import { generateKeyPairSync } from "node:crypto";

export interface PanDomainKeys {
  privateKeyPem: string;
  publicKeyPem: string;
  privateKeyBase64: string;
  publicKeyBase64: string;
}

function pemToBase64(pem: string): string {
  return pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
}

export function generatePanDomainKeys(): PanDomainKeys {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  return {
    privateKeyPem: privateKey,
    publicKeyPem: publicKey,
    privateKeyBase64: pemToBase64(privateKey),
    publicKeyBase64: pemToBase64(publicKey),
  };
}
