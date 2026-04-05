// WhatsApp-style doodle pattern SVG for chat backgrounds
// Tiny membership-themed icons: certificates, groups, chat bubbles, calendars, badges

const LIGHT_DOODLE = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <g fill="none" stroke="#d1d5db" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" opacity="0.35">
    <!-- Chat bubble -->
    <path d="M25 15c0-3.3 3.6-6 8-6s8 2.7 8 6-3.6 6-8 6c-1.5 0-2.9-.3-4.1-.8L25 22l1.5-3.2C25.5 17.6 25 16.4 25 15z" transform="translate(10,10)"/>
    <!-- Certificate/badge -->
    <circle cx="155" cy="25" r="8"/>
    <path d="M155 33v8M151 37h8"/>
    <path d="M149 19l6 6 6-6"/>
    <!-- Calendar -->
    <rect x="230" y="12" width="16" height="14" rx="2"/>
    <line x1="230" y1="18" x2="246" y2="18"/>
    <line x1="234" y1="9" x2="234" y2="14"/>
    <line x1="242" y1="9" x2="242" y2="14"/>
    <!-- People/group -->
    <circle cx="45" cy="85" r="4"/>
    <circle cx="55" cy="85" r="4"/>
    <path d="M38 95a9 9 0 0118 0"/>
    <!-- Document -->
    <path d="M140 75h12v16h-16v-12z"/>
    <path d="M140 75l-4 4"/>
    <line x1="130" y1="83" x2="148" y2="83"/>
    <line x1="130" y1="87" x2="144" y2="87"/>
    <!-- Star -->
    <path d="M240 80l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
    <!-- Wifi/signal -->
    <path d="M20 155a12 12 0 0116 0M24 159a7 7 0 019 0M28 163a2 2 0 013 0"/>
    <!-- Heart -->
    <path d="M150 150c0-4 8-8 8-4s-8 10-8 10-8-6-8-10 8 0 8 4z"/>
    <!-- Lock/secure -->
    <rect x="232" y="152" width="10" height="8" rx="1"/>
    <path d="M234 152v-3a3 3 0 016 0v3"/>
    <!-- Globe -->
    <circle cx="50" cy="165" r="8"/>
    <ellipse cx="50" cy="165" rx="4" ry="8"/>
    <line x1="42" y1="165" x2="58" y2="165"/>
    <!-- Envelope -->
    <rect x="125" y="215" width="16" height="12" rx="1"/>
    <path d="M125 217l8 6 8-6"/>
    <!-- Clock -->
    <circle cx="240" cy="225" r="8"/>
    <path d="M240 220v5l3 3"/>
    <!-- Phone -->
    <rect x="28" y="225" width="10" height="16" rx="2"/>
    <line x1="31" y1="237" x2="35" y2="237"/>
    <!-- Music note -->
    <path d="M60 280v-12l8-2v12"/>
    <circle cx="60" cy="280" r="2"/>
    <circle cx="68" cy="278" r="2"/>
    <!-- Camera -->
    <rect x="140" y="270" width="16" height="12" rx="2"/>
    <circle cx="148" cy="277" r="3"/>
    <path d="M144 270l2-3h4l2 3"/>
    <!-- Pin/location -->
    <path d="M240 268a5 5 0 110 10 5 5 0 010-10z"/>
    <path d="M240 282l-5-7h10z"/>
    <circle cx="240" cy="273" r="2"/>
  </g>
</svg>`);

const DARK_DOODLE = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <g fill="none" stroke="#374151" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
    <!-- Chat bubble -->
    <path d="M25 15c0-3.3 3.6-6 8-6s8 2.7 8 6-3.6 6-8 6c-1.5 0-2.9-.3-4.1-.8L25 22l1.5-3.2C25.5 17.6 25 16.4 25 15z" transform="translate(10,10)"/>
    <!-- Certificate/badge -->
    <circle cx="155" cy="25" r="8"/>
    <path d="M155 33v8M151 37h8"/>
    <path d="M149 19l6 6 6-6"/>
    <!-- Calendar -->
    <rect x="230" y="12" width="16" height="14" rx="2"/>
    <line x1="230" y1="18" x2="246" y2="18"/>
    <line x1="234" y1="9" x2="234" y2="14"/>
    <line x1="242" y1="9" x2="242" y2="14"/>
    <!-- People/group -->
    <circle cx="45" cy="85" r="4"/>
    <circle cx="55" cy="85" r="4"/>
    <path d="M38 95a9 9 0 0118 0"/>
    <!-- Document -->
    <path d="M140 75h12v16h-16v-12z"/>
    <path d="M140 75l-4 4"/>
    <line x1="130" y1="83" x2="148" y2="83"/>
    <line x1="130" y1="87" x2="144" y2="87"/>
    <!-- Star -->
    <path d="M240 80l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
    <!-- Wifi/signal -->
    <path d="M20 155a12 12 0 0116 0M24 159a7 7 0 019 0M28 163a2 2 0 013 0"/>
    <!-- Heart -->
    <path d="M150 150c0-4 8-8 8-4s-8 10-8 10-8-6-8-10 8 0 8 4z"/>
    <!-- Lock/secure -->
    <rect x="232" y="152" width="10" height="8" rx="1"/>
    <path d="M234 152v-3a3 3 0 016 0v3"/>
    <!-- Globe -->
    <circle cx="50" cy="165" r="8"/>
    <ellipse cx="50" cy="165" rx="4" ry="8"/>
    <line x1="42" y1="165" x2="58" y2="165"/>
    <!-- Envelope -->
    <rect x="125" y="215" width="16" height="12" rx="1"/>
    <path d="M125 217l8 6 8-6"/>
    <!-- Clock -->
    <circle cx="240" cy="225" r="8"/>
    <path d="M240 220v5l3 3"/>
    <!-- Phone -->
    <rect x="28" y="225" width="10" height="16" rx="2"/>
    <line x1="31" y1="237" x2="35" y2="237"/>
    <!-- Music note -->
    <path d="M60 280v-12l8-2v12"/>
    <circle cx="60" cy="280" r="2"/>
    <circle cx="68" cy="278" r="2"/>
    <!-- Camera -->
    <rect x="140" y="270" width="16" height="12" rx="2"/>
    <circle cx="148" cy="277" r="3"/>
    <path d="M144 270l2-3h4l2 3"/>
    <!-- Pin/location -->
    <path d="M240 268a5 5 0 110 10 5 5 0 010-10z"/>
    <path d="M240 282l-5-7h10z"/>
    <circle cx="240" cy="273" r="2"/>
  </g>
</svg>`);

export const chatBgStyle = {
  light: { backgroundImage: `url("data:image/svg+xml,${LIGHT_DOODLE}")`, backgroundColor: "#f0f2f5" } as React.CSSProperties,
  dark: { backgroundImage: `url("data:image/svg+xml,${DARK_DOODLE}")`, backgroundColor: "#0b141a" } as React.CSSProperties,
};

import React from "react";

/**
 * Hook to get the correct chat background style based on theme.
 * Uses next-themes to detect dark mode.
 */
export function useChatBgStyle(): React.CSSProperties {
  const [style, setStyle] = React.useState<React.CSSProperties>(chatBgStyle.light);

  React.useEffect(() => {
    // Check current theme
    const update = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setStyle(isDark ? chatBgStyle.dark : chatBgStyle.light);
    };

    update();

    // Watch for theme changes via class mutations on <html>
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return style;
}
