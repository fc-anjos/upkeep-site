---
kind: refs
id: refs
order: 9
num: "§ 08"
title: "Research-grade foundations"
subtitle: "incremental view maintenance for the web"
paragraphs:
  - >
    Upkeep is a materialized-view engine for HTML. Incremental view
    maintenance and optimistic concurrency control are decades-old database
    techniques with a deep literature and well-understood performance. We took
    the shape that databases use to keep derived tables fresh and pointed it
    at the rendered page.
  - >
    The page is a view. The read-set is its defining query. A write is a
    delta. The render is the row. Every decision in Upkeep follows from that
    analogy, which is why it holds up at scale.
  - >
    The result is a system with strong theoretical guarantees about which
    fragments need to update, rather than a heuristic about which broadcasts
    might reach the right client.
refs:
  - term: "incremental view maintenance"
    citation_html: "Gupta &amp; Mumick, Maintenance of Materialized Views <span class=\"year\">1995</span>"
  - term: "streaming dataflow for web apps"
    citation_html: "Gjengset et al., Noria: Partial State and Incremental Compute <span class=\"year\">OSDI 2018</span>"
  - term: "optimistic concurrency"
    citation_html: "Kung &amp; Robinson, On Optimistic Methods for Concurrency Control <span class=\"year\">1981</span>"
  - term: "statics / dynamics transport"
    citation_html: "Phoenix LiveView; Cutout <span class=\"year\">prior work in Elixir / Ruby</span>"
  - term: "two-tier subscription index"
    citation_html: "Convex reactor <span class=\"year\">2023</span>"
---
