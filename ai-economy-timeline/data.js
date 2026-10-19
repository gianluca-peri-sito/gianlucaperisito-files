// Content of the timeline.
//   EVENTS : the dated points in the list. `body` is the written text (short, simple, optional),
//            `sources` the links to the event's online sources, always shown at the bottom of the point.
//
// Event fields:
//   link  : online page the thumbnail opens (null if not known yet)
//   img   : thumbnail image in site/img/ (overrides thumb)
//   thumb : drawn card used when there is no img. kind = paper | product | org | milestone
//   by    : who made it happen, a list of names from MAKERS (below); shown as coloured tags next to the month
//   mock  : { prompt, thinking: [...], answer, caption }: a drawn example of a chat with a reasoning model (o1). It is
//           an illustration, and its caption must say so
//   split : instead of title/sources/img/link/thumb, a list of two such results that share one date and
//           one node on the line, shown side by side

const AUTHOR = "Gianluca Peri";

// "About the author" pane. Facts are from the author's website (www.gianlucaperi.com) and CV. Update here when the
// website changes.
const ABOUT = {
  role: "PhD student in Machine Learning and Complex Systems",
  // short label / value pairs, shown as a fact list
  facts: [
    ["PhD", "University of Florence · University of Namur"],
    ["Before", "MSc Theoretical Physics of Complex Systems (2024) · BSc Physics and Astronomy (2021), Florence"],
  ],
  // one short line each; shown as cards
  research: [
    ["Market forecasting", "Models for microtrading and market forecasting, developed with Tecnolink."],
    ["Spectral methods", "Describing a network by its eigenvalues and eigenvectors."],
    ["Higher-order neural networks", "Neural networks whose units interact in groups, not only in pairs."],
    ["Trained walkers", "Agents that learn where to go on networks."],
  ],
  publications: [
    ["Optimal Navigation on Simplicial Complexes", "2026 · arXiv", "https://arxiv.org/abs/2607.29450"],
    ["Spectral Higher-Order Neural Networks Have Sharp Expressivity Bounds", "2026 · arXiv", "https://arxiv.org/abs/2607.19042"],
    ["Spectral Higher-Order Neural Networks", "2026 · arXiv", "https://arxiv.org/abs/2603.28420"],
    ["Smart Walkers in Discrete Space", "2026 · Chaos, Solitons & Fractals", "https://www.sciencedirect.com/science/article/pii/S0960077926004972"],
    ["Spectral Architecture Search for Neural Network Models", "2025 · npj Artificial Intelligence", "https://www.nature.com/articles/s44387-025-00039-1"],
  ],
  links: [
    ["Website", "https://www.gianlucaperi.com"],
    ["Curriculum (PDF)", "https://gianluca-peri-sito.github.io/gianlucaperisito-files/Curriculum_ENG.pdf"],
    ["Google Scholar", "https://scholar.google.com/citations?user=iX-3cb8AAAAJ"],
    ["Notes and teaching", "https://www.gianlucaperi.com/material"],
  ],
  email: "gianluca.peri@unifi.it",
};

// Who made each point happen: the names used in the events' `by` field, each with the colour of its tag. The colour is
// mixed with the page's ink and surface in style.css, so one value works in light and in dark mode.
const MAKERS = {
  "OpenAI": "#0f9d7a", "Anthropic": "#d2693f", "Google": "#3b7cf0", "Microsoft": "#0a84d6", "Meta": "#1668e3", "xAI": "#6b7280",
  "Mistral": "#f2580c", "DeepSeek": "#4d6bfe", "Nvidia": "#6aa800", "METR": "#8a5cc2", "LMSYS": "#b0478f", "Egomnia": "#c2185b",
  "SoftBank": "#8a8f98", "Oracle": "#c74634", "European Union": "#2c56c9", "Open source": "#6e7781",
};

const EVENTS = [
  {
    date: "06/2017",
    by: ["Google"],
    title: "“Attention Is All You Need” is published",
    body: `Presented at NeurIPS 2017. Originally it was thought as an architecture for machine translation.`,
    sources: `<a href="https://arxiv.org/abs/1706.03762">arXiv:1706.03762</a>`,
    img: "img/attention.webp",
    link: "https://arxiv.org/abs/1706.03762",
    thumb: { kind: "paper", title: "Attention Is All You Need", authors: "Vaswani et al.", venue: "NeurIPS 2017" },
  },
  {
    date: "06/2018",
    by: ["OpenAI"],
    title: "GPT-1 is released",
    sources: `Radford et al., <a href="https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf">Improving Language Understanding by Generative Pre-Training</a>.`,
    img: "img/gpt1.webp",
    link: "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf",
    thumb: { kind: "paper", title: "Improving Language Understanding by Generative Pre-Training", authors: "Radford et al.", venue: "OpenAI 2018" },
  },
  {
    date: "02/2019",
    by: ["OpenAI"],
    title: "GPT-2 is partially released",
    sources: `Radford et al., <a href="https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf">Language Models are Unsupervised Multitask Learners</a> ·
      <a href="https://openai.com/index/better-language-models/">OpenAI announcement</a>`,
    img: "img/gpt2.webp",
    link: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf",
    thumb: { kind: "paper", title: "Language Models are Unsupervised Multitask Learners", authors: "Radford et al.", venue: "OpenAI 2019" },
  },
  {
    date: "06/2020",
    by: ["OpenAI"],
    title: "Private beta of GPT-3",
    sources: `Brown et al., <a href="https://arxiv.org/abs/2005.14165">Language Models are Few-Shot Learners</a>.`,
    img: "img/gpt3.webp",
    link: "https://arxiv.org/abs/2005.14165",
    thumb: { kind: "paper", title: "Language Models are Few-Shot Learners", authors: "Brown et al.", venue: "NeurIPS 2020" },
  },
  {
    date: "01/2021",
    by: ["Anthropic"],
    title: "Anthropic is founded",
    sources: `<a href="https://en.wikipedia.org/wiki/Anthropic">Wikipedia, “Anthropic”</a> (founded 26 January 2021)`,
    img: "img/anthropic-logo.webp",
    link: "https://en.wikipedia.org/wiki/Anthropic",
    thumb: { kind: "org", name: "Anthropic", mono: "A\\" },
  },
  {
    date: "06/2021",
    by: ["Microsoft", "OpenAI"],
    title: "GitHub Copilot is released",
    work: true,
    sources: `<a href="https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/">GitHub, “Introducing GitHub Copilot: your AI pair programmer”</a> (29 Jun 2021)`,
    body: "The first commercial application of Large Language Models.",
    figure: { img: "img/copilot-completion.webp", caption: "Copilot completing a function in the editor. Image from GitHub's launch post, June 2021.", link: "https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/" },
    link: "https://github.com/features/copilot",
    thumb: { kind: "product", name: "Copilot", code: true, lines: ["def fib(n):", "  if n < 2: return n", "  return fib(n-1) + fib(n-2)"] },
  },
  {
    date: "03/2022",
    by: ["OpenAI"],
    title: "InstructGPT: pretraining, fine-tuning, RLHF",
    body: `The article that introduced the first dominant training paradigm for large language models. It stood for years, until the rise of RLVR.`,
    sources: `Ouyang et al., <a href="https://arxiv.org/abs/2203.02155">Training language models to follow instructions with human feedback</a>.`,
    img: "img/instructgpt.webp",
    link: "https://arxiv.org/abs/2203.02155",
    thumb: { kind: "paper", title: "Training language models to follow instructions with human feedback", authors: "Ouyang et al.", venue: "NeurIPS 2022" },
  },
  {
    date: "11/2022",
    by: ["OpenAI"],
    title: "ChatGPT (GPT-3.5) is released",
    body: `The first modern AI product for the masses.`,
    sources: `<a href="https://openai.com/index/chatgpt/">OpenAI, “Introducing ChatGPT”</a> (30 Nov 2022).`,
    img: "img/chatgpt.webp",
    link: "https://openai.com/index/chatgpt/",
    thumb: { kind: "product", name: "ChatGPT", lines: ["Explain RLHF simply", "Humans rank answers; the model learns to prefer the better ones."] },
  },
  {
    date: "01/2023",
    by: ["OpenAI"],
    title: "ChatGPT reaches 100 million users",
    sources: `<a href="https://arstechnica.com/information-technology/2023/02/chatgpt-sets-record-for-fastest-growing-user-base-in-history-report-says/">Ars Technica, “ChatGPT sets record for fastest-growing user base in history, report says”</a> (1 Feb 2023) · <a href="https://www.theguardian.com/technology/2023/feb/02/chatgpt-100-million-users-open-ai-fastest-growing-app">The Guardian, “ChatGPT reaches 100 million users two months after launch”</a> (2 Feb 2023).`,
    img: "img/chatgpt-100m.webp",
    link: "https://arstechnica.com/information-technology/2023/02/chatgpt-sets-record-for-fastest-growing-user-base-in-history-report-says/",
    thumb: { kind: "milestone", big: "100M", caption: "users in 2 months" },
  },
  {
    date: "02/2023",
    by: ["Meta"],
    title: "Meta releases LLaMA",
    body: `The first big open-weights model.`,
    sources: `<a href="https://ai.meta.com/blog/large-language-model-llama-meta-ai/">Meta AI, “Introducing LLaMA: A foundational, 65-billion-parameter large language model”</a> (24 Feb 2023) ·
      Touvron et al., <a href="https://arxiv.org/abs/2302.13971">LLaMA: Open and Efficient Foundation Language Models</a>`,
    img: "img/llama.webp",
    link: "https://arxiv.org/abs/2302.13971",
    thumb: { kind: "paper", title: "LLaMA: Open and Efficient Foundation Language Models", authors: "Touvron et al.", venue: "arXiv 2023" },
  },
  {
    date: "03/2023",
    by: ["xAI"],
    title: "xAI is founded",
    sources: `<a href="https://en.wikipedia.org/wiki/XAI_(company)">Wikipedia, “xAI”</a> (founded 9 March 2023)`,
    img: "img/xai-logo.webp",
    link: "https://en.wikipedia.org/wiki/XAI_(company)",
    thumb: { kind: "org", name: "Incorporated 9 March 2023", mono: "xAI" },
  },
  {
    date: "03/2023",
    by: ["Anthropic"],
    title: "Claude is released",
    sources: `<a href="https://www.anthropic.com/news/introducing-claude">Anthropic, “Introducing Claude”</a> (14 Mar 2023).`,
    img: "img/claude.webp",
    link: "https://www.anthropic.com/news/introducing-claude",
    thumb: { kind: "product", name: "Claude", lines: ["Summarise this contract", "Here are the five clauses that matter most…"] },
  },
  {
    date: "04/2023",
    by: ["Open source"],
    title: "Auto-GPT: a language model put in a loop with tools",
    body: `The first harness for an LLM.`,
    work: true,
    sources: `<a href="https://github.com/Significant-Gravitas/AutoGPT/releases/tag/v0.1.0">Auto-GPT, first release (v0.1.0)</a> on GitHub (12 Apr 2023).`,
    img: "img/autogpt-repo.webp",
    link: "https://github.com/Significant-Gravitas/AutoGPT",
    thumb: { kind: "product", name: "Auto-GPT", lines: ["Goal: research and write a report", "(plans, searches, writes files, repeats)"] },
  },
  {
    date: "04/2023",
    by: ["Mistral"],
    title: "Mistral is founded",
    body: `The first, and so far the only, big European AI lab.`,
    sources: `<a href="https://en.wikipedia.org/wiki/Mistral_AI">Wikipedia, “Mistral AI”</a> (founded 28 April 2023)`,
    img: "img/mistral-logo.webp",
    link: "https://en.wikipedia.org/wiki/Mistral_AI",
    thumb: { kind: "org", name: "Mistral AI", mono: "M" },
  },
  {
    date: "05/2023",
    by: ["LMSYS"],
    title: "Chatbot Arena opens: the public ranks the models (today Arena AI)",
    body: `Two chatbots answer the same question, and you are not told which is which. You vote for the answer you like more. All the votes together become a ranking, worked out the way chess players are ranked (Elo).`,
    sources: `Zheng et al., <a href="https://lmsys.org/blog/2023-05-03-arena/">“Chatbot Arena: Benchmarking LLMs in the Wild with Elo Ratings”</a>, LMSYS (3 May 2023).`,
    img: "img/arena-launch.webp",
    link: "https://lmsys.org/blog/2023-05-03-arena/",
    thumb: { kind: "org", name: "Chatbot Arena", mono: "Arena" },
  },
  {
    date: "05/2023",
    by: ["Nvidia"],
    title: "Nvidia reaches a $1 trillion market value",
    sources: `<a href="https://www.cnbc.com/2023/05/30/nvidia-on-track-to-hit-1-trillion-market-cap-when-market-opens.html">CNBC, “Nvidia crosses into $1 trillion market cap before giving back gains”</a> (30 May 2023).`,
    img: "img/nvidia-1t.webp",
    link: "https://www.cnbc.com/2023/05/30/nvidia-on-track-to-hit-1-trillion-market-cap-when-market-opens.html",
    thumb: { kind: "milestone", big: "$1T", caption: "Nvidia" },
  },
  {
    date: "09/2023",
    by: ["Mistral"],
    title: "Mistral 7B is released with open weights",
    body: `The first release of a European model, and its weights are open: anyone can download it and run it.`,
    sources: `<a href="https://mistral.ai/news/announcing-mistral-7b">Mistral AI, “Mistral 7B”</a> (27 Sep 2023) ·
      Jiang et al., <a href="https://arxiv.org/abs/2310.06825">Mistral 7B</a> technical report.`,
    img: "img/mistral7b.webp",
    link: "https://arxiv.org/abs/2310.06825",
    thumb: { kind: "paper", title: "Mistral 7B", authors: "Jiang et al.", venue: "arXiv 2023" },
  },
  {
    date: "11/2023",
    by: ["xAI"],
    title: "Grok is released by xAI",
    sources: `<a href="https://x.ai/news/grok">xAI, “Announcing Grok”</a> (3 Nov 2023).`,
    img: "img/grok-announcement.webp",
    link: "https://x.ai/news/grok",
    thumb: { kind: "product", name: "Grok", lines: ["What happened today on X?", "Here is what people are talking about…"] },
  },
  {
    date: "12/2023",
    by: ["METR"],
    title: "METR is founded: an independent body to measure what AI can do",
    body: `METR is an independent non-profit that tests AI models from the outside. Its best-known test asks a simple question: how long a task can a model carry out on its own?`,
    sources: `<a href="https://metr.org/blog/2023-12-04-metr-announcement/">METR, “ARC Evals is now METR”</a> (4 Dec 2023). · <a href="https://metr.org/time-horizons/">METR, task-completion time horizons</a>`,
    img: "img/metr-founding.webp",
    link: "https://metr.org/blog/2023-12-04-metr-announcement/",
    thumb: { kind: "org", name: "Model Evaluation & Threat Research", mono: "METR" },
  },
  {
    // One point on the line, two results side by side: both lead to Gemini 1.0
    date: "12/2023",
    by: ["Google"],
    split: [
      {
        title: "Gemini is released",
        sources: `Gemini Team, <a href="https://arxiv.org/abs/2312.11805">Gemini: A Family of Highly Capable Multimodal Models</a>.`,
        img: "img/gemini.webp",
        link: "https://arxiv.org/abs/2312.11805",
        thumb: { kind: "paper", title: "Gemini: A Family of Highly Capable Multimodal Models", authors: "Gemini Team", venue: "Google 2023" },
      },
      {
        title: "First truly multimodal general model: Gemini 1.0",
        work: true,
        sources: `Gemini Team, <a href="https://arxiv.org/abs/2312.11805">Gemini: A Family of Highly Capable Multimodal Models</a>, section 2 and Figure 2.`,
        img: "img/gemini-multimodal.webp",
        link: "https://arxiv.org/abs/2312.11805",
        thumb: { kind: "milestone", big: "Aa ♪ ▣", caption: "One Transformer" },
      },
    ],
  },
  {
    date: "12/2023",
    by: ["DeepSeek"],
    title: "DeepSeek is released",
    body: `The first big and famous language model from China (and it's open-weights).`,
    sources: `<a href="https://github.com/deepseek-ai/DeepSeek-LLM">DeepSeek-LLM repository</a> ·
      paper <a href="https://arxiv.org/abs/2401.02954">arXiv:2401.02954</a>.`,
    img: "img/deepseek.webp",
    link: "https://github.com/deepseek-ai/DeepSeek-LLM",
    thumb: { kind: "org", name: "DeepSeek", mono: "DS" },
  },
  {
    date: "06/2024",
    by: ["Nvidia"],
    title: "Nvidia becomes, briefly, the most valuable company in the world",
    body: `It stayed on top only for a few days: three days of falling prices took 13% off its shares later.`,
    sources: `<a href="https://www.cnbc.com/2024/06/18/nvidia-passes-microsoft-in-market-cap-is-most-valuable-public-company.html">CNBC, “Nvidia passes Microsoft in market cap to become most valuable public company”</a> (18 Jun 2024). · CNBC, <a href="https://www.cnbc.com/2024/06/24/nvidia-slides-13percent-in-three-days-after-becoming-most-valuable-company.html">“Nvidia slides 13% in three days after briefly becoming most valuable company”</a> (24 Jun 2024)`,
    img: "img/nvidia-most-valuable.webp",
    link: "https://www.cnbc.com/2024/06/18/nvidia-passes-microsoft-in-market-cap-is-most-valuable-public-company.html",
    thumb: { kind: "milestone", big: "#1", caption: "Nvidia, $3.34 trillion" },
  },
  {
    date: "08/2024",
    by: ["European Union"],
    title: "The EU AI Act enters into force",
    body: `The first broad law on AI. It sorts AI systems by how risky they are, and asks more to the riskier ones.`,
    sources: `<a href="https://commission.europa.eu/news-and-media/news/ai-act-enters-force-2024-08-01_en">European Commission, “AI Act enters into force”</a> (1 Aug 2024) ·
      <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj">Regulation (EU) 2024/1689</a>`,
    img: "img/eu-ai-act.webp",
    link: "https://commission.europa.eu/news-and-media/news/ai-act-enters-force-2024-08-01_en",
    thumb: { kind: "milestone", big: "AI Act", caption: "European Union" },
  },
  {
    date: "09/2024",
    by: ["OpenAI"],
    title: "First reasoning model: OpenAI o1",
    sources: `<a href="https://openai.com/index/learning-to-reason-with-llms/">OpenAI, “Learning to reason with LLMs”</a> (12 Sep 2024).`,
    body: `For the first time, space for thinking and reasoning was given to a large LLM.`,
    mock: {
      prompt: "Solve x² − 3 = 1",
      thinking: ["I need the values of x that make this true.", "Add 3 to both sides: x² = 4.", "Which numbers give 4 when squared? 2 does, and so does −2.", "Check: 2² − 3 = 1 ✓ and (−2)² − 3 = 1 ✓"],
      answer: "x = 2 or x = −2",
      caption: "An illustration made for this page, not a real screenshot: the model first writes out its reasoning, then gives the answer.",
    },
    link: "https://openai.com/index/learning-to-reason-with-llms/",
    thumb: { kind: "product", name: "o1", lines: ["How many r's in strawberry?", "Thought for 6 seconds · 3"] },
  },
  {
    date: "10/2024",
    by: ["Anthropic"],
    title: "Computer use: Claude operates a computer",
    body: `Claude uses a computer the way a person does. It looks at the screen, decides what to do, then moves the cursor, clicks and types. Then it looks again, and so on until the job is done. At launch it was slow and made mistakes, but no top model had been offered with this ability before.`,
    work: true,
    sources: `<a href="https://www.anthropic.com/news/3-5-models-and-computer-use">Anthropic, “Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku”</a> (22 Oct 2024).`,
    img: "img/claude-computer-use.webp",
    link: "https://www.anthropic.com/news/3-5-models-and-computer-use",
    thumb: { kind: "product", name: "Claude", lines: ["Fill in this form from the spreadsheet", "(moves the cursor, clicks, types)"] },
  },
  {
    date: "11/2024",
    by: ["Anthropic"],
    title: "The Model Context Protocol (MCP) is introduced",
    body: `A common plug for AI. Before, every assistant needed its own custom connection to each tool or data source.`,
    work: true,
    sources: `<a href="https://www.anthropic.com/news/model-context-protocol">Anthropic, “Introducing the Model Context Protocol”</a> (25 Nov 2024).`,
    img: "img/mcp.webp",
    link: "https://www.anthropic.com/news/model-context-protocol",
    thumb: { kind: "product", name: "MCP", lines: ["One protocol between models", "and tools, files, databases"] },
  },
  {
    date: "01/2025",
    by: ["DeepSeek"],
    title: "DeepSeek R1 is released",
    body: `An open-weights model that reasons before it answers. It learned to reason by trial and error, with a method called RLVR (reinforcement learning with verifiable rewards). The model is given problems whose answers can be checked automatically, like a maths exercise or a coding challenge. Right answers get reinforced, along with their reasoning traces.`,
    sources: `DeepSeek-AI, <a href="https://arxiv.org/abs/2501.12948">DeepSeek-R1</a> technical report.`,
    img: "img/deepseek-r1.webp",
    link: "https://arxiv.org/abs/2501.12948",
    thumb: { kind: "paper", title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning", authors: "DeepSeek-AI", venue: "arXiv 2025" },
  },
  {
    date: "01/2025",
    by: ["OpenAI", "SoftBank", "Oracle"],
    title: "Stargate: a $500 billion plan for AI datacenters",
    body: `A plan by OpenAI, SoftBank, Oracle and MGX to spend $500 billion in four years on datacenters for AI in the United States.`,
    sources: `<a href="https://openai.com/index/announcing-the-stargate-project/">OpenAI, “Announcing The Stargate Project”</a> (21 Jan 2025). · OpenAI, <a href="https://openai.com/index/five-new-stargate-sites/">“OpenAI, Oracle, and SoftBank expand Stargate with five new AI data center sites”</a> (23 Sep 2025)`,
    img: "img/stargate.webp",
    link: "https://openai.com/index/announcing-the-stargate-project/",
    thumb: { kind: "milestone", big: "$500B", caption: "Stargate" },
  },
  {
    date: "01/2025",
    by: ["DeepSeek", "Nvidia"],
    title: "The DeepSeek shock: Nvidia falls 17% in one day",
    body: `DeepSeek said its model had been built in two months for under $6 million, very little next to what American labs spend. If good AI can be made that cheaply, who needs so many expensive chips? Investors took fright, and Nvidia lost 17% of its value in one day. Some analysts doubted the $6 million figure: they said it left out the cost of earlier research.`,
    sources: `<a href="https://www.cnbc.com/2025/01/27/nvidia-falls-10percent-in-premarket-trading-as-chinas-deepseek-triggers-global-tech-sell-off.html">CNBC, “Nvidia drops nearly 17% as China's cheaper AI model DeepSeek sparks global tech sell-off”</a> (27 Jan 2025).`,
    img: "img/deepseek-shock.webp",
    link: "https://www.cnbc.com/2025/01/27/nvidia-falls-10percent-in-premarket-trading-as-chinas-deepseek-triggers-global-tech-sell-off.html",
    thumb: { kind: "milestone", big: "−17%", caption: "Nvidia, 27 Jan 2025" },
  },
  {
    date: "02/2025",
    by: ["Anthropic"],
    title: "Claude Code: a coding agent in the terminal",
    work: true,
    body: `The first big coding agent that can do everything a human with a terminal can.`,
    sources: `<a href="https://www.anthropic.com/news/claude-3-7-sonnet">Anthropic, “Claude 3.7 Sonnet and Claude Code”</a> (24 Feb 2025)·`,
    figure: { img: "img/claude-code-terminal.webp", caption: "Claude Code's first screen in the terminal (research preview). Image from Anthropic's announcement, February 2025.", link: "https://www.anthropic.com/news/claude-3-7-sonnet" },
    link: "https://www.anthropic.com/news/claude-3-7-sonnet",
    thumb: { kind: "product", name: "Claude Code", lines: ["> fix the failing test", "(reads files, edits, runs tests)"] },
  },
  {
    date: "07/2025",
    by: ["Google"],
    title: "Gemini wins gold at the International Mathematical Olympiad",
    sources: `<a href="https://deepmind.google/discover/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/">Google DeepMind</a> (21 Jul 2025).`,
    img: "img/imo-gold.webp",
    link: "https://deepmind.google/discover/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/",
    thumb: { kind: "milestone", big: "IMO", caption: "Gold · 35 / 42" },
  },
  {
    date: "06/2026",
    by: ["Egomnia"],
    title: "Emma AI, an Italian model by Egomnia",
    body: `Egomnia, an Italian company listed in Milan, launched Emma, a family of small Italian-only language models. Emma-5 (about 550 million parameters) went public on 20 June 2026 and was suspended a few days later, after users shared incoherent and wrong answers.`,
    sources: `<a href="https://www.economymagazine.it/nasce-emma-lintelligenza-artificiale-italiana-per-la-sovranita-tecnologica-nazionale/">Economy (launch)</a> ·
      <a href="https://huggingface.co/egomnia/emma-5">Emma-5 model card</a> ·
      <a href="https://aidia.it/en/news/emma-5-perche-non-ha-funzionato/">Aidia (suspension)</a> ·
      <a href="https://www.focusjunior.it/news/emma-ai-italiana-allucinazioni-virali/">Focus Junior (the answers)</a> ·
      <a href="https://tg24.sky.it/tecnologia/2026/06/25/emma-ai-italia-egomnia">Sky TG24 (25 Jun 2026)</a>`,
    list: {
      title: "Questions and answers that went viral",
      items: [
        ["How many times does the letter “g” appear in <i>fragola</i> (strawberry)?", "<q>Ha circa 38kg per 100g</q> (“It has about 38 kg per 100 g”)"],
        ["Who runs Milan?", "<q>Il sindaco di Milano è Matteo Achilli</q> (“The mayor of Milan is Matteo Achilli”, who is the founder of the company that built Emma)"],
        ["Which is heavier, a kilo of bread or a kilo of feathers?", "The bread."],
        ["Can a dog fly?", "Yes."],
      ],
      note: "As collected by Focus Junior and Sky TG24 from screenshots that users shared online. The first two answers are quoted word for word; the last two were reported only in summary, so their wording here is ours. Both outlets warn that some screenshots in circulation are fake.",
    },
    img: "img/emma-launch.webp",
    link: "https://www.economymagazine.it/nasce-emma-lintelligenza-artificiale-italiana-per-la-sovranita-tecnologica-nazionale/",
    thumb: { kind: "org", name: "Emma AI", mono: "E" },
  },
  {
    date: "09/2026",
    by: ["Anthropic"],
    title: "Claude finds a CRISPR-like enzyme system in Anthropic's wet lab",
    work: true,
    body: `Anthropic opened a life sciences lab where Claude instances run the research. About 950 Claude agents searched a large DNA database for 21 hours and spotted a reverse transcriptase sitting next to an array of CRISPR-like DNA repeats. Anthropic named the system ART (array-associated reverse transcriptases). Its function is not known yet.`,
    sources: `<a href="https://www.anthropic.com/news/claude-discovers-novel-enzyme-system">Announcement</a> ·
      <a href="https://www-cdn.anthropic.com/22573675ada52a8ca8a97a1a4b4326b2f208a071.pdf">Preprint</a> ·
      <a href="https://techcrunch.com/2026/09/23/anthropic-says-its-biology-lab-has-already-found-something-big/">TechCrunch</a>`,
    link: "https://www.anthropic.com/news/claude-discovers-novel-enzyme-system",
    img: "img/claude-art.webp",
    thumb: { kind: "milestone", big: "ART", caption: "CRISPR-like enzyme" },
  },
  {
    date: "09/2026",
    by: ["OpenAI"],
    title: "OpenAI solved the Navier–Stokes Millennium Problem",
    work: true,
    body: `On 8 September 2026 OpenAI published a proof that the Navier–Stokes equations can develop a singularity in finite time. It was found by an internal system of about 10,000 coordinating agents and formalized in Lean. Mathematicians are still digesting it.`,
    sources: `<a href="https://openai.com/index/navier-stokes-solution/">OpenAI</a> ·
      <a href="https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/">Quanta Magazine</a> ·
      <a href="https://terrytao.wordpress.com/2026/09/23/headlines-and-inside-stories-understanding-and-trust-in-ai-for-mathematics-science-and-engineering/">Terence Tao's blog</a> ·`,
    figure: { img: "img/navier-stokes-vortex.webp", caption: "The vortex in the claimed solution: the fluid spirals inward while it is stretched along its axis. Image from OpenAI's announcement.", link: "https://openai.com/index/navier-stokes-solution/", tall: true },
    link: "https://openai.com/index/navier-stokes-solution/",
    thumb: { kind: "milestone", big: "∇·u = 0", caption: "Navier–Stokes" },
  },
  {
    date: "09/2026",
    by: ["Anthropic"],
    title: "Anthropic's first R&D Automation Index",
    body: `Anthropic published a first measure of how much of its own AI research is done by Claude. Claude “leads” 26% of Anthropic's AI R&D tasks, up from under 1% in February 2026, and more than 90% of the work is at the “AI collaborates” level or above.`,
    sources: `<a href="https://www.anthropic.com/institute/measuring-pace-of-ai-development">Anthropic, “Measurements for understanding the pace of AI development inside frontier labs”</a>.`,
    figure: { img: "img/rd-automation-chart.webp", caption: "Monthly share of Anthropic's model R&D tasks at each automation level, August 2025 to August 2026. Chart from Anthropic's report.", link: "https://www.anthropic.com/institute/measuring-pace-of-ai-development" },
    link: "https://www.anthropic.com/institute/measuring-pace-of-ai-development",
    thumb: { kind: "milestone", big: "R&D", caption: "Automation index" },
  },
  {
    date: "10/2026",
    by: ["OpenAI"],
    work: true,
    split: [
      {
        title: "The “mathpocalypse”: OpenAI releases 722 AI-written maths papers",
        body: `On 6 October 2026 OpenAI published 722 maths papers written by one of its AI models, all on the same day.`,
        sources: `<a href="https://openai.com/index/sharing-ai-progress-in-mathematics/">OpenAI, “Sharing AI progress in mathematics”</a> (6 Oct 2026) ·
          <a href="https://theconversation.com/is-this-the-mathocalypse-why-openais-latest-results-dump-has-left-mathematicians-in-shock-293837">The Conversation</a> (9 Oct 2026)`,
        img: "img/openai-math-release.webp",
        link: "https://openai.com/index/sharing-ai-progress-in-mathematics/",
        thumb: { kind: "milestone", big: "722", caption: "AI-written maths papers" },
      },
      {
        title: "The headline result: a step towards the Riemann hypothesis",
        body: `The most famous claim in the release: a step towards the Riemann hypothesis, the best-known open problem in mathematics. It is not a proof of the hypothesis itself, and mathematicians have not checked it yet.`,
        sources: `OpenAI, <a href="https://github.com/openai/math/blob/main/preprints/The-Quasi-Riemann-Hypothesis-September-30-2026/paper.pdf">“The Quasi-Riemann Hypothesis: A Zero-Free Half-Plane ℜs &gt; 7/8”</a> (30 Sep 2026) ·
          <a href="https://github.com/openai/math/blob/main/lean/docs/003.md">scope of the Lean formalization</a>`,
        img: "img/quasi-riemann.webp",
        link: "https://github.com/openai/math/blob/main/preprints/The-Quasi-Riemann-Hypothesis-September-30-2026/paper.pdf",
        thumb: { kind: "paper", title: "The Quasi-Riemann Hypothesis", authors: "OpenAI", venue: "30 September 2026" },
      },
    ],
  },
];
