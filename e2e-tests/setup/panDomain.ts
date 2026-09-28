import { generateKeyPairSync } from "node:crypto";
import { createCookie } from "@guardian/pan-domain-node/dist/src/panda.js";

export const authCookieName = "gutoolsAuth-assym";
export const authUserEmail = "e2e.editor@guardian.co.uk";

export interface PanDomainKeys {
  privateKeyPem: string;
  privateKeyBase64: string;
  publicKeyBase64: string;
}

function pemToBase64(pem: string): string {
  return pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s/g, "");
}

export function generatePanDomainKeys(): PanDomainKeys {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return {
    privateKeyPem: privateKey,
    privateKeyBase64: pemToBase64(privateKey),
    publicKeyBase64: pemToBase64(publicKey),
  };
}

export function createE2eAuthCookie(privateKeyPem: string): string {
  return createCookie(
    {
      firstName: "E2E",
      lastName: "Editor",
      email: authUserEmail,
      authenticatingSystem: "fronts",
      authenticatedIn: ["fronts"],
      expires: Date.now() + 24 * 60 * 60 * 1000,
      multifactor: true,
    },
    privateKeyPem,
  );
}