// Chat client. The Supabase JS `functions.invoke` helper doesn't expose a
// streaming response, so we use `fetch` directly with the user's access token.
//
// We import `fetch` from `expo/fetch` rather than using the global. React
// Native's stock `fetch` is an XHR polyfill that always sets `response.body`
// to null, so `getReader()` is unavailable — `expo/fetch` (Expo SDK 50+) is
// a real WHATWG fetch that returns a streaming ReadableStream.

import { fetch } from 'expo/fetch';
import { supabase } from '../supabase';
import type { Database } from '../database.types';
import {
  MealSwapPlanInputSchema,
  MealSwapSuggestionSchema,
  type MealSwapPlanInput,
  type MealSwapSuggestion,
} from '../schemas/chat';

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type ChatThread = Database['public']['Tables']['chat_threads']['Row'];

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const FUNCTIONS_BASE = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1`;

export type StreamEvent =
  | { kind: 'meta'; threadId: string }
  | { kind: 'delta'; token: string }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

export class ChatStreamError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ChatStreamError';
  }
}

/**
 * Most-recent thread for the user, or null. We use a single thread per user in
 * v1 — multi-thread is deferred to v1.1 per plan. New threads are created
 * server-side on the first /chat call when `threadId` is null.
 */
export async function getLatestThread(userId: string): Promise<ChatThread | null> {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMessages(threadId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function authHeader(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ChatStreamError('not signed in', 401);
  return `Bearer ${token}`;
}

/**
 * Opens an SSE stream against /chat and invokes `onEvent` for each typed
 * event. Returns a `Promise<void>` that resolves when the server emits `done`
 * (or rejects on transport errors). The caller is responsible for handling
 * mid-stream `error` events delivered to `onEvent` — those don't reject the
 * outer promise so the UI can render the partial reply.
 */
export async function streamChat(
  args: { threadId: string | null; userMessage: string; signal?: AbortSignal },
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
  if (!SUPABASE_URL) {
    throw new ChatStreamError('chat unavailable — EXPO_PUBLIC_SUPABASE_URL missing');
  }

  const authorization = await authHeader();
  const response = await fetch(`${FUNCTIONS_BASE}/chat`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify({
      threadId: args.threadId,
      userMessage: args.userMessage,
    }),
    signal: args.signal,
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.text()).slice(0, 200);
    } catch {
      // ignore
    }
    // Supabase's Functions gateway returns 404 + `{"code":"NOT_FOUND",...}`
    // when the function name exists in source but isn't deployed to the
    // project. The raw response is opaque to most users — surface the actual
    // fix instead so they don't have to chase down what NOT_FOUND means.
    if (response.status === 404 && /NOT[_-]?FOUND/i.test(detail)) {
      throw new ChatStreamError(
        'Chat is offline — the /chat Edge Function isn\'t deployed yet. ' +
          'Run `npm run supabase:deploy:chat` (or `supabase functions deploy chat`) ' +
          'after linking the project, then set the NIM_API_KEY secret with ' +
          '`supabase secrets set NIM_API_KEY=…`.',
        404,
      );
    }
    throw new ChatStreamError(
      `chat request failed: ${response.status} ${detail}`.trim(),
      response.status,
    );
  }
  if (!response.body) {
    throw new ChatStreamError('chat response missing body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  const separator = /\r?\n\r?\n/g;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // SSE frames are separated by a blank line (\n\n or \r\n\r\n). The
      // regex's `g` flag + lastIndex reset lets us know both the start AND
      // length of the match so we don't have to guess CRLF vs LF lengths.
      separator.lastIndex = 0;
      let match = separator.exec(buffer);
      let consumed = 0;
      while (match) {
        const frame = buffer.slice(consumed, match.index);
        const parsed = parseFrame(frame);
        if (parsed) onEvent(parsed);
        consumed = match.index + match[0].length;
        match = separator.exec(buffer);
      }
      if (consumed > 0) buffer = buffer.slice(consumed);
    }
  } finally {
    reader.releaseLock();
  }

  // Flush any remaining buffered frame (defensive — the server always ends
  // with \n\n, so this is normally a no-op).
  if (buffer.trim()) {
    const parsed = parseFrame(buffer);
    if (parsed) onEvent(parsed);
  }
}

function parseFrame(frame: string): StreamEvent | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (dataLines.length === 0) return null;
  const dataStr = dataLines.join('\n');
  let data: unknown;
  try {
    data = JSON.parse(dataStr);
  } catch {
    return null;
  }
  const obj = (data ?? {}) as Record<string, unknown>;
  switch (event) {
    case 'meta':
      return typeof obj.threadId === 'string'
        ? { kind: 'meta', threadId: obj.threadId }
        : null;
    case 'delta':
      return typeof obj.token === 'string'
        ? { kind: 'delta', token: obj.token }
        : null;
    case 'done':
      return { kind: 'done' };
    case 'error':
      return {
        kind: 'error',
        message: typeof obj.message === 'string' ? obj.message : 'unknown error',
      };
    default:
      return null;
  }
}

/**
 * One-shot meal-swap suggestion. Validates the response shape client-side too
 * (the Edge Function already does, but a defensive parse keeps the type
 * boundary clean).
 */
export async function requestMealSwap(plan: MealSwapPlanInput): Promise<MealSwapSuggestion> {
  if (!SUPABASE_URL) {
    throw new ChatStreamError('meal-swap unavailable — EXPO_PUBLIC_SUPABASE_URL missing');
  }
  const input = MealSwapPlanInputSchema.parse(plan);
  const authorization = await authHeader();

  const response = await fetch(`${FUNCTIONS_BASE}/meal-swap`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify({ plan: input }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    if (response.status === 404 && /NOT[_-]?FOUND/i.test(body)) {
      throw new ChatStreamError(
        'Meal-swap is offline — the /meal-swap Edge Function isn\'t deployed yet. ' +
          'Run `npm run supabase:deploy:meal-swap` (or `supabase functions deploy meal-swap`).',
        404,
      );
    }
    throw new ChatStreamError(
      `meal-swap failed: ${response.status} ${body.slice(0, 200)}`.trim(),
      response.status,
    );
  }
  const raw = (await response.json()) as unknown;
  return MealSwapSuggestionSchema.parse(raw);
}
