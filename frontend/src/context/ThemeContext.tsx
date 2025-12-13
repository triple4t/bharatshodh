// // import React, { createContext, useContext, useEffect, useState } from "react";

// // export type ThemeMode = "Light" | "Dark" | "Solarized";

// // const ThemeContext = createContext<{
// //   mode: ThemeMode;
// //   setMode: (mode: ThemeMode) => void;
// // }>({
// //   mode: "Dark",
// //   setMode: () => {},
// // });

// // export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
// //   children,
// // }) => {
// //   const [mode, setMode] = useState<ThemeMode>("Dark");

// //   useEffect(() => {
// //     const savedTheme = localStorage.getItem("customTheme");
// //     if (savedTheme) {
// //       try {
// //         const theme = JSON.parse(savedTheme);
// //         if (theme.background === "#f3f3f3") setMode("Light");
// //         else if (theme.background === "#fdf6e3") setMode("Solarized");
// //         else if (theme.background === "#181818") setMode("Dark");
// //       } catch {
// //         console.error("Invalid theme in localStorage:", savedTheme);
// //       }
// //     }
// //   }, []);

// //   // Listen for theme changes (when ThemeCustomizer updates localStorage)
// //   useEffect(() => {
// //     const onStorage = () => {
// //       const savedTheme = localStorage.getItem("customTheme");
// //       if (savedTheme) {
// //         try {
// //           const theme = JSON.parse(savedTheme);
// //           if (theme.background === "#f3f3f3") setMode("Light");
// //           else if (theme.background === "#fdf6e3") setMode("Solarized");
// //           else if (theme.background === "#181818") setMode("Dark");
// //         } catch {
// //           console.error("Invalid theme in localStorage:", savedTheme);
// //         }
// //       }
// //     };
// //     window.addEventListener("storage", onStorage);
// //     return () => window.removeEventListener("storage", onStorage);
// //   }, []);

// //   return (
// //     <ThemeContext.Provider value={{ mode, setMode }}>
// //       {children}
// //     </ThemeContext.Provider>
// //   );
// // };

// // export const useThemeMode = () => useContext(ThemeContext);

// // import React, { createContext, useContext, useEffect, useState } from "react";

// // export type ThemeMode = "Light" | "Dark" | "Solarized";

// // const ThemeContext = createContext<{
// //   mode: ThemeMode;
// //   setMode: (mode: ThemeMode) => void;
// // }>({
// //   mode: "Dark",
// //   setMode: () => {},
// // });

// // export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
// //   children,
// // }) => {
// //   const [mode, setMode] = useState<ThemeMode>("Dark");

// //   // Helper to read theme from localStorage and update mode
// //   const updateModeFromTheme = () => {
// //     const savedTheme = localStorage.getItem("customTheme");
// //     if (savedTheme) {
// //       try {
// //         const theme = JSON.parse(savedTheme);
// //         if (theme.background === "#f3f3f3") setMode("Light");
// //         else if (theme.background === "#181818") setMode("Dark");
// //       } catch {
// //         console.error("Invalid theme in localStorage:", savedTheme);
// //       }
// //     }
// //   };

// //   // Initial load
// //   useEffect(() => {
// //     updateModeFromTheme();
// //   }, []);

// //   // Listen for theme changes via storage event and custom event
// //   useEffect(() => {
// //     const onThemeChange = () => updateModeFromTheme();
// //     window.addEventListener("storage", onThemeChange);
// //     window.addEventListener("themeChange", onThemeChange);
// //     return () => {
// //       window.removeEventListener("storage", onThemeChange);
// //       window.removeEventListener("themeChange", onThemeChange);
// //     };
// //   }, []);

// //   return (
// //     <ThemeContext.Provider value={{ mode, setMode }}>
// //       {children}
// //     </ThemeContext.Provider>
// //   );
// // };

// // export const useThemeMode = () => useContext(ThemeContext);

// import React, { createContext, useContext, useEffect, useState } from "react";

// export type ThemeMode = "light" | "dark" | "system";

// type Ctx = {
//   mode: ThemeMode; // user's choice
//   resolvedMode: Exclude<ThemeMode, "system">; // actual applied
//   setMode: (mode: ThemeMode) => void;
// };

// const ThemeContext = createContext<Ctx>({
//   mode: "system",
//   resolvedMode: "light",
//   setMode: () => {},
// });

// const PRESET = {
//   light: {
//     // background: "#f8fafc", // slate-50: soft gray-white, easier on eyes than pure white
//     background: "#819A91", // slate-50: soft gray-white, easier on eyes than pure white
//     textColor: "#0f172a", // slate-900: high contrast but not pure black
//     chatBubble: "#ffffff", // white bubbles pop nicely on soft background
//     iconBg: "#e2e8f0", // slate-200: subtle gray button background
//     iconColor: "#2563eb", // blue-600: vibrant accent color
//     userIconBg: "#2563eb", // same blue for user bubble highlight
//     sendButtonBg: "#819A91", // matching blue for CTA consistency
//     sidebarBorder: "000000",
//   },
//   dark: {
//     background: "#0b0f1a",
//     textColor: "#e5e7eb",
//     chatBubble: "#1f2937",
//     iconBg: "#111827",
//     iconColor: "#93c5fd",
//     userIconBg: "#374151",
//     sendButtonBg: "#374151",
//     sidebarBorder: "fffffff",
//   },
// } as const;

// const LS_KEY = "theme:mode";

// /** Normalize any stored value (handles legacy "Dark"/"Light" and customTheme blobs) */
// function readInitialMode(): ThemeMode {
//   if (typeof window === "undefined") return "system";

//   // 1) New key (may contain lower or UPPER case from earlier tests)
//   const raw = window.localStorage.getItem(LS_KEY);
//   if (raw) {
//     const v = raw.toLowerCase();
//     if (v === "light" || v === "dark" || v === "system") return v as ThemeMode;
//   }

//   // 2) Legacy: object at "customTheme" / "customTheme:v2"
//   for (const legacyKey of ["customTheme", "customTheme:v2"]) {
//     const legacy = window.localStorage.getItem(legacyKey);
//     if (legacy) {
//       try {
//         const obj = JSON.parse(legacy);
//         // Map known backgrounds to modes
//         const bg = (obj?.background || obj?.Background || "").toLowerCase();
//         if (bg === "#ffffff" || bg === "#f3f3f3" || bg === "#fafafa")
//           return "light";
//         if (bg === "#0b0f1a" || bg === "#181818" || bg === "#000000")
//           return "dark";
//       } catch {
//         /* ignore */
//       }
//     }
//   }
//   // 3) Default
//   return "system";
// }

// function getSystemTheme(): "light" | "dark" {
//   if (typeof window === "undefined") return "light";
//   return window.matchMedia("(prefers-color-scheme: dark)").matches
//     ? "dark"
//     : "light";
// }

// /** Defensive: always fall back to 'dark' preset if something is off */
// function applyCssVars(mode: "light" | "dark") {
//   const t = PRESET[mode] ?? PRESET.dark;
//   const root = document.documentElement;
//   root.style.setProperty("--theme-background", t.background);
//   root.style.setProperty("--theme-fontColor", t.textColor);
//   root.style.setProperty("--theme-chatBubble", t.chatBubble);
//   root.style.setProperty("--theme-chatBubbleText", t.textColor);
//   root.style.setProperty("--theme-iconBg", t.iconBg);
//   root.style.setProperty("--theme-iconColor", t.iconColor);
//   root.style.setProperty("--theme-userIconBg", t.userIconBg);
//   root.style.setProperty("--theme-sendButtonBg", t.sendButtonBg);
//   root.setAttribute("data-theme", mode);
//   root.style.setProperty("--theme-fontColor", t.textColor);
//   root.style.setProperty("--theme-text", t.textColor); // alias so your layout works
// }

// export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [mode, setModeState] = useState<ThemeMode>(() => readInitialMode());
//   const [systemPref, setSystemPref] = useState<"light" | "dark">(
//     getSystemTheme()
//   );

//   // Migrate & sanitize on mount (e.g., stored "Dark" or garbage → valid value)
//   useEffect(() => {
//     const normalized = (String(mode).toLowerCase() as ThemeMode) || "system";
//     if (normalized !== mode) setModeState(normalized);
//     // ensure storage has a valid value
//     window.localStorage.setItem(LS_KEY, normalized);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // run once

//   useEffect(() => {
//     const mql = window.matchMedia("(prefers-color-scheme: dark)");
//     const handler = () => setSystemPref(mql.matches ? "dark" : "light");
//     mql.addEventListener?.("change", handler) ?? mql.addListener(handler);
//     return () =>
//       mql.removeEventListener?.("change", handler) ??
//       mql.removeListener(handler);
//   }, []);

//   const resolvedMode: "light" | "dark" = mode === "system" ? systemPref : mode;

//   useEffect(() => {
//     applyCssVars(resolvedMode);
//     window.dispatchEvent(new Event("themeChange"));
//   }, [resolvedMode]);

//   const setMode = (next: ThemeMode) => {
//     const normalized = String(next).toLowerCase() as ThemeMode;
//     setModeState(normalized);
//     window.localStorage.setItem(LS_KEY, normalized);
//   };

//   return (
//     <ThemeContext.Provider value={{ mode, resolvedMode, setMode }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useThemeMode = () => useContext(ThemeContext);
// second claude ui deisgn

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

type Ctx = {
  mode: ThemeMode; // user's choice
  resolvedMode: Exclude<ThemeMode, "system">; // actual applied
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<Ctx>({
  mode: "system",
  resolvedMode: "light",
  setMode: () => {},
});

const PRESET = {
  light: {
    // Modern warm light theme with teal accents
    background: "#FAFAF9", // stone-50: warm soft white, inviting
    secondaryBg: "#F5F5F4", // stone-100: subtle layering
    surfaceBg: "#FFFFFF", // pure white for elevated surfaces
    textColor: "#1C1917", // stone-900: strong readable text
    textColorR: "#1C1917", // stone-900: strong readable text
    textSecondary: "#57534E", // stone-600: readable secondary text
    textSecondaryR: "#57534E", // stone-600: readable secondary text
    textTertiary: "#78716C", // stone-500: muted tertiary text
    chatBubble: "#F5F5F4", // stone-100: subtle chat bubbles
    chatBubbleUser: "#14B8A6", // teal-500: vibrant modern accent
    chatBubbleText: "#1C1917", // dark text on light bubbles
    chatBubbleUserText: "#FFFFFF", // white text on teal bubbles
    iconBg: "#F5F5F4", // stone-100: subtle icon backgrounds
    iconColor: "#14B8A6", // teal-500: vibrant icons
    iconHover: "#0D9488", // teal-600: darker on hover
    userIconBg: "#14B8A6", // teal-500: user avatar background
    sendButtonBg: "#14B8A6", // teal-500: CTA button
    sendButtonHover: "#0D9488", // teal-600: darker on hover
    sidebarBg: "#FAFAF9", // stone-50: matches background
    sidebarBorder: "#E7E5E4", // stone-200: subtle border
    borderColor: "#E7E5E4", // stone-200: general borders
    inputBg: "#FFFFFF", // white input backgrounds
    inputBorder: "#D6D3D1", // stone-300: input borders
    inputFocus: "#14B8A6", // teal-500: focus color
    shadow: "rgba(0, 0, 0, 0.05)", // very subtle shadows
    overlay: "rgba(0, 0, 0, 0.4)", // modal overlays
    success: "#10B981", // emerald-500
    warning: "#F59E0B", // amber-500
    error: "#EF4444", // red-500
    // Auth page gradient colors
    authGradientStart: "#14B8A6", // teal-500
    authGradientMid: "#06B6D4", // cyan-500  
    authGradientEnd: "#0891B2", // cyan-600
  },
  dark: {
    // Modern deep dark theme with cyan accents
    background: "#0F1419", // custom deep navy, almost black
    secondaryBg: "#1A1F29", // lighter navy for layering
    surfaceBg: "#232933", // slate-like elevated surfaces
    textColor: "#F1F5F9", // slate-100: high contrast text
    textColorR: "#1C1917", // stone-900: for light backgrounds
    textSecondary: "#CBD5E1", // slate-300: readable secondary
    textSecondaryR: "#57534E", // stone-600: for light backgrounds
    textTertiary: "#94A3B8", // slate-400: muted tertiary
    chatBubble: "#232933", // elevated surface for chat
    chatBubbleUser: "#06B6D4", // cyan-500: bright modern accent
    chatBubbleText: "#F1F5F9", // light text on dark bubbles
    chatBubbleUserText: "#FFFFFF", // white text on cyan bubbles
    iconBg: "#232933", // elevated surface for icons
    iconColor: "#22D3EE", // cyan-400: softer bright for dark
    iconHover: "#67E8F9", // cyan-300: lighter on hover
    userIconBg: "#06B6D4", // cyan-500: user avatar
    sendButtonBg: "#06B6D4", // cyan-500: CTA button
    sendButtonHover: "#0891B2", // cyan-600: darker on hover
    sidebarBg: "#1A1F29", // darker sidebar
    sidebarBorder: "#2D3748", // subtle border
    borderColor: "#2D3748", // general borders
    inputBg: "#232933", // elevated input backgrounds
    inputBorder: "#374151", // gray-700: input borders
    inputFocus: "#22D3EE", // cyan-400: focus color
    shadow: "rgba(0, 0, 0, 0.5)", // deeper shadows
    overlay: "rgba(0, 0, 0, 0.75)", // stronger modal overlays
    success: "#34D399", // emerald-400: softer for dark
    warning: "#FBBF24", // amber-400: softer for dark
    error: "#F87171", // red-400: softer for dark
    // Auth page gradient colors
    authGradientStart: "#0F172A", // slate-900: deep dark
    authGradientMid: "#1E293B", // slate-800: mid tone
    authGradientEnd: "#334155", // slate-700: lighter end
  },
} as const;

const LS_KEY = "theme:mode";

/** Normalize any stored value (handles legacy "Dark"/"Light" and customTheme blobs) */
function readInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "system";

  // 1) New key (may contain lower or UPPER case from earlier tests)
  const raw = window.localStorage.getItem(LS_KEY);
  if (raw) {
    const v = raw.toLowerCase();
    if (v === "light" || v === "dark" || v === "system") return v as ThemeMode;
  }

  // 2) Legacy: object at "customTheme" / "customTheme:v2"
  for (const legacyKey of ["customTheme", "customTheme:v2"]) {
    const legacy = window.localStorage.getItem(legacyKey);
    if (legacy) {
      try {
        const obj = JSON.parse(legacy);
        // Map known backgrounds to modes
        const bg = (obj?.background || obj?.Background || "").toLowerCase();
        if (bg === "#ffffff" || bg === "#f3f3f3" || bg === "#fafafa")
          return "light";
        if (
          bg === "#0b0f1a" ||
          bg === "#181818" ||
          bg === "#000000" ||
          bg === "#0f172a"
        )
          return "dark";
      } catch {
        /* ignore */
      }
    }
  }
  // 3) Default
  return "system";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Enhanced CSS variables application with comprehensive theme support */
function applyCssVars(mode: "light" | "dark") {
  const t = PRESET[mode] ?? PRESET.dark;
  const root = document.documentElement;

  // Core colors
  root.style.setProperty("--theme-background", t.background);
  root.style.setProperty("--theme-secondary-bg", t.secondaryBg);
  root.style.setProperty("--theme-surface-bg", t.surfaceBg);

  // Text colors
  root.style.setProperty("--theme-text", t.textColor);
  root.style.setProperty("--theme-textR", t.textColorR);
  root.style.setProperty("--theme-text-secondary", t.textSecondary);
  root.style.setProperty("--theme-text-secondaryR", t.textSecondaryR);
  root.style.setProperty("--theme-text-tertiary", t.textTertiary);
  root.style.setProperty("--theme-fontColor", t.textColor); // legacy support

  // Chat bubbles
  root.style.setProperty("--theme-chatBubble", t.chatBubble);
  root.style.setProperty("--theme-chatBubbleUser", t.chatBubbleUser);
  root.style.setProperty("--theme-chatBubbleText", t.chatBubbleText);
  root.style.setProperty("--theme-chatBubbleUserText", t.chatBubbleUserText);

  // Icons
  root.style.setProperty("--theme-iconBg", t.iconBg);
  root.style.setProperty("--theme-iconColor", t.iconColor);
  root.style.setProperty("--theme-iconHover", t.iconHover);
  root.style.setProperty("--theme-userIconBg", t.userIconBg);

  // Buttons
  root.style.setProperty("--theme-sendButtonBg", t.sendButtonBg);
  root.style.setProperty("--theme-sendButtonHover", t.sendButtonHover);

  // Layout
  root.style.setProperty("--theme-sidebarBg", t.sidebarBg);
  root.style.setProperty("--theme-sidebarBorder", t.sidebarBorder);
  root.style.setProperty("--theme-borderColor", t.borderColor);

  // Inputs
  root.style.setProperty("--theme-inputBg", t.inputBg);
  root.style.setProperty("--theme-inputBorder", t.inputBorder);
  root.style.setProperty("--theme-inputFocus", t.inputFocus);

  // Effects
  root.style.setProperty("--theme-shadow", t.shadow);
  root.style.setProperty("--theme-overlay", t.overlay);

  // Status colors
  root.style.setProperty("--theme-success", t.success);
  root.style.setProperty("--theme-warning", t.warning);
  root.style.setProperty("--theme-error", t.error);

  // Auth page gradients
  root.style.setProperty("--theme-auth-gradient-start", t.authGradientStart);
  root.style.setProperty("--theme-auth-gradient-mid", t.authGradientMid);
  root.style.setProperty("--theme-auth-gradient-end", t.authGradientEnd);

  // Set data attribute for CSS targeting
  root.setAttribute("data-theme", mode);

  // Add transition for smooth theme switching
  root.style.setProperty(
    "--theme-transition",
    "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
  );
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(() => readInitialMode());
  const [systemPref, setSystemPref] = useState<"light" | "dark">(
    getSystemTheme()
  );

  // Migrate & sanitize on mount (e.g., stored "Dark" or garbage → valid value)
  useEffect(() => {
    const normalized = (String(mode).toLowerCase() as ThemeMode) || "system";
    if (normalized !== mode) setModeState(normalized);
    // ensure storage has a valid value
    window.localStorage.setItem(LS_KEY, normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemPref(mql.matches ? "dark" : "light");
    mql.addEventListener?.("change", handler) ?? mql.addListener(handler);
    return () =>
      mql.removeEventListener?.("change", handler) ??
      mql.removeListener(handler);
  }, []);

  const resolvedMode: "light" | "dark" = mode === "system" ? systemPref : mode;

  useEffect(() => {
    applyCssVars(resolvedMode);
    window.dispatchEvent(new Event("themeChange"));
  }, [resolvedMode]);

  const setMode = (next: ThemeMode) => {
    const normalized = String(next).toLowerCase() as ThemeMode;
    setModeState(normalized);
    window.localStorage.setItem(LS_KEY, normalized);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);

// from claude ui design first time
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { Monitor, Moon, Sun } from "lucide-react";

// // Theme Context - keeping all your existing logic
// export type ThemeMode = "light" | "dark" | "system";

// type Ctx = {
//   mode: ThemeMode; // user's choice
//   resolvedMode: Exclude<ThemeMode, "system">; // actual applied
//   setMode: (mode: ThemeMode) => void;
// };

// const ThemeContext = createContext<Ctx>({
//   mode: "system",
//   resolvedMode: "light",
//   setMode: () => {},
// });

// const PRESET = {
//   light: {
//     background: "#819A91",
//     textColor: "#0f172a",
//     chatBubble: "#ffffff",
//     iconBg: "#e2e8f0",
//     iconColor: "#2563eb",
//     userIconBg: "#2563eb",
//     sendButtonBg: "#819A91",
//     sidebarBorder: "000000",
//   },
//   dark: {
//     background: "#0b0f1a",
//     textColor: "#e5e7eb",
//     chatBubble: "#1f2937",
//     iconBg: "#111827",
//     iconColor: "#93c5fd",
//     userIconBg: "#374151",
//     sendButtonBg: "#374151",
//     sidebarBorder: "fffffff",
//   },
// } as const;

// const LS_KEY = "theme:mode";

// function readInitialMode(): ThemeMode {
//   if (typeof window === "undefined") return "system";

//   const raw = window.localStorage.getItem(LS_KEY);
//   if (raw) {
//     const v = raw.toLowerCase();
//     if (v === "light" || v === "dark" || v === "system") return v as ThemeMode;
//   }

//   for (const legacyKey of ["customTheme", "customTheme:v2"]) {
//     const legacy = window.localStorage.getItem(legacyKey);
//     if (legacy) {
//       try {
//         const obj = JSON.parse(legacy);
//         const bg = (obj?.background || obj?.Background || "").toLowerCase();
//         if (bg === "#ffffff" || bg === "#f3f3f3" || bg === "#fafafa")
//           return "light";
//         if (bg === "#0b0f1a" || bg === "#181818" || bg === "#000000")
//           return "dark";
//       } catch {
//         /* ignore */
//       }
//     }
//   }
//   return "system";
// }

// function getSystemTheme(): "light" | "dark" {
//   if (typeof window === "undefined") return "light";
//   return window.matchMedia("(prefers-color-scheme: dark)").matches
//     ? "dark"
//     : "light";
// }

// function applyCssVars(mode: "light" | "dark") {
//   const t = PRESET[mode] ?? PRESET.dark;
//   const root = document.documentElement;
//   root.style.setProperty("--theme-background", t.background);
//   root.style.setProperty("--theme-fontColor", t.textColor);
//   root.style.setProperty("--theme-chatBubble", t.chatBubble);
//   root.style.setProperty("--theme-chatBubbleText", t.textColor);
//   root.style.setProperty("--theme-iconBg", t.iconBg);
//   root.style.setProperty("--theme-iconColor", t.iconColor);
//   root.style.setProperty("--theme-userIconBg", t.userIconBg);
//   root.style.setProperty("--theme-sendButtonBg", t.sendButtonBg);
//   root.setAttribute("data-theme", mode);
//   root.style.setProperty("--theme-text", t.textColor);
// }

// export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [mode, setModeState] = useState<ThemeMode>(() => readInitialMode());
//   const [systemPref, setSystemPref] = useState<"light" | "dark">(
//     getSystemTheme()
//   );

//   useEffect(() => {
//     const normalized = (String(mode).toLowerCase() as ThemeMode) || "system";
//     if (normalized !== mode) setModeState(normalized);
//     window.localStorage.setItem(LS_KEY, normalized);
//   }, []);

//   useEffect(() => {
//     const mql = window.matchMedia("(prefers-color-scheme: dark)");
//     const handler = () => setSystemPref(mql.matches ? "dark" : "light");
//     mql.addEventListener?.("change", handler) ?? mql.addListener(handler);
//     return () =>
//       mql.removeEventListener?.("change", handler) ??
//       mql.removeListener(handler);
//   }, []);

//   const resolvedMode: "light" | "dark" = mode === "system" ? systemPref : mode;

//   useEffect(() => {
//     applyCssVars(resolvedMode);
//     window.dispatchEvent(new Event("themeChange"));
//   }, [resolvedMode]);

//   const setMode = (next: ThemeMode) => {
//     const normalized = String(next).toLowerCase() as ThemeMode;
//     setModeState(normalized);
//     window.localStorage.setItem(LS_KEY, normalized);
//   };

//   return (
//     <ThemeContext.Provider value={{ mode, resolvedMode, setMode }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useThemeMode = () => useContext(ThemeContext);
