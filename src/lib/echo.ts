import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally for Echo
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).Pusher = Pusher;
}

let echoInstance: Echo<"reverb"> | null = null;

export function getEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined") return null;

  if (echoInstance) return echoInstance;

  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
  const wsHost = process.env.NEXT_PUBLIC_REVERB_HOST || "staging-api.komuu.com";
  const wsPort = parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080");

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "komuu-reverb-key",
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS: wsPort === 443,
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${apiUrl}broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });

  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

export function reconnectEcho() {
  disconnectEcho();
  return getEcho();
}
