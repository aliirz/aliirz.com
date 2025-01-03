---
layout: post
title: "Building Knowledge Graphs Using DSPy"
description: "A guide to building knowledge graphs using DSPy"
tags: [dspy, knowledge-graphs, tutorial]
date: 2025-01-03
---
One of the coolest things I learned in 2024 was DSPy [1]. It's a framework for programming LLMs (not prompting). It's a great way to build LLM applications.

We have helped build some cool applications using DSPy. We deployed a License information extractor at TRA [2] and a couple of smart agents at Revreply [3] for scoring and validating emails before they are sent out. I made my first ever open source contribution to DSPy in 2024 albeit small but still meaningful. 

At boostpanda we are working on the next generation RAG agent. One of the key aspects is utilizing knowledge graphs as well as memwalker to build a faster RAG pipeline. While it's a work in progress, I thought why not demonstrate an example of how DSPy can be used to extract knowledge graphs from text.

So in true indie hacker spirit, as part of my 100 days of AI challenge, I decided to build a DSPy program that extracts knowledge graphs from text:

{% highlight python %}
class EntityRelations(BaseModel):
    first_entity: str = Field(..., description="The first entity in the relationship")
    relationship: str = Field(..., description="The relationship between the two entities, should be a verb")
    second_entity: str = Field(..., description="The second entity in the relationship")

class EntityExtraction(dspy.Signature):
    text: str = dspy.InputField(desc="The text to extract entities from")
    entities: EntityRelations = dspy.OutputField(desc="Entities and their relationships extracted from the text")


def extract_entities_and_relations(extractor, sentence):
    prompt = f"Identify the main entities and their relationship in the sentence: '{sentence}'"
    response = extractor(text=prompt).entities.model_dump()
    keys = ['first_entity', 'relationship', 'second_entity']
    return tuple(response[key] for key in keys if key in response)

def build_knowledge_graph(extractor, text):
    sentences = sent_tokenize(text)
    graph = nx.DiGraph()

    for sentence in sentences:
        try:
            entity1, relationship, entity2 = extract_entities_and_relations(extractor, sentence)
            if entity1 and entity2:
                graph.add_node(entity1)
                graph.add_node(entity2)
                graph.add_edge(entity1, entity2, relation=relationship)
        except Exception as e:
            print(f"Failed to extract or add entities for the sentence '{sentence}': {e}")

    draw_knowledge_graph(graph)

def draw_knowledge_graph(graph):
    pos = nx.spring_layout(graph)
    plt.figure(figsize=(12, 12))
    nx.draw(graph, pos, with_labels=True, node_size=300, node_color="skyblue")
    edge_labels = nx.get_edge_attributes(graph, 'relation')
    nx.draw_networkx_edge_labels(graph, pos, edge_labels)
    plt.title("Knowledge Graph")
    plt.show()

def configure_dspy():
    api_key = userdata.get('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("API key for OpenAI is not set in environment variables.")
    llm = dspy.OpenAI(
        model='gpt-4o',
        api_key=api_key,
        max_tokens=400
    )
    dspy.settings.configure(lm=llm)
    return dspy.TypedPredictor(EntityExtraction)


entity_extractor = configure_dspy()



text = """
On a bright sunny day, not too far, not too near,
Lived two silly sisters, so full of cheer.
Anaya was seven, Liyana just five,
When they had an idea that came alive!

“Let’s build a machine!” Anaya declared.
“One that eats socks!” (Liyana just stared.)
“Why socks?” Liyana asked, scratching her head.
“Because eating bananas is boring,” she said.

So they grabbed a big pot and a very small spoon,
A trumpet, a toaster, and a bright red balloon.
They piled it all high, till it looked like a blob,
“This is perfect!” said Anaya, “Let’s call it Bob!”

Bob rumbled and grumbled, it clanked and it beeped,
Then suddenly WHOOSH! Out came a leap!
A sock shot out high, like a rocket in space,
It landed, of course, on poor Liyana’s face"""
build_knowledge_graph(entity_extractor, text)
{% endhighlight %}

The output is a knowledge graph that looks like this:

![Knowledge Graph](/images/graph.png)

I am so excited about this. I think this is a great way to extract knowledge graphs from text.

[1]: https://github.com/stanfordnlp/dspy
[2]: https://www.travelresorts.com/
[3]: https://revreply.com/