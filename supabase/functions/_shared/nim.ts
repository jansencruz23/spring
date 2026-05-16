// NVIDIA NIM client. NIM is OpenAI-compatible so we point the OpenAI SDK at
// NIM's base URL. Defaults to Llama 3.1 70B Instruct, configurable via
// NIM_MODEL secret. Streaming uses the OpenAI SDK's async-iterator chunks.

import OpenAI from 'npm:openai@4.65.0';

const NIM_API_KEY = Deno.env.get('NIM_API_KEY') ?? '';
const NIM_BASE_URL = Deno.env.get('NIM_BASE_URL') ?? 'https://integrate.api.nvidia.com/v1';
export const NIM_MODEL = Deno.env.get('NIM_MODEL') ?? 'meta/llama-3.1-70b-instruct';

export const nim = new OpenAI({ apiKey: NIM_API_KEY, baseURL: NIM_BASE_URL });

export function isNimConfigured(): boolean {
  return !!NIM_API_KEY;
}
