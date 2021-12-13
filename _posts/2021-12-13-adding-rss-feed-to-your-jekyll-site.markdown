---
layout: post
title: Adding RSS feed to your Jekyll Powered Site
description:
date: 2021-12-14 01:33:35 +0500
image: "/images/retrosupply-jLwVAUtLOAQ-unsplash.jpg"
tags: [jekyll]
---

You just built your uber cool jekyll site. You just deployed it on your server. Whats this?! No RSS Feeds! Don't sweat, I got you. See its pretty simple. you just have to do two things.

## Add the jekyll-feed gem to your Gemfile

{% highlight bash %}
gem 'jekyll-feed'
{% endhighlight %}

## Add it to your \_config.yml file under plugins

{% highlight yaml%}
plugins:

- jekyll-feed
  {% endhighlight %}

## Run bundle install

{% highlight bash%}
bundle install
{% endhighlight %}

That's it. Once you build or run your website, your RSS feed will be accessible at yoursite.com/feed.xml. You are welcome. 🦄

Photo by <a href="https://unsplash.com/@retrosupply?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">RetroSupply</a> on <a href="https://unsplash.com/s/photos/blog?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
