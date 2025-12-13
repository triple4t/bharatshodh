// import { Monitor, MoonIcon, SunIcon } from "lucide-react";
// import { useThemeMode } from "../context/ThemeContext"; // adjust path

// function ThemeFab({ onOpen }: { onOpen: () => void }) {
//   const { mode, resolvedMode } = useThemeMode();

//   const Icon =
//     mode === "system" ? Monitor : resolvedMode === "dark" ? MoonIcon : SunIcon;

//   return (
//     <button
//       aria-label="Theme"
//       title={
//         mode === "system"
//           ? "System theme"
//           : resolvedMode === "dark"
//           ? "Dark theme"
//           : "Light theme"
//       }
//       onClick={onOpen}
//       className="fixed top-1 right-3 z-50 inline-flex items-center justify-center rounded-full shadow-md border"
//       style={{
//         width: 38,
//         height: 38,
//         background: "var(--theme-background)",
//         color: "var(--theme-fontColor)",
//         borderColor: "var(--theme-iconBg, #e5e7eb)",
//       }}
//     >
//       <Icon size={18} />
//     </button>
//   );
// }

// export default ThemeFab;

import { Monitor, MoonIcon, SunIcon } from "lucide-react";
import { useThemeMode } from "../context/ThemeContext";

function ThemeFab({ onOpen }: { onOpen: () => void }) {
  const { mode, resolvedMode } = useThemeMode();

  const Icon =
    mode === "system" ? Monitor : resolvedMode === "dark" ? MoonIcon : SunIcon;

  return (
    <button
      aria-label="Theme"
      title={
        mode === "system"
          ? "System theme"
          : resolvedMode === "dark"
          ? "Dark theme"
          : "Light theme"
      }
      onClick={onOpen}
      className="theme-fab"
      style={{
        position: "fixed",
        top: "6px",
        right: "16px",
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "var(--theme-surface-bg)",
        color: "var(--theme-iconColor)",
        border: "1px solid var(--theme-borderColor)",
        cursor: "pointer",
        transition: "var(--theme-transition)",
        boxShadow: `0 4px 12px var(--theme-shadow)`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = `0 8px 24px var(--theme-shadow)`;
        e.currentTarget.style.color = "var(--theme-iconHover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = `0 4px 12px var(--theme-shadow)`;
        e.currentTarget.style.color = "var(--theme-iconColor)";
      }}
    >
      <Icon size={20} />
    </button>
  );
}

export default ThemeFab;

// this first claude update code
// import { Monitor, Moon, Sun } from "lucide-react";
// import { useThemeMode } from "../context/ThemeContext";
// import { useState } from "react";

// const ModernThemeFab = ({ onOpen }: { onOpen: () => void }) => {
//   const { mode, resolvedMode } = useThemeMode();
//   const [isHovered, setIsHovered] = useState(false);

//   const getIconAndColor = () => {
//     if (mode === "system") {
//       return {
//         Icon: Monitor,
//         color: "from-gray-500 to-gray-600",
//         shadow: "shadow-gray-500/20",
//       };
//     }
//     if (resolvedMode === "dark") {
//       return {
//         Icon: Moon,
//         color: "from-indigo-500 to-purple-600",
//         shadow: "shadow-purple-500/20",
//       };
//     }
//     return {
//       Icon: Sun,
//       color: "from-yellow-500 to-orange-500",
//       shadow: "shadow-yellow-500/20",
//     };
//   };

//   const { Icon, color, shadow } = getIconAndColor();

//   const getTooltipText = () => {
//     if (mode === "system") return "System theme";
//     return resolvedMode === "dark" ? "Dark theme" : "Light theme";
//   };

//   return (
//     <div className="fixed top-4 right-4 z-50">
//       {isHovered && (
//         <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl text-sm text-gray-300 whitespace-nowrap shadow-2xl">
//           {getTooltipText()}
//           <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700/50" />
//         </div>
//       )}

//       <button
//         aria-label="Theme"
//         onClick={onOpen}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         className={`group w-12 h-12 rounded-2xl bg-gradient-to-br ${color} ${shadow} border border-white/10 backdrop-blur-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-12 shadow-lg`}
//       >
//         <Icon
//           size={20}
//           className="text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-200"
//         />

//         {/* Animated ring on hover */}
//         <div className="absolute inset-0 rounded-2xl border-2 border-white/20 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200" />
//       </button>
//     </div>
//   );
// };
