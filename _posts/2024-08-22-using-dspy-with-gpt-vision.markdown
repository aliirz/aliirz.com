---
layout: post
title: GPT Vision and DSPY towards smarter automation
description: The one time I used DSPY with GPT vision to extract structued json from an image.
image: "images/dspy-license.jpg"
tags: [gpt, vision, dspy]
date: 2024-08-22 21:54:00 +0500
---
Recently, I was presented with an intriguing challenge by a client. They were using a tablet-based point of sale (POS) system to sell memberships. The process involved a salesperson entering the buyer's information and then having the buyer provide their signature after verifying all the details. However, once the contract was generated, it frequently failed validation because the details entered by the sales rep didn't match the buyer's license. This discrepancy wasted a significant amount of time and effort.

While investigating this issue, I discovered that the app was already capturing and storing an image of the buyer's driver's license. This sparked an idea: why not use Optical Character Recognition (OCR) to convert the driver's license image into text and pre-fill the form? However, just using OCR wasn't enough; the extracted information needed to be structured properly in JSON format. It became clear that I needed a Large Language Model (LLM) to achieve this. Eventually, I implemented a solution using Google Vision AI combined with GPT-4o, and it performed quite well.

Although the initial solution was effective, I knew it could be improved further. That's when I turned to [DSPY](https://dspy-docs.vercel.app/), a framework designed to program (not just prompt) language models. I decided to fully integrate GPT Vision with DSPY, allowing me to read the image and receive structured JSON with a single API call. Since DSPY didn't have a built-in abstract LM class to support GPT Vision, I had to do some digging online and on [GitHub](https://github.com/stanfordnlp/dspy/issues/624). Here’s what I found:

{% highlight python %}
import requests
import base64
import re
from dsp import LM

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

"""
GPTVision is a class that extends the LM class from dsp.py
"""
class GPTVision(LM):

    def __init__(self, model, api_key):
        super().__init__("gpt-4o")
        self.model = model
        self.api_key = api_key
        self.provider = "openai"

        self.history = []
        self.base_url = "https://api.openai.com/v1/chat/completions"

    def basic_request(self, prompt, **kwargs):
        pattern = r'^Image Path: .*'
        matches = re.findall(pattern, prompt, re.MULTILINE)

        image_path = matches[1].replace("Image Path: ", "")
        for match in matches:
            prompt = prompt.replace(f"\n{match}\n", "")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        base64_image = encode_image(image_path)

        data = {
            **kwargs,
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 1024
        }
        response = requests.post(self.base_url, headers=headers, json=data)
        response = response.json()

        self.history.append({
            "prompt": prompt,
            "response": response,
            "kwargs": kwargs
        })

        return response
        

    def __call__(self, prompt, only_completed=True, return_sorted=False, **kwargs):
        responses = self.basic_request(prompt, **kwargs)
        print(responses)
        completions = [choice["message"]["content"] for choice in responses["choices"]]

        return completions
{% endhighlight %}

The above implementation worked beautifully, especially when combined with my signature:

{% highlight python %}
import dspy

class VqaCoT(dspy.Signature):
    """Extract the following demographic fields from the US driver license image and return them in JSON format. If a field is not found, return an empty string for that field. The fields to extract are:

                - Full Name (ignore titles or job descriptions such as 'Motorist')
                - First Name (If it contains a middle name such as Lori Lee or Yasir N, just pick up the first name and ignore the middle name)
                - Last Name (Its always at the very beginning right next to 1 usually)
                - Middle Name (If no middle name is present, return an empty string)
                - Date of Birth
                - Gender
                - Address (including street, city, state, and zip code. Sometimes the demographics have numbers against them, like the address might have something like 8 145 Street. We need to make sure we dont pick up the serial numbers)
                - License Number (Its always at the top and the first field that looks like a license number such 4965454 or R-140-428-730-065. The title is sometimes LIC NO or ID)
                - Issue Date
                - Expiration Date"""

    image_path = dspy.InputField(desc="Base64 format of the image")
    {% raw %}
    demographics = dspy.OutputField(desc="""{
                    "Full Name": "",
                    "First Name": "",
                    "Last Name": "",
                    "Middle Name": "",
                    "Date of Birth": "",
                    "Gender": "",
                    "Address": {{
                        "Street": "",
                        "City": "",
                        "State": "",
                        "Zip Code": ""
                    }},
                    "License Number": "",
                    "Issue Date": "",
                    "Expiration Date": ""
                }}""")
    {% endraw %}
{% endhighlight %}

So far, I am quite satisfied with this implementation. I’m not sure what I’ll add next, but I’m excited about the possibilities!