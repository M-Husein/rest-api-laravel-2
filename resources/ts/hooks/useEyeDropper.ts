/**
 * From 
 * https://github.com/mantinedev/mantine/blob/master/packages/@mantine/hooks/src/use-eye-dropper/use-eye-dropper.ts
 */
export interface EyeDropperOpenOptions {
  signal?: AbortSignal;
}

export interface EyeDropperOpenReturnType {
  sRGBHex: string;
}

export interface UseEyeDropperReturnValue {
  supported: boolean;
  open: (options?: EyeDropperOpenOptions) => Promise<EyeDropperOpenReturnType | undefined>;
}

export const useEyeDropper = (): UseEyeDropperReturnValue => {
  const supported = !navigator.userAgent.includes('OPR') && 'EyeDropper' in window;

  const open = (
    options: EyeDropperOpenOptions = {}
  ): Promise<EyeDropperOpenReturnType | undefined> => {
    if (!supported) return Promise.resolve(undefined);
    const eyeDropper = new (window as any).EyeDropper();
    return eyeDropper.open(options);
  };

  return { supported, open };
};
