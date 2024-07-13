---
layout: post
title: Mastering Markdown; A Cheatsheet from a Dev Who Loves Markdown (But Keeps Googling It)
description: The one time I created a markdown cheatsheet and blogged about it.
image: "images/md.png"
tags: [cheat-sheet, markdown]
date: 2024-06-26 20:54:00 +0500
---
I have a deep love for Markdown .It’s the magical tool that turns plain text into beautifully formatted documents. But here’s a little secret: even with over 10 years in tech, I still find myself googling how to format Markdown. So, I decided to write this cheatsheet to end my relentless web searches

## Headers

{% highlight md %}
Use `#` for headers. The number of `#` symbols at the beginning of the line indicates whether it's a heading 1, 2, 3, etc.

# H1
## H2
### H3
#### H4
##### H5
###### H6
{% endhighlight %}

## Emphasis

Use `*` or `_ `for emphasis.
{% highlight md %}
*italic* or _italic_
**bold** or __bold__
***bold and italic*** or ___bold and italic___
{% endhighlight %}

## Lists

### Unordered List

Use `-`, `*`, or `+` for unordered lists.
{% highlight md %}
- Item 1
- Item 2
  - Item 2a
  - Item 2b
{% endhighlight %}

## Ordered List

Use numbers for ordered lists.
{% highlight md %}
1. Item 1
2. Item 2
   1. Item 2a
   2. Item 2b
{% endhighlight %}

## Links

Use `[text](URL)` for links.
{% highlight md %}
[Ali Raza](https://www.aliirz.com)
{% endhighlight %}

## Images

Use ```![alt text](URL)``` for images.
{% highlight md %}
![Markdown Logo](https://markdown-here.com/img/icon256.png)
{% endhighlight %}

## Blockquotes

Use `>` for blockquotes.
{% highlight md %}
> This is a blockquote.
{% endhighlight %}

## Code

### Inline Code

Use backticks for inline code.
{% highlight md %}
`code`
{% endhighlight %}

### Code Blocks

Use triple backticks for code blocks.
{% highlight md %}
```javascript
function helloWorld() {
console.log("Hello, world!");
}
```
{% endhighlight %}

## Horizontal Rules

Use `---`, `***`, or `___` for horizontal rules.
{% highlight md %}
---
***
___
{% endhighlight %}

## Tables

Use `| `to create tables.
{% highlight md %}
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
{% endhighlight %}

## Strikethrough

Use `~~` to strikethrough text.
{% highlight md %}
~~This was a mistake.~~
{% endhighlight %}

## Task Lists

Use `- [ ]` for task lists.
{% highlight md %}
- [x] Completed task
- [ ] Incomplete task
{% endhighlight %}

## Footnotes

Use `[^1]` for footnotes.

Here is a footnote reference[^1].


## Emoji

Use colons to include emoji.
{% highlight md %}
:smile: :+1: :heart:
{% endhighlight %}

