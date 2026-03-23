---
layout: post
title: "The Web Is A Cop And You Invited It In"
description: "Every free tool is a data extraction operation with a UX layer on top. So I built something that can't spy on you even if it wanted to."
date: 2026-03-22
tags: [open-source, privacy, security, zero-knowledge, encryption]
image: "images/own-the-web.jpg"
---

A few months ago I wrote that we [gave up file ownership without noticing](/Remember-when-we-owned-our-files). That we handed control to corporations not because it was better, but because it was easier. I ended with "we can build something better."

This is that something.

<p><iframe src="https://www.youtube.com/embed/Q9-33j4bV7M?si=78tP6i4Vf6H6F31y" frameborder="0" allowfullscreen></iframe></p>

A file sharing service needs to do exactly one thing. Move bytes from point A to point B, then forget they existed. No accounts. No logs. No server that can read what you sent.

The technology to do this has existed for over a decade. Client-side encryption. URL fragments that browsers never send to servers. AES-256-GCM. None of this is new. Nobody bothered because collecting your data was always more profitable than respecting it.

So I built [phntm.sh](https://phntm.sh).

Your file gets encrypted in your browser before it goes anywhere. The decryption key lives in the URL fragment, which means I never receive it. All I store is ciphertext. Noise. I literally cannot read your file. When the timer expires, the ciphertext is destroyed. Nothing to subpoena. Nothing to leak.

The web app and CLI are both open source because "trust me" is not an architecture.

- Web app: [github.com/aliirz/phntm.sh](https://github.com/aliirz/phntm.sh)
- CLI: [github.com/aliirz/phntm-cli](https://github.com/aliirz/phntm-cli) / [phntm.sh/cli](https://phntm.sh/cli)