import { Fraunces, Space_Grotesk } from "next/font/google";

/** Display serif — headings, logo, big numbers in the admin console. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-admin-display",
  display: "swap",
});

/** Body/UI sans for the admin console. */
export const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-admin-sans",
  display: "swap",
});
