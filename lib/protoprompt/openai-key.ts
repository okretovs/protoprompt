export function isOpenAIKeyReady(value: string): boolean {
  return value.trim().length > 0;
}

export function shouldHideSubmittedKey(submitted: boolean): boolean {
  return submitted;
}
