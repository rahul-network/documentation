# Introduction

Document version: <span class="mono"> v1.0.2 </span> (updated 09-feb-2022)

This document describes the TokenMe Architecture and Design.

## The gentle introduction

This is an introduction for people who need to read and maybe later write or change the info in this "Architecture Design document", and who are not (yet) familiar with Github and/or Markdown.

First, the entire web-document lives (is "hosted") on Github, in a repository called <span class="mono">TokenMe-Architecture</span>, with this web-link (URL): <br>
https://github.com/Sostark/TokenMe-Architecture 

<span class="mono">Github</span> is a website where you can have free or paid account, and then host your code or documents in a "git repository", which is a collection of files and folders, of which the contents and the changes are tracked. 

<span class="mono">Git</span> is a tool (developed by Linus Torvalds, also the creator of Linux) that lets you track changes in documents (typically: code), and allow you to collaborate with others (merge code), or revert to old versions (this software is also called a 'version control system'). Simply put, git allows you to see who has changed what code at what time, and you can restore previous code (every change is called a "commit" in git, and you can restore to a previous commit).

This web-document actually consists of multiple "source" documents, and these <span class="mono">source-documents</span> are written in a format called MarkDown.
The source document where this very "gentle introduction" text is written is called `/docbase/01-introduction.md` and can be seen (and edited) here: <br>
https://github.com/Sostark/TokenMe-Architecture/blob/main/docbase/01-introduction.md

<span class="mono">Markdown</span> is a text format where you (as a human) can write both the text (content), and the formatting of that content.
Actually the HTML format does the same, but HTML is not designed to be easy for humans, and Markdown is. <br> 
For example, to make a certain word in **bold** in Markdown, you would use two (2) asterix (\*) symbols on either side of that word, like this: "this is a **\*\*bold\*\*** word."

There is another special thing about this Architecture web-document: everytime a change is made in a source-document, and that change is "seen" in the github repo (tchnically: a commit is pushed to Github), then there is an <span class="mono">automatic process</span> triggered (called a "webhook" script), that copies this repo to the TokenMe cloud-server, and converts all (Markdown) source-documents to one big web-document, which is actually a HTML document (the conversion is handled by a script called ReSpec from W3C). That process is fully automatic, and normally you don't need to mind this, with one exception: you do need to <span class="mono">refresh your web-browser page</span> to see the latest version!

## About the source of this document

The source of this document is held in this (private) repository: <br>
https://github.com/Sostark/TokenMe-Architecture

Only the files in the `/docbase/` folder are converted to this HTML document. <br>

There are the files/folders in this `/docbase/` folder:

| File or Folder | Description |
| -- | -- |
| `index.html` | the base HTML file, where the `respec.js` scripts is called, and the `*.md` files are included |
| `respec.js` | the script from W3C that converts the `*.md` files to HTML and creates all links and indexes and references |
| `respec-w3c-v28.0.4-2021-nov--nosotd.js ` | the latest version (and modified for `nosotd`), actually `respec.js` is a copy of this file  |
| `/img/` | subfolder where images (`*.png`, `*.jpg`, `*.svg`, etc.) are stored. From the MarkDown file these are referenced as `img/file.png` |
| `00-abstract.md` | the MarkDown file that provides the abstract (this is mandatory by the `respec.js` file) |
| `01-introduction.md` | the first MarkDown file, and actually contains this very text and this table. |
| `xx-lowercasename.md` | any more MarkDown files with text, `xx` is a sequence number 00-99, and the name is lowercase. Note that a new `12-new.md` file needs to also be included in the `index.html` file! |

Directly after any change (technically after every commit), a webhook is send, and a Linux/Web-server is 'triggered' to pull the latest repo and publish this document (both links point to the same): <br>
https://cloud.sostark.nl/code/29117732/doc/
https://cloud.sostark.nl/code/29117732/TokenMe-Architecture/

## Format of documents

In order for git history tracking to work (and create issues, see differences between commits, etc.), it is important to exclusively use *Text-based documents*, such as: <br>
- MarkDown documents (\*.md) \[preferred!\]
- HTML documents (\*.html)
- Plain text documents (\*.txt)
- Diagrams can be created in SVG format (\*.svg) 

When all documents (in all folders) are written in MarkDown, and all diagrams in SVG, then it is very easy to generate ReSpec documents.

Note that ReSpec is also used in the https://github.com/Sostark/TokenMe-API repo, where the compiled (HTML) files are published here: https://sostark.github.io/TokenMe-API/

## About MarkDown

https://en.wikipedia.org/wiki/Markdown <br>
"*Markdown* is a lightweight markup language for creating formatted text using a plain-text editor."

https://daringfireball.net/projects/markdown/ <br>
"Markdown is two things: (1) a plain text formatting syntax; and (2) a software tool, written in Perl, that converts the plain text formatting to HTML."

&#96;&#96;&#96; 
```
Example of code
```
&#96;&#96;&#96;

<span class="mono">\<span class="mono"\>/api/reports\</span\></span>

Overview of supported languages: https://markdown.land/markdown-code-block

## Guide for writing MarkDown

- Github basic writing and formatting syntax <br> https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
- GitHub Flavored Markdown Spec <br> https://github.github.com/gfm/

## About SVG

https://en.wikipedia.org/wiki/Scalable_Vector_Graphics <br>
"Scalable Vector Graphics (SVG) is an XML-based vector image format for two-dimensional graphics with support for interactivity and animation."

This SVG-logo is an example of itself:

<img src="img/SVG_Logo.svg" width="200px" />

This is the SVG code:

```
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300">
 <defs>
  <g id="SVG" fill="#ffffff" transform="scale(2) translate(20,79)">
   <path id="S" d="M 5.482,31.319 C2.163,28.001 0.109,23.419 0.109,18.358 C0.109,8.232 8.322,0.024 18.443,0.024 C28.569,0.024 36.782,8.232 36.782,18.358 L26.042,18.358 C26.042,14.164 22.638,10.765 18.443,10.765 C14.249,10.765 10.850,14.164 10.850,18.358 C10.850,20.453 11.701,22.351 13.070,23.721 L13.075,23.721 C14.450,25.101 15.595,25.500 18.443,25.952 L18.443,25.952 C23.509,26.479 28.091,28.006 31.409,31.324 L31.409,31.324 C34.728,34.643 36.782,39.225 36.782,44.286 C36.782,54.412 28.569,62.625 18.443,62.625 C8.322,62.625 0.109,54.412 0.109,44.286 L10.850,44.286 C10.850,48.480 14.249,51.884 18.443,51.884 C22.638,51.884 26.042,48.480 26.042,44.286 C26.042,42.191 25.191,40.298 23.821,38.923 L23.816,38.923 C22.441,37.548 20.468,37.074 18.443,36.697 L18.443,36.692 C13.533,35.939 8.800,34.638 5.482,31.319 L5.482,31.319 L5.482,31.319 Z"/>
   <path id="V" d="M 73.452,0.024 L60.482,62.625 L49.742,62.625 L36.782,0.024 L47.522,0.024 L55.122,36.687 L62.712,0.024 L73.452,0.024 Z"/>
   <path id="G" d="M 91.792,25.952 L110.126,25.952 L110.126,44.286 L110.131,44.286 C110.131,54.413 101.918,62.626 91.792,62.626 C81.665,62.626 73.458,54.413 73.458,44.286 L73.458,44.286 L73.458,18.359 L73.453,18.359 C73.453,8.233 81.665,0.025 91.792,0.025 C101.913,0.025 110.126,8.233 110.126,18.359 L99.385,18.359 C99.385,14.169 95.981,10.765 91.792,10.765 C87.597,10.765 84.198,14.169 84.198,18.359 L84.198,44.286 L84.198,44.286 C84.198,48.481 87.597,51.880 91.792,51.880 C95.981,51.880 99.380,48.481 99.385,44.291 L99.385,44.286 L99.385,36.698 L91.792,36.698 L91.792,25.952 L91.792,25.952 Z"/>
  </g>
 </defs>
 <path id="base" fill="#000" d="M8.5,150 H291.5 V250 C291.5,273.5 273.5,291.5 250,291.5 H50 C26.5,291.5 8.5,273.5 8.5,250 Z"/>
 <g stroke-width="38.0086" stroke="#000">
  <g id="svgstar" transform="translate(150, 150)">
   <path id="svgbar" fill="#ffb13b" d="M-84.1487,-15.8513 a22.4171,22.4171 0 1 0 0,31.7026 h168.2974 a22.4171,22.4171 0 1 0 0,-31.7026 Z"/>
   <use xlink:href="#svgbar" transform="rotate(45)"/>
   <use xlink:href="#svgbar" transform="rotate(90)"/>
   <use xlink:href="#svgbar" transform="rotate(135)"/>
  </g>
 </g>
 <use xlink:href="#svgstar"/>
 <use xlink:href="#base" opacity="0.85"/>
 <use xlink:href="#SVG"/>
</svg>
```

## About ReSpec

ReSpec is a tool from W3C (standardisation body) that converts or compiles MarkDown to HTML, with optional SVG embedded.

- Info: https://respec.org/docs/
- Source code: https://github.com/w3c/respec/

<hr>
