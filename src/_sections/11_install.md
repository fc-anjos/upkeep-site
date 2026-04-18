---
kind: install
id: install
order: 11
num: "§ 10"
title: "Try it in your app"
subtitle: "one bundle install away"
codepair:
  - filename: "Gemfile"
    pill: "Ruby"
    code_html: |
      gem <span class="str">"upkeep"</span>, <span class="sym">"~&gt; 0.1"</span>

      <span class="cmt"># or, to track main:</span>
      gem <span class="str">"upkeep"</span>, <span class="sym">github:</span> <span class="str">"upkeep-rb/upkeep"</span>
  - filename: "bin/rails"
    pill: "shell"
    code_html: |
      <span class="cmt"># bundle, install, migrate</span>
      bundle install
      bin/rails upkeep:install
      bin/rails db:migrate

      <span class="cmt"># then in any model you want reactive:</span>
      <span class="cmt">#   include Upkeep::Broadcastable</span>
ctas:
  - { variant: "primary", label: "→ get started", href: "#" }
  - { variant: "ghost", label: "read the guide", href: "#" }
  - { variant: "ghost", label: "see example apps", href: "#" }
cta_tagline_html: |
  building something with Upkeep? <a href="#" style="color: var(--orange-ink);">tell us →</a>
---
