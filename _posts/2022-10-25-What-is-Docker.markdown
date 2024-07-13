---
layout: post
title: What is docker
description: The age old question a lot of devs still dont know the answer to.
date: 2022-10-25 16:33:35 +0500
image: "images/Moby-logo.png"
tags: [docker]
---

Docker is a containerization platform that allows us to deploy our applications inside a container and then we can easily ship that container anywhere.

Docker uses the host operating system kernel, this makes docker containers really lightweight because you don't have to have a guest OS inside your container. This also means that you can run any type of application you want inside it since the OS is the same as the host OS.

Docker containers are isolated from each other, they share the same host OS, this means that if a container gets compromised other containers will not get affected.

You can create multiple services using docker e.g. If your project consists of front-end and back-end technologies, you can create separate images for both front & back then connect them together to form a complete application.

Docker lets you build, run, test and deploy your code in an easy way
  
Here is a slide deck I created to explain docker in a simple way:

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQ_tlhDyxUOXyLL23fkwUraw2jn7yhKZIsn7jmY12t1FI-YuDSq_yKzVyomDGnAwyPjpaBoMaLcqlyi/embed?start=false&loop=false&delayms=5000" frameborder="0" width="960" height="569" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

