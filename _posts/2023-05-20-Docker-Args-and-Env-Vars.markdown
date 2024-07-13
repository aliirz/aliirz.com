---
layout: post
title: Docker Environment Variables vs Arguments
description: Docker how to set environment variables vs args and when to use what.
date: 2023-05-20 15:03:00 +0500
tags: [docker]
image: "images/philippe-oursel-06y6wukkSKg-unsplash.jpg"
---
I have worked with docker for over 7 years now and I still get confused about the difference between environment variables and arguments. In this post I try to simplify the distinction and explain when to use what. 

## Whats the difference between ENV and ARG variables and why should I care?

### ARG and ENV in Dockerfile
* ARG and ENV are ways to define variables in a Dockerfile.

### ARG variables
* ARG variables are only available during the build process.
* ARG variables are used to pass values to the Dockerfile.

### ENV variables
* ENV variables are available to running containers.
* ENV variables are used to set environment variables for running containers.

### Using ARG and ENV together
* You can use ARG values to set ENV values. This is a common way to set default values for environment variables.
* For example, you could use an ARG variable to specify the name of a package to install, and then use an ENV variable to set the path to the installed package.

The following image from VSUPALOV illustrated this beautifully.

![Illustration credits VSUPALOV](https://vsupalov.com/images/docker-env-vars/docker_environment_build_args.png "image credits https://vsupalov.com/docker-arg-vs-env/").


## How do I use ARGs and ENV Vars?

### Using ARGs
As stated above these need to be passed and defined before the build process. You would define an ARG in your `Dockerfile` like this:

{% highlight bash %}
ARG my_mighty_arg
RUN echo "the value of my mighty arg is $my_mighty_arg"
{% endhighlight %}

What this does is it lets Docker know that this image we are builidng should expect an argument called my_mighty_arg. A value for which we will pass when we are building our image like this:

{% highlight bash %}
docker build --build-arg my_mighty_arg=a_mighty_value .
{% endhighlight %}

so when we run this we should see something like this:

{% highlight bash %}
the value of my mighty arg is a_mighty_value
{% endhighlight %}

Thats it the ARG has served its purpose and will not be available beyond the docker build scope.

### Using ENV VARS
On the other hand ENV VARS are available to the running container. Imagine passing information to your continaer via env var that populates itself through a build time ARG. You can define an ENV VAR in your `Dockerfile` like this:

{% highlight bash %}
ARG my_might_arg
ENV env_var_name=$my_might_arg
{% endhighlight %}

Another way is to simple pass the ENV VAR in the command line:

{% highlight bash %}
docker run -e env_var_name=a_mighty_value .
{% endhighlight %}

### Conclustion
In conclusion, ARG and ENV variables are both useful tools for defining variables in a Dockerfile. ARG variables are only available during the build process and are used to pass values to the Dockerfile, while ENV variables are available to running containers and are used to set environment variables for running containers. You can use ARG values to set ENV values, which is a common way to set default values for environment variables. By understanding the difference between ARG and ENV variables, you can better manage your Docker images and containers and ensure that your applications run smoothly.

__Photo by <a href="https://unsplash.com/@ourselp?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Philippe Oursel</a> on <a href="https://unsplash.com/s/photos/docker?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>__