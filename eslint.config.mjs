import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  // scripts/ holds standalone Node processes (VPN server bootstrap, the
  // Telegram bot) that run outside the Next.js app via plain `node` - not
  // part of the app's lint/type surface.
  { ignores: ["scripts/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
