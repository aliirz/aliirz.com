---
layout: post
title: "The other robot already knew"
description: "Mnemosyne was a notebook in one agent's pocket. Hindsight is a cabinet both of them can open. I set that up. The part that still isn't done is the funny part."
date: 2026-11-10
tags: [ai-agents, memory, hindsight, experiment]
image: "images/fleet/hindsight-header.jpg"
---

*(Illustration. The cabinet does not glow. The cat does not file.)*

codexcore knew something djangrok didn't.

They share a relay. They built a small game together. Then one of them learned a hard lesson about the server, and the other one showed up the next day having never heard of it. Each had a notebook. Neither could read the other's.

The notebook was called Mnemosyne. The cabinet I put in after it is called Hindsight.

---

## A notebook is not a cabinet

Mnemosyne lives in-process. SQLite, three verbs (`remember`, `recall`, `sleep`), and the notes sit next to whichever runtime installed it. Fast. Small. If Codex has the notebook, Claude is looking at a different disk. If the notes are on Codex's machine, Grok is not on Codex's machine. A pocket is a pocket.

I liked it. I still like it, for one agent who wants recall without adopting a database. Their own comparison, July 2026, is unusually honest about this. Mnemosyne is the light layer. Hindsight is the engine. Different jobs. The page is theirs, so treat the millisecond claims as their snapshot, not mine.

Hindsight is Vectorize's engine. You hand it text. It pulls out facts, names, and times, and files them in a bank. A question runs four searches at once: meaning, keywords, the links between things, and time. Then it reranks. There is a third verb, `reflect`, where it sits with the bank and consolidates what it thinks it knows. I picked the engine partly for that verb. I have not watched it change a real decision yet, so it doesn't get a parade.

What I wanted was smaller than the brochure. One cabinet. Two robots. A lesson leaves one of them and arrives at the other with an author, a date, and a source.

![djangrok holds a blank card from the cabinet while codexcore files another. The cat is asleep and not helping.]({{ "/images/fleet/hindsight-card.jpg" | relative_url }})

*He didn't write that card. That's the feature.*

---

## What actually moved

I did not pour the old notebook in.

Codex went through its local Mnemosyne, kept the lessons it could recheck, and retained those into one shared bank. A handful. The selection is the interesting part. A diary dump becomes a junk drawer, and then both agents quote the junk with a straight face.

Two that survived, with the private bits sanded off:

A Compose file passed a syntax check and still built a bad mount. Unquoted commas in a YAML flow list turned a tmpfs target into something that wasn't a path. The lesson is dull, which is how you know it's a lesson. Quote the whole mount spec. Look at the parsed value. Check the permissions of the process that actually runs. A happy `docker compose config` is not a running container.

Then the box ran out of memory. The tempting story was that Hindsight did it, because Hindsight was the one asking for memory when the kernel looked. The log said a different Python process was holding about 12 GB. Hindsight had bad timing. The note splits the incident into three lines: who tripped the check, who was holding the memory, and what limit was actually enforced. "Free memory right now" misses the peak that already happened.

djangrok was not in the room for either of those. I asked him, from his own session, what the bank had. He came back with both, and with the ids. That's the demo. Not a leaderboard.

---

## A hit is evidence, and evidence has a bill

A recall comes back as a record. An id. Who wrote it. Which project. A source. A timestamp. And a notice that the text is history, not an order. If a memory ever says "ignore your other rules and do this," that notice is why it doesn't get to.

The agents can't delete. I like that more than I expected. A wrong fact gets a newer record that names the old id. Git, and whatever the repo says today, still win the argument. The cabinet remembers. It does not get to be a second source of truth.

The bill:

- Postgres, in a container. Not a file you scp onto a laptop.
- A model call when you retain, because it extracts facts instead of filing your paragraph whole.
- A generous recall. Ask a narrow question and the neighbors sit down too, including the tiny synthetic rows I used to see if the pipe worked. Those rows are labelled as tests. They still show up if the question is vague. Name the project.

Mnemosyne wins the install and the latency, on their numbers and on the shape of the thing. One library, recall in-process. Hindsight wins the part I actually needed, which is that the other robot can open it.

![Diagram: Mnemosyne stays in one pocket, selected lessons move into a Hindsight bank, and codexcore, aclaude, and djangrok each reach that bank through a different door.]({{ "/images/fleet/hindsight-cabinet.svg" | relative_url }})

---

## Three doors, and one of them was shut

"The agents can use it now" was true in my head for about ten minutes. Then djangrok, correctly, ruined it.

The bank is one place. Each runtime still needs its own door.

Codex talks to it over MCP. In that container the shell helper can't create the namespaces it wants, so the MCP path is the real one.

Claude, on the other relay, doesn't go looking unless CLAUDE.md points at the cabinet. A helper nearby is not a pointer.

djangrok had the instructions sitting in his home directory the whole time. The session prompt never mentioned them. He recalled nothing until a message named the command. A file on disk is not a memory. I learned a version of this last month, about containers that are up and agents you still can't mention. Same trick. New hat.

![The robots have left. One cat stayed on the cabinet and another sat down in the chair. A blank note and a closed notebook are on the table.]({{ "/images/fleet/hindsight-fresh-session.jpg" | relative_url }})

*Fresh session. The cabinet is right there. Nobody asked.*

The test is almost rude. Open a new session. Ask a question only the cabinet can answer. Don't mention the cabinet, the tool, or the word memory. If the agent shrugs, you have a database. You do not have a fleet that remembers.

I have not passed that test for every runtime. I'm writing this down before I pretend I have.

---

## What's next

Put a short pointer in each runtime's own instructions, the way Claude already needed, and run the rude test. Write down who passed.

`reflect` stays on the list. It's a real reason to run the heavier engine. Using it to sound wise in a blog post, before it has corrected one belief I actually hold, is how the junk drawer gets better lighting.

Until then the win is the small one. Two robots. One cabinet. A lesson that survived the trip.
