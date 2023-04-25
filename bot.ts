import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { loadBotCache, writeBotCache } from "./lib/bootstrap";
import { BotConfig } from "./types";

// Edge cases
// MathJax
// https://www.core-econ.org/the-economy/book/text/01.html#eb-113
// Sub Heading in Blockquote
// https://www.core-econ.org/the-economy/book/text/01.html#the-starting-point-nominal-gdp
// Mentions of Figure 1.1b, 1.8 (missing), 1.9 (missing)
// https://www.core-econ.org/the-economy/book/text/01.html#eb-91
// blockquote.contains-footnote (Introduction of personality or side concept)
// https://www.core-econ.org/the-economy/book/text/01.html#great-economists-adam-smith
// Table in Figure
// https://www.core-econ.org/the-economy/book/text/12.html#figure-12-8
// ... sign in paragraph
// https://www.core-econ.org/the-economy/book/text/12.html#eb-309 (For Paraphrasing)
// Excercise
// https://www.core-econ.org/the-economy/book/text/12.html#exercise-127-rivalry-and-excludability (Skip these sections)
// Question
// https://www.core-econ.org/the-economy/book/text/12.html#question-125-choose-the-correct-answers
// Sub heading within Subchapter
// https://www.core-econ.org/the-economy/book/text/12.html#adverse-selection-in-the-insurance-market
// Sidenote
// https://www.core-econ.org/the-economy/book/text/12.html#eb-350
// Choices has Column in Question
// https://www.core-econ.org/the-economy/book/text/01.html#question-13-choose-the-correct-answers
// Paragraph having definition
// https://www.core-econ.org/the-economy/book/text/01.html#eb-215
// Paragraph having external links
// https://www.core-econ.org/the-economy/book/text/01.html#eb-225
// Paragraph having internal and external links
// https://www.core-econ.org/the-economy/book/text/01.html#eb-228
// Figure with SVG
// https://www.core-econ.org/the-economy/book/text/01.html#eb-232
// Sidenote as blockquote
// https://www.core-econ.org/the-economy/book/text/01.html#firm
// Figure with multiple SVGs
// https://www.core-econ.org/the-economy/book/text/01.html#figure-1-8
// Paragraph wih following Blockquote
// https://www.core-econ.org/the-economy/book/text/01.html#eb-387
// Paragraph with Reference
// https://www.core-econ.org/the-economy/book/text/01.html#eb-430
// Paragraph with question mark at end and next paragraph answering it
// https://www.core-econ.org/the-economy/book/text/01.html#eb-418
// Paragraph with H3 title
// https://www.core-econ.org/the-economy/book/text/01.html#economic-conditions
// Paraphrased Paragraph missing bullet points
// https://www.core-econ.org/the-economy/book/text/01.html#eb-456
// https://i.imgur.com/5QeExqg.png


// To select sub chapters
// document.querySelectorAll("section[role=\"tabpanel\"]")
// For Section Title and ID of Sub chapter
// section[role=\"tabpanel\"] > header > h2
// section[role=\"tabpanel\"] > div > *

// Procedure
// 1. Scrape all Figures and References
// 2. Extract actually links from Reference Links (because, all of them are shorten)
// 3. Extract Top level domain from References and Propose them as Nodes
// 4. Propose Figures as Nodes and save Node Ids in memo collection
// 5. Sync Subchapters list and skip "Conclusion" and "References"
// 6. Create Tag Nodes for Chapters
// 7. Create Tag Nodes for Sub Chapters with Parent link of corresponding Chapter
// 8. Combine information chunks if previous chunk is incomplete without next chunk
//    8.1. Don't paraphrase Blockquotes that are saying of someone
//         https://www.core-econ.org/the-economy/book/text/01.html#eb-387
// 9. Generate Title for each Chunk
// 10. Paraphrase all of Chunks
// 11. Calculate Parent(s) and Child(ren) for each Chunk
// 12. Calculate Tags and References for each Chunk
// 13. Propose all chunks as Nodes


// Paragraph with Blockquotes
// Paragraph with Lists
// Paragraph with Video or Figure
// Individual Lists
// Questions
// Ignored Blocks (named Unit for definitions, summary etc)
// Exercise (Skip)
// https://www.core-econ.org/the-economy/book/text/0-3-contents.html

const syncChapters = async (config: BotConfig) => {
  if(config.chapters.length) return;

  const TOC_URL = "https://www.core-econ.org/the-economy/book/text/0-3-contents.html";
  const tableOfContents = await (await fetch(TOC_URL)).text();
  const domToC = new JSDOM(tableOfContents);
  const tocListItems = domToC.window.document.querySelectorAll("#content > ol.toc-list > li.toc-entry-title > a");
  const chapters: {
    title: string,
    link: string,
    processed: boolean
  }[] = [];

  for(const tocListItem of tocListItems) {
    // const tocTitle = String(((tocListItem as HTMLElement).querySelector(".toc-entry-text") as HTMLElement)?.innerText).trim();
    const parentLi = tocListItem.closest("li");
    // Skipping non Chapter TOC
    if(
      parentLi.classList.contains("toc-frontmatter") ||
      parentLi.classList.contains("toc-endmatter")
    ) {
      continue;
    }
    const titleEl = tocListItem.querySelector(".toc-entry-text") as HTMLElement;
    if(!titleEl) {
      continue;
    }

    const href = (tocListItem as HTMLAnchorElement).href;
    const aHref = new URL(href, TOC_URL);

    chapters.push({
      title: titleEl.innerHTML.trim(),
      link: aHref.href,
      processed: false
    });
  }

  config.chapters = chapters;
  writeBotCache(config);
}

const syncSubChapters = async (config: BotConfig) => {
  for(const chapter of config.chapters) {
    if(chapter.subChapters && chapter.subChapters.length) continue;
    
    const chapterHTML = await (await fetch(chapter.link)).text();
    const domChapter = new JSDOM(chapterHTML);
    // domChapter.window.document.querySelector("");
    break;
  }
}

(async () => {
  const botConfig = loadBotCache();
  await syncChapters(botConfig);
})()