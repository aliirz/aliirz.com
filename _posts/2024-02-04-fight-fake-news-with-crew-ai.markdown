---
layout: post
title: Using Crew AI to detect fake news with your own LLM
description: The one time I used crew ai to detect fake news
date: 2024-02-07 13:19:35 +0500
image: "images/aliirz_a_crew_of_researchers_working_together_to_find_if_a_news_dca49ea5-e643-4dc2-b532-fd879522cd79.png"
tags: [ollama, openhermes]
---
I found out about [crew ai](https://www.crewai.io/) some time ago. While the use of multiple AT agents to perform a task is not something new. Crew AI serves as a framework to make this a lot more easier. The best part is that it lets you define your agents and their tasks in a very [organized manner](https://github.com/joaomdmoura/crewAI-examples/tree/main/starter_template). I have been playing with it for a while now and I did a small experiment to see if I could use it to detect fake news.

One of the most powerful features that Crew AI has is the ability to have your agents use  tools in their tasks. For example you can have a agent use the following tool to search the web
```python 
@tool("Search the internet")
def search_internet(query):
"""Useful to search the internet 
about a a given topic and return relevant results"""
url = "https://google.serper.dev/search"
payload = json.dumps({"q": query})
headers = {
    'X-API-KEY': os.environ['SERPER_API_KEY'],
    'content-type': 'application/json'
}
response = requests.request("POST", url, headers=headers, data=payload)
results = response.json()['organic']
string = []
for result in results:
    string.append('\n'.join([
        f"Title: {result['title']}", f"Link: {result['link']}",
        f"Snippet: {result['snippet']}", "\n-----------------"
    ]))

return '\n'.join(string)
```

By default Crew AI uses openai's api, you need to have the ```OPENAI_API_KEY``` as a env var available. But would it not be fun if we could use our own model? I have been playing with [openhermes](https://ollama.ai/library/openhermes) so I decided to give it a shot and voila! I was able to use it with crew ai. 

Here is a small snippet of the code from my [crews](https://github.com/aliirz/crews) repo:

```python
from crewai import Agent, Task, Crew, Process
from langchain.tools import tool
from langchain.llms import Ollama
ollama_llm = Ollama(model="openhermes")


from langchain.tools import DuckDuckGoSearchRun
search_tool = DuckDuckGoSearchRun()


# Define your CrewAI agents and tasks
# Define Agents
fact_checking_agent = Agent(
    role='Fact-Checking Agent',
    goal='Verify the factual accuracy of the news article or statement.',
    backstory='Expert in data verification and fact-checking, skilled in discerning truth from fiction in news reporting.',
    tools=[search_tool],
    verbose=True,
    llm=ollama_llm
)

political_analyst_agent = Agent(
    role='Political Analyst Agent',
    goal='Provide context and political analysis on Pakistan.',
    backstory='Specializes in South Asian geopolitics, focusing on Pakistan.',
    verbose=True,
    llm=ollama_llm
)

media_bias_analyst_agent = Agent(
    role='Media Bias Analyst Agent',
    goal='Assess potential biases in the news source.',
    backstory='Expert in media studies, focusing on detecting biases in news reporting.',
    verbose=True,
    llm=ollama_llm
)

public_sentiment_analyst_agent = Agent(
    role='Public Sentiment Analyst Agent',
    goal='Gauge public reaction to the news.',
    backstory='Skilled in analyzing public opinion and sentiment on social media and online forums.',
    tools=[search_tool],
    verbose=True,
    llm=ollama_llm
)
# Define a function to integrate the tools with CrewAI
def analyze_news_article(content):

    fact_checking_task = Task(
        description=f'Analyze the news article: {content} for factual accuracy. Final answer must be a detailed report on factual findings.',
        agent=fact_checking_agent
    )

    political_analysis_task = Task(
        description=f'Analyze the political context of the news article: {content}. Final answer must include an assessment of the current political situation and its credibility.',
        agent=political_analyst_agent
    )

    media_bias_analysis_task = Task(
        description=f'Evaluate the news source: {content} for biases and report on potential influences on the article\'s narrative. Final answer must include an analysis of media bias.',
        agent=media_bias_analyst_agent
    )

    public_sentiment_analysis_task = Task(
        description=f'Analyze public reaction to the news: {content} on social media and forums. Final answer must summarize public sentiment.',
        agent=public_sentiment_analyst_agent
    )


    crew = Crew(
        agents=[fact_checking_agent, political_analyst_agent, media_bias_analyst_agent, public_sentiment_analyst_agent],  #  agents
        tasks=[fact_checking_task,political_analysis_task, media_bias_analysis_task, public_sentiment_analysis_task],    #  tasks
        process=Process.sequential, # currently the only way it works
        verbose=True
    )

    result = crew.kickoff()
    return result

#  usage
final_result = analyze_news_article("Feb 8 2024 Elections have been cancelled in Pakistan. The government has declared a state of emergency. The military has taken over the country.")
print(final_result)
```


As you can see I am using DuckDuckGo as a tool and openhermes as the LLM. The result is a detailed report on the news article. I am still playing with it and I am sure I can make it better. But I am happy with the results so far. My news article is a fake news around the delay of elections in Pakistan. As I am writing this post, elections are due tomorrow. My crew was able to successfuly research and provide its findings on the news article. This was the output i got:

> Based on the context provided, it appears that the news article is outdated or incorrect as elections are still scheduled for February 8, 2024 in Pakistan and no state of emergency or military takeover has been reported.

Pretty cool right? I am excited to see what else we can do with this. I have barely began to scratch the surface. You can checkout crew ai [here](https://www.crewai.io/).
