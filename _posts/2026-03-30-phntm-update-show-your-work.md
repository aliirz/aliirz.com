---
layout: post
title: "Made it show its work"
description: "A builder's update on phntm.sh — what changed, why it matters, and why showing the encryption happening is more than just UX polish."
date: 2026-03-30
tags: [open-source, privacy, security, phntm, cli]
---

I wrote about [phntm.sh](https://phntm.sh) a few weeks ago. The short version: a file sharing tool that encrypts in your browser, puts the key in the URL fragment, and forgets the ciphertext when the timer runs out. I literally cannot read your file.

Since then I've been heads down. Here's what changed and why.

---

**The landing page was lying by omission.**

Not intentionally. But it said "encrypted, self-destructing file sharing" without explaining what that actually means. Most people read that and think: encrypted somewhere on a server, probably. A checkbox someone ticked.

So I rewrote it. The new hero says what's actually happening — your file encrypts *in your browser* before it goes anywhere. The decryption key never touches the server. There's a WHY section now that explains zero-knowledge, not as a buzzword, but as a specific technical decision with real consequences.

It also lists who this is actually built for: journalists, lawyers, developers. People who've had reasons to care about this stuff before the rest of us did.

---

**The encryption is visible now.**

This is the change I'm most proud of.

When you upload a file, the UI now shows you the cipher algorithm and key size in real-time. AES-256-GCM. 256-bit key. Client-side. You can watch it happen. The status text cycles through glyphs before resolving — like a terminal decoding something. A bit theatrical, but also accurate.

I added this to downloads too. When someone receives your file, they see the same details. Cipher. Key size. Client-side processing.

The reason this matters: trust isn't a paragraph in a privacy policy. Trust is watching the lock turn. When encryption is invisible, it might as well not be there from a user's perspective. Making it visible makes the claim real.

I also strip the URL fragment from analytics. The key is in the fragment. Analytics never see it. That needed to be airtight.

---

**The CLI actually tells you what's happening now.**

The CLI went from "it works" to "it feels good to use."

`phntm send` and `phntm get` now have step tracking. You see each stage: encrypting, uploading, done. Progress bars. Proper handling when the output file already exists (increments instead of clobbering). The ANSI rendering was cleaned up so it doesn't break on weird terminals.

Before this it was a pipe. Now it feels like a tool.

---

**A note on what I fixed.**

There was a bug where the CLI was getting 403 errors from the server because the origin check was too strict. The CLI sends an `X-Phntm-Client` header and the server was rejecting it. Fixed. Also found that `localhost` with a port was failing origin comparisons because I was comparing the full origin string against just the hostname. Small bug, annoying to track down, obvious in retrospect.

Ran a security audit. Patched the findings. Nothing dramatic.

---

Both the web app and the CLI are open source. The code is how you verify the claims.

- [github.com/aliirz/phntm.sh](https://github.com/aliirz/phntm.sh)
- [github.com/aliirz/phntm-cli](https://github.com/aliirz/phntm-cli)

If something seems off, open an issue. That's the whole point.
