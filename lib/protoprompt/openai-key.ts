export const OPENAI_KEY_STORAGE_KEY = "protoprompt.openaiKey";

export function isOpenAIKeyReady(value: string): boolean {
  return value.trim().length > 0;
}

export function shouldHideSubmittedKey(submitted: boolean): boolean {
  return submitted;
}

export function readStoredOpenAIKey(storage: Pick<Storage, "getItem">): string {
  return storage.getItem(OPENAI_KEY_STORAGE_KEY) ?? "";
}

export function saveStoredOpenAIKey(storage: Pick<Storage, "setItem" | "removeItem">, value: string): string {
  const trimmed = value.trim();
  if (trimmed) {
    storage.setItem(OPENAI_KEY_STORAGE_KEY, trimmed);
  } else {
    storage.removeItem(OPENAI_KEY_STORAGE_KEY);
  }
  return trimmed;
}
