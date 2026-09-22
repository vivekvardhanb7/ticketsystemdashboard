/* ============================================================================
   DESIGN SYSTEM TOKENS — Single source of truth (Figma Sep 2026)
   ============================================================================ */

export const COLORS = {
    primary: {
        500: "#78EF63", // Main Brand Green
        700: "#5CEB47"
    },
    secondary: {
        500: "#F1B568", // In-Progress Orange
        700: "#F84311"
    },
    backgrounds: {
        main: "#0C0D0E",   // App Background
        card: "#111315",   // Component Background
        input: "#15181A",  // Form Inputs / Table header
        sidebar: "#131416" // Nav Areas
    },
    text: {
        heading: "#EFF2F0",
        body: "#A0A8AD",
        disabled: "#78828A"
    },
    border: "#282C2F",
    activeBg: "#17241A",
    activeBorder: "#345135"
};

/**
 * Build Authorization headers from auth data stored in state/localStorage.
 */
export function getAuthHeaders(authData) {
    const headers = {};
    if (!authData) return headers;

    if (authData.accessToken) {
        headers['Authorization'] = `Bearer ${authData.accessToken}`;
    } else if (authData.token || authData.jwt) {
        headers['Authorization'] = `Bearer ${authData.token || authData.jwt}`;
    }
    return headers;
}

/**
 * Returns a human-readable relative timestamp, e.g. "2h ago", "3 days ago".
 */
export function timeAgo(dateString) {
    if (!dateString) return '';
    const now = Date.now();
    const then = new Date(dateString).getTime();
    if (isNaN(then)) return '';

    const seconds = Math.floor((now - then) / 1000);
    if (seconds < 60) return 'just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(months / 12);
    return `${years}y ago`;
}
