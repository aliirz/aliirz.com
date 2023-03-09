---
layout: post
title: Using inject and provide in vue 3
description: I recently learned how to do dependency injection in vue 3. Here's how you can use it in your projects.
date: 2023-03-06 00:19:00 +0500
tags: [vue3, javascript]
image: "images/araza_vue_js_logo_disney_like_art_style_c455cfcb-7fb1-44ea-9d35-1beafb11c720.png"
---
Vue 3 has some cool new features, including "inject" and "provide", which allow you to share data between parent and child components without having to pass it down as props. This makes your components more modular and reusable.

"Provide" is used in the parent component to provide data, which can be anything like a string, object, or function. "Inject" is used in the child component to get access to that data.

For example, let's say you have a "message" variable in your parent component that you want to share with your child component. You can use "provide" to make that happen:


{% highlight javascript %}
// Parent Component
<script>
import { provide } from 'vue';

export default {
  setup() {
    const message = 'Hello from parent!';

    provide('message', message);

    return {
      message,
    };
  },
};
</script>
{% endhighlight %}

Then, in your child component, you can use "inject" to get that "message" variable:

{% highlight javascript %}
// Child Component
<script>
import { inject } from 'vue';

export default {
  setup() {
    const message = inject('message');

    return {
      message,
    };
  },
};
</script>
{% endhighlight %}

By using "provide" and "inject", you can make your Vue 3 components more efficient and organized. Plus, the syntax is super easy to use!

You can read more [here](https://vuejs.org/guide/components/provide-inject.html).
