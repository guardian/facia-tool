import { createCookie } from "@guardian/pan-domain-node/dist/src/panda.js";
import { PANDA_COOKIE_NAME } from "./constants";

export const roles = {
  default: "fronts.e2e.test@guardian.co.uk",
} as const;

export type Role = keyof typeof roles;

const defaultExpiryMs = 24 * 60 * 60 * 1000;

export function createPanDomainCookie(
  role: Role,
  privateKeyPem: string,
  cookieDomain: string,
  expiresInMs: number = defaultExpiryMs,
) {
  const value = createCookie(
    {
      firstName: "Fronts",
      lastName: "Tester",
      email: roles[role],
      authenticatingSystem: "fronts",
      authenticatedIn: ["fronts"],
      expires: Date.now() + expiresInMs,
      multifactor: true,
    },
    privateKeyPem,
  );

  return {
    name: PANDA_COOKIE_NAME,
    value,
    domain: cookieDomain,
    path: "/",
    httpOnly: false,
    secure: false,
    expires: Math.floor((Date.now() + expiresInMs) / 1000),
  };
}
