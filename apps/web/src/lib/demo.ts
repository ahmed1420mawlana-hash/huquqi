/** Shared by middleware (edge) and server code: the demo gate cookie holds a hash of the password. */
export const DEMO_COOKIE = "hq_demo";

export async function demoToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`huquqi-demo:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Cookies are Secure in production. INSECURE_COOKIES=1 allows testing a production build over plain http on localhost. */
export function secureCookies(): boolean {
  return process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1";
}
