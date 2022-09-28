---
layout: post
title: Getting better at releasing software
description: With age comes wisdom
date: 2022-05-30 23:53:35 +0500
image: "https://ratectiv.sirv.com/Images/christina-wocintechchat-com-eAXpbb4vzKU-unsplash-2.jpg"
tags: [best practices]
---

The first software release I did was for a company called Welltime. They had a appointment system I used to work on and one day our tech. lead voluntold me to do the release. I had seen him do it a couple of times so I wasn't very nervous. The release process was pretty simple; Remote Desktop onto a server, Open visual studio, Pull latest code from TFS, Do a build and then copy over the previous build files in a directory that was served by IIS. Yes, I was a .NET developer at that time. Now this seemed like a straight forward process but there was so much that could go wrong. I had heard horror stories of botched deployments causing the whole system to crash, however I got lucky. 

When I started working on an idea of my own called [Couponific](https://github.com/aliirz/Couponific) I learnt how to do one click deploys with [Heroku](https://www.heroku.com). Now this was a really good experience, it was so easy to push the app to production. I was loving this approach. There was nothing that go wrong with this...or so i thought. There was a bug in the app that allowed some users to view other users' coupons.

 