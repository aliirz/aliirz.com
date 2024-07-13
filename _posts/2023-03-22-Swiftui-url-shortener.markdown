---
layout: post
title: Learning SwiftUI by building a URL Shortener iOS App
description: From Objective-C to SwiftUI, rediscovering iOS Development through Building a URL Shortener App
date: 2023-03-22 10:19:00 +0500
tags: [swiftui]
image: "images/animation_500_lfk7n0ml.gif"
---

## Rediscovering iOS Development: From Objective-C to SwiftUI
I ws a iOS developer in a past life who started his career more than eight years ago, I have seen firsthand the remarkable evolution of the iOS ecosystem. Back in the day, Objective-C was the go-to language for developing iOS applications, and we had to deal with manual memory management without the luxury of Automatic Reference Counting (ARC). Today, we have SwiftUI, a powerful and intuitive framework that makes it easier than ever to create beautiful user interfaces across all Apple platforms.

## Starting with SwiftUI
Apple introduced SwiftUI at WWDC 2019 as a powerful, easy-to-use UI toolkit that enables developers to design apps for iOS, macOS, watchOS, and tvOS using Swift code. With its declarative syntax, SwiftUI simplifies the process of building user interfaces by allowing developers to describe the UI's appearance and behavior.

As I began my SwiftUI journey, I found Apple's official SwiftUI tutorials to be an excellent starting point. They cover the fundamentals of building user interfaces, as well as more advanced topics like data flow and animations. Additionally, I discovered several online resources, such as articles, YouTube videos, and Stack Overflow threads, that provided invaluable insights and assistance throughout my learning process.

## Building a URL Shortener iOS App
After familiarizing myself with SwiftUI concepts and syntax, I decided to create a [URL shortener iOS app](https://github.com/aliirz/Swift-Url-Shortener). This project would serve as a practical way to solidify my understanding and apply the knowledge I had acquired.

![image of the app running on simulator](images/url-shorten-app.png "Default UI but its honest work").

The app I built is straightforward: users enter a long URL into a text field, tap a button to generate a short URL using the Bitly API, and the resulting short URL is copied to the user's clipboard. To ensure smooth interactions with the Bitly API, I chose to integrate the Alamofire library, which simplifies the process of making network requests.

During the development of the app, I encountered several challenges that deepened my understanding of SwiftUI. First, I learned about the @State, @ObservedObject, and @Published property wrappers, which are crucial for managing data flow and state changes in SwiftUI. Second, I explored how to present alerts based on state changes and handle user input validation. Overall, this project served as an excellent hands-on introduction to SwiftUI.

## Moving Forward
My experience building the URL shortener app reinforced the importance of practice and real-world application when learning a new programming language or framework. By diving into SwiftUI and working on a practical project, I was able to grasp concepts more effectively and identify areas that required further study.

This journey has been a testament to how far iOS development has come since my early days working with Objective-C. As I continue to explore SwiftUI and apply my knowledge to more complex projects, I'm excited about the endless possibilities—from building productivity apps to creating games or even designing tools to help fellow developers. I'm eager to see where my SwiftUI journey takes me next and how it will shape my future as a developer.

The app code is open source and available on [GitHub](https://github.com/aliirz/Swift-Url-Shortener).