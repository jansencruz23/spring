export type ThemeMode = 'light' | 'dark';

export type SpringPalette = {
  coral: string;
  coralDeep: string;
  coralSoft: string;
  coralWhisper: string;

  sage: string;
  sageDeep: string;
  sageSoft: string;

  butter: string;
  butterDeep: string;
  butterSoft: string;

  cream: string;
  ivory: string;
  sand: string;
  stone: string;
  bark: string;
  espresso: string;
  inkSoft: string;

  success: string;
  danger: string;
};

export const SPRING_PALETTE: Record<ThemeMode, SpringPalette> = {
  light: {
    coral:        '#EFA890',
    coralDeep:    '#D8866A',
    coralSoft:    '#FCE5D9',
    coralWhisper: '#FBF1EA',

    sage:         '#9BB89A',
    sageDeep:     '#6E8E73',
    sageSoft:     '#E3ECDF',

    butter:       '#F4D27A',
    butterDeep:   '#D9B257',
    butterSoft:   '#FAEFCB',

    cream:        '#FBF7F1',
    ivory:        '#F4EEE5',
    sand:         '#E8DFD2',
    stone:        '#B8AC9C',
    bark:         '#5C4D3F',
    espresso:     '#3A2E25',
    inkSoft:      '#7A6B5C',

    success:      '#7A9F6E',
    danger:       '#C97A6A',
  },
  dark: {
    coral:        '#E8A088',
    coralDeep:    '#F0B69E',
    coralSoft:    '#3D2A22',
    coralWhisper: '#2A1E18',

    sage:         '#A8C4A6',
    sageDeep:     '#B9D3B8',
    sageSoft:     '#2A3528',

    butter:       '#E8C674',
    butterDeep:   '#F2D589',
    butterSoft:   '#3A2F1C',

    cream:        '#1F1814',
    ivory:        '#2A2017',
    sand:         '#3A2D22',
    stone:        '#857668',
    bark:         '#E8DDD0',
    espresso:     '#FBF7F1',
    inkSoft:      '#B8A89A',

    success:      '#9BBC8E',
    danger:       '#E09080',
  },
};

export type PrimaryOverride = Partial<Pick<SpringPalette, 'coral' | 'coralDeep' | 'coralSoft'>>;

export function resolveSpringPalette(
  mode: ThemeMode,
  primaryOverride?: PrimaryOverride,
): SpringPalette {
  const base = SPRING_PALETTE[mode];
  if (!primaryOverride) return base;
  return {
    ...base,
    coral: primaryOverride.coral ?? base.coral,
    coralDeep: primaryOverride.coralDeep ?? base.coralDeep,
    coralSoft: primaryOverride.coralSoft ?? base.coralSoft,
  };
}
