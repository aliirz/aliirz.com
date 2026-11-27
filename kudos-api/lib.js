"use strict";

const crypto = require("crypto");

const SLUG = /^[a-z0-9][a-z0-9._-]{0,120}$/;

const ORIGIN = /^(https:\/\/aliirz\.com|https:\/\/www\.aliirz\.com|http:\/\/localhost(?::\d+)?|http:\/\/127\.0\.0\.1(?::\d+)?)$/;

function validSlug(slug) {
  return typeof slug === "string" && SLUG.test(slug);
}

function isAllowedOrigin(origin) {
  return typeof origin === "string" && ORIGIN.test(origin);
}

function clientIp(req) {
  const fwd = req.headers && (req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"]);
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  const first = (raw || (req.socket && req.socket.remoteAddress) || "unknown").split(",")[0].trim();
  return first || "unknown";
}

function ipHash(ip) {
  const salt = process.env.KUDOS_IP_SALT || "";
  return crypto.createHash("sha256").update(salt + "\n" + ip).digest("hex").slice(0, 32);
}

function redisEnv() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token: token };
}

async function redis(args) {
  const env = redisEnv();
  if (!env) {
    const err = new Error("redis not configured");
    err.code = "NO_REDIS";
    throw err;
  }
  const res = await fetch(env.url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(args)
  });
  if (!res.ok) {
    const err = new Error("redis http " + res.status);
    err.code = "REDIS";
    throw err;
  }
  const data = await res.json();
  if (data.error) {
    const err = new Error("redis");
    err.code = "REDIS";
    throw err;
  }
  return data.result;
}

function corsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    Vary: "Origin"
  };
  if (isAllowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function send(res, origin, status, body) {
  const headers = corsHeaders(origin);
  Object.keys(headers).forEach(function (key) {
    res.setHeader(key, headers[key]);
  });
  res.status(status).json(body);
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    if (req.body.length > 2048) return null;
    return JSON.parse(req.body);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2048) return null;
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function querySlug(req) {
  if (req.query && typeof req.query.slug === "string") return req.query.slug;
  try {
    const host = (req.headers && req.headers.host) || "localhost";
    return new URL(req.url || "/", "http://" + host).searchParams.get("slug") || "";
  } catch (e) {
    return "";
  }
}

async function bumpLimit(bucket, limit, ttl) {
  const n = Number(await redis(["INCR", bucket]));
  if (n === 1) await redis(["EXPIRE", bucket, ttl]);
  return n > limit;
}

async function currentCount(slug) {
  const raw = await redis(["GET", "kudos:count:" + slug]);
  const n = raw == null ? 0 : parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

async function handler(req, res) {
  const origin = (req.headers && (req.headers.origin || req.headers.Origin)) || "";
  const method = (req.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    const headers = corsHeaders(origin);
    Object.keys(headers).forEach(function (key) {
      res.setHeader(key, headers[key]);
    });
    res.status(204).end();
    return;
  }

  if (method !== "GET" && method !== "POST") {
    send(res, origin, 405, { error: "method" });
    return;
  }

  try {
    let slug = "";
    if (method === "GET") slug = querySlug(req);
    else {
      const body = await readJson(req);
      slug = body && typeof body.slug === "string" ? body.slug : "";
    }
    if (!validSlug(slug)) {
      send(res, origin, 400, { error: "bad slug" });
      return;
    }

    const hash = ipHash(clientIp(req));
    if (method === "GET") {
      if (await bumpLimit("kudos:rl:get:" + hash, 120, 600)) {
        send(res, origin, 429, { error: "slow down" });
        return;
      }
      send(res, origin, 200, { count: await currentCount(slug) });
      return;
    }

    if (await bumpLimit("kudos:rl:post:" + hash, 30, 3600)) {
      send(res, origin, 429, { error: "slow down" });
      return;
    }

    const fresh = await redis(["SET", "kudos:seen:" + slug + ":" + hash, "1", "NX", "EX", "31536000"]);
    if (fresh !== "OK") {
      send(res, origin, 200, { count: await currentCount(slug) });
      return;
    }
    const count = Number(await redis(["INCR", "kudos:count:" + slug]));
    send(res, origin, 200, { count: count });
  } catch (err) {
    const status = err && err.code === "NO_REDIS" ? 503 : 503;
    send(res, origin, status, { error: "unavailable" });
  }
}

module.exports = handler;
module.exports.validSlug = validSlug;
module.exports.isAllowedOrigin = isAllowedOrigin;
module.exports.clientIp = clientIp;
module.exports.ipHash = ipHash;
