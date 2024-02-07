---
layout: post
title: Code Roaster GPT
description: The one about the time I made a GPT that roasts your code (and you)
date: 2024-01-03 00:19:35 +0500
image: "images/roasty.png"
tags: [chatgpt]
---
While experimenting with building my own GPTs, I stumbled upon a fascinating idea. What if we could train a GPT on code and utilize it to roast code? Intrigued by the concept, I decided to give it a shot. As a result Roasty was born. Roasty is a fiesty little GPT that roasts your code (and you). While its a novel idea, its the prompt that matters and the results. So far Roasty has roasted my code and me pretty well. It has also roasted some of my friends and their code.

<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.loom.com/embed/a31f7ae3721f43858ff86e4ddc7f7a29?sid=86db9780-7f4c-48ce-be64-a28efc516311" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>


As an example here is the code snippet from my [encodedecode.lol](https://www.encodedecode.lol/){:target="_blank"} side project. 


{% highlight js %}
<template>
  <div>
    <div class="form-group">
        <textarea class="form-control" v-model="inputText" placeholder="Ready for some Base64 sorcery? Input your text!" id="floatingTextarea"></textarea>
        <br />
        <div class="d-flex justify-content-end">
          <button type="button" @click="convertTo64" :disabled="isEncoded" class="btn btn-primary" :style="{ 'marginRight': '10px' }">Encode</button>
          <button type="button" @click="convertFrom64" :disabled="!isEncoded" class="btn btn-secondary">Decode</button>
        </div>
    </div>
  </div>
</template>

  <script lang="ts">
  import { defineComponent } from 'vue'
  
  export default defineComponent({
    name: 'ConvertTo64',
    methods: {
      convertTo64() {
       this.inputText = btoa(this.inputText)
       this.isEncoded = true
      },
      convertFrom64() {
        this.inputText = atob(this.inputText)
        this.isEncoded = false
      }
    },
    data() {
      return {
        inputText: '',
        isEncoded: false
      }
    }
  })
  </script>
}
{% endhighlight %}


This is what Roasty had to say about it:

```
Ah, Vue.js meets Base64 – the peanut butter and jelly of web development, but with a side of "What were they thinking?"

First off, let's address the elephant in the room: `convertTo64` and `convertFrom64`. Ah, naming methods like they're Transformers characters. Optimus Encode and Decodetron, roll out! But seriously, how about `encodeToBase64` and `decodeFromBase64`? It's like a gift to your future self who won't remember what "64" stood for.

And then, `this.isEncoded`. I appreciate the effort to track state, but what happens when someone decodes and then re-encodes? Do we just flip-flop this boolean like a politician in election season? Consider tracking the state more robustly.

Oh, and speaking of robust – `btoa` and `atob` – the good ol' built-in duo. They're great until they meet non-Latin1 characters and throw a tantrum like a toddler denied candy. Maybe consider handling that so your app doesn't crash when it encounters an emoji. 🙃

Now, let's talk about your template. It's like a minimalist painting - there's beauty in simplicity, but a few more strokes wouldn't hurt. How about some validation or user feedback? Let the user know if something went wrong, or if they're trying to decode a string that wasn't encoded in the first place. We don't want to be decoding gibberish, do we?

Lastly, the inline style in the button – `:style="{ 'marginRight': '10px' }"`. Inline styles are like seasoning – a little goes a long way, but too much and you'll ruin the dish. Maybe consider a class? Keep it clean, keep it maintainable.

In summary:
1. Rename your methods for clarity.
2. Improve your state tracking.
3. Handle non-Latin1 characters.
4. Provide user feedback and validation.
5. Avoid inline styles.

But hey, you've got the basics down. Now, just polish it until it shines brighter than a bald man's head under a spotlight! 🌟
```

<br />
<iframe src="https://giphy.com/embed/RdKjAkFTNZkWUGyRXF" width="480" height="256" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/RdKjAkFTNZkWUGyRXF">via GIPHY</a></p>


As you can see it not only roasted me but also provided some useful feedback. I am planning to use this in my code reviews from now own. Specially when I am reviewing code from my friends. Let me know what you think about this idea. You can try it out [here](https://chat.openai.com/g/g-6CMx7oOl1-roasty-the-code-roaster/){:target="_blank"}.
