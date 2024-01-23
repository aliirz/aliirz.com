---
layout: post
title: Gesture Recognition with Python OpenCV
description: The one about when i taught myself how to recognize gesture with python
date: 2024-01-21 16:19:35 +0500
image: "images/gesture.png"
tags: [todayilearned, python]
---
A long time ago I was part of a competition where people were presenting and building some great ideas. One such startup that really inspired me was trying to build an app to recognize ASL(American Sign Language) and PSL(Pakistan Sign Language). To no one's surprise they won the competion, however down the line 4 years from that day, that startup now works as a event management company and provides sign language interpreters for such events.

We promise big, but we deliver small. It has been part of a norm here in Pakistan. Anyhow, since I've never had much experience working with Computer Vision, I decided to give it a shot and see if how hard it would be build a simple gesture recognition python script. Turns out, its not that hard. I was able to build a simple app that recognizes a few gestures. 

![Gesture Recognition in action](images/gesturerecog.png)

The only dependencies are ```opencv-python``` and ```mediapipe```. You can install them using pip:

```bash
pip install opencv-python mediapipe
```

Here is the code:

<script src="https://gist.github.com/aliirz/9a235a3973a511c13e04b0ff452b600b.js"></script>

Enjoy!
