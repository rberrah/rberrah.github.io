---
id: "ai-llm"
slug: "ai-llm"
title: "Large language models (LLMs)"
description: "Transformers, attention and next-token prediction: what LLMs are — and are not."
summary: "Understanding LLMs: tokenisation, attention, auto-regressive prediction, and cautious pharmacometric uses."
track: "ai"
order: 18
duration: "13 min"
level: "intermediate"
tags: ["ai", "llm", "transformer", "nlp"]
slides: []
prerequisites: ["trois-approches"]
glossary: ["White / black / grey box"]
sources: ["vaswani-transformer","brown-gpt3"]
reviewed_on: "2026-07-09"
review_type: "author"
review_pending: true
reviewed_hash: "cd8e4a541c13993245ac0e9797c3e7e976596a4903cc1b80e4d96ba65d819c4b"
quiz:
  - prompt: "An autoregressive LLM is, at its core, trained to..."
    options:
      - "predict the next token from the previous ones"
      - "look up the exact answer in an internal knowledge base"
      - "assign each sentence to a category defined in advance"
    correct: 0
  - prompt: "The attention mechanism lets a token..."
    options:
      - "weight the other tokens by their relevance"
      - "look only at the immediately preceding token"
      - "memorise a fixed position independent of the context"
    correct: 0
  - prompt: "A major risk of an LLM in a clinical context is..."
    options:
      - "hallucination (false but plausible statements)"
      - "a response time too slow for use at the patient's bedside"
      - "producing identical text whatever the question asked"
    correct: 0
---

<!-- step:title="Why this chapter" -->
**LLMs** (ChatGPT, Claude…) are transforming access to information and writing support (protocols, code, summaries). In pharmacometrics they assist coding (NONMEM, nlmixr2, R) and literature reading.

Understanding their mechanics avoids two symmetric traps: magic and rejection.
<!-- /step -->

<!-- step:title="Intuition" viz="47_TokenAttention" -->
An autoregressive LLM is a **next-token predictor** trained on large corpora. From a context, it estimates a distribution over the next token, selects one according to the decoding strategy, then repeats.

From this simple task, repeated at massive scale, emerge useful abilities for summarising, coding and sometimes apparent reasoning — to evaluate with external tests rather than assume.
<!-- /step -->

<!-- step:title="The formula, unpacked" -->
A central building block of the **Transformer** is **attention**: each position constructs a weighted combination of other positions allowed by the model's mask.

$$ \text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V $$

**Math —** each token is projected into three vectors: a **query** $Q$ ("what I'm looking for"), a **key** $K$ ("what I offer") and a **value** $V$ ("the information I carry"). The product $QK^\top$ measures **relevance** between tokens, the **softmax** turns it into weights summing to 1, and the $V$ vectors are aggregated by those weights. The $\sqrt{d_k}$ merely **stabilises** the scale.

Training minimises the next-token prediction loss (cross-entropy):

$$ \mathcal{L} = -\sum_t \log p_\theta(x_t \mid x_{<t}) $$

**Ref —** Vaswani et al., *Attention Is All You Need*, NeurIPS 2017 (Transformer). For the foundations (neural networks), see **MLU-Explain**, https://mlu-explain.github.io ("Neural Networks").
<!-- /step -->

<!-- step:title="Worked example" -->
Concretely, an LLM can propose a NONMEM control file from a description, **explain** an error message, or **summarise** a PK/PD paper. The code must then be compiled and the summary checked against the source.

Used well, it speeds up the work; but every output must be **checked** — the model does not "know", it completes plausible text.
<!-- /step -->

<!-- step:title="Common pitfall" -->
Plausible is not true.

**Pitfall —** an LLM can **hallucinate**: invent a reference, a value or a wrong-but-credible syntax. In a clinical or regulatory context, every piece of information must be **verified at the source**, and patient data protected (confidentiality). The LLM assists, it does not decide.
<!-- /step -->

<!-- step:title="Key takeaways" -->
- An LLM predicts the next token (auto-regressive); trained at massive scale.
- The Transformer relies on attention: weighting the context by relevance.
- Uses: coding help (NONMEM/R), summarising, explaining — always to be verified.
- Risks: hallucinations, confidentiality; the LLM assists, it does not decide.
<!-- /step -->
