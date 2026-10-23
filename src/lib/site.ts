// Public URL of the site. Set NEXT_PUBLIC_SITE_URL=https://truxange.com once the
// domain points to Vercel; until then the Vercel production URL is used.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/**
 * Search engines may index the site only on the production deployment with the
 * real domain configured. Previews and the *.vercel.app URL stay out of Google.
 */
export const INDEXABLE = Boolean(process.env.NEXT_PUBLIC_SITE_URL) && process.env.VERCEL_ENV === "production";

export const SITE_NAME = "truXanger";
export const SITE_TAGLINE = "Cambia lo que tienes por lo que quieres";
export const SITE_DESCRIPTION =
  "Trueque entre vecinos en México y Estados Unidos. Sube lo que ya no usas, desliza y cámbialo por lo que quieres, sin dinero de por medio.";
