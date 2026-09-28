import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { createServer, request } from "node:http";
import { resolve } from "node:path";
import { Network, type StartedTestContainer } from "testcontainers";
import {
  authCookieName,
  createE2eAuthCookie,
  generatePanDomainKeys,
} from "../setup/panDomain.js";
import {
  nativeAppPort,
  startAuthRedirect,
} from "../setup/stack/auth-redirect.js";

const upstream = createServer(async (incoming, response) => {
  const chunks: Buffer[] = [];
  for await (const chunk of incoming) {
    chunks.push(Buffer.from(chunk));
  }
  response.writeHead(incoming.url === "/failure" ? 418 : 200, {
    "Content-Type": "application/json",
  });
  response.end(
    JSON.stringify({
      method: incoming.method,
      url: incoming.url,
      host: incoming.headers.host,
      cookie: incoming.headers.cookie,
      proto: incoming.headers["x-forwarded-proto"],
      body: Buffer.concat(chunks).toString(),
    }),
  );
});
upstream.on("upgrade", (_incoming, socket) => {
  socket.end(
    "HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n",
  );
});

const network = await new Network().start();
let proxy: StartedTestContainer | undefined;
try {
  upstream.listen(nativeAppPort, "0.0.0.0");
  await once(upstream, "listening");
  const cookie = createE2eAuthCookie(generatePanDomainKeys().privateKeyPem);
  proxy = await startAuthRedirect(
    resolve(import.meta.dirname, ".."),
    network,
    randomUUID(),
    "native",
    cookie,
  );
  const baseUrl = `http://${proxy.getHost()}:${proxy.getMappedPort(80)}`;
  assert.equal(proxy.getMappedPort(80), 9000);
  const redirect = await fetch(`${baseUrl}/cookie`, { redirect: "manual" });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get("location"), "/v2");
  assert.equal(redirect.headers.get("cache-control"), "no-store");
  assert.equal(
    redirect.headers.get("set-cookie"),
    `${authCookieName}=${cookie}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`,
  );
  const secureRedirect = await fetch(`${baseUrl}/cookie`, {
    redirect: "manual",
    headers: { "X-Forwarded-Proto": "https" },
  });
  assert.equal(
    secureRedirect.headers.get("set-cookie"),
    `${redirect.headers.get("set-cookie")}; Secure`,
  );
  const cookieHeader = `${authCookieName}=${cookie}`;
  const page = await fetch(`${baseUrl}/v2?front=test`, {
    headers: { Cookie: cookieHeader },
  });
  assert.deepEqual(await page.json(), {
    method: "GET",
    url: "/v2?front=test",
    host: new URL(baseUrl).host,
    cookie: cookieHeader,
    proto: "http",
    body: "",
  });
  const payload = JSON.stringify([{ id: "e2e-collection" }]);
  const post = await fetch(`${baseUrl}/collections`, {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
      "Content-Type": "application/json",
      "X-Forwarded-Proto": "https",
    },
    body: payload,
  });
  assert.deepEqual(await post.json(), {
    method: "POST",
    url: "/collections",
    host: new URL(baseUrl).host,
    cookie: cookieHeader,
    proto: "https",
    body: payload,
  });
  assert.equal((await fetch(`${baseUrl}/failure`)).status, 418);
  await new Promise<void>((resolveUpgrade, reject) => {
    const upgrade = request(`${baseUrl}/socket`, {
      headers: { Connection: "Upgrade", Upgrade: "websocket" },
    });
    upgrade.on("upgrade", (response, socket) => {
      socket.destroy();
      if (response.statusCode !== 101)
        reject(new Error("WebSocket upgrade failed"));
      else resolveUpgrade();
    });
    upgrade.on("response", (response) => {
      response.resume();
      reject(new Error(`Upgrade returned ${response.statusCode}`));
    });
    upgrade.on("error", reject);
    upgrade.setTimeout(10_000, () =>
      upgrade.destroy(new Error("Upgrade timed out")),
    );
    upgrade.end();
  });
  console.log(
    "Nginx auth redirect, native routing, headers, bodies and WebSocket checks passed",
  );
} finally {
  await proxy?.stop();
  await network.stop();
  upstream.closeAllConnections();
  if (upstream.listening) {
    await new Promise<void>((resolveClose, reject) =>
      upstream.close((error) => (error ? reject(error) : resolveClose())),
    );
  }
}
