export const envFlag = (name: string, defaultValue: boolean) => {
  const env = process.env as any;
  const raw = env?.[name];
  if (raw === undefined || raw === null) return defaultValue;
  const normalized = String(raw).trim().toLowerCase();
  if (!normalized) return defaultValue;
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return defaultValue;
};

export const isRawatInapEnabled = (platform: string) => {
  const env = process.env as any;
  if (platform === 'web' && env?.EXPO_PUBLIC_ENABLE_RAWAT_INAP_WEB !== undefined) {
    return envFlag('EXPO_PUBLIC_ENABLE_RAWAT_INAP_WEB', true);
  }
  return envFlag('EXPO_PUBLIC_ENABLE_RAWAT_INAP', true);
};

