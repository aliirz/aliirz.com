---
layout: post
title: insults.dev, an LLM based Insult Generator for devs
description: Learning Prompt Engineering with GPT-3
date: 2023-09-05 00:45:00 +0500
tags: [gpt-3, prompt-engineering, LLM, vue, python]
image: "images/aliirz_two_software_developers_shouting_at_each_other_while_hol_068209cd-1bc4-4d02-92cb-cff624119ea7.png"
---
In the grand tradition of friendly banter among developers, I embarked on a journey to create a tool that could generate light-hearted, non-offensive insults for programmers. Why, you ask? Well, because who doesn't love a good-natured jest about their favorite (or not-so-favorite) programming language? And thus, insults.dev was born.

Insults.dev is a web application that serves up playful jabs at developers based on their chosen programming language or framework. Built using Vue.js for the frontend and FastAPI for the backend. The real star of the show, however, is OpenAI's GPT-3, a language model so advanced it can generate text that's almost indistinguishable from human writing. And in this case, it's been trained to be a comedic genius.

Prompt engineering is a bit like telling a joke. You need to set it up just right to get the punchline to land. In the case of insults.dev, the punchline is the insult, and the setup is the prompt I feed to GPT-3. It took a bit of trial and error, but eventually, I found the sweet spot that consistently produced insults that were funny, relevant, and just a bit cheeky. Here is what my generate_insult function looks like:

```python
def generate_insult(language):

    prompt = f" \
        Generate insult for a developer of {language}. "
    
    messages =  [
        {
            "role":"system",
            "content":"You are a developer insult generator that gets a \
                programming language or framework as input from the user and \
                    generates a not very offensive insult.",
        },
        {
            "role": "user",
            "content": prompt,
        }
    ]
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0613",
        messages=messages
    )
    insult = response.choices[0].message.content
    return { "insult":insult, "language":language , "prompt":prompt}
```


This project is part of my learning journey to get better at prompt engineering and build more significant applications that utilize LLMs. The code is all available under MIT License [here](https://github.com/aliirz/insults.dev) at Github. I hope you enjoy it as much as I enjoyed building it. And if you have any suggestions for improvements, please feel free to open an issue or submit a pull request.

<div style="width:100%;height:0;padding-bottom:100%;position:relative;"><iframe src="https://giphy.com/embed/l0K4mbH4lKBhAPFU4" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/dab-dabbing-bill-gates-l0K4mbH4lKBhAPFU4">via GIPHY</a></p>