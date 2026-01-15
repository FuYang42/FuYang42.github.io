---
layout: post
title: "Paper2Slides"
date: 2026-01-15
categories: [Github]
tags: [技术, 分享]
---

## Paper2Slides

<a href="/assets/images/2/P2S.png" target="_blank">
  <img src="/assets/images/2/P2S.png" alt="项目简介" style="max-width: 100%; height: auto; cursor: pointer;">
</a>
<p style="font-size: 0.9em; color: #666; text-align: center; margin-top: 5px;">点击图片查看完整内容</p>

在上周五，我在GitHub上偶然发现了一个很有趣的开源项目，从名字来看非常容易理解，它可以将任意一篇论文转化成内容丰富的演讲展示稿。起初我认为这个功能十分鸡肋，因为我认为在LLM算力如此恐怖的当下，随便一个AI都可以完成这个任务，但是当我在Claude Sonnet 4.5尝试完成这个任务的时候，我发现了一些问题。

首先，人类与LLM对话的过程本来就带着非常大的语义不确定性，自然语言中某个词的细微差别可能会让AI完全理解错意思。例如下面我与Claude对话的图片中所示的情况。

<a href="/assets/images/2/Claude.png" target="_blank">
  <img src="/assets/images/2/Claude.png" alt="理解的偏差" style="max-width: 100%; height: auto; cursor: pointer;">
</a>
<p style="font-size: 0.9em; color: #666; text-align: center; margin-top: 5px;">点击图片查看完整内容</p>

在自然语言的对话中，我很随意的输入了我认为可以表达我意思的语句，但是忽略了其中演讲稿对于AI判断的影响。导致AI输出了一篇看起来很恶心的PDF。并且浪费了我很多Token...

在这个例子看来，LLM就像是一个穿着中世纪盔甲拿着长剑的骑士，而每个人类都是君主，当你下达指令的时候他会毫不犹豫地完成你的命令，当途中遇到障碍物，它会凭借它的直觉解决问题，就像上面的例子，Claude用628行Python代码生成了个全是方块的PDF文件...

而Paper2Slides就聪明多了。它只针对这一个问题（论文与PPT的转换），就像你给你的骑士划定了一条路线，并且把途中所有的困难和障碍物的解决方法都告诉了他。简单来说，Paper2Slides把具体问题抽象化然后再拆分成了四个阶段。

### 第一阶段：文档理解阶段

在这个阶段中，项目的处理流程如下：

1. **文档转换**：使用MinerU将PDF/Word转换成更适合LLM理解的Markdown文件
2. **知识图谱构建**：使用LightRAG建立文档的知识图谱

这部分中关于LightRAG是我认为这个项目最有意思的部分，它对于论文中的语句有高度的理解，以及语义划分。

<a href="/assets/images/2/rag.png" target="_blank">
  <img src="/assets/images/2/rag.png" alt="LightRAG" style="max-width: 100%; height: auto; cursor: pointer;">
</a>
<p style="font-size: 0.9em; color: #666; text-align: center; margin-top: 5px;">点击图片查看完整内容</p>

它可以将论文的每个词、句、段落进行嵌入处理，建立一个向量空间，再通过计算余弦相似度（或许是别的类似的算法，但余弦相似度算法是目前最广泛使用的）对语句进行理解和分类。在进行完这一步后的文档大概是这样子的：

<a href="/assets/images/2/PaperRAG1.png" target="_blank">
  <img src="/assets/images/2/PaperRAG1.png" alt="PaperRAG1" style="max-width: 100%; height: auto; cursor: pointer;">
</a>
<p style="font-size: 0.9em; color: #666; text-align: center; margin-top: 5px;">点击图片查看完整内容</p>

这一步十分出色，也为后面的步骤奠定了基础。

### 第二阶段：结构提取阶段

这部分是通过接入GPT-4o的API来实现的，代码会提取论文的四个核心部分：

```python
await extract_paper_section("motivation", rag_results["motivation"])
await extract_paper_section("solution", rag_results["solution"])
await extract_paper_section("results", rag_results["results"])
await extract_paper_section("contributions", rag_results["contributions"])
```

并且会建立一个数据模型来储存分类好的语义数据：

```python
class PaperContent:
    paper_info: str        # 标题、作者、机构
    motivation: str        # 研究问题和动机
    solution: str          # 方法和算法
    results: str           # 实验结果
    contributions: str     # 主要贡献
    tables: List[TableInfo]    # 提取的表格
    figures: List[FigureInfo]  # 提取的图表
```

### 第三阶段：策划以及内容优化

这个阶段也是通过接入GPT-4o的API来进行内容布局规划，并且为每张幻灯片匹配最相关的图标和数据。这部分是GPT的强项，并且这个项目还创建了一个关键提示词的Python脚本，用来要求保留关键数据、公式和具体数字。

<a href="/assets/images/2/PaperRAG2.png" target="_blank">
  <img src="/assets/images/2/PaperRAG2.png" alt="PaperRAG2" style="max-width: 100%; height: auto; cursor: pointer;">
</a>
<p style="font-size: 0.9em; color: #666; text-align: center; margin-top: 5px;">点击图片查看完整内容</p>

### 第四阶段：图像合成阶段

这个阶段是使用的Gemini 3 Pro Image Preview来处理生成视觉化幻灯片。不得不说，在视觉化处理的领域Gemini实在是太强了，不仅可以自定义风格，还可以要求所有幻灯片的风格、配色、字体、设计语言保持一致，生成一份内容和风格一致的幻灯片。效果如下：

<a href="/assets/images/2/over.png" target="_blank">
  <img src="/assets/images/2/over.png" alt="Slide" style="max-width: 100%; height: auto; cursor: pointer;">
</a>
<p style="font-size: 0.9em; color: #666; text-align: center; margin-top: 5px;">点击图片查看完整内容</p>

在这个过程中所使用的api在项目的\Paper2Slides\paper2slides\env处设置，按照我的经验建议使用代理的api，因为项目会调用不同的LLM，我使用了OpenRouter，实际使用下来模型的速度很快，并且价格比较合适，在上面的例子中使用了1.3美元的Tokens。

<a href="/assets/images/2/API.png" target="_blank">
  <img src="/assets/images/2/API.png" alt="API" style="max-width: 100%; height: auto; cursor: pointer;">
</a>
<p style="font-size: 0.9em; color: #666; text-align: center; margin-top: 5px;">点击图片查看完整内容</p>

在我看来，目前的AI发展让每个人都可以使用AI来搭建自己的工具，而不是像以前那样为不满意的应用程序付费。但更大的影响是，人们的创造力被以前所未有的方式激发。作为一个物种，我们从未能想象某种东西会被这样创造出来。

而这一切才刚刚开始。