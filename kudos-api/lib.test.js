"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const handler = require("./lib");

test("slug pattern", function () {
  assert.equal(handler.validSlug("its-not-sabotage-its-a-catapult"), true);
  assert.equal(handler.validSlug("zen-pad.minimal-markdown-editor"), true);
  assert.equal(handler.validSlug("../etc"), false);
  assert.equal(handler.validSlug("HasCaps"), false);
  assert.equal(handler.validSlug(""), false);
  assert.equal(handler.validSlug("a/b"), false);
});

test("cors origins", function () {
  assert.equal(handler.isAllowedOrigin("https://aliirz.com"), true);
  assert.equal(handler.isAllowedOrigin("https://www.aliirz.com"), true);
  assert.equal(handler.isAllowedOrigin("http://localhost:4000"), true);
  assert.equal(handler.isAllowedOrigin("http://127.0.0.1:4000"), true);
  assert.equal(handler.isAllowedOrigin("http://localhost"), true);
  assert.equal(handler.isAllowedOrigin("https://evil.example"), false);
  assert.equal(handler.isAllowedOrigin("http://aliirz.com"), false);
});

function mockRes() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    ended: false,
    setHeader: function (key, value) { this.headers[key.toLowerCase()] = value; },
    status: function (code) { this.statusCode = code; return this; },
    json: function (body) { this.body = body; return this; },
    end: function () { this.ended = true; return this; }
  };
}

test("rejects a bad slug before talking to redis", async function () {
  const res = mockRes();
  await handler({
    method: "GET",
    url: "/api/kudos?slug=../nope",
    headers: { origin: "http://localhost:4000", host: "localhost:3000" },
    query: { slug: "../nope" }
  }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.headers["access-control-allow-origin"], "http://localhost:4000");
  assert.equal(res.body.error, "bad slug");
});

test("hides counts when redis is unset", async function () {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  const res = mockRes();
  await handler({
    method: "POST",
    headers: { origin: "https://aliirz.com", host: "localhost" },
    body: { slug: "its-not-sabotage-its-a-catapult" }
  }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.headers["access-control-allow-origin"], "https://aliirz.com");
});

test("preflight", async function () {
  const res = mockRes();
  await handler({
    method: "OPTIONS",
    headers: { origin: "http://127.0.0.1:4000" }
  }, res);
  assert.equal(res.statusCode, 204);
  assert.equal(res.headers["access-control-allow-origin"], "http://127.0.0.1:4000");
  assert.match(res.headers["access-control-allow-methods"], /POST/);
});
