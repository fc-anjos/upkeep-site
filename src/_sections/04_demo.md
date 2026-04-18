---
kind: demo
id: demo
order: 4
num: "§ 03"
title: "See it in a working board"
subtitle: "two browsers · one database"
lede_html: |
  Two independent sessions of the same kanban. Click any card in either pane, or use the controls, and watch updates ripple through in real time. Only the fragments that depend on the changed record re-render; everything else is untouched. This is the entire kanban app, built with plain ERB and one <code>include</code>.
panes:
  - pane: "A"
    addr: "app.example.com/board/1"
    tag_class: "a"
    tag_label: "session A"
  - pane: "B"
    addr: "app.example.com/board/1"
    tag_class: "b"
    tag_label: "session B"
controls:
  - act: "move-random"
    variant: "primary"
    label: "write · move random card"
  - act: "add"
    variant: "ghost"
    label: "insert card (session A)"
  - act: "rename"
    variant: "ghost"
    label: "update title"
  - act: "reset"
    variant: "ghost"
    label: "reset"
hint: "click a card to cycle its lane"
kv:
  - { label: "subscribers", id: "kv-subs", value: "2" }
  - { label: "writes", id: "kv-writes", value: "0" }
  - { label: "overlap checks", id: "kv-checks", value: "0" }
  - { label: "pushes sent", id: "kv-pushes", value: "0" }
  - { label: "no-op checks", id: "kv-noops", value: "0" }
---
