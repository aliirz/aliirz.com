---
layout: post
title: Using Google Gemini to build Karachi Chal
description: The one time I built something for Karachi, the city of lights. A lobor of love for my mother's city. Also how to use google gemini to build a ai powered city guide.
date: 2024-05-05 19:03:00 +0500
image: "images/arfat-jabbar-RtIVw8BGMWc-unsplash.jpg"
tags: [karachi, ai, city-guide, open-source, civic-tech, llm]
---

## The Inspiration Spark
Picture this: I'm on a flight to Karachi, a megacity I've always felt a connection to, when it hits me.  The sheer scale of the place, the energy – there had to be a better way to navigate it than generic travel guides. Enter Karachi Chal, my AI-powered itinerary planner!  Sometimes, even when you think you're escaping work to clear your head, inspiration strikes in the most unexpected places.  That flight to Karachi turned into an accidental coding adventure!  With its bustling streets and hidden gems, I knew there had to be a way to help visitors – and tourists like myself – experience the city's true spirit. Powered by Google's Gemini API, it quickly became more than a side project; it was a deep dive into building web apps with the power of advanced language models.

## Gemini API: Your AI Copilot

Gemini a super-smart language model from Google AI that can generate text, translate languages, write different kinds of creative content, and answer your questions in an informative way. It also has multi modal capabilites.

For Karachi Chal, I needed more than just an AI that could spit out search results.  Gemini's the perfect fit because it can understand complex requests and go beyond the typical tourist traps.  For example, if a user asks, "Help me find offbeat Karachi experiences, things most tourists wouldn't know about. I am here for 3 days" Gemini could tap into its knowledge of Karachi to suggest.

## The Code Behind the Magic

Let's start by bringing in the necessary tools. The first line imports the core Gemini functionalities from Google's library. MarkdownIt will help us format the AI's responses for the web, and your style.css keeps everything looking good. Of course, we need your super-secret API key to communicate with Gemini!


{% highlight js %}
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"; // Bringing in the tools to work with Gemini
import MarkdownIt from 'markdown-it'; //  Library to make the AI's output look nice
import './style.css'; 

// Your API Key - Keep it Safe!
let API_KEY = import.meta.env.VITE_GEMINI_KEY 
{% endhighlight %}

This is where I teach Gemini how to be the ultimate Karachi travel guide. By setting the 'role' to 'user', I'm making sure the AI understands this input is coming from someone asking for help. Inside the 'parts' is where I'll carefully craft instructions for creating the perfect itinerary:


{% highlight js %}
let contents = [
  {
    role: 'user',
    parts: [
          // Your prompt text here 
        ]
    }
  }
];
{% endhighlight %}

Now here is the real Jugaar(hack), the prompt that makes karachi chal tick:

{% highlight js %}
let contents = [
  {
    role: 'user',
    parts: [
          { text:  `You are a knowledgeable travel guide specializing in Karachi. 
          When a visitor asks you about their upcoming trip using the 
          variable "${promptInput.value}", provide a comprehensive response. 
          Include detailed daily itineraries, top dining spots, and must-see attractions. 
          Ensure you account for travel logistics, such as travel times and 
          operational hours of venues.`, }
        ]
    }
  }
];
{% endhighlight %}

![Karachi Chal dev in Google's project IDX](/images/idx-khi-chal.png)

One of the coolest parts of building with AI is those 'aha!' moments.  Gemini works by sending a stream of text rather than a single block, and figuring out how to handle that on the fly was a big win! Working with Markdown to make everything look good on the website added another layer to the challenge.

## The End result

For the input we used above, here is how Karachi chal would respond
{% highlight md %}
Day 1: Discovering Karachi's Quirky Side

Morning:

Start your day by visiting the ethereal Khuda Ki Basti (God's Colony), a unique neighborhood adorned with vibrant street art and murals by local and international artists. Spend about an hour exploring its colorful streets.
Afternoon:

Head to the bustling Tower Market for a sensory overload. Wander through its maze-like alleys, marveling at the vibrant fabrics, handicrafts, and delicious street food. Allow 2-3 hours for shopping and lunch.
Evening:

Immerse yourself in the local culture at Pakka Qila (Association of the Faithful). Witness traditional wrestling matches or indulge in mouthwatering street delicacies at this vibrant public space. Stay for about 2 hours.
Day 2: Architectural Wonders and Culinary Delights

Morning:

Explore the grandeur of the Frere Hall (City Library), a majestic Gothic Revival building. Admire its intricate architecture and delve into its extensive collection of books. Visit for approximately 2 hours.
Afternoon:

Visit the picturesque Haleji Lake, a serene wetland home to diverse birdlife. Take a boat ride or stroll along its scenic shores, enjoying the tranquil atmosphere. Allow 3-4 hours for this excursion.
Evening:

Indulge in authentic Sindhi cuisine at Sohni Dharti Restaurant. Savor flavorsome dishes like sajji (grilled meat) and bhel puri (spicy puffed rice). Dinner takes about 2 hours.
Day 3: The Soul of Karachi

Morning:

Discover the fascinating history and culture of Karachi at the Pakistan Maritime Museum. Explore its exhibits on naval history, marine life, and the role of the Pakistani Navy. Plan for 2-3 hours at the museum.
Afternoon:

Immerse yourself in the vibrant atmosphere of Kemari Town, a historic fishing village. Witness the bustling fish market, interact with friendly locals, and savor fresh seafood at roadside stalls. Dedicate 2-3 hours to this experience.
Evening:

End your Karachi adventure at the Mohatta Palace, a stunning palace built in the Rajput architectural style. Admire its intricate carvings and serene gardens, while enjoying a memorable dinner at its in-house restaurant. Allow 2-3 hours for dinner and exploration.
Travel Logistics:

Getting Around: Use ride-sharing apps like Careem or Uber for convenient transportation.
Local Transport: Explore the city by rickshaw for an authentic experience.
Travel Times: Factor in approximately 30-60 minutes for travel between attractions.
Operating Hours: Venues typically open around 9 AM and close between 6 PM and 9 PM. Check specific venues for exact hours._
{% endhighlight %}

![Karachi Chal](/images/khi-chal.png)

The possibilities are endless with Karachi Chal!  Think about tweaking the prompt for a budget-friendly trip, a focus on Karachi's art scene, or even adding a time-of-year element (festival season vs. quieter months)

If you're a coder, data enthusiast, or just bursting with ideas to make Karachi Chal even better, join the adventure! Let's turn this AI itinerary planner into the ultimate Karachi travel companion. Checkout the [Github Repo](https://github.com/codeforpakistan/karachi-chal) and the [Website](https://karachichal.com) if you want to contribute or just explore the project.