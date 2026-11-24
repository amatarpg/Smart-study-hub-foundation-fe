import { id, type Messages } from "./id";

let messages: Messages = id;

export function setMessages(next: Messages): void {
  messages = next;
}

export type TFunction = {
  (key: string, params?: Record<string, string | number>): string;
};

export const t: TFunction = (key, params) => {
  let node: unknown = messages;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      node = undefined;
      break;
    }
  }
  let text = typeof node === "string" ? node : key;
  if (params) {
    for (const [name, replacement] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return text;
};
