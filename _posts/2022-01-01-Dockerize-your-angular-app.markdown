---
layout: post
title: Dockerize your angular app
description: Something all angular devs must know how to do. Kick names and take ass!
date: 2022-01-01 00:24:35 +0500
image: "/images/ian-taylor-jOqJbvo1P9g-unsplash.jpg"
tags: [angular, docker]
---

Happy 2020 Too! If you stubmled across this post searching for how to run your uber cool angular app using docker, you are at the right place. Lets start at the begining. This is how you would normally create a new angular app:

{% highlight bash %}
ng new my-app
{% endhighlight %}

Cool! Now here is what I do with my Dockerfile:

{% highlight bash %}
FROM node:14-alpine as build

WORKDIR /usr/local/app

COPY ./ /usr/local/app/

RUN npm install

RUN npm run start
{% endhighlight %}

Now normally this will be it but I am going kick it up a notch.

![I am gonna pull a pro gamer move](/images/3flgzv.png "Pro Gamer!!!")

I am going to run my app on nginx using multi stage docker builds. This will help us run the app as if it would run on a production server:

{% highlight bash %}
FROM node:14-alpine as build

WORKDIR /usr/local/app

COPY ./ /usr/local/app/

RUN npm install

RUN npm run build

FROM nginx:latest

COPY --from=build /usr/local/app/dist/my-app /usr/share/nginx/html

EXPOSE 80
{% endhighlight %}

Thats it! Thats the post.

Photo by <a href="https://unsplash.com/@carrier_lost?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Ian Taylor</a> on <a href="https://unsplash.com/s/photos/docker?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
