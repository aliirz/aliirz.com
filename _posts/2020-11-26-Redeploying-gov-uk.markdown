---
layout: post
title: Redeploying gov.uk Part-1
description: Repurpose e-democracy
date: 2020-11-26 15:01:35 +0300
image: "https://svbtleusercontent.com/tnT8s842edwq6iqy1PsBqG0xspap_small.png"
tags: [civic tech, code for all, code for pakistan, gov 2.0]
---

Some unique and exciting circumstances require us to redeploy [gov.uk](https://www.gov.uk/) for a government stakeholder. If I am honest, this seems like a huge undertaking. As cool as this sounds, the whole project scares me. I mean, look at this architecture diagram:

[![download (8).png](https://svbtleusercontent.com/fSpW7BwhZVr5QnMdHn3q5k0xspap_small.png)](https://svbtleusercontent.com/fSpW7BwhZVr5QnMdHn3q5k0xspap.png)

To get this behemoth of a project right, I am trying to understand its guts. It's not your typical off the mill web application that you can fork, customize, and rebuild. It is more of a tech stack to build applications on top off.

The recommended way to build applications for gov.uk is to use their [docker based dev environment](https://github.com/alphagov/govuk-docker). Let's see how far I get. This is the first of a series of posts I will be making on this expedition
