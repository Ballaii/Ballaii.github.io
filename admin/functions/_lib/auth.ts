import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AccessEnv {
  CF_ACCESS_AUD: string;
  CF_ACCESS_TEAM_DOMAIN: string;
}

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("Cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) {
      return value.join("=");
    }
  }
  return null;
}

function getKeySet(teamDomain: string): ReturnType<typeof createRemoteJWKSet> {
  const existing = keySets.get(teamDomain);
  if (existing) {
    return existing;
  }
  const keySet = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
  keySets.set(teamDomain, keySet);
  return keySet;
}

export async function requireAccessIdentity(request: Request, env: AccessEnv): Promise<string> {
  if (!env.CF_ACCESS_AUD || !env.CF_ACCESS_TEAM_DOMAIN) {
    throw new Error("Access verification is not configured");
  }
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN.replace(/\/$/, "");
  const token =
    request.headers.get("Cf-Access-Jwt-Assertion") ?? readCookie(request, "CF_Authorization");
  if (!token) {
    throw new Error("Cloudflare Access token is missing");
  }
  const { payload } = await jwtVerify(token, getKeySet(teamDomain), {
    audience: env.CF_ACCESS_AUD,
    issuer: [teamDomain, `${teamDomain}/`],
  });
  if (typeof payload.email !== "string" || !payload.email.includes("@")) {
    throw new Error("Cloudflare Access identity is missing an email");
  }
  return payload.email;
}
