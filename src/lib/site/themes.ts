import type { SiteTheme } from "@/lib/domain/company";

export const THEMES: Record<SiteTheme, { name: { ru: string; de: string }; colors: Record<string, string> }> = {
  forest: {
    name: { ru: "Лесной", de: "Wald" },
    colors: { ink: "#17201d", muted: "#617069", paper: "#f3f1e9", surface: "#fffdf8", accent: "#246a54", soft: "#dcebe4", line: "#d8d8cf" },
  },
  midnight: {
    name: { ru: "Полночный", de: "Mitternacht" },
    colors: { ink: "#101a2e", muted: "#64708a", paper: "#eef1f6", surface: "#ffffff", accent: "#315eaa", soft: "#dce6f7", line: "#d4d9e4" },
  },
  sand: {
    name: { ru: "Песочный", de: "Sand" },
    colors: { ink: "#2b2119", muted: "#75675c", paper: "#f6f0e6", surface: "#fffaf2", accent: "#a04f2f", soft: "#f1dfd2", line: "#dfd4c6" },
  },
  berry: {
    name: { ru: "Ягодный", de: "Beere" },
    colors: { ink: "#271723", muted: "#76616f", paper: "#f6eff4", surface: "#fffafd", accent: "#8b315f", soft: "#eed9e5", line: "#dfd1da" },
  },
};
