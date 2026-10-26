type SessionFlags = {
  offers_online: boolean;
  offers_offline: boolean;
  offers_audio?: boolean;
  offers_video?: boolean;
};

const SESSION_LABELS: [keyof SessionFlags, string][] = [
  ["offers_online", "Online"],
  ["offers_offline", "In person"],
  ["offers_audio", "Audio call"],
  ["offers_video", "Video call"],
];

export function offeredSessions(flags: SessionFlags): string[] {
  return SESSION_LABELS.filter(([key]) => flags[key]).map(([, label]) => label);
}

export function previewItems<T>(items: readonly T[], limit: number): { visible: T[]; hidden: number } {
  return {
    visible: items.slice(0, limit),
    hidden: Math.max(0, items.length - limit),
  };
}
