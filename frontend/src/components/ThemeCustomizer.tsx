// // import { useState, useEffect } from "react";

// // type ThemeType = {
// //   background: string;
// //   fontColor: string;
// //   chatBubble: string;
// //   chatBubbleText: string;
// //   iconBg: string;
// //   iconColor: string;
// //   userIconBg: string;
// //   sendButtonBg: string;
// // };

// // const presetThemes: Record<string, ThemeType> = {
// //   Light: {
// //     background: "#f3f3f3",
// //     fontColor: "#181818",
// //     chatBubble: "#e0e0e0",
// //     chatBubbleText: "#181818",
// //     iconBg: "#e0e0e0",
// //     iconColor: "#007bff",
// //     userIconBg: "#007bff",
// //     sendButtonBg: "#007bff",
// //   },
// //   Dark: {
// //     background: "#181818",
// //     fontColor: "#f3f3f3",
// //     chatBubble: "#323232",
// //     chatBubbleText: "#f3f3f3",
// //     iconBg: "#323232",
// //     iconColor: "#7ab7ff",
// //     userIconBg: "#444",
// //     sendButtonBg: "#444",
// //   },
// //   Solarized: {
// //     background: "#fdf6e3",
// //     fontColor: "#657b83",
// //     chatBubble: "#eee8d5",
// //     chatBubbleText: "#586e75",
// //     iconBg: "#eee8d5",
// //     iconColor: "#b58900",
// //     userIconBg: "#b58900",
// //     sendButtonBg: "#268bd2",
// //   },
// // };

// // const defaultTheme = presetThemes.Dark;

// // const THEME_KEY = "customTheme";

// // function ThemeCustomizer() {
// //   const [theme, setTheme] = useState<ThemeType>(() => {
// //     const saved = localStorage.getItem(THEME_KEY);
// //     return saved ? JSON.parse(saved) : defaultTheme;
// //   });

// //   useEffect(() => {
// //     // Apply theme as CSS variables
// //     Object.entries(theme).forEach(([key, value]) => {
// //       document.documentElement.style.setProperty(
// //         `--theme-${key}`,
// //         value as string
// //       );
// //     });

// //     // Save to localStorage
// //     localStorage.setItem(THEME_KEY, JSON.stringify(theme));

// //     // 🔔 Notify ThemeProvider instantly
// //     window.dispatchEvent(new Event("themeChange"));
// //   }, [theme]);

// //   const handleColorChange = (key: keyof ThemeType, value: string) => {
// //     setTheme((prev: ThemeType) => ({ ...prev, [key]: value }));
// //   };

// //   const applyPreset = (preset: keyof typeof presetThemes) => {
// //     setTheme(presetThemes[preset]);
// //   };

// //   return (
// //     <div
// //       style={{
// //         padding: 0,
// //         background: "var(--theme-background)",
// //         color: "var(--theme-fontColor)",
// //         borderRadius: 12,
// //         maxWidth: 300,
// //       }}
// //     >
// //       <h2 style={{ marginBottom: 16 }}>Theme Customizer</h2>
// //       <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
// //         {Object.keys(presetThemes).map((preset) => (
// //           <button
// //             key={preset}
// //             onClick={() => applyPreset(preset as keyof typeof presetThemes)}
// //             style={{
// //               background: presetThemes[preset].background,
// //               color: presetThemes[preset].fontColor,
// //               border: "1px solid #ccc",
// //               borderRadius: 6,
// //               padding: "6px 12px",
// //               cursor: "pointer",
// //             }}
// //           >
// //             {preset}
// //           </button>
// //         ))}
// //       </div>
// //       <div style={{ display: "grid", gap: 12 }}>
// //         <label>
// //           Background Color:
// //           <input
// //             type="color"
// //             value={theme.background}
// //             onChange={(e) => handleColorChange("background", e.target.value)}
// //           />
// //         </label>
// //         <label>
// //           Font Color:
// //           <input
// //             type="color"
// //             value={theme.fontColor}
// //             onChange={(e) => handleColorChange("fontColor", e.target.value)}
// //           />
// //         </label>
// //         <label>
// //           Icon BG Color:
// //           <input
// //             type="color"
// //             value={theme.iconBg}
// //             onChange={(e) => handleColorChange("iconBg", e.target.value)}
// //           />
// //         </label>
// //         <label>
// //           Icon Color:
// //           <input
// //             type="color"
// //             value={theme.iconColor}
// //             onChange={(e) => handleColorChange("iconColor", e.target.value)}
// //           />
// //         </label>
// //         <label>
// //           ChatBubble Color:
// //           <input
// //             type="color"
// //             value={theme.chatBubble}
// //             onChange={(e) => handleColorChange("chatBubble", e.target.value)}
// //           />
// //         </label>
// //         <label>
// //           Chat Bubble Text Color:
// //           <input
// //             type="color"
// //             value={theme.chatBubbleText}
// //             onChange={(e) =>
// //               handleColorChange("chatBubbleText", e.target.value)
// //             }
// //           />
// //         </label>
// //       </div>
// //     </div>
// //   );
// // }

// // export default ThemeCustomizer;

// import { MoonIcon, SunIcon } from "lucide-react";
// import { useState, useEffect } from "react";

// type ThemeType = {
//   background: string;
//   textColor: string; // merged: fontColor + chatBubbleText
//   chatBubble: string;
//   iconBg: string;
//   iconColor: string;
//   userIconBg: string;
//   sendButtonBg: string;
// };

// const presetThemes: Record<"Light" | "Dark", ThemeType> = {
//   Light: {
//     background: "#ffffff", // cleaner light bg
//     textColor: "#0f172a", // slate-900
//     chatBubble: "#f1f5f9", // slate-100
//     iconBg: "#e2e8f0", // slate-200
//     iconColor: "#2563eb", // blue-600
//     userIconBg: "#2563eb", // blue-600
//     sendButtonBg: "#2563eb", // blue-600
//   },
//   Dark: {
//     background: "#0b0f1a", // slightly deeper dark
//     textColor: "#e5e7eb", // zinc-200
//     chatBubble: "#1f2937", // gray-800
//     iconBg: "#111827", // gray-900
//     iconColor: "#93c5fd", // blue-300
//     userIconBg: "#374151", // gray-700
//     sendButtonBg: "#374151", // gray-700
//   },
// };

// const defaultTheme = presetThemes.Dark;
// const THEME_KEY = "customTheme:v2"; // new key to avoid mixing with old shape

// function ThemeCustomizer() {
//   const [theme, setTheme] = useState<ThemeType>(() => {
//     try {
//       const saved = localStorage.getItem(THEME_KEY);
//       if (saved) return JSON.parse(saved) as ThemeType;
//     } catch {
//       // ignore parsing errors
//     }
//     return defaultTheme;
//   });

//   useEffect(() => {
//     // Map our merged textColor to both CSS vars expected by the app
//     const cssMap: Record<string, string> = {
//       "--theme-background": theme.background,
//       "--theme-fontColor": theme.textColor,
//       "--theme-chatBubble": theme.chatBubble,
//       "--theme-chatBubbleText": theme.textColor, // merged!
//       "--theme-iconBg": theme.iconBg,
//       "--theme-iconColor": theme.iconColor,
//       "--theme-userIconBg": theme.userIconBg,
//       "--theme-sendButtonBg": theme.sendButtonBg,
//     };

//     Object.entries(cssMap).forEach(([k, v]) =>
//       document.documentElement.style.setProperty(k, v)
//     );

//     localStorage.setItem(THEME_KEY, JSON.stringify(theme));
//     window.dispatchEvent(new Event("themeChange"));
//   }, [theme]);

//   const handleColorChange = (key: keyof ThemeType, value: string) => {
//     setTheme((prev) => ({ ...prev, [key]: value }));
//   };

//   const applyPreset = (preset: keyof typeof presetThemes) => {
//     setTheme(presetThemes[preset]);
//   };

//   return (
//     <div
//       style={{
//         padding: 0,
//         background: "var(--theme-background)",
//         color: "var(--theme-fontColor)",
//         borderRadius: 12,
//         maxWidth: 320,
//       }}
//     >
//       <h2 style={{ marginBottom: 16 }}>Theme Customizer</h2>
//       {/* Presets: Light / Dark only
//       <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
//         {(["Light", "Dark"] as const).map((preset) => (
//           <button
//             key={preset}
//             onClick={() => applyPreset(preset)}
//             style={{
//               background: presetThemes[preset].background,
//               color: presetThemes[preset].textColor,
//               border: "1px solid #ccc",
//               borderRadius: 6,
//               padding: "6px 12px",
//               cursor: "pointer",
//             }}
//           >
//             {preset}
//           </button>
//         ))}
//       </div> */}
//       {/* Presets: Light / Dark only */}
//       <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
//         {(["Light", "Dark"] as const).map((preset) => (
//           <button
//             key={preset}
//             onClick={() => applyPreset(preset)}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 6, // spacing between icon and text
//               background: presetThemes[preset].background,
//               color: presetThemes[preset].textColor,
//               border: "1px solid #ccc",
//               borderRadius: 6,
//               padding: "6px 12px",
//               cursor: "pointer",
//             }}
//           >
//             {preset === "Light" ? (
//               <SunIcon size={16} color={presetThemes[preset].iconColor} />
//             ) : (
//               <MoonIcon size={16} color={presetThemes[preset].iconColor} />
//             )}
//             {preset}
//           </button>
//         ))}
//       </div>
//       {/* Controls */}
//       <div style={{ display: "grid", gap: 12 }}>
//         <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           Background Color:
//           <input
//             type="color"
//             value={theme.background}
//             onChange={(e) => handleColorChange("background", e.target.value)}
//           />
//         </label>

//         {/* Merged Text Color */}
//         <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           Text Color:
//           <input
//             type="color"
//             value={theme.textColor}
//             onChange={(e) => handleColorChange("textColor", e.target.value)}
//           />
//         </label>

//         <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           Icon BG Color:
//           <input
//             type="color"
//             value={theme.iconBg}
//             onChange={(e) => handleColorChange("iconBg", e.target.value)}
//           />
//         </label>

//         <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           Icon Color:
//           <input
//             type="color"
//             value={theme.iconColor}
//             onChange={(e) => handleColorChange("iconColor", e.target.value)}
//           />
//         </label>

//         <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           ChatBubble Color:
//           <input
//             type="color"
//             value={theme.chatBubble}
//             onChange={(e) => handleColorChange("chatBubble", e.target.value)}
//           />
//         </label>
//       </div>
//     </div>
//   );
// }

// export default ThemeCustomizer;

// import { Monitor, MoonIcon, SunIcon } from "lucide-react";
// import React from "react";
// import { useThemeMode } from "../context/ThemeContext"; // adjust path as needed

// // Small helper pill button
// const Pill: React.FC<{
//   active?: boolean;
//   onClick?: () => void;
//   children: React.ReactNode;
//   title?: string;
// }> = ({ active, onClick, children, title }) => (
//   <button
//     onClick={onClick}
//     title={title}
//     style={{
//       display: "inline-flex",
//       alignItems: "center",
//       gap: 8,
//       padding: "8px 12px",
//       borderRadius: 999,
//       border: active ? "1px solid var(--theme-iconColor)" : "1px solid #ccc",
//       background: active ? "rgba(0,0,0,0.05)" : "transparent",
//       cursor: "pointer",
//     }}
//   >
//     {children}
//   </button>
// );

// const ThemeCustomizer: React.FC = () => {
//   const { mode, resolvedMode, setMode } = useThemeMode();

//   return (
//     <div
//       style={{
//         padding: 12,
//         background: "var(--theme-background)",
//         color: "var(--theme-fontColor)",
//         borderRadius: 12,
//         maxWidth: 360,
//         border: "1px solid #e5e7eb",
//       }}
//     >
//       <h2 style={{ marginBottom: 12 }}>Appearance</h2>

//       {/* Mode chooser */}
//       <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
//         <Pill
//           active={mode === "system"}
//           onClick={() => setMode("system")}
//           title="Follow OS"
//         >
//           <Monitor size={16} />
//           System
//         </Pill>
//         <Pill
//           active={mode === "light"}
//           onClick={() => setMode("light")}
//           title="Always Light"
//         >
//           <SunIcon size={16} />
//           Light
//         </Pill>
//         <Pill
//           active={mode === "dark"}
//           onClick={() => setMode("dark")}
//           title="Always Dark"
//         >
//           <MoonIcon size={16} />
//           Dark
//         </Pill>
//       </div>

//       {/* Current status helper text */}
//       <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
//         Active theme: <strong>{resolvedMode}</strong>
//         {mode === "system" ? " (following system preference)" : ""}
//       </p>
//     </div>
//   );
// };

// export default ThemeCustomizer;

// import { Monitor, MoonIcon, SunIcon } from "lucide-react";
// import React from "react";
// import { useThemeMode } from "../context/ThemeContext";

// type Props = { onClose?: () => void };

// const Pill: React.FC<{
//   active?: boolean;
//   onClick?: () => void;
//   children: React.ReactNode;
//   title?: string;
// }> = ({ active, onClick, children, title }) => (
//   <button
//     onClick={onClick}
//     title={title}
//     style={{
//       display: "inline-flex",
//       alignItems: "center",
//       gap: 8,
//       padding: "8px 12px",
//       borderRadius: 999,
//       border: active ? "1px solid var(--theme-iconColor)" : "1px solid #ccc",
//       background: active ? "rgba(0,0,0,0.05)" : "transparent",
//       cursor: "pointer",
//     }}
//   >
//     {children}
//   </button>
// );

// const ThemeCustomizer: React.FC<Props> = ({ onClose }) => {
//   const { mode, resolvedMode, setMode } = useThemeMode();

//   const select = (m: "light" | "dark" | "system") => {
//     setMode(m);
//     onClose?.(); // ✅ close modal immediately after selection
//   };

//   return (
//     <div
//       style={{
//         padding: 12,
//         background: "var(--theme-background)",
//         color: "var(--theme-fontColor)",
//         borderRadius: 12,
//         maxWidth: 360,
//         border: "1px solid #e5e7eb",
//       }}
//     >
//       <h2 style={{ marginBottom: 12 }}>Appearance</h2>

//       <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
//         <Pill
//           active={mode === "system"}
//           onClick={() => select("system")}
//           title="Follow OS"
//         >
//           <Monitor size={16} />
//           System
//         </Pill>
//         <Pill
//           active={mode === "light"}
//           onClick={() => select("light")}
//           title="Always Light"
//         >
//           <SunIcon size={16} />
//           Light
//         </Pill>
//         <Pill
//           active={mode === "dark"}
//           onClick={() => select("dark")}
//           title="Always Dark"
//         >
//           <MoonIcon size={16} />
//           Dark
//         </Pill>
//       </div>

//       <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
//         Active theme: <strong>{resolvedMode}</strong>
//         {mode === "system" ? " (following system preference)" : ""}
//       </p>
//     </div>
//   );
// };

// export default ThemeCustomizer;

import { Monitor, MoonIcon, SunIcon } from "lucide-react";
import React from "react";
import { useThemeMode } from "../context/ThemeContext";

type Props = { onClose?: () => void };

const Pill: React.FC<{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ active, onClick, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 16px",
      borderRadius: "12px",
      border: active
        ? "2px solid var(--theme-iconColor)"
        : "2px solid var(--theme-borderColor)",
      background: active ? "var(--theme-iconColor)" : "var(--theme-surface-bg)",
      color: active ? "var(--theme-chatBubbleUserText)" : "var(--theme-text)",
      cursor: "pointer",
      transition: "var(--theme-transition)",
      fontSize: "14px",
      fontWeight: active ? "600" : "500",
      minWidth: "90px",
      justifyContent: "center",
      boxShadow: active
        ? `0 2px 8px var(--theme-shadow)`
        : `0 1px 3px var(--theme-shadow)`,
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.background = "var(--theme-iconBg)";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = `0 4px 12px var(--theme-shadow)`;
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.background = "var(--theme-surface-bg)";
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = `0 1px 3px var(--theme-shadow)`;
      }
    }}
  >
    {children}
  </button>
);

const ThemeCustomizer: React.FC<Props> = ({ onClose }) => {
  const { mode, resolvedMode, setMode } = useThemeMode();

  const select = (m: "light" | "dark" | "system") => {
    setMode(m);
    onClose?.();
  };

  return (
    <div
      style={{
        padding: "24px",
        background: "var(--theme-background)",
        color: "var(--theme-text)",
        borderRadius: "16px",
        maxWidth: "400px",
        border: "1px solid var(--theme-borderColor)",
        boxShadow: `0 20px 60px var(--theme-shadow)`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "20px",
            fontWeight: "700",
            color: "var(--theme-text)",
          }}
        >
          🎨 Appearance
        </h2>
        <p
          style={{
            margin: "0",
            fontSize: "14px",
            color: "var(--theme-text-secondary)",
            lineHeight: "1.5",
          }}
        >
          Choose your preferred theme for the chat interface
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <Pill
          active={mode === "system"}
          onClick={() => select("system")}
          title="Follow your system preference"
        >
          <Monitor size={16} />
          System
        </Pill>
        <Pill
          active={mode === "light"}
          onClick={() => select("light")}
          title="Always use light theme"
        >
          <SunIcon size={16} />
          Light
        </Pill>
        <Pill
          active={mode === "dark"}
          onClick={() => select("dark")}
          title="Always use dark theme"
        >
          <MoonIcon size={16} />
          Dark
        </Pill>
      </div>

      <div
        style={{
          padding: "16px",
          background: "var(--theme-secondary-bg)",
          borderRadius: "12px",
          border: "1px solid var(--theme-borderColor)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--theme-success)",
            }}
          />
          <span
            style={{ fontSize: "13px", color: "var(--theme-text-secondary)" }}
          >
            Currently active:{" "}
            <strong style={{ color: "var(--theme-text)" }}>
              {resolvedMode}
            </strong>
            {mode === "system" ? " (following system)" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;

// first time claude update design

// import { Monitor, Moon, Sun } from "lucide-react";
// import React from "react";
// import { useThemeMode } from "../context/ThemeContext";

// const ModernThemePill: React.FC<{
//   active?: boolean;
//   onClick?: () => void;
//   children: React.ReactNode;
//   title?: string;
// }> = ({ active, onClick, children, title }) => (
//   <button
//     onClick={onClick}
//     title={title}
//     className={`group relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 border ${
//       active
//         ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 shadow-lg shadow-blue-500/10"
//         : "bg-gray-800/40 hover:bg-gray-700/50 border-gray-700/50 hover:border-gray-600/50"
//     }`}
//     style={{
//       backdropFilter: "blur(12px)",
//     }}
//   >
//     {active && (
//       <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl" />
//     )}
//     <div className="relative z-10 flex items-center gap-3">{children}</div>
//     {active && (
//       <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
//     )}
//   </button>
// );

// const ModernThemeCustomizer: React.FC<{ onClose?: () => void }> = ({
//   onClose,
// }) => {
//   const { mode, resolvedMode, setMode } = useThemeMode();

//   const select = (m: "light" | "dark" | "system") => {
//     setMode(m);
//     onClose?.();
//   };

//   const themeOptions = [
//     {
//       key: "system" as const,
//       icon: Monitor,
//       label: "System",
//       description: "Follow OS preference",
//       gradient: "from-gray-500/20 to-gray-600/20",
//     },
//     {
//       key: "light" as const,
//       icon: Sun,
//       label: "Light",
//       description: "Always light mode",
//       gradient: "from-yellow-500/20 to-orange-500/20",
//     },
//     {
//       key: "dark" as const,
//       icon: Moon,
//       label: "Dark",
//       description: "Always dark mode",
//       gradient: "from-indigo-500/20 to-purple-500/20",
//     },
//   ];

//   return (
//     <div className="p-6 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl max-w-md shadow-2xl">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
//           <Monitor size={20} className="text-blue-400" />
//         </div>
//         <div>
//           <h2 className="text-xl font-semibold text-gray-100 mb-1">
//             Appearance
//           </h2>
//           <p className="text-sm text-gray-400">Choose your preferred theme</p>
//         </div>
//       </div>

//       <div className="space-y-3 mb-6">
//         {themeOptions.map((option) => {
//           const IconComponent = option.icon;
//           const isActive = mode === option.key;

//           return (
//             <ModernThemePill
//               key={option.key}
//               active={isActive}
//               onClick={() => select(option.key)}
//               title={option.description}
//             >
//               <div
//                 className={`w-8 h-8 rounded-xl flex items-center justify-center ${
//                   isActive
//                     ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/30"
//                     : "bg-gray-700/50 border border-gray-600/30"
//                 }`}
//               >
//                 <IconComponent
//                   size={16}
//                   className={isActive ? "text-blue-300" : "text-gray-400"}
//                 />
//               </div>
//               <div className="flex flex-col items-start">
//                 <span
//                   className={`font-medium ${
//                     isActive ? "text-blue-300" : "text-gray-300"
//                   }`}
//                 >
//                   {option.label}
//                 </span>
//                 <span className="text-xs text-gray-500">
//                   {option.description}
//                 </span>
//               </div>
//             </ModernThemePill>
//           );
//         })}
//       </div>

//       <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/30 backdrop-blur-sm">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
//           <span className="text-sm font-medium text-gray-300">
//             Current Status
//           </span>
//         </div>
//         <p className="text-sm text-gray-400">
//           Active theme:{" "}
//           <span className="text-green-400 font-medium">{resolvedMode}</span>
//           {mode === "system" && (
//             <span className="text-gray-500 block text-xs mt-1">
//               Following system preference
//             </span>
//           )}
//         </p>
//       </div>
//     </div>
//   );
// };
