import { Message, WebSearchResult } from "../types";

export function parseWebSourcesFromContent(markdown: string): WebSearchResult[] {
  const blocks = markdown.split("🔹").filter(Boolean);
  return blocks.map((block) => {
    const titleMatch = /\[(.*?)\]/.exec(block);
    const urlMatch = /\((https?:\/\/.*?)\)/.exec(block);
    const snippet = block.split("\n").slice(1).join(" ").trim();

    return {
      title: titleMatch?.[1] ?? "Unknown",
      url: urlMatch?.[1] ?? "#",
      snippet,
    };
  });
}

export const enhanceMessagesWithSources = (messages: Message[]): Message[] => {
  return messages.map((msg, i) => {
    if (msg.role === "assistant") {
      const prev = messages[i - 1];
      if (prev?.role === "system" && prev.content?.includes("🔹 [")) {
        const parsedSources = parseWebSourcesFromContent(prev.content);
        return {
          ...msg,
          sources: parsedSources, // ⬅️ Inject parsed sources
        };
      }
    }
    return msg;
  });
};
