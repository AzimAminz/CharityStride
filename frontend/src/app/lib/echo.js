import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Only create Echo instance on client side
let echo = null;

if (typeof window !== "undefined") {
  window.Pusher = Pusher;

  echo = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 6001,
    wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 6001,
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || "http") === "https",
    enabledTransports: ["ws", "wss"],
  });
}

export default echo;
