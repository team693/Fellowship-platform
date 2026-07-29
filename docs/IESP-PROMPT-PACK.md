# IESP Content Prompt Pack

Ready-to-paste prompts for authoring IESP learning content in an external Claude
Opus chat (GitHub Copilot Cowork, or claude.ai).

**How to use:** paste the Build Contract below at the top of your message, then one
prompt from the library underneath it. Fill in anything in `<ANGLE BRACKETS>`. Check
the output against that prompt's acceptance checks before using it.

54 prompts across 7 categories.

---

# THE IESP BUILD CONTRACT

You are producing content for **IESP — the Immersive Experience & Simulation
Program**, run by **Heal Social Foundation**, a Section 42 non-profit in Karachi,
Pakistan (SECP CUIN 0265422, NTN E445846). Partner: Ziauddin University (MOU).

Read this whole block before you produce anything. Everything below is a hard
constraint verified against the live codebase — it is not a style preference.

---

## 1. WHO THE LEARNER IS

Design for this specific person, not a generic student:

- A Pakistani undergraduate, mostly in Karachi (expanding to Sindh and Punjab).
- They have their own degree coursework. They realistically give **3–4 hours a week**.
- They are **mobile-first**, often on **mobile data**, frequently at night, sometimes
  during load-shedding. Data costs them money.
- Bilingual English/Urdu. English is their academic language but often not their
  first. Dense academic prose loses them. Concrete local detail holds them.
- They paid **PKR 2,000** of their own or their family's money. They can tell filler
  from real work and will resent the former.
- They are called **Solutions Builders**. They are analysts solving their city's
  problems — never tourists observing hardship.
- What motivates them: something real to show an employer, a verifiable credential,
  and genuinely not being bored.

## 2. THE PROGRAMME SHAPE (fixed for cohort 1)

Four weeks total.

- **Week 1 — Compulsory Core.** Everyone does it. Three short modules: AI literacy,
  professional ethics, and Karachi as a living lab. Each must fit **30–40 minutes**
  and must be hands-on. Week 1 is where cohorts lose people.
- **Weeks 2–4 — Topics.** The learner completes **any 3 of the 4 topics**, roughly
  one per week, chosen freely.
- **Capstone.** The week-4 topic's deliverable, taken deeper, published to a
  portfolio gallery.

**The 4 Topics:**

| Topic | Existing simulation |
|---|---|
| Water & Environment | `karachi-water-intelligence.html` |
| Public Health | `health-research-platform.html` |
| Urban Safety | `karachi-safety-observatory.html` |
| Economic Opportunity | `rozgar-karachi-2041.html` |

**The 4 Lenses** (learner picks one at onboarding; it reframes ethics and case
framing, not the whole curriculum): Health · Computer Science / Data ·
Design & Marketing · Entrepreneurial / Finance.

Completion earns an **Impact Certification**, publicly verifiable at `/verify/<id>`
with a QR code.

## 3. HOW CONTENT PLUGS IN — EXACTLY TWO WAYS

### (A) Standalone HTML simulation

A single self-contained `.html` file dropped into `public/simulations/`.

- Filename must match `^[a-zA-Z0-9._-]+\.html$` — lowercase, hyphens, no spaces.
- It runs inside `<iframe sandbox="allow-scripts">` **with no `allow-same-origin`.**
  This is absolute and has consequences that break most generated code:
  - **`localStorage`, `sessionStorage`, cookies, and IndexedDB all throw.** Never
    touch them. Keep state in a plain in-memory JS variable for the session only.
  - No access to `window.parent.document`, no `document.domain`.
  - No credentialed `fetch()` to any API. **Treat the file as fully offline.**
- The server injects these globals into `<head>` before your scripts run:
  ```js
  window.__HEAL_MODULE_ID__          // string
  window.healComplete(score, meta)   // score: number 0–100; meta: optional object
  window.healProgress(percent)       // percent: number 0–100
  ```
  Call `healComplete(...)` **exactly once**, when the learner genuinely finishes.
  Do not define these yourself — they already exist. Just call them.
- **Libraries — this list is exhaustive.** The server rewrites these to self-hosted
  copies, so they work offline:
  - Google Fonts (any `fonts.googleapis.com` / `fonts.gstatic.com` URL)
  - **D3** from cdnjs, jsDelivr, unpkg, or d3js.org
  - **Three.js** from cdnjs, jsDelivr, or unpkg

  Anything else — Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie, Google
  Analytics, any external image host — is **not** rewritten and will silently fail
  to load. Write vanilla JS and CSS, or use D3/Three. No exceptions.
- **No external images.** Use inline SVG or CSS. Data URIs are allowed but keep
  them small.
- Must work at **360px width**, be fully keyboard reachable, and never depend on
  hover to convey information or enable an action.

### (B) Native graded activity — JSON, not HTML

Pasted into the admin panel. Graded on the server; answer keys are stripped before
anything reaches the browser. Use this schema **exactly**:

```json
{
  "intro": "string",
  "pass_score": 70,
  "questions": [
    {"id":"q1","type":"mcq","prompt":"...","options":["a","b","c"],"answer":1},
    {"id":"q2","type":"multi","prompt":"...","options":["a","b","c","d"],"answers":[0,2,3]},
    {"id":"q3","type":"matching","prompt":"...","left":["A","B"],"right":["X","Y"],"pairs":{"0":1,"1":0}},
    {"id":"q4","type":"order","prompt":"...","items":["a","b","c"],"correctOrder":[1,0,2]},
    {"id":"q5","type":"numeric","prompt":"...","answer":20,"tolerance":0,"unit":"people"},
    {"id":"q6","type":"essay","prompt":"...","minWords":60}
  ]
}
```

Field names are literal — `answer` (singular) for `mcq`, `answers` (plural) for
`multi`, `pairs` keyed by **string** indices. Optional `"points"` per question
(default 1).

**Essay questions are not auto-scored.** They are stored for human review and only
checked against `minWords`. There is no staff capacity to grade sprawling free
writing for 30+ learners — strongly favour objective question types plus **one**
tightly-scoped essay with an explicit rubric.

### (C) Completion rules

- `engagement` — counts as done after a minimum dwell time. The HTML needs no
  awareness of the platform at all.
- `reported` — the HTML must call `window.healComplete(score)`, and a `pass_score`
  applies.

## 4. BRAND

**Fonts** (all via Google Fonts, auto-rewritten): `Bricolage Grotesque` for headings
and display, `Inter` or `IBM Plex Sans` for body, `IBM Plex Mono` for data and code,
`Noto Nastaliq Urdu` for Urdu (requires `dir="rtl" lang="ur"` and `line-height: 2.1`).

**Colours:**

```
teal    #0f8b80  (primary)     teal-50  #e8f7f5     teal-700 #0b5953
mint    #45c887                mint-100 #d6f7e3
coral   #fb5f3d  (alerts)      coral-500 #ef4423
blue    #3163fb
gold    #e6a92f                gold-50  #fdf9ed
ink     #0b1f1d   ink-soft #33413f   ink-muted #5c6b69
surface #ffffff   subtle   #f6faf9   muted     #eef4f3

gradient: linear-gradient(135deg, #0f8b80 0%, #45c887 45%, #3163fb 100%)
```

Border radius: `0.9rem` / `1.25rem` / `1.75rem`.
Card shadow: `0 1px 2px rgba(11,31,29,0.04), 0 8px 24px rgba(11,31,29,0.06)`.

## 5. NON-NEGOTIABLES

1. **Never fabricate a statistic.** This is educational content for paying students
   about their own city. Use only figures attributable to a named source (WHO,
   UNICEF, PCRWR, KWSC, PBS, Sindh Bureau of Statistics, WWF-Pakistan, published
   journal articles), and state the source and year inline. Where you do not know a
   real figure, insert a visible `[VERIFY: what to check, and where]` marker instead
   of inventing a plausible-looking number. Realistic-but-invented data is the worst
   possible failure here — it destroys credibility with university partners and
   misleads students about their own city.
2. **Karachi specifics must be real and respectful.** Real areas (Orangi, Lyari,
   Korangi, Malir, Gadap, DHA, Saddar), real institutions (KWSC, KMC, Sindh Solid
   Waste Management Board, PPHI, Indus Hospital, Aga Khan, Ziauddin), real dynamics
   (the tanker economy, katchi abadis, informal settlements). Never poverty-porn.
   Communities have agency and expertise; frame them that way.
3. **Mobile-first and offline-safe.** Works at 360px. Tap targets ≥ 44px. No
   hover-only interactions. Keep page weight modest.
4. **Time-honest.** State the intended completion time and actually design to fit it.
5. **Accessible.** Semantic HTML, real `<label>`s, visible focus states, sufficient
   contrast, and never colour alone to carry meaning.
6. **Self-check before returning.** Every output must be checked against the
   checklist at the end of the prompt.

---

*Paste this block at the top of any IESP content prompt, then paste the specific
prompt underneath it.*


---

# The Prompt Library

## Contents

**Week 1 compulsory core**

- [Orientation — "Your Next 4 Weeks" welcome artifact (5 min, first thing after onboarding)](#orientation-welcome)
- [Week 1 Core A · AI literacy — "Source or Slop" hands-on simulation (35 min)](#ai-literacy-source-or-slop)
- [Week 1 Core B · Professional ethics — branching field-decision sim, one build per lens (35 min)](#ethics-branching-sim-by-lens)
- [Week 1 Core C · Karachi as a Living Lab — guided real-dataset tour (40 min, D3)](#living-lab-guided-dataset-tour)
- [Source the real dataset behind the Living Lab (run this BEFORE the tour prompt)](#living-lab-dataset-sourcing-brief)
- [Week 1 knowledge check — native graded activity JSON (build once per core module)](#week1-knowledge-check-activity)
- [Week 1 configuration sheet, learner-facing copy, and the essay rubric bank](#week1-config-copy-and-rubrics)
- [Stress-test any Week 1 artifact against a real Karachi learner before shipping](#week1-dropoff-audit)

**Research-based case study readings**

- [The topic case brief — researched reading as a standalone HTML file](#topic-case-brief)
- [Source dossier and citation ledger — run this BEFORE writing any case](#source-dossier-first)
- [The phone-skimmable reading shell — reusable template plus retrofit pass](#phone-skim-shell)
- [Lens adapter — the same case, four disciplines, one evidence base](#lens-case-adapter)
- [The structured response instrument — activity JSON with one capped memo](#decision-response-json)
- [Grading pack — rubric, anchor answers, and a 25-minute pass for 30 learners](#grading-rubric-pack)
- [Capstone case — the week 4 deep brief and its portfolio deliverable](#capstone-case-deep)
- [Red-team audit — adversarial pass on a drafted case before it ships](#case-red-team-audit)

**Interactive HTML artifacts and games**

- [Allocation Sandbox (Builder) — spend a constrained budget, watch 5 years](#allocation-sandbox-builder)
- [Branching Case Simulation — five scenes, sticky consequences, a counterfactual epilogue](#branching-case-simulation)
- [Consequence Engine — a transparent stock-and-flow model with a feedback loop you can see](#consequence-engine)
- [Data Detective — interrogate a labelled synthetic dataset and commit a hypothesis before the reveal](#data-detective)
- [MCQ-with-Consequences — a night shift of ten calls, no gold stars, damage persists](#mcq-with-consequences)
- [Ethics Dilemma Station — commit a position, face three rebuttals, name your falsifier](#ethics-dilemma-station)
- [Consequence Ledger — the receipt: what you chose, who paid, what you didn't see coming](#consequence-ledger)
- [Week 1 Core Micro-Sim — three checkpointed acts against the drop-off cliff](#week1-core-microsim)

**Ethics dilemma engine, keyed by lens**

- [Dilemma Bank - eight Karachi ethics dilemmas for ONE lens (JSON)](#dilemma-bank-by-lens)
- [Delayed Consequence Weaver - write or repair the second-order layer](#delayed-consequence-weaver)
- [Lens Crosswalk - turn one dilemma into four genuinely different ones](#lens-crosswalk-antiwash)
- [Week 1 core ethics engine - the interactive simulation (HTML)](#week1-core-ethics-sim)
- [Topic micro-dilemmas that feed the ledger (graded activity JSON)](#topic-microdilemma-activity)
- [The Consequence Ledger - closing reflection simulation (HTML)](#consequence-ledger-closing)
- [Ethics essay review kit - 90-second rubric, feedback bank, plain-language pass](#ethics-review-rubric)

**Assessment, rubrics and grading leverage**

- [Build a server-graded activity JSON for a topic module](#topic-activity-json-builder)
- [Audit an existing activity spec for guessable answers and broken JSON](#activity-spec-auditor)
- [Write a rubric a non-expert can apply in under 3 minutes](#three-minute-rubric)
- [Design a written-response template that is fast to grade](#structured-response-template)
- [Build the AI first-pass grading prompt the team reruns every week](#ai-first-pass-grader)
- [Zero-grading checkpoints for the three compulsory Week 1 core modules](#week1-core-checkpoint-bank)
- [Peer review as a triage signal, not a grade](#peer-review-protocol)
- [The two-hour grading run: 30 submissions, feedback out in 72 hours](#grading-batch-runbook)

**Capstone, portfolio and credential**

- [The capstone brief (one per topic)](#capstone-brief)
- [Capstone Workbench simulation (offline draft scaffolder + pitch timer)](#capstone-workbench-sim)
- [Capstone submission activity JSON (objective gate + memo)](#capstone-submission-activity)
- [Capstone rubric + volunteer reviewer calibration kit](#capstone-rubric-reviewer-kit)
- [Portfolio gallery entry format + learner writing guide](#portfolio-gallery-entry)
- [2-minute video pitch: script skeleton + recording guide for a nervous first-timer](#video-pitch-kit)
- [LinkedIn share pack: post copy, certification entry, and honesty rules](#linkedin-share-pack)
- [Explaining the credential to an employer (and to an admissions reader)](#employer-credential-explainer)

**Learner experience, accessibility, ops and recruitment**

- [Bilingual pass — where Urdu genuinely helps, and where it is tokenism](#bilingual-urdu-pass)
- [Low-bandwidth and mobile audit — will this actually load on a Redmi on mobile data?](#low-bandwidth-audit)
- [The cold-open test — can a confused learner self-serve at 11pm with nobody to ask?](#cold-open-test)
- [Recruitment pack — university society outreach, flyer, and honest launch posts](#recruitment-collateral)
- [Trial cohort runbook — running the first 8–12 learners without a team](#trial-runbook)
- [Feedback instrument for a small trial, plus the 3-month outcome survey](#feedback-and-outcomes)
- [Consent, refund policy and safeguarding copy for a paying youth audience](#consent-and-safeguarding)


---

## Week 1 compulsory core

> What a learner actually feels: they finish onboarding, land on a 5-minute orientation that tells them the honest deal (4 weeks, 3-4 hrs/wk, PKR 2,000 already paid, no stipend, here is the certificate you get) and lets them tap out a personal weekly plan they screenshot. Then the first "real" thing they touch is not a lecture — it is Source or Slop, where within 90 seconds they are tapping a fabricated sentence in an AI answer about their own city and getting told they were right. That is the anti-drop-off move: hands on a thing, feedback, small win, before any theory. Ethics is a branching field sim where consequences arrive one screen late, so choices feel real rather than moralised. The Living Lab is the flagship — a guided tour of one small real district-level table where the whole 40 minutes builds to the count-vs-rate trap (Karachi Central looks worst because more people live there), which is the single highest-leverage data idea a first-year can carry into weeks 2-4.

Structural choices worth flagging. (1) Prompt 6 runs BEFORE prompt 4 by design — the tour cannot be honest unless a real, sourced dataset block exists first, and since the generating model cannot browse reliably, prompt 6 outputs a checking worksheet (exact publication, exact table) rather than pretending to know. This is the main defence against realistic-but-invented data. (2) One parameterised activity-JSON prompt serves all three core modules instead of three near-identical prompts, and it enforces exactly one essay with a scan-gradeable three-line structure — 30 learners x 3 modules of free essays would bury a team with no graders. (3) Prompt 8 is the founder's QA arm: a non-technical person cannot read HTML, so the audit prompt makes the model enumerate every numeral in the file and say where it came from, which catches fabrication mechanically rather than by taste.

Verified against the codebase, not assumed: essay questions gate passing (`passed = score >= pass_score && essayOk`), so a short essay fails the module no matter how good the objective score — the activity prompt warns about this explicitly. `matching.pairs` keys are strings. `numeric.tolerance` defaults to 0. The Google Fonts link is rewritten server-side to a self-hosted bundle containing only weights 400-800 and NO italic files, so italics render as fake synthesised slant — the HTML prompts forbid italics-for-meaning. Google Fonts, D3 and Three.js are the only rewritten CDNs.

Deliberately excluded: any Chart.js/Tailwind/GSAP suggestion (would silently fail offline); localStorage-based "save your work" (throws in the sandbox — the orientation uses screenshot-as-save instead); hover tooltips as the only path to data (mobile-fatal, and the Living Lab prompt requires a parallel visible table); anything resembling poverty tourism — every scenario casts the learner as an analyst with a decision to make, not a visitor observing hardship; and stipend/job-placement language, since the program is paid and legally disclosed.


<a id="orientation-welcome"></a>
### Orientation — "Your Next 4 Weeks" welcome artifact (5 min, first thing after onboarding)

**When to use:** The very first screen a Solutions Builder sees after picking their lens at onboarding, before any core module.  
**Produces:** Standalone HTML simulation file (public/simulations/iesp-orientation.html), completion rule = engagement, min_seconds 180

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build me one file: `iesp-orientation.html`. This is the FIRST thing a Solutions Builder sees after finishing onboarding. It is not a lesson. It is a warm, honest, 5-minute orientation that answers "what did I just sign up for, and can I actually do it?" — and it must leave them wanting to start.

**Format: five full-screen cards, one idea each, advanced by a big bottom button.** Progress dots at top. Vertical scroll inside a card is fine; the card itself must fit a 360px-wide phone without horizontal scroll.

**Card 1 — Welcome.** Direct and human, no corporate warmth-speak. Name the program: the Immersive Experience & Simulation Program by Heal Social Foundation, in partnership with Ziauddin University. Tell them they are called a Solutions Builder and that this means they produce work, not attendance. Maximum 70 words. Include ONE short line of encouragement in Urdu using Noto Nastaliq Urdu with `dir="rtl" lang="ur"` and `line-height: 2.1` — something like a welcome and "let's begin", checked for natural Urdu, not machine-translated English.

**Card 2 — The map.** A simple vertical timeline drawn in inline SVG or pure CSS (no images): Week 1 = three short core modules everyone does (AI literacy, professional ethics, Karachi as a living lab). Weeks 2-4 = you choose any 3 of the 4 Topics — Water & Environment, Public Health, Urban Safety, Economic Opportunity — roughly one per week. Your week-4 Topic becomes your Capstone, which goes to a public portfolio gallery. Make it unmistakable that the Topic choice is theirs and that they do 3 of 4, not all 4.

**Card 3 — The honest time deal.** State plainly: about 3 to 4 hours per week for 4 weeks. Each core module is 30-40 minutes. Then the reassurance that actually matters to this learner: your progress is saved per module, so finishing one module in a sitting is the safe unit of work — if your connection drops mid-module, redo that module, not the week. Advise 30-minute chunks. Do not promise anything about offline mode.

**Card 4 — What you get, stated without inflation.** An Impact Certification, publicly verifiable at a `/verify/<id>` link with a QR code that anyone — an employer, a scholarship committee — can check. A capstone piece in the public portfolio gallery. Say explicitly and without embarrassment: this is a paid program, PKR 2,000 one-time, already paid; there is no stipend and no guaranteed job. Understating here builds more trust than overselling.

**Card 5 — Plan my week (the interactive bit).** Let them tap to choose 2 or 3 days of the week and one time band (morning / afternoon / after Isha / late night). Then render a plain, clean, screenshot-friendly plan card: their chosen slots, the four weeks laid against them, and one line — "Screenshot this. There is no save button here." This is deliberate: **do not attempt to store anything.** localStorage, sessionStorage and cookies all throw in this sandbox. Hold the choices in a plain JavaScript variable only.

**Technical constraints most likely to trip you up on THIS file:** no storage of any kind; no external images at all (inline SVG or CSS only); call `window.healProgress(percent)` each time the card changes and `window.healComplete(100)` once on the final card; buttons must be real `<button>` elements, minimum 44px tall, reachable by keyboard with a visible focus ring. The Google Fonts link you write is swapped server-side for a self-hosted bundle that contains weights 400-800 and **no italic files at all** — never use italics to carry meaning, it will render as a fake slant.

**Facts:** the only figures you may state are the ones given here (4 weeks, 3-4 hrs/week, 3 of 4 Topics, PKR 2,000, 30-40 min modules). If you feel the urge to add a cohort size, a start date, a placement rate, an alumni count or a partner list — do not. Write `[VERIFY: cohort start date — confirm with Heal team]` instead.

**Before you return the file, self-check and state your findings:**
1. Does every card fit 360px with no horizontal scroll?
2. Zero uses of localStorage / sessionStorage / cookies / fetch?
3. Zero external images and zero libraries other than Google Fonts?
4. Every interactive element a real button/input, 44px+, keyboard reachable, visible focus?
5. No italics used for meaning anywhere?
6. Is the Urdu line correct, natural, and RTL with line-height 2.1?
7. Read it aloud: does it sound like a person talking to a 20-year-old in Karachi, or like a brochure? If brochure, rewrite it.
8. Total word count under 450 across all five cards — a 5-minute artifact cannot be longer.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Open it on your phone: every card fits, nothing scrolls sideways, buttons are thumb-sized
- [ ] Card 4 says out loud that there is no stipend and the price is PKR 2,000 — if that sentence is missing or softened, send it back
- [ ] No number appears anywhere that you did not supply — any invented cohort size or placement stat is an instant reject
- [ ] The plan card on Card 5 renders and looks good in a screenshot, and nowhere claims to have saved anything
- [ ] Read all five cards aloud in under two minutes. If you run long, it is too wordy for a 5-minute artifact


<a id="ai-literacy-source-or-slop"></a>
### Week 1 Core A · AI literacy — "Source or Slop" hands-on simulation (35 min)

**When to use:** The first real module after orientation — this is the anti-drop-off artifact and must be fun inside 90 seconds.  
**Produces:** Standalone HTML simulation (public/simulations/source-or-slop.html), completion rule = reported, pass_score 70

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build `source-or-slop.html`: a hands-on AI-literacy simulation for Pakistani undergraduates. **35 minutes.** The learner must be doing something with their thumb within 60 seconds of the page loading — no welcome essay, no learning objectives list. This module exists at the highest drop-off point in the whole program, so it opens with a puzzle, not a preamble.

**The fiction:** the learner is the AI reviewer at a small Karachi research team. Draft answers come in from an AI assistant and they must triage each one before it goes into a report that a real institution will read. Their job title on screen: "Reviewer".

**CRITICAL — there is no real AI here.** Do not call any API. `fetch()` is blocked in this sandbox and will fail silently. Every "AI response" is a hard-coded string in a JavaScript array that you write. Build the whole thing as a scripted transcript library.

**Round 1 — Spot the slop (about 6 min, this is the hook).** Show one short AI-written paragraph about a Karachi topic, split into 4-5 tappable sentences. The learner taps the sentence they do not trust. Instant feedback either way, with one line explaining the tell. Three paragraphs total. Design the tells to be genuinely different: (a) a suspiciously precise number with no source, (b) a confident claim about a very recent event, (c) a real institution credited with something outside its actual remit — for example an AI claiming KWSC publishes household-level water quality test results, when PCRWR is the body that publishes water quality monitoring. **Safety rule: the moment the learner answers, the screen must state plainly that the sentence was fabricated by the AI in this exercise.** Nobody may leave this module believing a false thing they read here.

**Round 2 — Prompt repair (about 8 min).** Give a weak prompt ("tell me about water problems in Karachi") and three rewrites. The learner picks one, then sees the canned output that rewrite produces, side by side with the weak prompt's output. Teach through contrast: the good rewrite names a place (Orangi Town, Lyari, Korangi, Malir), names an audience, asks for uncertainty to be flagged, and asks for sources. Two rounds of this.

**Round 3 — The confident citation (about 8 min).** The AI produces a polished sentence with a precise statistic and a citation. Give the learner a "source card" panel beside it showing what that organisation actually publishes. They must decide: supported / not in this source / cannot tell. The lesson is that a citation existing is not a citation checking out. Two rounds. Again, label the fabrication explicitly on reveal.

**Round 4 — Where AI belongs (about 6 min).** Six real tasks from this program (drafting an interview guide, summarising 12 survey responses, deciding which neighbourhood a clinic goes in, translating a consent form to Urdu, cleaning a messy spreadsheet, writing the finding a donor will act on). Learner sorts each into: AI can draft this / AI must never decide this / AI drafts but a human must verify. Sorting must work by tapping a category button, **never by drag-and-drop** — drag is unreliable on cheap Android phones.

**Finish (about 5 min).** They pick three rules for their own AI use from a list of eight and get a clean "My AI Use Policy" card to screenshot. Then call `window.healComplete(score)` exactly once, score 0-100 from rounds 1, 3 and 4.

**Constraints most likely to trip you up on THIS file:** no `fetch` and no API of any kind; no storage (state lives in one plain JS variable); no drag-and-drop; no hover-only feedback since phones have no hover; every choice a real `<button>` at 44px+; call `healProgress()` between rounds and `healComplete(score)` once at the end.

**Fabrication discipline:** any figure presented as TRUE in this module needs a named source and year inline (WHO, UNICEF, PCRWR, KWSC, PBS, Sindh Bureau of Statistics, WWF-Pakistan, a named journal article). If you do not know a real figure, write `[VERIFY: what to check, where to look]` in the file rather than inventing one. Figures presented as the AI's FABRICATION are fine and are the point — they must simply be unmistakably labelled as fabricated on reveal, and must not put words in the mouth of a named real person.

**Before returning, self-check and report:**
1. Time yourself from page load to first tap — is it under 60 seconds of reading?
2. Zero `fetch`, zero storage, zero drag-and-drop, zero libraries beyond Google Fonts?
3. Is every fabricated example explicitly labelled as fabricated after the learner answers?
4. List every numeral in the file that is presented as true, and next to each write its source or its `[VERIFY:]` marker. Paste this list in your reply.
5. Does it work at 360px with 44px tap targets and visible keyboard focus?
6. Is `healComplete` called exactly once, with a number 0-100?
7. Estimate the real completion time by counting words plus interactions. If it exceeds 40 minutes, cut a round rather than rushing the learner.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Load it on a phone and start a stopwatch — you must be tapping something meaningful within a minute
- [ ] Search the file for the word 'fetch' — there must be zero results
- [ ] Every fake statistic in the exercise is labelled as fake on the answer screen, so no learner walks away misinformed
- [ ] The model's reply includes a list of every true-claimed number with its named source or a [VERIFY:] marker
- [ ] Nothing requires dragging; every sort and choice is a tap
- [ ] Round 4's six tasks sound like this program's actual work, not generic AI-ethics filler


<a id="ethics-branching-sim-by-lens"></a>
### Week 1 Core B · Professional ethics — branching field-decision sim, one build per lens (35 min)

**When to use:** Build this four times, once per lens, swapping <LENS> — it is the ethics core module and the lens is what makes it feel written for that learner.  
**Produces:** Standalone HTML simulation (public/simulations/field-ethics-<lens-slug>.html), completion rule = reported, pass_score 70

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build `field-ethics-<LENS-SLUG>.html` — a branching decision simulation on professional ethics in the field, **35 minutes**, written for a Solutions Builder whose chosen lens is **<LENS>** (one of: Health | Computer Science / Data | Design & Marketing | Entrepreneurial / Finance; slug one of: health | data | design | finance).

This must not feel like an ethics lecture. Pakistani undergraduates have sat through those. It is a story with consequences.

**Structure: six decision points in one continuous scenario.** The learner is on a two-week field assignment with a small research team doing household work in **<NEIGHBOURHOOD — pick one and stay in it: Orangi Town | Lyari | Korangi | Malir | Gadap>**. Establish the setting in under 80 words: who the team is, what they are collecting, who the community partner is (a Union Council office, a school, or a clinic operated by a real-type body such as PPHI Sindh or Indus Hospital & Health Network — describe the type honestly, do not claim a specific real organisation endorsed this program).

**The mechanic that makes it a simulation and not a quiz:** each decision offers 3 options with no cartoon villain — every option is something a decent, tired, deadline-pressed person would plausibly pick. The consequence of a decision is **not** revealed immediately. It surfaces one or two screens later as an event: a respondent stops answering, a supervisor asks a question, a WhatsApp message arrives, a number in the report will not reconcile. Track choices in a plain JS object and let them shape which events fire.

**The six decisions — four shared, two rewritten for <LENS>:**

Shared: (1) **Consent under pressure** — a woman agrees to the survey but her husband answers for her; the team needs 40 households by Thursday. (2) **The over-promise** — a respondent asks whether this survey will finally get her lane a water connection, and saying "maybe" gets you the interview. (3) **Data on a personal device** — the team laptop is dead and the only way to keep working is the learner's own phone, which is backed up to a personal cloud account. (4) **Attribution** — a community health worker gives the team the insight that reframes the whole finding; her name is not on anything.

Now the two lens-specific ones, choose the pair matching <LENS>:
- **Health**: a respondent discloses a symptom that needs a doctor and the learner is not one; and pressure to record a household as "screened" when the screening was partial.
- **Computer Science / Data**: a dataset stripped of names still identifies people because the block, household size and occupation together are unique; and a request to merge this survey with a second dataset that people consented to separately.
- **Design & Marketing**: choosing the photograph for the donor deck, where the most moving image is the least dignified; and a caption that implies the program achieved something the data does not support.
- **Entrepreneurial / Finance**: rounding an impact number upward because the grant renewal depends on it; and a budget line that pays a community facilitator less than promised because the transport cost overran.

**Debrief (last 8 minutes).** Replay their path. For each decision, name the principle involved in plain words — informed consent, do no harm, dignity in representation, data minimisation, honest reporting, credit where it is due — and show what the alternative choices would have caused. No scolding: a poor choice gets "here is what happened, here is the repair", because in real fieldwork the recoverable mistake is the normal case. End with them writing three commitments onto a card they screenshot, then call `window.healComplete(score)` once, scoring the six decisions.

**Tone rule, non-negotiable:** the learner is an analyst with a job to do among people who have their own agency and expertise. Never a visitor observing suffering. Residents in this story are shrewd, busy, and have been surveyed before by people who never came back — that scepticism is realistic and should appear.

**Constraints most likely to trip you up on THIS file:** branching state must live in a plain JS variable, never localStorage (it throws here); every choice a real `<button>`, 44px+, keyboard reachable with visible focus; no hover-dependent reveals; text at 360px must not require pinch-zoom, so body text 16px minimum. The self-hosted font bundle has no italic files — do not use italics for the narrative voice, use the mint or teal-50 background panels to separate story from instruction, and also mark the difference with a small visible label so colour is not the only signal.

**Facts:** this is a fictional scenario, which is allowed — but any real-world figure, law, or institutional practice you reference must carry a named source and year inline, or a `[VERIFY: ...]` marker. Do not invent Pakistani data protection law provisions; if you want to reference the legal frame, write `[VERIFY: current status of Pakistan's personal data protection legislation — check as at build date]`.

**Before returning, self-check and report:**
1. Is any option in any of the six decisions obviously the villain choice? If yes, rewrite it — all three must be defensible.
2. Do consequences arrive delayed rather than instantly? Name the screen each one fires on.
3. Zero storage, zero fetch, zero libraries beyond Google Fonts?
4. 360px clean, 44px targets, keyboard reachable, focus visible, no italics-for-meaning, no colour-only signals?
5. Re-read every mention of residents: is anyone rendered as a passive victim? Fix it.
6. Are the two lens-specific decisions genuinely specific to <LENS>, or generic ones with a word swapped?
7. Does it fit 35 minutes? Count words plus decisions and say your estimate.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Pick any decision point at random: could a reasonable, decent person choose each of the three options? If one is obviously evil, it is a quiz not a sim
- [ ] Consequences show up later in the story, not immediately after the click
- [ ] The two lens-specific decisions would make no sense in another lens — that is the test of whether the parameterisation is real
- [ ] No resident in the story is a prop; at least one pushes back on the team
- [ ] Zero references to specific Pakistani legal provisions unless marked [VERIFY:]
- [ ] Runs on a 360px phone with no pinch-zoom needed to read the story


<a id="living-lab-guided-dataset-tour"></a>
### Week 1 Core C · Karachi as a Living Lab — guided real-dataset tour (40 min, D3)

**When to use:** The flagship week-1 module — build it AFTER running the dataset sourcing prompt, and paste that prompt's output into this one.  
**Produces:** Standalone HTML simulation (public/simulations/karachi-living-lab.html), completion rule = reported, pass_score 70

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build `karachi-living-lab.html`: a guided, interactive tour that teaches a Pakistani undergraduate **how to read a real dataset about their own city**. **40 minutes.** This is the intellectual centre of Week 1 — everything in Weeks 2-4 assumes the learner can look at a table and not be fooled by it.

**Paste your dataset below this line before running the prompt. Use only these numbers. Do not add, extend, round, or interpolate a single value.**

```
<<< PASTE THE DATASET BLOCK FROM THE SOURCING BRIEF HERE — one row per Karachi district, a population denominator column, 3-5 indicator columns, every cell carrying source + year or a [VERIFY:] marker >>>
```

If any cell above is a `[VERIFY:]` marker, render it in the interface **as a visible verify chip**, not as a number and not as zero. A learner seeing "we don't know this yet, here's where to check" is being taught something true. Faking it destroys the module.

**Seven guided steps. One idea per step. The learner cannot skip ahead, but can go back.**

1. **What is a row?** Show one single district row, large, as a labelled card. Point at each cell: this is the unit of analysis, this is a district, not a person and not a household. Ask them to tap the cell that answers a given question. 3 min.
2. **Where did this come from?** Show the provenance: who collected it, in what year, from how many households, and by what method. Make the point that a survey is a sample of a place at a moment, not the place itself. 4 min.
3. **Read the whole table.** Now reveal all districts as a proper `<table>` with real `<th>` headers. Let them sort by tapping a column header. First real interaction with the shape of the data. 5 min.
4. **THE TRAP — count versus rate.** This is the payload of the entire module. Show a horizontal bar chart of the raw counts. One district tops it. Ask them to name the worst-affected district. Let them answer. Then reveal the population column and re-draw the same chart as a rate per 1,000 or per 100,000 — and watch the ranking rearrange. Make them sit with it: the first chart was not lying, it was answering a different question. Then give them a toggle between COUNT and RATE and two questions where the correct answer differs depending on which view is right for the question. 10 min.
5. **The empty cells.** Point at the missing or `[VERIFY:]` values. Teach the three reasons data goes missing — never collected, collected but suppressed for small numbers, collected but not published — and why deleting those rows quietly changes your answer. 5 min.
6. **What this dataset cannot tell you.** Concrete and local: a district-level table cannot tell you which lanes in Orangi get water on which days, cannot see the tanker economy at all if tankers were never a survey question, cannot distinguish a katchi abadi from a planned block inside the same district, and is silent on anyone the survey frame missed. Then the constructive turn: name what you would do to find out — walk the UC, ask the KWSC valve operator, read the OPP-RTI lane maps, sit at the hydrant for an hour. Karachi is the lab; the table is the map, not the ground. 7 min.
7. **Write the honest sentence.** Give them a guided sentence builder — dropdowns for indicator, district, comparison basis (count or rate), plus a required uncertainty clause and a required source-and-year clause. It assembles into one sentence they can screenshot. Score whether the sentence they built is defensible against the data shown. 6 min.

Then call `window.healComplete(score)` exactly once, scoring steps 1, 3, 4 and 7.

**Charting rules — read these carefully, they are where this file will fail.** Use D3 (allowed and self-hosted) or plain SVG. **Horizontal bar charts only** — district names must be readable at 360px, which vertical bars cannot do. **No tooltip-only information.** Hover does not exist on a phone; every value shown in a chart must also be present in a visible `<table>` on the same screen, and each bar must be a focusable element with an accessible label. Use teal `#0f8b80` for the count view and blue `#3163fb` for the rate view, and additionally label each view in text — colour alone must never be the signal. Do not animate the count-to-rate transition faster than 600ms, and let the learner re-trigger it.

**Other constraints for THIS file:** no storage; D3 only from cdnjs/jsdelivr/unpkg/d3js.org (Chart.js, Tailwind, Plotly and anime.js will simply fail to load); no external images; embed the dataset as a JS array literal in the file, never fetch it; numbers in `IBM Plex Mono`, headings in `Bricolage Grotesque`; no italics anywhere (there are no italic font files).

**Before returning, self-check and report:**
1. List every number that appears in the finished file and confirm each one traces to a cell in the pasted dataset. Any number you generated yourself must be removed. Paste this list.
2. Did any `[VERIFY:]` cell get silently turned into a number or a zero?
3. Does the count-to-rate reveal actually change the ranking with the real data given? If it does not, say so plainly rather than fudging the data — and tell the founder the dataset needs a different indicator.
4. Is every charted value also readable in a visible table?
5. 360px clean, 44px targets, keyboard reachable, focus visible, no colour-only meaning?
6. Zero fetch, zero storage, zero libraries besides D3 and Google Fonts?
7. Estimate real completion time step by step and total it. If over 45 minutes, compress step 2 or 5, never step 4.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Step 4 must actually work with your real data — if the ranking does not change between count and rate, the module has no punchline and you need a different indicator
- [ ] Every number in the file traces back to a cell you pasted in; the model's reply proves this with a list
- [ ] Any [VERIFY:] cell shows as a visible 'needs checking' chip, never as a number or a blank zero
- [ ] Turn hover off in your head: read the page on a phone and confirm you can still get every value, from a table
- [ ] District names are readable without rotating the phone (horizontal bars, not vertical)
- [ ] Step 6 names real Karachi specifics — tanker economy, katchi abadis, OPP-RTI lane maps — not generic 'data has limitations' filler


<a id="living-lab-dataset-sourcing-brief"></a>
### Source the real dataset behind the Living Lab (run this BEFORE the tour prompt)

**When to use:** First step of building the Living Lab module — produces the verified dataset block you paste into the tour prompt.  
**Produces:** Markdown provenance brief + a paste-ready DATASET BLOCK + a checking worksheet

#### Prompt

````text
Follow the IESP Build Contract pasted above.

I need the real dataset that a Week 1 module called "Karachi as a Living Lab" will teach students to read. **The whole value of that module is that the data is real.** One invented number and a university partner stops trusting us.

**Be honest about your own limits.** You may not be able to browse, and your memory of specific table values is not reliable. So your job here is NOT to produce numbers you are confident about. It is to produce (a) the correct dataset *structure*, (b) a specific, named, findable source for every column, and (c) a checking worksheet precise enough that a non-technical person in Karachi can open the right document and fill in the right cells in under an hour. Any value you are not certain of goes in as `[VERIFY: exactly what to check, in exactly which publication, at which table or page]`. **A brief that is 80% verify-markers and 100% honest is a success. A brief full of plausible numbers is a failure.**

**Required shape of the dataset:**
- **Rows:** one per district of Karachi Division. Note that Keamari was carved out of Karachi West — confirm the current district list and mark it `[VERIFY: current district list of Karachi Division and the date Keamari was notified]`.
- **Column 1:** district name.
- **Column 2:** a population denominator, from the Pakistan Bureau of Statistics 7th Population and Housing Census (2023). This column is mandatory — the module's central lesson is count versus rate and it collapses without a denominator.
- **Columns 3-6:** three to five indicators on ONE theme, chosen from the options below.
- **Every single cell** carries either `value (Source, Year)` or a `[VERIFY:]` marker. No bare numbers.

**Pick the theme that gives the strongest count-versus-rate reversal** — i.e. where the district with the biggest raw count is NOT the district with the worst rate. Candidate themes and the real bodies that publish on them:
- **Water and sanitation access** — PBS Census 2023 housing tables (source of drinking water, toilet type by district); PCRWR water quality monitoring reports for Karachi; KWSC operational data.
- **Child and maternal health** — Sindh MICS (Multiple Indicator Cluster Survey, Sindh, 2018-19, UNICEF-supported, district-disaggregated); PSLM district-level survey; Sindh Health Department / PPHI Sindh service statistics; EPI immunisation coverage.
- **Urban safety** — CPLC (Citizens-Police Liaison Committee) reported crime statistics for Karachi; Sindh Police published figures. Flag clearly that reported crime is not crime, and that reporting rates differ by area — this is itself a teaching point.
- **Solid waste and environment** — Sindh Solid Waste Management Board collection data; SEPA; WWF-Pakistan.
- **Work and income** — PBS Labour Force Survey; PSLM.

**Deliver five sections:**

1. **Theme recommendation** — which theme, and one paragraph on why it produces the best count-versus-rate reversal and is most findable in public documents.
2. **THE DATASET BLOCK** — a fenced code block, formatted as a clean markdown table, ready for me to paste straight into the tour prompt. Every cell sourced or `[VERIFY:]`.
3. **Provenance card** — for each column: publishing body, exact publication title, year, collection method (census / household survey / administrative record / police report), sample size if a survey, and the known caveat a student should be told.
4. **Checking worksheet** — a numbered list a person with a browser can work through. Each line: which document to open, where it is published (the organisation's site or a named report), which table or section to look at, and which cell of my block it fills. Be specific enough to actually follow; "search online" is useless.
5. **What this dataset cannot tell you** — six to eight concrete, Karachi-specific blind spots for the tour's step 6. Real ones: district averages hide the gap between DHA and a katchi abadi in the same district; a survey that never asked about water tankers cannot see the tanker economy; census enumeration in informal settlements has known undercount risk `[VERIFY: documented undercount concerns for Karachi in the 2023 census]`; reported crime reflects who trusts the police enough to report; administrative service data counts services delivered, not need.

**Also flag:** any indicator where the count-versus-rate reversal will NOT happen, so I do not build a 40-minute module around a punchline that does not land.

**Before returning, self-check and report:**
1. Count the cells in your dataset block. How many are hard numbers and how many are `[VERIFY:]`? State both numbers plainly.
2. For every hard number: are you genuinely confident, or is it a remembered approximation? Downgrade anything in the second category to `[VERIFY:]`. Be ruthless — this is the whole point.
3. Does every column name a real publishing body and a real publication title?
4. Is the population denominator column present?
5. Is the checking worksheet followable by someone who is not a researcher?
6. Have you stated whether the count-versus-rate reversal actually holds for your chosen indicators?
````

#### Check the output

- [ ] A high ratio of [VERIFY:] markers to hard numbers is GOOD here — if the model returned a full table of confident numbers, be suspicious and make it re-run the honesty self-check
- [ ] Every column names a real organisation and a real publication, not 'government data'
- [ ] The population denominator column exists — without it the whole tour breaks
- [ ] You can personally follow the checking worksheet: open the named document, find the named table, fill the cell
- [ ] The model states plainly whether the count-vs-rate reversal holds for the indicators it picked


<a id="week1-knowledge-check-activity"></a>
### Week 1 knowledge check — native graded activity JSON (build once per core module)

**When to use:** After each core module's simulation exists, to add the graded checkpoint — swap <MODULE> to run it three times.  
**Produces:** Activity JSON spec, pasted into the admin panel

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce a **native graded activity JSON spec** — not HTML — for the Week 1 core module **<MODULE: AI literacy | Professional ethics | Karachi as a living lab>**. It is the checkpoint after the simulation, and should take a learner **8-10 minutes**.

Return one valid JSON object and nothing else outside the code fence. Match this schema exactly:

```json
{
  "intro": "Short, warm, one or two sentences. Say how long this takes and that it checks understanding, not memory.",
  "pass_score": 70,
  "questions": [
    {"id":"q1","type":"mcq","prompt":"...","options":["a","b","c","d"],"answer":1},
    {"id":"q2","type":"multi","prompt":"...","options":["a","b","c","d"],"answers":[0,2]},
    {"id":"q3","type":"matching","prompt":"...","left":["a","b"],"right":["x","y"],"pairs":{"0":1,"1":0}},
    {"id":"q4","type":"order","prompt":"...","items":["first","second","third"],"correctOrder":[0,1,2]},
    {"id":"q5","type":"numeric","prompt":"...","answer":20,"tolerance":1,"unit":"per 1,000"},
    {"id":"q6","type":"essay","prompt":"...","minWords":90}
  ]
}
```

**Schema rules that will bite you if you get them wrong:**
- `matching.pairs` keys are **strings** (`"0"`, `"1"`), values are integers — left index to right index.
- `order.correctOrder` is a list of **item indices in the correct sequence**, not positions.
- `numeric.tolerance` defaults to **0** if omitted. Any answer a learner derives by dividing must have a real tolerance, or correct work gets marked wrong on a rounding difference.
- `points` is optional, default 1. Weight the two hardest objective questions at 2.
- Essays are **not auto-scored** — they are stored for a human and checked only against `minWords`. **And this matters: a learner who skips the essay or writes under `minWords` FAILS the activity no matter how well they did on everything else.** So `minWords` must be genuinely achievable — 80 to 110 words, never 200.

**Composition — exactly nine questions:** 8 objective plus exactly ONE essay. We have no grading staff; sprawling free writing across 30 learners and three modules is unmanageable. Use a spread of types: at least 2 mcq, 1 multi, 1 matching, 1 order, and 1 numeric. Not eight mcqs.

**Make the questions applied, not recall.** A good question gives a short concrete situation and asks what follows from it. A bad question asks what a term means. Draw the situations from the <MODULE> simulation and from real Karachi:
- *AI literacy*: an AI output with a precise number and a citation to an organisation that does not publish that thing; two prompts to compare; sorting a task by whether AI may decide it.
- *Professional ethics*: a consent moment where a third party answers for the respondent; a dataset that re-identifies people through combined fields; an impact number a donor wants rounded up.
- *Karachi as a living lab*: **the numeric question must be a count-to-rate conversion** — give a raw count and a population and ask for the rate per 1,000 or 100,000, with a sensible tolerance. Also include an mcq where the district with the highest count is not the district with the highest rate.

**The one essay — make it scan-gradeable in 60 seconds.** Scope it tightly, and put the rubric and the required structure inside the `prompt` string itself, so the learner knows the target and the grader can check three specific things instead of reading an argument. Structure it like this: ask for exactly three labelled lines — `Claim:`, `Evidence and source:`, `What I still don't know:` — about one specific thing from the module. `minWords` 90. State in the prompt that unsourced numbers score zero and that "what I still don't know" being blank is itself a fail.

**Facts:** every real-world figure inside a question stem needs a named source and year in the stem itself (PBS Census 2023, Sindh MICS 2018-19, PCRWR, WHO, CPLC, WWF-Pakistan). Where you do not have a real figure, either build the question on a clearly hypothetical scenario labelled as such ("suppose a district records...") — which is fine for a numeric reasoning question — or write `[VERIFY: ...]` in the stem for me to fill. Never present an invented figure as a real Karachi statistic.

**Before returning, self-check and report:**
1. Is the JSON valid? Parse it mentally, key by key. No trailing commas, all strings double-quoted.
2. Are all `matching.pairs` keys strings?
3. Does every `answer` / `answers` / `pairs` / `correctOrder` index actually exist in its options/items array?
4. Does the numeric question have a tolerance greater than 0 if the learner has to divide?
5. Are `id` values unique?
6. Is there exactly one essay, with `minWords` between 80 and 110, and a rubric plus the three required labelled lines inside its prompt?
7. Are there 8 objective questions across at least 5 different types?
8. Does every real statistic in every stem carry a source and year, or a `[VERIFY:]` marker, or say "suppose"?
9. Time it: 8 objective questions plus a 90-word essay in 8-10 minutes. If it is longer, cut a question.
````

#### Check the output

- [ ] Paste it into the admin panel — if it does not save, the JSON is malformed and you send it straight back
- [ ] Exactly one essay question, minWords under 110 — remember a short essay fails the whole activity regardless of score
- [ ] The essay prompt contains its own rubric and asks for three labelled lines, so you can grade it in under a minute
- [ ] For the Living Lab version, the numeric question is a count-to-rate conversion with a real tolerance
- [ ] No question asks for a definition; every one gives a situation and asks what follows
- [ ] Every real Karachi statistic in a question stem names its source and year, or says 'suppose'


<a id="week1-config-copy-and-rubrics"></a>
### Week 1 configuration sheet, learner-facing copy, and the essay rubric bank

**When to use:** Once the three core modules exist, to wire them up in admin and write every word the learner reads around them.  
**Produces:** Markdown document: admin settings table, module copy, drop-off nudges, grading rubrics

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Week 1 of the IESP is the compulsory core: three short modules everyone does before choosing Topics. The simulations are built. I now need everything *around* them written and configured. Produce one markdown document with five sections.

**Section 1 — Admin configuration table.** One row per Week 1 module, with these columns: order, module title, `asset_path` filename, `completion_rule` (`engagement` or `reported`), `min_seconds` (for engagement modules only), `pass_score` (for reported modules only), and a one-line reason for that choice. My builds are:
1. `iesp-orientation.html` — orientation, ~5 min, not assessed
2. `source-or-slop.html` — AI literacy, ~35 min, calls `healComplete(score)`
3. `field-ethics-<lens>.html` — professional ethics, ~35 min, calls `healComplete(score)`
4. `karachi-living-lab.html` — Karachi as a living lab, ~40 min, calls `healComplete(score)`
5. Three knowledge-check activities (native JSON, one per core module)

For `min_seconds`, recommend a value that is roughly **half** the honest completion time, not the full time — it is an anti-skim floor, not a punishment, and a learner on load-shedding who reloads should not be trapped. Say this in the reason column. For `pass_score`, recommend a number and defend it: too high and a first-week learner who is fine gets blocked; too low and the certificate means nothing.

**Section 2 — Learner-facing copy for each of the three core modules.** For each: a title (5 words max, concrete, no colons and no "Introduction to"), a one-sentence description that says what they will *do* not what they will *learn*, an honest time estimate, and one line answering "why is this compulsory?" — because a paying learner who cannot see the point of week 1 leaves in week 1. Write at a reading level that works for a bright undergraduate whose English is academic but not first-language: short sentences, concrete nouns, no abstraction stacking. Avoid "leverage", "holistic", "unpack", "deep dive", "journey".

**Section 3 — The Week 1 promise block.** A short block of copy (under 100 words) shown at the top of Week 1 that sets the deal: three modules, about two hours total, all three compulsory, and then the Topics open up and you choose. Include one line in Urdu (Noto Nastaliq Urdu, `dir="rtl" lang="ur"`), natural rather than translated.

**Section 4 — Three drop-off nudges.** Short messages, SMS/WhatsApp length (under 320 characters each), for: (a) enrolled but has not opened the orientation after 48 hours, (b) finished the orientation but has not started a core module after 4 days, (c) two core modules done, one to go, Topics not yet unlocked. Rules: no guilt, no "we noticed you haven't...", name the specific next thing and how long it takes, and mention the concrete payoff (Topics unlock / certificate progress). Write each in English with a short natural Urdu variant.

**Section 5 — The essay rubric bank (this is the one that saves my team).** Each core module's knowledge check has exactly one essay, asking for three labelled lines: `Claim:`, `Evidence and source:`, `What I still don't know:`. Give me, per module, a **five-line grading rubric** that lets one person grade 30 submissions in under an hour. Format it as a 3-point scale with an unmistakable observable test per level — e.g. "Evidence line: 2 = names a specific source and year; 1 = names a source but no year or wrong body; 0 = a number with no source, or no number". Add a short list of the three most common failure patterns to expect from first-week students and a one-line canned feedback response for each, so graders paste rather than compose.

**Facts:** the only program numbers you may state are the ones given (4 weeks, 3-4 hrs/week, 3 of 4 Topics, PKR 2,000, no stipend, module times above). Anything else — cohort size, start dates, partner specifics beyond the Ziauddin University MOU — write as `[VERIFY: ...]`.

**Before returning, self-check and report:**
1. Does every recommended `min_seconds` sit at roughly half the honest module time, with the anti-skim reasoning stated?
2. Does every module description say what the learner DOES, using an active verb?
3. Is any module title longer than 5 words, or does any start with "Introduction to"?
4. Are all nudges under 320 characters, guilt-free, and specific about the next action and its length?
5. Is each rubric level an observable test a tired grader can apply in 5 seconds, rather than a judgement call?
6. Are all Urdu lines natural Urdu rather than word-for-word translations of the English?
7. Any invented program facts? Replace with `[VERIFY:]`.
````

#### Check the output

- [ ] The config table is complete enough that you can type it straight into the admin panel without deciding anything yourself
- [ ] min_seconds is about half each module's real length, with the reasoning stated — a learner who reloads after load-shedding must not be punished
- [ ] Every rubric level is an observable test, not a judgement call: hand it to someone who did not design the module and see if they grade the same way
- [ ] The three nudges contain no guilt and name a specific next action with its length
- [ ] Read the Urdu lines aloud, or have a native speaker do it — translated-English Urdu is worse than no Urdu


<a id="week1-dropoff-audit"></a>
### Stress-test any Week 1 artifact against a real Karachi learner before shipping

**When to use:** Run on every generated HTML file before you drop it into public/simulations — this is your QA pass when you cannot read the code yourself.  
**Produces:** Markdown audit report plus a corrected full replacement file

#### Prompt

````text
Follow the IESP Build Contract pasted above.

I am not a developer. I have an HTML file generated for Week 1 of the IESP and I cannot personally tell whether it will work on a PKR-15,000 Android phone in Karachi, or whether it quietly invented statistics. **Audit it hard, then fix it.** Assume it is broken until proved otherwise, and do not be polite — a soft audit costs us paying students.

**The file:**

```html
<<< PASTE THE FULL HTML FILE HERE >>>
```

**Intended module:** <MODULE NAME>. **Intended completion time:** <MINUTES> minutes. **Intended completion rule:** <engagement | reported>.

Produce these eight sections, in order.

**1. First-ten-minutes verdict.** Walk the file as a learner would. How many seconds of reading before their first meaningful interaction? What is the first moment of genuine interest? Would a 20-year-old with their own coursework, on mobile data, still be here at minute 10? Answer yes or no and justify it. Week 1 is our highest drop-off point; a boring first screen is a defect, not a style note.

**2. Sandbox violations.** Quote the exact offending line for each. Check for: `localStorage`, `sessionStorage`, `document.cookie`, `indexedDB` (all throw in this iframe — no `allow-same-origin`); any `fetch` or `XMLHttpRequest`; `window.parent` or `document.domain` access; any `<script src>` or `<link href>` pointing anywhere other than Google Fonts, or D3/Three.js from cdnjs, jsdelivr, unpkg or d3js.org — Chart.js, Tailwind CDN, GSAP, anime.js, Lottie, React and any remote image host all fail silently offline; any `<img src="http...">`. Then confirm the completion contract: for `reported`, `window.healComplete(score)` must be called **exactly once** with a number 0-100 on genuine completion — flag it if it fires on page load, fires more than once, or is never called at all.

**3. Fabricated-number sweep.** This is the most important section. **Enumerate every numeral in the file that is presented as a real-world fact** — walk the text content systematically, do not sample. For each, produce a table row: the number, the sentence it sits in, whether a named source and year appear inline, and your verdict — SOURCED / UNSOURCED / SUSPICIOUS. Mark SUSPICIOUS anything that is real-world-shaped but conveniently round or suspiciously precise ("nearly 40% of households", "an estimated 2.3 million residents"). For every UNSOURCED or SUSPICIOUS entry, replace it in the fixed file with `[VERIFY: what to check, where to look]`. Do not substitute a different number you believe is correct. Ignore numbers that are obviously fictional scenario values or interface counters.

**4. Mobile pass at 360px.** Any fixed pixel width over 340px, any table or chart that will force horizontal scroll, body text under 16px, tap targets under 44px, anything requiring hover, anything requiring drag-and-drop, and any layout that breaks on a 640px-tall viewport. Note that the self-hosted font bundle contains **no italic files**, so flag any italics carrying meaning.

**5. Accessibility pass.** Semantic elements or a pile of clickable `<div>`s; real `<label>`s on inputs; visible focus styles; keyboard reachability of every interaction; contrast against the brand palette; and anywhere colour alone carries meaning without a text or shape backup.

**6. Karachi and tone pass.** Are neighbourhoods, institutions and dynamics real and correctly used — Orangi, Lyari, Korangi, Malir, Gadap, DHA, Saddar; KWSC, KMC, SSWMB, PPHI Sindh, Indus Hospital, Aga Khan, Ziauddin; tanker economy, katchi abadis, informal settlements? Flag any invented organisation, any misattributed remit, and any passage that frames residents as passive victims rather than people with agency. Also flag any Urdu that reads as machine-translated English, and check `dir="rtl" lang="ur"` with line-height around 2.1 on Urdu passages.

**7. Time honesty.** Count the words the learner must read and the interactions they must complete. Estimate real completion time for a non-native English reader at roughly 180 words per minute plus interaction time. Compare with the stated <MINUTES>. If it overruns by more than 20%, say exactly which section to cut.

**8. The fixed file.** Return the complete corrected HTML, ready to save. Not a diff, not excerpts — the whole file. Then a short changelog of what you changed and, separately, a list of anything you could NOT fix because it needs a human decision (a missing real statistic, a factual claim you cannot verify, a design call).

**Before returning, self-check:**
1. Did you enumerate every numeral in section 3, or did you sample? If you sampled, go back and do it properly.
2. Did you replace any unsourced number with your own guess instead of a `[VERIFY:]` marker? That is the worst possible outcome — undo it.
3. Is the fixed file complete and valid HTML, with the sandbox violations actually removed rather than just noted?
4. Does the fixed file still call `healComplete` exactly once, if the rule is `reported`?
5. Did you answer the first-ten-minutes question with a plain yes or no?
````

#### Check the output

- [ ] Section 3 lists every real-world number in the file, not a sample — count them yourself against the file if you are unsure
- [ ] No unsourced number was quietly replaced with a different number; every one became a [VERIFY:] marker
- [ ] Section 8 returns the whole corrected file, not a diff, and you can save it straight over the original
- [ ] The first-ten-minutes verdict is a plain yes or no with a reason, not a hedge
- [ ] Every sandbox violation names the exact offending line, so you can see the model actually read the file
- [ ] If the audit comes back clean on the first pass with no findings at all, be suspicious and re-run it — generated Week 1 files almost always break at least one mobile or sourcing rule


## Research-based case study readings

> A learner opens this on a phone between classes: a 90-word "60-second version" tells them what they must DECIDE before any evidence arrives; five short sections each end with "So what for your decision"; then levers they must choose between. The [VERIFY] gaps are shown to them openly, which reframes them from student-receiving-facts to analyst-working-with-incomplete-data. That tone shift is the most important thing in the pack.

Structural choices forced by the verified codebase: (1) Reading and response are always TWO modules — an `embed` HTML asset plus an `activity` JSON — because the sandbox has no storage, so a long unsaved form inside an iframe is cruel under load-shedding. Prompt 1 forbids forms in the reading. (2) Grading capacity is the binding constraint, and `gradeActivity` in src/lib/activity.ts has a quirk worth exploiting: essays contribute ZERO to `score` but gate passing via `passed = score >= pass_score && essayOk`, where essayOk is only a minWords check. So the objective questions must carry the entire pass decision and the single essay becomes a fixed-field memo with word caps. Prompt 5 bakes that in; prompt 6 turns it into a ~25-minute grading pass for 30 learners. (3) Lens adaptation is a separate HTML file per lens because `module_variants.asset_path` is a file swap, not runtime branching — so prompt 4 forbids touching the evidence base and permits swapping only role, vocabulary, and the 90-day metric. This keeps 4 lenses from becoming 4 unmaintainable cases.

Deliberately excluded: open-ended essay assignments; chart libraries (only D3/Three are rewritten, and a reading needs neither — inline SVG bars only); "discussion questions", which sound academic and generate ungradeable volume; PDF/print deliverables (mobile data cost); and any invented round number. Prompt 2 exists because the anti-fabrication rule cannot be enforced at writing time — it has to be enforced BEFORE writing, by building a citation ledger first. Prompt 8 exists because it must also be enforced AFTER writing, adversarially. Those two bracket the pack.


<a id="topic-case-brief"></a>
### The topic case brief — researched reading as a standalone HTML file

**When to use:** Building the main week 2-4 reading for any one of the four topics; this is the workhorse prompt of the pack.  
**Produces:** HTML simulation file (a reading, no form) for public/simulations/

#### Prompt

````text
Follow the IESP Build Contract pasted above.

BUILD one standalone HTML file named `case-<TOPIC-SLUG>-brief.html` (e.g. `case-water-orangi-brief.html`). It is the case-study READING for the IESP topic **<TOPIC>**. The graded response is a separate module, so this file must contain NO form, NO text input and NO submit button. Intended reading time: **18-22 minutes**. Design to actually fit that — roughly 1,400-1,800 words of body text, no more.

READER: a Pakistani undergraduate, mostly in Karachi, on a phone, on mobile data, fitting this between their own degree coursework. English is academic but often not their first language. They paid PKR 2,000 of their own money and will recognise filler instantly.

SCENARIO — use the row for <TOPIC>, delete the other three:

**Water & Environment.** You advise the chairman of a Union Council in Orangi Town. KWSC piped supply reaches the ward roughly two mornings a week at low pressure; the rest is bought from tanker operators, at a per-1,000-gallon price that climbs in summer. Lanes were sewered decades ago under the Orangi Pilot Project's self-help model; the secondary drains carrying them are silted. He has one financial year and a fixed ward budget. Levers: (1) desilt and reconnect the secondary drain to the trunk; (2) negotiate a metered bulk connection so the ward buys collectively; (3) fund household chlorination and storage-tank cleaning through Lady Health Workers; (4) fund monthly water testing and publish the results publicly. He cannot build K-IV, cannot license or close hydrants, cannot set the city tariff.

**Public Health.** You advise a district health officer covering Korangi and Landhi. PPHI basic health units plus Indus Hospital & Health Network and a Ziauddin outreach clinic are seeing a rising share of typhoid that does not respond to ceftriaxone. Levers: (1) a targeted typhoid conjugate vaccine catch-up round in named katchi abadis; (2) blood-culture-before-treatment plus antibiotic stewardship; (3) a water and sanitation fix in the two union councils with most cases; (4) a community health worker campaign on household water storage. Budget covers two. Deadline: before post-monsoon season.

**Urban Safety.** You advise a working group of Karachi Traffic Police, KMC and a hospital trauma registry on a 6 km stretch of one arterial — name it accurately (Shahrah-e-Faisal, University Road, or Korangi Road). Pedestrians are killed at night, disproportionately by heavy vehicles, most often crossing mid-block to reach a bus stop. Levers: (1) two signalised at-grade crossings with raised tables; (2) one pedestrian bridge; (3) relocating three bus stops so nobody crosses mid-block; (4) restricted heavy-vehicle hours plus night enforcement; (5) continuous median lighting. Money covers about two. Pre-hospital response is Edhi, Chhipa and Rescue 1122 Sindh, and response time is part of the survival story.

**Economic Opportunity.** You advise the board of a small Lyari youth organisation that just won a two-year grant and will be judged on an outcome metric it chooses itself. Options: (1) a 12-week freelancing and digital-services bootcamp with a laptop lending pool; (2) a home-based stitching cooperative registered under the Sindh Home-Based Workers Act 2018 with a buyer linkage into the Korangi/SITE garment chain; (3) rider onboarding plus a savings product for Bykea/inDrive/Careem workers; (4) a certified trade pipeline via NAVTTC or a Sindh TVET provider into industrial employers. The neighbourhood has been promised things before.

STRUCTURE, in this order:
1. `<h1>` naming the DECISION, not the topic. Not "Water in Karachi" — rather "Two mornings of water a week: what does the chairman fund first?"
2. **THE 60-SECOND VERSION** — a bordered box, max 90 words, four bullets: situation, decision, constraint, deadline. Someone who reads only this box can still hold a position.
3. **YOUR ROLE** — max 60 words, second person, stating what authority the learner has and explicitly what they do not.
4. **FIVE to SEVEN evidence sections**, each ≤180 words. Each `<h2>` is written as a claim, not a label. Each ends with a bold one-line `So what for your decision:`. At most one number card per section.
5. **THE LEVERS** — one stacked card each: what it does, what it costs as a share of the budget, who must agree, and the strongest objection to it. Every lever must be genuinely defensible; no obvious dud.
6. **WHAT WE DON'T KNOW** — 3 to 5 `[VERIFY: ...]` items presented to the learner as live open questions. Frame this as how real analysis works, not as an apology.
7. **YOUR TASK** — restate the decision, say the response is in the next module. No form here.
8. **SOURCES** — numbered list: organisation, document title, year, and where the learner would find it. Every inline citation is an anchor link to its number.

EVIDENCE RULES. Every number carries an inline `(Publisher, Year)` naming a real publisher — PCRWR, KWSC, PBS, Sindh Bureau of Statistics, WHO, UNICEF, NIH Pakistan, CPLC, WWF-Pakistan, a named journal article. If you do not know a real figure, DO NOT produce a plausible one: write `[VERIFY: what to check, where to look]` in visible text. Cost figures internal to the scenario must be labelled "this case's assumed budget" so they are never mistaken for published data. Name real institutions and neighbourhoods only. Frame residents as people with strategies and constraints, never as objects of pity.

SANDBOX — the three most likely mistakes for THIS artifact: (a) do not use localStorage or sessionStorage to remember reading position; they throw here and will kill the page — hold any state in a plain variable; (b) no external images, icon fonts, Tailwind CDN or Chart.js — they silently fail; use inline SVG and hand-written CSS, Google Fonts links are fine; (c) do not call `window.healComplete()` — this module completes on dwell time. You may call `window.healProgress(pct)` on scroll, wrapped in `if (typeof window.healProgress === 'function')`.

MOBILE AND ACCESS: single column at 360px, nothing horizontally scrollable, body text ≥17px, line length capped ~68 characters, tap targets ≥44px, no hover-only behaviour, `<details>` for optional depth, semantic `<section>`/`<h2>`, visible focus rings, and never colour alone to signal meaning. Put an honest "~20 min read" near the title and a per-section minute estimate.

SELF-CHECK before returning. Confirm each: (1) every number has a real publisher and year, or is a visible [VERIFY]; (2) I invented zero statistics; (3) no localStorage/sessionStorage/fetch anywhere in the file; (4) no external image, icon font or non-D3 CDN; (5) no form, input or submit element; (6) body text is 1,400-1,800 words; (7) every evidence section ends with a bold "So what for your decision"; (8) each lever has a real objection; (9) the file renders correctly at 360px with no horizontal scroll; (10) every neighbourhood and institution named is real and correctly described.
````

#### Check the output

- [ ] Open it on your phone: can you read the whole thing without ever scrolling sideways?
- [ ] Search the file for a digit — pick three at random. Does each one have a publisher name and a year right beside it, or is it a visible [VERIFY]?
- [ ] Read only the 60-second box. Could you argue a position from that alone?
- [ ] Search the file for 'localStorage', 'sessionStorage', 'fetch(' and 'Chart' — all four should return nothing.
- [ ] Pick the lever you think is the weak one. Is there still a real argument for it? If one lever is obviously a dud, the case has no decision in it.
- [ ] Time yourself reading it. If it takes 35 minutes, the word count is lying.


<a id="source-dossier-first"></a>
### Source dossier and citation ledger — run this BEFORE writing any case

**When to use:** Always, as step one for a new topic; this is what makes the anti-fabrication rule enforceable instead of aspirational.  
**Produces:** Markdown research dossier with a citation ledger and a ranked [VERIFY] list

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Do NOT write a case study yet. Produce a **source dossier** in Markdown that I will use as the factual spine of a case study on **<TOPIC>** in Karachi, with the working scenario: **<ONE-SENTENCE SCENARIO>**.

This exists because the failure mode I care most about is a confident, realistic-looking number that nobody published. So this dossier separates three things and never blurs them: what you actually know with a citation; what is widely repeated but you cannot pin to a source; and what nobody in this chat can know without going and looking.

Produce exactly these sections.

**1. THE CITATION LEDGER** — a Markdown table with columns: Claim | Figure | Publisher | Document and year | Confidence | How a student could check it. One row per usable fact, 12-20 rows. Confidence is exactly one of `HIGH` (you can name the specific publication), `MEDIUM` (you are confident of the institution and roughly the year but not the exact document) or `LOW`. Anything below HIGH must have its figure cell written as `[VERIFY: ...]` rather than a number. Do not pad the table to look thorough — a ledger of 12 solid rows beats 25 shaky ones.

Draw from real publishers relevant to <TOPIC>: PCRWR water quality monitoring reports, KWSC, Karachi Metropolitan Corporation, Sindh Solid Waste Management Board, Pakistan Bureau of Statistics (Labour Force Survey, census), Sindh Bureau of Statistics, National Nutrition Survey, Pakistan Demographic and Health Survey, WHO and UNICEF country data, the Citizens-Police Liaison Committee, Sindh Police, NDMA and PDMA Sindh, WWF-Pakistan, IUCN Pakistan, NAVTTC, Pakistan Software Export Board, State Bank of Pakistan, plus peer-reviewed work from Aga Khan University, the Indus Hospital & Health Network, IBA Karachi, NED University and the Urban Resource Centre. Name the actual body. "Studies show" is a fail.

**2. THE MYTH LIST** — 4 to 6 figures about Karachi and <TOPIC> that circulate in journalism, LinkedIn posts and NGO decks but that you cannot trace to a primary source. For each: the claim as usually stated, why it spreads, and what the honest version is. This is teaching material in its own right and I may quote it directly to students.

**3. THE INSTITUTIONAL MAP** — who actually holds each decision in this scenario. Distinguish clearly between the federal government, the Sindh provincial government, KMC, the district and town administration, the union council, a utility or authority, and the informal actors who really shape outcomes (tanker operators, contractors, transporters, informal landlords, biradari and neighbourhood associations). State plainly which of these the case's protagonist can instruct, which they can only negotiate with, and which they cannot touch. A case where the protagonist has powers they do not really have is worse than no case.

**4. THE HUMAN TEXTURE LIST** — 8 to 12 concrete, verifiable, non-statistical details that make the setting real: what a specific street looks like at 6am, how a tanker booking is actually placed, what a BHU waiting room is like, how a home-based worker gets paid and how often. Anything you are not confident about, mark `[VERIFY: ...]`. No poverty-porn, no dramatised suffering — these are texture details about people managing their lives competently under constraint.

**5. THE RANKED VERIFY QUEUE** — every `[VERIFY]` you generated, ordered by how much the case's argument depends on it. For each: exactly what to look for, which named body publishes it, and roughly how long it would take a student volunteer to find. Top 5 are what I chase before publishing; the rest can ship as visible open questions inside the reading.

**6. THREE CANDIDATE DECISIONS** — three different decision points this evidence could genuinely support, each stated as a question with 3-5 real options. Say which one has the sharpest disagreement between defensible answers, and why. A case with an obviously correct answer is a lecture wearing a costume.

TONE: write to me as a research collaborator, not a student. If the evidence for <TOPIC> in Karachi is genuinely thin, say so up front and tell me the case will lean on institutional structure rather than statistics. That is a legitimate design; pretending otherwise is not.

SELF-CHECK before returning: (1) every HIGH row names a specific publication, not just an organisation; (2) no figure appears anywhere outside the ledger; (3) every non-HIGH claim is written as [VERIFY], never as a number; (4) the institutional map states who CANNOT act, not only who can; (5) the myth list contains at least four items and I have not quietly recycled any of them as facts elsewhere in the dossier; (6) I have not invented a single document title, report name or author.
````

#### Check the output

- [ ] Every HIGH-confidence row names an actual document, not just 'PBS' or 'WHO' — if you cannot picture the report, downgrade it.
- [ ] Google two of the HIGH rows. If a title does not exist, the whole ledger is suspect and you restart.
- [ ] The myth list should make you slightly uncomfortable — it should contain a number you have used yourself.
- [ ] The institutional map must say what the protagonist CANNOT do. If it only lists powers, send it back.
- [ ] No bare numbers should appear outside the ledger table.


<a id="phone-skim-shell"></a>
### The phone-skimmable reading shell — reusable template plus retrofit pass

**When to use:** Once, to build the house style for all readings; then again to fix any reading that arrived as a wall of text.  
**Produces:** HTML template file plus a short authoring rulebook

#### Prompt

````text
Follow the IESP Build Contract pasted above.

BUILD `reading-shell.html` — a reusable, dependency-free reading template that every IESP case-study brief will be poured into, plus a short authoring rulebook underneath it. Fill it with clearly-marked placeholder copy (`<!-- SECTION 1 -->`, "Lorem-style placeholder — replace") so I can see the pattern working before real content exists.

THE PROBLEM IT SOLVES. Our reader is on a phone, often on mobile data, often standing up, often interrupted. A wall of academic English loses them in the first screen, and week one drop-off is our biggest risk. Skimmability is not decoration here — it is the retention mechanism. But the reading must still reward the person who reads every word, because they paid for it.

BUILD THESE PATTERNS, all in one file, all vanilla:

1. **Honest time header.** Title, a one-line "~N min read" and a plain-language "what you'll decide at the end". Per-section minute estimates in each `<h2>`, styled small and muted.
2. **The 60-second box.** Top of page, visually distinct, max 90 words. Explicitly labelled "If you read nothing else". This is the single highest-value pattern; make it look deliberate, not like a callout afterthought.
3. **One idea per screen.** Section max 180 words. A `<h2>` written as a claim, body, then a bold "So what:" line. Generous section spacing so a thumb-scroll lands cleanly between ideas.
4. **Number cards.** A standalone block for one figure: big number in 'IBM Plex Mono', a plain-English label, and a small source line "PCRWR, 2023" or a visible `[VERIFY: ...]`. Never more than one per section. The source line is part of the component and cannot be omitted.
5. **Sticky progress rail.** A 3px bar at the top reflecting scroll depth, plus a small "3 of 7" section counter. Update it with a scroll listener throttled by `requestAnimationFrame`. Also call `window.healProgress(pct)` guarded by `if (typeof window.healProgress === 'function')`.
6. **Jump-to-section chips.** A horizontally scrollable row of section links directly under the 60-second box. Real `<a href="#id">` anchors so they work with the keyboard and without JS. Add `scroll-margin-top` so headings are not hidden behind the sticky rail.
7. **Optional depth.** Native `<details><summary>` for methodology and caveats, so the curious can open it and nobody else pays the scroll cost. Style the summary as an obvious tappable row ≥44px, with a caret that rotates via CSS only.
8. **Urdu key-terms strip.** 6-10 domain terms with a short Urdu gloss, in 'Noto Nastaliq Urdu' with `lang="ur" dir="rtl"` and `line-height: 2.1`. This is a comprehension aid for a bilingual reader, not decoration — put it near the top, before the terms are needed. Use plain, commonly spoken Urdu, not literary register.
9. **Tables that survive 360px.** Show a real 4-column table that, under a `@media (max-width: 520px)` rule, restacks into one card per row with `<span>` labels. No horizontal scrolling tables.
10. **A quote/testimony block** for a sourced first-person line, with attribution and year.

SANDBOX, the three that will bite here: (a) never persist scroll position in localStorage or sessionStorage — they throw in this iframe and will break everything below the throw; keep it in a variable; (b) no icon fonts, no external SVG files, no CDN CSS — inline the SVG carets and write the CSS by hand; Google Fonts links are safe; (c) do not call `healComplete()` in the shell — completion is dwell-based.

CONSTRAINTS: total file under 60KB before content. Fonts 'Bricolage Grotesque' for headings, 'Inter' for body, 'IBM Plex Mono' for figures. Respect `prefers-reduced-motion`. All interactive elements keyboard-reachable with a visible focus ring. Contrast at least 4.5:1 for body text — check the muted greys specifically, that is where this usually fails.

THEN, below the code, write **THE AUTHORING RULEBOOK**: at most 400 words, numbered, in plain language for a non-technical writer. Cover the hard caps (90 words for the box, 180 per section, one number card per section), the "claim not label" heading rule, the "So what" rule, when a paragraph should become a `<details>`, and a three-line worked before/after showing one dense academic paragraph rewritten into a claim heading plus 40 words plus a So-what line.

SELF-CHECK: (1) file works with JavaScript entirely disabled — anchors, details and the table all still function; (2) no storage API appears anywhere; (3) nothing scrolls horizontally at 360px except the deliberate chip row; (4) every number card has a source or [VERIFY] line; (5) Urdu block has lang, dir and line-height set; (6) all tap targets ≥44px; (7) rulebook is under 400 words and contains a real before/after.
````

#### Check the output

- [ ] Turn JavaScript off in your phone browser. Section jumps, the details blocks and the table must still all work.
- [ ] Shrink the browser to 360px. Only the chip row should scroll sideways — nothing else.
- [ ] Ask someone who reads Urdu daily whether the glosses sound like speech or like a dictionary.
- [ ] Try to delete the source line from a number card. If the component still looks finished without it, the component is wrong.
- [ ] Read the rulebook out loud to a non-technical writer. If they cannot apply it immediately, it is too long.


<a id="lens-case-adapter"></a>
### Lens adapter — the same case, four disciplines, one evidence base

**When to use:** After a topic brief is finished and verified, to produce the four lens variants without forking the research.  
**Produces:** HTML variant file for one lens, plus a swap sheet documenting exactly what changed

#### Prompt

````text
Follow the IESP Build Contract pasted above.

I am pasting below a finished IESP case brief. Produce a **lens variant** of it for the **<LENS>** lens, where <LENS> is exactly one of: `Health` / `Computer Science / Data` / `Design & Marketing` / `Entrepreneurial / Finance`. Output a complete standalone HTML file named `case-<TOPIC-SLUG>-brief-<LENS-SLUG>.html`, plus a short swap sheet.

HOW OUR PLATFORM USES THIS. A lens variant is a whole separate HTML file that the platform swaps in for learners who picked that lens. There is no runtime branching and no shared include — so the variant must be complete on its own, and any correction to the shared evidence has to be applied to all files. That is exactly why the rules below are strict about what you may touch.

WHAT YOU MUST NOT CHANGE — treat these as frozen:
- Every statistic, every citation, every `(Publisher, Year)` string, every `[VERIFY: ...]` marker. Character for character.
- The core decision and the set of levers. All four lenses argue about the SAME choice, or peer discussion collapses.
- The budget, the deadline, the institutional constraints and who holds which power.
- The overall section order and the word budgets.
If you believe a fact is wrong, do not silently fix it — flag it at the end of the swap sheet instead.

WHAT YOU SHOULD CHANGE, and only this:
1. **The role framing (YOUR ROLE, ~60 words).** Same decision, different seat at the table. Health: you are the clinical or public-health voice the protagonist consults. CS/Data: you are the person asked "what would you need to measure to know?" and you own instrumentation, data quality and its limits. Design & Marketing: you own whether the intervention is understood, trusted and actually used by residents. Entrepreneurial/Finance: you own unit economics, cost per outcome, and whether it survives after the grant ends.
2. **The lens paragraph inside two or three of the evidence sections.** Add or rewrite one short passage — 40-70 words — that reads the SAME evidence through this discipline. Health reads a coliform figure as exposure and case burden. CS/Data reads it as sampling frequency, spatial coverage and what the sampling design cannot see. Design reads it as a risk-communication problem — what does a household actually do differently on Tuesday morning. Finance reads it as avoided cost and willingness to pay. Do not add new facts to do this; interpret the ones present.
3. **Vocabulary and analogies.** Health may say incidence, catchment, referral pathway. CS/Data may say baseline, confounder, data pipeline, ground truth. Design may say journey, message-testing, adoption barrier. Finance may say cost per beneficiary, payback period, recurring cost. Use terms this lens would genuinely use in practice, not sprinkled buzzwords.
4. **The 90-day measurement suggestion**, so each lens proposes something it could actually be accountable for.
5. **One added `<details>` block, max 80 words**, titled for the lens ("If you're coming from a data background") pointing at one real skill or public dataset they could bring. Optional depth only.
6. **The `<title>` and `<h1>` subtitle**, so a learner can see the variant is meant for them.

HARD LIMIT: total added or changed body text must stay under 320 words. This is a reframing, not a rewrite. A 40% longer variant means you rewrote the case, and I will reject it.

SANDBOX: keep every existing `[VERIFY]`, `healProgress` guard and inline SVG intact; introduce no storage calls, no fetch, no new external asset of any kind.

TONE: do not flatter the lens. A Design & Marketing learner is not "the creative one" — they are the person who decides whether a chlorination campaign is understood by a household that has heard four campaigns already. Give each lens real analytical work.

THEN produce **THE SWAP SHEET**: a Markdown table of every change — Location | Original | Replacement | Why this lens. Plus a final line stating the total word delta, and a `FLAGS:` line listing anything in the source case you believe is factually questionable but did not touch.

SELF-CHECK: (1) I can diff this against the original and every number, citation and [VERIFY] is byte-identical; (2) the decision and levers are unchanged; (3) word delta is under 320 and I have stated the actual figure; (4) I added no new statistic anywhere; (5) the vocabulary would pass with a practitioner in this field; (6) the swap sheet lists every single change, with no silent edits.

--- PASTE THE FINISHED CASE BRIEF HTML BELOW THIS LINE ---

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Diff the variant against the original. Every number, citation and [VERIFY] must be untouched — any drift here means four files that disagree about reality.
- [ ] Check the stated word delta against reality. If it says 300 and it is 900, it rewrote the case.
- [ ] Read the four role paragraphs side by side. Do all four still argue about the same decision?
- [ ] Show the Design variant to a designer and the Finance variant to an accountant. Ask if the vocabulary sounds like their field or like a stereotype of it.
- [ ] Confirm the swap sheet lists every change — silent edits are how the four files drift apart over a cohort.


<a id="decision-response-json"></a>
### The structured response instrument — activity JSON with one capped memo

**When to use:** Immediately after a case brief is finished, to build the graded module that sits next to it.  
**Produces:** Activity JSON spec ready to paste into the admin panel

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce a native activity JSON spec — NOT HTML — for the graded response to the IESP case brief on **<TOPIC>**, which I am pasting at the bottom. Return one JSON object and nothing else outside a short note. Intended completion time: **12-15 minutes** after reading the brief.

ONE PLATFORM DETAIL THAT DRIVES THE ENTIRE DESIGN. Essay questions are stored for human review and checked ONLY against `minWords` — they contribute nothing to the score. The score comes purely from the objective questions, and a learner passes only if `score >= pass_score` AND every essay clears its minimum word count. So the objective questions must be strong enough to be the whole pass decision on their own, and the essay must be short, structured and gradeable by a human in about 45 seconds.

SCHEMA — match this shape exactly:

```json
{
  "intro": "You have read the Orangi water brief. Now make the call and defend it.",
  "pass_score": 70,
  "questions": [
    {"id":"call","type":"mcq","prompt":"Which lever do you fund first?","options":["Desilt the secondary drain","Metered bulk connection","Household chlorination via LHWs"],"answer":1,"points":2},
    {"id":"powers","type":"multi","prompt":"Which of these can the UC chairman decide without provincial approval?","options":["Ward tariff","Hydrant licensing","Lane repair schedule","K-IV construction"],"answers":[2],"points":2},
    {"id":"who","type":"matching","prompt":"Match each figure to the body that publishes it.","left":["Tap-sample coliform counts","Labour force participation"],"right":["Pakistan Bureau of Statistics","PCRWR"],"pairs":{"0":1,"1":0}},
    {"id":"seq","type":"order","prompt":"Order these steps as the brief describes them.","items":["Publish the result","Take the sample","Agree the sampling points"],"correctOrder":[2,1,0]},
    {"id":"budget","type":"numeric","prompt":"Using the case's assumed budget table: 4 lanes at PKR 180,000 each. Total?","answer":720000,"tolerance":0,"unit":"PKR"},
    {"id":"memo","type":"essay","prompt":"...","minWords":90}
  ]
}
```

BUILD, in this order:

**A. `intro`** — max 40 words. Restate the decision. Do not re-teach the brief.

**B. Seven to nine objective questions, 10-14 total points.** Required coverage:
- Exactly ONE `mcq` called `call`, worth 2 points, where the learner commits to a lever. Here is the honest problem: there is no single right answer, so do not fake one. Instead phrase it so the mcq tests a defensible *reading* of the constraint — for example "Which lever is the only one that produces evidence the chairman can show at the next budget cycle?" Every option must be a real lever from the brief.
- One `multi` on **who holds which power** — the most common student error is assuming the protagonist can do things they cannot.
- One `matching` pairing figures or claims to the **body that publishes them**. This drills source literacy, which is the habit the whole pack exists to build.
- One `order` on a real process sequence from the brief. Note that order is scored positionally with partial credit, so keep it to 3-4 items.
- One or two `numeric` questions requiring actual arithmetic over figures stated in the brief. If a figure is the case's own assumed budget, say so in the prompt wording. Never build a numeric question on an unsourced real-world statistic.
- One `mcq` or `multi` on a **`[VERIFY]` item** — ask which open question would most change the decision if resolved. This tells learners that noticing missing evidence is a graded skill.
- Every distractor must be plausible to someone who skimmed and wrong to someone who read. No joke options.

**C. Exactly ONE essay, id `memo`, `minWords: 90`.** Its prompt must specify four labelled fields with word caps, and say the whole memo must be 90-160 words:
```
DECISION: one sentence naming the lever you would fund first.
EVIDENCE (max 40 words): two specific figures or lines from the brief, each with the source named in the brief.
RISK (max 40 words): the strongest argument against your own choice, stated fairly.
90-DAY TEST (max 40 words): one indicator, who publishes it, and the number that would tell you it worked.
No introduction. No conclusion. Labels on their own lines.
```
State in the prompt that the memo is read by a human and that copying sentences from the brief without a source scores zero on EVIDENCE.

**D. `pass_score`: 70.** Then, in a note under the JSON, tell me what a learner scores if they miss the two hardest questions — so I can sanity-check that 70 is achievable but not automatic.

SELF-CHECK: (1) valid JSON, parses clean, no trailing commas, no comments; (2) every question id is unique; (3) mcq has `answer`, multi has `answers`, matching has `pairs` with string keys, order has `correctOrder`, numeric has `answer` and `tolerance`; (4) exactly one essay; (5) no answer key is hinted in any prompt or option; (6) every numeric answer is arithmetic I can verify by hand from the brief; (7) 10-14 objective points total; (8) every fact referenced appears in the brief with the same source attribution; (9) essay prompt states the word caps and the four labels; (10) I invented no statistic anywhere.

--- PASTE THE CASE BRIEF BELOW THIS LINE ---
````

#### Check the output

- [ ] Paste the JSON into a validator. It must parse with zero errors before it goes near the admin panel.
- [ ] Do every numeric question by hand from the brief. If you cannot reach the answer, learners cannot either.
- [ ] Check that exactly one question has type 'essay'. Two essays doubles your grading load per learner per module.
- [ ] Read the distractors. If any is obviously silly, the question tests nothing.
- [ ] Add up the points and confirm a learner who misses the two hardest questions still lands near but below 70 — that is where the gate belongs.
- [ ] Confirm no question can be answered correctly without opening the brief.


<a id="grading-rubric-pack"></a>
### Grading pack — rubric, anchor answers, and a 25-minute pass for 30 learners

**When to use:** Before the first cohort submits anything, so the memos do not pile up ungraded.  
**Produces:** Markdown grading pack: rubric, four anchor answers, feedback bank, workflow

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce a **grading pack** in Markdown for the human-reviewed memo attached to the IESP case study on **<TOPIC>**. The memo has four labelled fields — DECISION, EVIDENCE (≤40 words), RISK (≤40 words), 90-DAY TEST (≤40 words) — totalling 90-160 words. I am pasting the case brief and the memo prompt below.

THE CONSTRAINT THIS PACK EXISTS TO SOLVE. Around 30 learners per cohort, several graded modules each, and no dedicated grading staff. The objective questions are already auto-scored server-side; the memo is the only thing a human touches. Target: **45 seconds per memo, 25 minutes for a cohort of 30**, and consistent enough that two different graders land in the same band. Everything below is judged against that.

Produce exactly these five parts.

**1. THE RUBRIC.** Four rows, one per field, four columns: `Strong (2)` / `Adequate (1)` / `Weak (0)` / `What to look for in 10 seconds`. That last column is the load-bearing one — it must be a physically fast visual check, e.g. "Does EVIDENCE contain two publisher names? If not, it cannot be Strong." Total 8 points. State the pass threshold and say explicitly what happens at the boundary. Key judgements to encode: choosing a different lever than we might is NEVER penalised; what is penalised is a lever the brief shows the protagonist has no power over. RISK must be a real argument against their own choice — restating their choice in negative form is Weak. 90-DAY TEST must name who publishes the indicator, because an unmeasurable indicator is the most common failure.

**2. FOUR ANCHOR ANSWERS.** Write four complete example memos for this specific case, one at each level: `8/8`, `6/8`, `4/8`, `2/8`. Write them the way real Pakistani undergraduates write — slightly formal English, occasional non-native constructions, some genuinely good thinking expressed awkwardly. Do not write the weak ones as stupid; write them as rushed, or as someone who skimmed the brief, or as someone with a good instinct and no evidence habit. Under each, three bullets: the score per field, the one sentence a grader would say, and the specific line that decided the band. These anchors are what keep two graders aligned, so make the boundary between 6 and 4 unmistakable.

**3. THE FEEDBACK BANK.** Twelve to fifteen reusable comments, each ≤25 words, each naming the fix rather than the flaw. "Name the publisher next to each figure — that turns an assertion into evidence" beats "unsupported". Group them under the four field headings plus a fifth group for excellent work, because strong learners deserve a real sentence too, and generic praise is the fastest way to lose your best ones. Include two comments for the specific case of a well-argued position we disagree with — a grader must have language for "this is good and I would have chosen differently".

**4. THE 25-MINUTE WORKFLOW.** A numbered procedure: sort submissions, do a calibration set of 3 against the anchors before scoring anything, then a single pass at 45 seconds each, then a second look only at the boundary cases and anything flagged. State the stopping rule — what a grader does when they have spent 3 minutes on one memo. Include a plain-text scoring line they can paste per learner, e.g. `D2 E1 R2 T1 = 6/8 — see comment F3, F9`.

**5. THE INTEGRITY NOTE.** Three or four short paragraphs, written to be read aloud to a cohort, on AI-assisted writing. Our learners study AI literacy in week one, so a ban is incoherent. Take this position: using AI to draft is fine, submitting a memo whose EVIDENCE field cites figures that are not in the brief is not, because that is fabrication and it is the exact failure mode this programme teaches against. Give graders two concrete tells: figures that do not appear in the brief, and a 90-DAY TEST naming an indicator no Pakistani body publishes. Prescribe the response — return it once for correction rather than punishing it. Be direct and non-preachy; assume good faith.

SELF-CHECK: (1) every rubric cell is checkable in under 10 seconds and I have not written a cell requiring re-reading the brief; (2) the four anchors are genuinely different in quality and sound like real students, not caricatures; (3) no rubric row rewards agreeing with a particular lever; (4) every feedback comment is ≤25 words and names an action; (5) the workflow arithmetic actually totals under 30 minutes for 30 learners; (6) every figure I quote inside an anchor answer really appears in the pasted brief with the same source.

--- PASTE THE CASE BRIEF AND THE MEMO PROMPT BELOW THIS LINE ---

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] Grade the four anchors yourself against the rubric, cold. If you do not reproduce the stated scores, the rubric is ambiguous.
- [ ] Time yourself on the 6/8 anchor. Over 45 seconds means the rubric is too heavy for one person and a cohort of 30.
- [ ] Confirm a learner can pick a lever you disagree with and still score 8/8. If not, you built an answer key, not a rubric.
- [ ] Read the weak anchors — do they sound like a real rushed 20-year-old, or like a strawman?
- [ ] Check that every figure quoted inside an anchor answer actually appears in the brief.


<a id="capstone-case-deep"></a>
### Capstone case — the week 4 deep brief and its portfolio deliverable

**When to use:** Building the final week of any topic, where the output goes to the public portfolio gallery.  
**Produces:** HTML deep-brief reading plus a deliverable specification and public-gallery rubric

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build the **capstone** for the IESP topic **<TOPIC>**: one standalone HTML file `capstone-<TOPIC-SLUG>-brief.html`, plus a deliverable specification written into the same page. This is week 4. The learner's output goes to a **public portfolio gallery** attached to their verifiable Impact Certification, so it must be something they would genuinely send to an employer. Budget the learner **3-4 hours total** across the week, including writing. Reading time for this brief: **25-30 minutes**.

HOW IT DIFFERS FROM A WEEK 2-3 CASE — make all four differences real, not cosmetic:
1. **Contested evidence.** The week 2-3 cases hand over a coherent evidence base. This one contains at least two places where credible sources disagree, or where a figure is measured differently by two bodies. Present both and do not resolve it — the learner has to decide which to act on and say why.
2. **A stakeholder they must lose.** Any real decision here disadvantages somebody with legitimate standing: tanker operators whose livelihood the fix removes, transporters facing restricted hours, a contractor mid-contract, informal workers displaced by formalisation. Name them, state their interest fairly and non-cynically, and require the learner to address them explicitly. This is the single biggest maturity jump from week 2.
3. **A second-order consequence.** Include one plausible way the obvious fix makes something else worse. The learner must acknowledge it.
4. **Sequencing, not just selection.** They must order actions over 18 months and justify what goes first, given that money and political capital arrive unevenly.

BRIEF STRUCTURE: keep the phone-first shell — a 60-second box, claim-style `<h2>`s, one number card per section, a bold "So what for your decision" line, `<details>` for depth, honest per-section timings. Then add three capstone-only sections: **WHERE THE EVIDENCE DISAGREES** (a restacking two-column comparison, both sides sourced); **WHO LOSES** (one card per affected group: their interest, their leverage, what would make this survivable for them); **THE 18-MONTH FRAME** (what money and permission realistically arrive when).

EVIDENCE RULES: unchanged and absolute. Every number carries `(Publisher, Year)` naming a real body — PCRWR, KWSC, PBS, Sindh Bureau of Statistics, CPLC, WHO, UNICEF, NAVTTC, State Bank of Pakistan, a named journal article, a named university study. Anything you cannot attribute becomes a visible `[VERIFY: what to check, where to look]`. A capstone that reaches the public gallery on fabricated data is the worst possible outcome for a Section 42 non-profit with a university MOU, so hold this line harder here than anywhere else.

THE DELIVERABLE SPEC, written into the page as its own section. Specify a **decision memo of 700-900 words**, in fixed sections with word caps, that a stranger could read cold:
- `THE CALL` (≤60) — what you would do, in order.
- `WHY THIS AND NOT THE OBVIOUS ALTERNATIVE` (≤180) — name the alternative and beat it.
- `THE EVIDENCE I RELIED ON` (≤200) — three to five findings, each with publisher and year, and one sentence on why you trusted that source over the competing one.
- `WHO THIS COSTS AND WHAT I WOULD DO ABOUT IT` (≤150) — the named losing party, and something concrete.
- `WHAT COULD GO WRONG` (≤120) — the second-order consequence and your early-warning signal.
- `HOW I WOULD KNOW IN 6 MONTHS` (≤120) — one indicator, its publisher, its target number, and what you do if it is flat.
- `WHAT I STILL DON'T KNOW` (≤80) — their own `[VERIFY]` list. Explicitly say this section raises the grade rather than lowering it. That single instruction changes how honestly the whole memo is written.
State plainly that this is publicly visible under their name, and that they should be comfortable with an employer reading it.

SANDBOX: no localStorage or sessionStorage anywhere, no external images or icon fonts, no CDN beyond Google Fonts, and do not call `healComplete()` — dwell-based. Guard `healProgress` with a typeof check. Comparison tables must restack to single-column cards below 520px.

ALSO RETURN, below the HTML, a **gallery rubric**: 6 rows, 3 bands, each row checkable in under 20 seconds, weighted so that source discipline and honest treatment of the losing party outweigh writing polish.

SELF-CHECK: (1) the two disagreeing sources are both real and both cited, and I resolved neither; (2) the losing party is described with genuine sympathy and real leverage; (3) every number has a publisher and year or is a visible [VERIFY]; (4) the deliverable caps total 700-900 words and I have added them up; (5) the brief is honestly readable in 25-30 minutes; (6) no storage API, no external asset, no healComplete; (7) tables restack at 360px; (8) the WHAT I STILL DON'T KNOW section is explicitly rewarded; (9) nothing in this brief would embarrass Ziauddin University if a faculty member read it closely.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Find the two places where sources disagree. If you cannot, it is a week-2 case wearing a capstone label.
- [ ] Read the WHO LOSES cards aloud. Would a tanker operator or a transporter recognise themselves, or is it a cartoon villain?
- [ ] Add up the deliverable word caps — they must land between 700 and 900.
- [ ] Check that the memo's evidence section forces a publisher name per finding. That is the habit the whole programme sells.
- [ ] Imagine an employer opening this from a public gallery link. Does the deliverable format make the learner look like an analyst?
- [ ] Confirm every figure would survive a Ziauddin faculty member checking three of them at random.


<a id="case-red-team-audit"></a>
### Red-team audit — adversarial pass on a drafted case before it ships

**When to use:** On every case, right before publishing; nothing reaches a paying learner without going through this.  
**Produces:** Markdown audit report with severity-ranked findings and exact replacement text

#### Prompt

````text
Follow the IESP Build Contract pasted above.

You are auditing a drafted IESP case study before it is published to paying learners. Be adversarial. Your job is not to say it is good — it is to find what will embarrass us. Assume the draft was written by a capable model that was trying to be helpful, which means the most likely defect is a number that looks exactly right and is not real. I am pasting the case HTML (and its activity JSON, if it exists) below.

Run these seven passes in order and report each separately.

**PASS 1 — FABRICATION SWEEP. This is the one that matters most.** Extract EVERY number in the document into a table: Figure | Where it appears | Claimed source | Verdict. Verdict is exactly one of: `SOURCED` (a real publisher and year are named, and a document like that plausibly exists), `UNSOURCED` (a number with no attribution), `SUSPICIOUS` (attributed, but the figure looks rounded, too tidy, or too convenient — 40%, 2 million, "one in three"), or `FABRICATED` (you can tell nobody published this). For every non-SOURCED row, write the exact `[VERIFY: what to check, which body publishes it]` string that should replace it. Do not skip numbers inside `<details>`, inside SVG labels, inside the activity JSON, or inside a quotation. Numbers hidden in a chart label are the ones that survive review.

**PASS 2 — INSTITUTIONAL ACCURACY.** Check every named body and every claimed power. Is KWSC responsible for what the text says it is responsible for? Does a union council chairman actually control that budget line? Is the split between KMC, the district administration and the Sindh government right? Is Rescue 1122 Sindh described as it currently operates? Flag every place the protagonist is given authority they would not have — a case that misdescribes power teaches learners something false about their own city, which is worse than a wrong statistic.

**PASS 3 — DIGNITY AND TONE.** Read as a student from Orangi, Lyari or Korangi reading about their own neighbourhood in material they paid for. Flag: any sentence positioning residents as passive victims rather than people managing constraints competently; any borrowed-outrage phrasing; any implicit "expert arrives from outside" framing; any detail that is vivid mainly because it is grim. Also flag the opposite failure — sanitised language that dodges a real problem. Quote the offending sentence and write the replacement.

**PASS 4 — DECISION QUALITY.** Is there a genuine decision, or a correct answer in disguise? For each lever, write the strongest one-sentence case FOR it. If you cannot do that for one of them, that lever is a decoy and the case is a lecture. Also check that the constraint actually binds — if the budget quietly allows all the options, there is no decision.

**PASS 5 — TIME AND WEIGHT HONESTY.** Count body words and give a real reading estimate at roughly 180 words per minute for a non-native academic reader, plus time for the number cards. Compare with the stated time. Report the file size. Flag any data URI over 20KB and anything that would cost a learner meaningful mobile data.

**PASS 6 — SANDBOX AND TECHNICAL.** Search for and report every occurrence of: `localStorage`, `sessionStorage`, `document.cookie`, `indexedDB`, `fetch(`, `XMLHttpRequest`, `window.parent`, `document.domain`. All are fatal here — the iframe has no same-origin access and these throw, killing every script that follows. Then list every external URL and flag anything that is not fonts.googleapis.com, fonts.gstatic.com, or a D3/Three.js URL on cdnjs, jsdelivr, unpkg or d3js.org — everything else silently fails to load. Confirm whether `healComplete` is called and whether that matches the module's completion rule.

**PASS 7 — MOBILE AND ACCESSIBILITY.** Anything that would scroll horizontally at 360px; tap targets under 44px; hover-only interactions; missing focus styles; heading levels that skip; meaning carried by colour alone; body text under 17px; contrast failures — check the muted greys against white specifically, that is where these drafts fail. If an Urdu block exists, confirm `lang="ur"`, `dir="rtl"` and line-height near 2.1.

OUTPUT FORMAT. Open with a verdict line: `SHIP` / `SHIP AFTER FIXES` / `DO NOT SHIP`, and one sentence of reasoning. Then the seven passes. Then a single consolidated fix list, ordered `BLOCKER` / `SHOULD FIX` / `NICE TO HAVE`, each with the exact old text and the exact replacement text so I can find-and-replace without thinking. Any FABRICATED or UNSOURCED figure, and any storage API call, is automatically a BLOCKER.

Do not soften findings to be encouraging. A polite audit that lets one invented statistic through costs us a university partnership.

SELF-CHECK: (1) I extracted every number including those in SVG labels, details blocks and the JSON; (2) I gave a verdict for each and a replacement string for each non-SOURCED one; (3) I searched for all eight forbidden APIs by name; (4) I listed every external URL; (5) I wrote a one-sentence case FOR every lever; (6) my fix list contains literal replacement text, not advice; (7) I stated a clear ship verdict and did not hedge it.

--- PASTE THE CASE HTML (AND ACTIVITY JSON) BELOW THIS LINE ---
````

#### Check the output

- [ ] Count the numbers in the draft yourself, roughly. If the audit table has fewer rows, it missed some — most often inside SVG labels.
- [ ] Any UNSOURCED or FABRICATED verdict must come with the literal [VERIFY: ...] replacement string, ready to paste.
- [ ] Check the verdict line is unhedged. 'Mostly fine' is not one of the three options.
- [ ] Verify the eight forbidden APIs were each searched by name and reported, even when the count is zero.
- [ ] If Pass 4 could not write a case FOR every lever, fix the case before shipping — you have a lecture, not a decision.
- [ ] Read the Pass 3 rewrites. Are they actually better, or just blander?


## Interactive HTML artifacts and games

> What a Solutions Builder actually feels: they open a module on a phone, on mobile data, with maybe 25 minutes before something interrupts. So every artifact here interacts within 20 seconds of load, is checkpointed so a reload costs one act rather than the whole session, and says on screen that it does not save. Nothing here is a quiz with a gold star. Each type converts a decision into a visible cost borne by a named group, because "you were wrong" teaches less than "the poorest quartile in Orangi now pays more, and you did that."

Deliberate exclusions, each for a checked reason. (1) Drag-and-drop is banned everywhere: it is miserable at 360px and unreachable by keyboard, so ordering uses move-up/move-down buttons and matching uses tap-select-then-tap-target. (2) No cross-file state. I read the embed route: every simulation is a separate opaque-origin iframe with no storage, so a standalone "Consequence Ledger" file physically cannot read decisions made in another file. Rather than let the founder find that out in production, prompt 7 states it plainly and forces the ledger to live inside the same HTML as the decisions it reports. (3) No charting library. Chart.js is not in the server's CDN rewrite list and would silently fail offline, so everything is hand-written inline SVG or D3. (4) Free-essay sprawl is capped: each artifact collects at most one short written commitment, and because a sandboxed file cannot POST anything, it renders that text back in a copyable box to paste into the paired native activity. One human-graded essay per module, not several.

Two constraints I verified in the codebase and baked into all eight prompts because a generating model would otherwise get them wrong: the iframe is fixed-height (absolute inset-0 — it does not grow to fit content, so the page must scroll internally), and the platform paints a Fullscreen button over the bottom-left corner, so that area must stay clear of controls. The self-hosted font bundle contains exactly Bricolage Grotesque, Inter, IBM Plex Sans, IBM Plex Mono and Noto Nastaliq Urdu, with no italic faces.

The factual doctrine is the thing most likely to be fumbled, so every prompt states it twice with a distinction the brief implies but does not spell out. Aggregate real-world claims (coverage rates, tanker prices, unemployment figures) need a named source and year inline, or a visible [VERIFY: ...] marker. Row-level teaching datasets (case line lists, complaint logs, placement records) cannot be sourced at all, so they must carry a standing on-screen label saying the records are synthetic and the patterns are modelled on documented Karachi conditions, and they must never be attributed to KWSC, SSWMB, Indus Hospital or any real institution. That distinction is what keeps a Ziauddin faculty reviewer on side.

Topic coverage is spread so the founder can see all four exercised (Water in 1 and 3, Public Health in 4, Economic Opportunity in 2, Urban Safety in 5 and 6, cross-topic in 7 and 8), and every prompt additionally carries a RETARGET SKETCHES block giving a one-line version for the other three topics, so one prompt genuinely serves all four.


<a id="allocation-sandbox-builder"></a>
### Allocation Sandbox (Builder) — spend a constrained budget, watch 5 years

**When to use:** When you want learners to feel a trade-off in their hands rather than read about it: a fixed budget, competing levers, no dominant strategy.  
**Produces:** One standalone HTML simulation file for public/simulations/, ~25 minutes, reports a score via healComplete.

#### Prompt

````text
Follow the IESP Build Contract pasted above. Produce ONE standalone HTML file: an **Allocation Sandbox**. The learner spends a fixed budget across competing levers, runs a multi-year projection, and then commits to defending one choice.

## SWAP-TO-RETARGET BLOCK (change only these lines to move this to another Topic)
- `<FILENAME>` = `orangi-water-allocation.html`
- `<TOPIC>` = Water & Environment
- `<PLACE>` = Orangi Town, Karachi
- `<ROLE>` = "You advise the UC chairman. You have no authority — you have a budget and a memo."
- `<BUDGET>` = PKR 40,000,000 of district development funds, one financial year
- `<HORIZON>` = 5 years
- `<HEADLINE METRIC>` = share of households receiving piped water at least 2 days a week
- `<EQUITY METRIC>` = monthly water spend of the poorest quartile of households, in PKR
- `<TIME>` = 25 minutes

## THE FOUR LEVERS — build these specifically, do not genericise them
1. **Trunk main repair and bulk metering on the feeder line.** Expensive. Nothing visible until year 2. Largest effect on the headline metric. Zero effect on households that are entirely off-network.
2. **Formalise and meter tanker hydrant supply** — regulated filling points with published per-tanker rates. Cheap, effect within months, reduces what the poorest pay, does nothing for network coverage, and builds a constituency with an interest in the network staying broken.
3. **Lane-level community-managed distribution in katchi abadi blocks**, in the Orangi Pilot Project self-help tradition: residents finance and lay the lane line, the authority funds the secondary main. Medium cost, 6–9 month mobilisation lag, strongest equity effect, and **does nothing at all** below PKR 9,000,000 — mobilisation never reaches critical mass.
4. **Leak detection and illegal-connection survey.** Low cost, recovers volume fast, and drains a visible **political capital** meter. If political capital hits zero, lever 1 stalls for a full year.

## MODEL RULES THE LEARNER MUST BE ABLE TO SEE
- Diminishing returns on every lever — use a saturating curve such as `effect = max * (1 - Math.exp(-spend / k))`.
- Lever 3's hard threshold, lever 4's political cost, lever 1's lag must all be legible in the output, not hidden.
- **No dominant strategy.** A split that maximises the headline metric must score badly on equity, and vice versa. Test at least three different splits yourself before returning the file and confirm this holds.
- A `<details>` panel titled "How this model works" states every coefficient in plain English and contains this sentence verbatim: *"This is an illustrative teaching model built for IESP. It is not a KWSC, KMC or government forecast. The relationships are directionally reasoned; the coefficients are chosen for teaching."*

## FACTUAL DISCIPLINE
Any real-world figure you assert — population, coverage, tanker prices, supply volumes — needs a named source and year inline, e.g. "(PCRWR, 2021)". Where you do not know a real figure, put a visible `[VERIFY: what to check, where to look]` marker in the interface instead of inventing one. Your learner lives in Karachi and will spot a fake tanker price instantly. Model coefficients are not facts and do not need sources, but they must sit behind the disclosure panel above.

## INTERACTION AND LAYOUT
- Four `<input type="range">` sliders, each paired with a number input (the number input is the accessible and mobile-friendly fallback), each with a real `<label>`. A live "unallocated" counter. A **Run 5 years** button.
- Results: two small inline-SVG line charts (headline and equity) plus one plain-English sentence per year. Never use colour alone — pair every colour with a text label or a distinct shape.
- Single column below 720px. Tap targets at least 44px.
- **The iframe is a fixed height and does not grow to fit your content.** Set `html,body{height:100%}` and scroll inside your own container. Keep the bottom-left 180×56px clear — the platform paints a Fullscreen button there.
- Finish with a **Commit and explain** step: the learner picks the single lever they would defend to the chairman and writes 40+ words in a `<textarea>`. This file cannot send that text anywhere, so render it back in a selectable read-only box labelled "Copy this into the reflection question on the module page."

## SANDBOX RULES MOST LIKELY TO BE BROKEN IN THIS ARTIFACT
- No `localStorage` or `sessionStorage` to save an allocation — they throw in this sandbox. All state lives in one in-memory `const state = {}`.
- No Chart.js, no Tailwind CDN, no icon fonts. Hand-write the SVG or use D3 (whitelisted). Plain CSS only. No external images.
- Call `window.healComplete(score)` exactly once, guarded by `let reported = false;`. Score = 60 for completing a genuine run and the commit step, plus up to 40 scaled by how far both metrics beat the do-nothing baseline.
- Show an honest line near the top: "Nothing here is saved. Finish in one sitting — about 25 minutes."

## RETARGET SKETCHES (one line each, for reuse)
- **Public Health:** a UC health budget in Baldia across immunisation outreach, a clinic upgrade, a community health worker cadre, and water chlorination.
- **Urban Safety:** a road-safety budget on a Korangi corridor across street lighting, a pedestrian crossing, speed calming, and ambulance staging.
- **Economic Opportunity:** a youth employment fund in Lyari across stipends, equipment grants, an employer wage subsidy, and a transport allowance for women.

## SELF-CHECK — state pass or fail on each before returning the file
1. Zero storage APIs, zero non-whitelisted CDNs, zero external images, single file.
2. `healComplete` fires once, only on genuine completion.
3. Usable at 360px wide; nothing depends on hover; every control reachable by Tab with a visible focus ring.
4. Three different splits produce three genuinely different outcomes, and no split wins on both metrics.
5. Every real-world number carries a source and year, or a `[VERIFY: …]` marker.
6. The model disclosure panel and the exact "illustrative teaching model" sentence are present.
7. Under roughly 200KB, no build step, opens correctly by double-clicking the file.
````

#### Check the output

- [ ] Open the file on a phone, or drag a browser window to 360px wide: every slider, number box and button is reachable and tappable without pinch-zoom.
- [ ] Use find-in-page for 'localStorage', 'sessionStorage' and 'chart.js' — all three must return zero hits.
- [ ] Try three deliberately different splits (all on lever 1; all on lever 3; an even spread). If any one wins on both the headline and the equity metric, send it back — the trade-off is broken.
- [ ] Every number visible on screen either has a source and year in brackets after it, or a [VERIFY: ...] tag. No bare statistics.
- [ ] Open the 'How this model works' panel — it must contain the sentence saying this is an illustrative teaching model and not a KWSC or KMC forecast.
- [ ] Complete a run on the real platform and confirm the module marks you complete exactly once, not on page load.


<a id="branching-case-simulation"></a>
### Branching Case Simulation — five scenes, sticky consequences, a counterfactual epilogue

**When to use:** When the learning is institutional and interpersonal — who you say no to, what you concede, what you report — rather than numerical.  
**Produces:** One standalone HTML simulation file, ~20 minutes, 5 scenes with state flags and 3–4 endings, reports via healComplete.

#### Prompt

````text
Follow the IESP Build Contract pasted above. Produce ONE standalone HTML file: a **Branching Case Simulation** — five short scenes, choices that stick, four hidden state flags, and an epilogue that shows the learner the road not taken.

## SWAP-TO-RETARGET BLOCK
- `<FILENAME>` = `korangi-rozgar-case.html`
- `<TOPIC>` = Economic Opportunity
- `<ROLE>` = coordinator of a 60-seat skills-and-placement programme in Korangi
- `<FLAGS>` = `trust` (community), `placements`, `budget`, `integrity`
- `<TIME>` = 20 minutes

## THE FIVE SCENES — build exactly these
**S1 · Intake.** 300 applications, 60 seats. Options: rank by aptitude test; spread seats evenly across neighbourhoods; reserve 30 seats for women and fund a transport allowance; first-come-first-served. Each moves the flags differently. The transport option costs budget now and pays back in S3.

**S2 · Curriculum.** A garment unit in Korangi Industrial Area offers to guarantee interviews for 25 graduates if you train specifically on their machine models. Options: accept fully; accept but keep 40% general skills; refuse and teach transferable skills. Accepting raises `placements`, lowers long-run employability, and the epilogue must say so.

**S3 · Attendance collapses.** In week 3, female attendance drops sharply. The binding constraint is transport, not motivation — a real and documented barrier to women's labour force participation in Karachi. Mark it `[VERIFY: cite a Sindh Bureau of Statistics or PBS Labour Force Survey figure on women's participation and transport as a barrier]`. Options: pick-up van; shift the class to daylight hours; a cash stipend; do nothing and backfill the seats. If S1 already funded transport, this scene is cheaper — reward the earlier decision.

**S4 · The offer.** An employer offers to take 18 graduates on a piece rate below minimum wage, with no written contract. Options: accept and record it as a placement; negotiate a written contract at minimum wage for fewer seats; refuse; refer to the Sindh labour department. Reference the Sindh Home-Based Workers Act 2018 as a real instrument, with `[VERIFY: confirm which protections the Act actually extends and to whom]`.

**S5 · The donor report.** Your true placement rate is whatever the flags produced. Options: report the honest number with context; report gross "trained" numbers and let the reader infer; delay the report until after the next intake. `integrity` decides the ending.

## MECHANICS — non-negotiable
- **Scene text max 120 words.** This is read on a phone on mobile data. Ruthlessly short.
- After each choice, show a short **"What changed"** panel naming the affected flag in words, not numbers ("Community trust: dropped. Word travels fast in Korangi."). Never show raw scores mid-run.
- **No undo.** Choices commit. Offer "Start over" only at the end.
- **No dead ends.** Every path reaches an ending in five scenes. Verify all paths yourself.
- 3 or 4 endings, differentiated by flags — and none of them is a "you win" ending. The best available outcome should still involve a named cost.
- **The epilogue is the most valuable screen.** For each of the two most consequential choices the learner made, show one sentence describing what the alternative would plausibly have produced, and why. Label this block "What the other road looked like".

## FACTUAL AND CULTURAL DISCIPLINE
Use real institutions (Korangi Industrial Area, SITE, the Sindh labour department, Benazir Income Support Programme) and real dynamics (contract versus permanent hiring, home-based piece work, transport as the binding constraint on women's participation). Any statistic needs a named source and year, or a visible `[VERIFY: …]` marker. Characters are competent people under constraint — the employer has a real margin problem, the donor has a real board. **No poverty tourism:** the learner is an analyst making calls, never a visitor observing hardship.

## SANDBOX RULES MOST LIKELY TO BE BROKEN IN THIS ARTIFACT
- No `localStorage` for save-and-resume — it throws. Keep everything in one in-memory object and tell the learner up front: "This takes about 20 minutes and isn't saved — do it in one sitting."
- Do not use the browser history API to move between scenes. Render scenes by swapping innerHTML in a single `<main tabindex="-1">` and call `.focus()` on it after each transition, so keyboard and screen-reader users land inside the new scene.
- Call `window.healComplete(score)` once at the ending screen, guarded by a boolean. Score: 70 for reaching any ending honestly, plus up to 30 from a composite of the flags weighted so `integrity` counts most. Do not punish exploration — a learner who takes a bad path and reaches an ending still passes.
- Call `window.healProgress(pct)` after each scene so partial work shows on the module page.

## RETARGET SKETCHES
- **Water & Environment:** you negotiate with a tanker operators' association in Orangi over regulated filling points and published rates — they employ people, they are not villains, and they can shut off supply during the talks.
- **Public Health:** a district health officer in Lyari decides when to escalate a suspected enteric fever cluster, what to tell the press, and whether to work through a private clinic.
- **Urban Safety:** a ward officer allocates a monsoon preparedness week between nala desilting, evacuation planning and drain-cover replacement, while a councillor demands visible work on the main road.

## SELF-CHECK — state pass or fail on each
1. Every path reaches an ending; no scene can leave the learner stuck.
2. No scene body exceeds 120 words.
3. No storage APIs, no non-whitelisted CDNs, no external images, single file.
4. `healComplete` fires exactly once, at an ending, and any honest completion passes.
5. Focus moves to the new scene after every transition; all choices are `<button>` elements reachable by Tab.
6. The epilogue names at least two counterfactuals.
7. Every statistic has a source and year or a `[VERIFY: …]` marker; no character is written as a stereotype.
8. Renders and reads comfortably at 360px.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Play it three times taking different branches — you must reach an ending every time, and never hit a screen with no way forward.
- [ ] Read every scene aloud: none should run past about 30 seconds of speech. If a scene feels long on a phone, it is too long.
- [ ] Check the epilogue actually names what would have happened on the road you did not take — if it only summarises what you did, it is missing the most valuable screen.
- [ ] Take a deliberately bad-but-honest path. You should still pass at 70 or above; the module must not punish exploring.
- [ ] Reread the employer, the donor and the trainees: each should read as a competent person under constraint. If anyone reads as a villain or a victim, send it back.
- [ ] Find-in-page for 'localStorage' — zero hits. Every statistic has a source and year or a [VERIFY: ...] tag.


<a id="consequence-engine"></a>
### Consequence Engine — a transparent stock-and-flow model with a feedback loop you can see

**When to use:** When the point is systems thinking: that the problem feeds itself, and that a sensible-looking intervention can make things worse two steps later.  
**Produces:** One standalone HTML simulation file, ~20 minutes, time-stepped model with a labelled loop diagram, reports via healComplete.

#### Prompt

````text
Follow the IESP Build Contract pasted above. Produce ONE standalone HTML file: a **Consequence Engine** — a transparent, time-stepped model the learner configures, runs, and intervenes in only twice, so they experience a feedback loop instead of being told about one.

## SWAP-TO-RETARGET BLOCK
- `<FILENAME>` = `korangi-waste-loop.html`
- `<TOPIC>` = Water & Environment
- `<SYSTEM>` = solid waste collection in Korangi, and the storm drains it blocks
- `<HORIZON>` = 60 weeks, stepped weekly
- `<INTERVENTION POINTS>` = week 0 (setup), then only week 20 and week 40
- `<TIME>` = 20 minutes

## THE MODEL — build this system specifically
**Stocks** (each visible as a live number and a sparkline): `uncollectedTonnage`, `nalaBlockagePct`, `openComplaints`, `contractorPaymentBacklog`.

**Reinforcing loop R1 — the trap:** uncollected waste is dumped into the nalas → blockage rises → monsoon weeks flood low-lying lanes → flooded lanes are unreachable by collection vehicles → collection coverage falls → more uncollected waste. Once blockage passes roughly 55%, R1 dominates and the system will not recover on its own within the horizon.

**Balancing loop B1:** rising complaints eventually trigger an emergency desilting allocation, which cuts blockage but drains the same budget that pays the contractor, which raises `contractorPaymentBacklog`, which cuts effective fleet availability the following month.

**Learner dials at week 0** (four, no more): number of collection vehicles deployed; share of the ward served by a transfer station versus direct-to-landfill hauling; frequency of pre-monsoon nala desilting; contractor payment schedule (monthly on time versus quarterly in arrears).

**Seasonality:** weeks 26–34 are the monsoon window. Rainfall multiplies the flooding effect. Say plainly on screen that monsoon timing varies year to year and mark it `[VERIFY: typical Karachi monsoon window and rainfall variability, Pakistan Meteorological Department]`.

**Mid-run interventions:** at week 20 and week 40 only, pause and offer three options each (emergency desilting; add two vehicles; clear the payment backlog; a community drop-point pilot). Each has a lag. This scarcity is the lesson — you cannot micromanage your way out.

## TRANSPARENCY IS THE POINT
- A **Model inspector** (`<details>`) listing every difference equation in plain English: "Each week, blockage rises by 0.4 percentage points for every 100 tonnes left uncollected, and falls by 6 points per desilting round."
- An **inline SVG loop diagram** showing R1 and B1 with labelled arrows, with the reinforcing loop visually highlighted while it is dominant. Label the loops R1 and B1 in text as well as colour.
- Carry this verbatim: *"This is an illustrative teaching model built for IESP. It is not an SSWMB or KMC projection. The structure reflects documented dynamics; the coefficients are chosen for teaching."*

## FACTUAL DISCIPLINE
Name the real actors correctly — Sindh Solid Waste Management Board (SSWMB), KMC, the district municipal corporation, private collection contractors, the Gujjar Nala and Orangi Nala corridors. Any tonnage, fleet size, population or budget figure needs a named source and year, or a visible `[VERIFY: what to check, where to look]` marker. Do not attribute the model's coefficients to any agency.

## INTERACTION AND LAYOUT
- Dials are `<input type="range">` with paired number inputs and real `<label>`s.
- **Run** animates the 60 weeks in about 12 seconds using `requestAnimationFrame`. Provide a **Skip to end** button and honour `@media (prefers-reduced-motion: reduce)` by drawing the final state immediately.
- Charts: four small hand-written inline-SVG sparklines, stacked vertically on mobile and in a 2×2 grid above 720px. D3 is allowed and whitelisted; nothing else is.
- Debrief screen: state whether R1 took over, in which week, and what would have prevented it. Then ask one question — "Name the earliest week at which this outcome became hard to reverse, and say why" — in a `<textarea>`, 30+ words, echoed back in a copyable box for the paired reflection question.

## SANDBOX RULES MOST LIKELY TO BE BROKEN IN THIS ARTIFACT
- No `localStorage`, and no `setInterval` left running — use `requestAnimationFrame` and cancel it when the run ends or the learner restarts, or the phone gets hot and the battery drains.
- No Chart.js, no Plotly, no animation library. Vanilla or D3 only. No external images.
- `window.healComplete(score)` fires once, after the debrief question is answered. Score: 55 for a completed run, plus a scaled component for final blockage and complaint levels, plus 15 if the learner used both intervention points.
- Report `window.healProgress` at week 20, week 40 and completion.

## RETARGET SKETCHES
- **Public Health:** immunisation coverage versus rumour spread — falling coverage triggers an outbreak, an outbreak triggers a campaign, a rushed campaign fuels the rumour.
- **Urban Safety:** road-crash blackspots — a crash triggers enforcement, enforcement decays over months, traffic volume grows, crashes return.
- **Economic Opportunity:** a training-to-placement pipeline where oversupply of one skill collapses the wage, which collapses enrolment two intakes later.

## SELF-CHECK — state pass or fail on each
1. Run the model at least three ways yourself: a configuration where R1 takes over, one where it does not, and one borderline. Confirm all three actually occur.
2. The model inspector lists every coefficient in plain English, and the "illustrative teaching model" sentence is present verbatim.
3. The loop diagram labels R1 and B1 in text, not colour alone.
4. No storage APIs, no non-whitelisted CDNs, no leaked timers, single file under ~200KB.
5. prefers-reduced-motion is honoured and Skip to end works.
6. Readable at 360px with sparklines stacked; all dials keyboard-operable with visible focus.
7. Every real-world figure sourced or `[VERIFY: …]` marked.
8. `healComplete` fires exactly once.
````

#### Check the output

- [ ] Run it three ways: a setup that spirals, one that holds, one borderline. If every setup ends the same way the model is fake and the lesson is lost.
- [ ] Open the model inspector — you should be able to read every rule in plain English and understand roughly why the numbers moved. If it reads as magic, send it back.
- [ ] Confirm the loop diagram says 'R1' and 'B1' in text, not just in colour, and that the arrows describe a loop you can trace with your finger.
- [ ] Press Skip to end, then reload and run again — the phone should not heat up and the animation should not keep running after the run finishes.
- [ ] Check the sentence stating this is an illustrative teaching model and not an SSWMB or KMC projection is present, word for word.
- [ ] Every tonnage, fleet size or budget number has a source and year or a [VERIFY: ...] tag.


<a id="data-detective"></a>
### Data Detective — interrogate a labelled synthetic dataset and commit a hypothesis before the reveal

**When to use:** When you want real analytical work: filtering, spotting a confounder, rejecting a red herring, and being held to a hypothesis stated in advance.  
**Produces:** One standalone HTML simulation file with an inline dataset, ~25 minutes, reports via healComplete.

#### Prompt

````text
Follow the IESP Build Contract pasted above. Produce ONE standalone HTML file: a **Data Detective** station. The learner interrogates a small dataset, is forced to commit a hypothesis before any reveal, and then learns whether the data actually supported it.

## SWAP-TO-RETARGET BLOCK
- `<FILENAME>` = `enteric-cluster-detective.html`
- `<TOPIC>` = Public Health
- `<SCENARIO>` = a suspected enteric fever (typhoid) cluster across six union councils in western Karachi
- `<ROWS>` = 48 case records
- `<ANSWER>` = a single tanker filling point supplying three of the six UCs
- `<TIME>` = 25 minutes

## THE DATASET — generate it inline, in code, as `const CASES = [ … ]`
Columns: `id`, `ageBand`, `unionCouncil`, `onsetDate`, `mainWaterSource` (piped / tanker / borewell / bottled), `tankerPoint` (blank unless the source is tanker), `school`, `severity`, `respondedToFirstLineAntibiotic` (yes/no — a plain-language proxy for drug resistance, explained in the interface).

Structure it so the analysis is genuinely doable but not trivial:
- **The real signal:** cases sourced from tanker point "T-3" cluster with onset dates 8–14 days after a single date. That incubation window is the key to the whole exercise — teach it explicitly.
- **A red herring:** one school appears in many records, but its cases are spread evenly across six weeks with no shared onset window. Plausible, and wrong.
- **A confounder:** the UC with the most raw cases is also by far the most populous, so raw counts mislead. Provide a small population table so the learner can reason in rates.
- **Noise:** a handful of unrelated cases on piped and bottled supply, so the signal is not 100% clean.

**DATA LABELLING — mandatory and non-negotiable.** A permanently visible, non-dismissible banner on every screen reading: *"Synthetic teaching dataset. These individual records are invented for IESP training. The patterns are modelled on documented Karachi conditions. This is not real patient data and is not from any hospital, laboratory or health department."* Never attribute these rows to Indus Hospital, Aga Khan, Ziauddin, PPHI, Sindh EPI or NIH. Aggregate real-world context stated around the dataset (typhoid burden, incubation period, XDR typhoid in Sindh) must carry a named source and year, or a `[VERIFY: what to check, where to look]` marker.

## THE FIVE-STEP FLOW
1. **The brief** (max 100 words). A district health officer forwards 48 records and asks one question: what is the shared exposure?
2. **Explore.** A sortable table plus filter chips for water source, UC and age band. Plus a small inline-SVG **epidemic curve** binned by week. The x-axis must be **onset date, not report date** — include a one-line explanation of why that distinction matters, because it is the most transferable idea in the exercise.
3. **Commit.** Before any feedback: a locked hypothesis form — pick the suspected exposure from a list, tick the evidence rows that support it, and write 30+ words on what would prove you wrong. Once submitted it cannot be edited.
4. **Reveal.** Show the learner's hypothesis against the data. Explain why the school was a red herring (dates don't cluster) and why raw UC counts mislead (population). If they got it right, still show the reasoning — being right for the wrong reason is a failure mode worth naming.
5. **Epilogue: how a real investigation differs.** Three or four bullets on what actually happens — laboratory confirmation, notification through the district health officer, the difference between a case definition and a suspicion. Mark process claims `[VERIFY: confirm Sindh notifiable-disease reporting pathway]`.

## SANDBOX RULES MOST LIKELY TO BE BROKEN IN THIS ARTIFACT
- **Do not `fetch()` a CSV or JSON file — it is blocked.** The dataset must be a literal JavaScript array inside the file.
- No `localStorage` for the hypothesis. In-memory only; tell the learner it isn't saved.
- The table must be a real `<table>` with `<th scope="col">`, wrapped in a container with `overflow-x:auto`, so the page body never scrolls sideways at 360px. Filter chips are `<button aria-pressed>`, minimum 44px tall. No drag-and-drop anywhere.
- Call `window.healComplete(score)` once, after the reveal. Score: 40 for a committed hypothesis with a falsifier written, 40 for identifying the tanker point, 20 for selecting mostly-correct supporting rows. A learner who commits a wrong hypothesis with sound evidence selection should still be able to reach 70 — reward method, not luck.

## RETARGET SKETCHES
- **Water & Environment:** nine sampling points along a distribution line; the learner finds where contamination enters, using turbidity and residual chlorine columns.
- **Urban Safety:** 60 road-crash records on one corridor; the signal is time-of-day plus a single unlit junction, and the red herring is vehicle type.
- **Economic Opportunity:** 50 placement records from a training programme; the signal is that one provider's graduates are never placed, and the confounder is that they also enrol the least-experienced applicants.

## SELF-CHECK — state pass or fail on each
1. The synthetic-data banner is visible on every screen, cannot be dismissed, and no record is attributed to a real institution.
2. The dataset is inline; there is no `fetch`, no `XMLHttpRequest`, no external file.
3. Work the dataset yourself: confirm the tanker signal is findable using only the filters provided, that the school red herring is genuinely tempting, and that the population table is needed to avoid the confounder.
4. The epidemic curve uses onset date and says why.
5. The hypothesis truly locks before any feedback appears.
6. No storage APIs, no non-whitelisted CDNs, no external images, single file.
7. The table scrolls inside its own container at 360px; the page body never scrolls horizontally; all controls keyboard reachable with visible focus.
8. `healComplete` fires once, and a well-reasoned wrong answer can still pass.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Solve it yourself using only the filters provided. If you cannot find the tanker point in about ten minutes, the puzzle is unfair; if you find it in thirty seconds, it is too easy.
- [ ] Confirm the synthetic-data banner is on every screen and cannot be closed, and that no record is credited to Indus Hospital, Aga Khan, Ziauddin, PPHI or any real body.
- [ ] Try to change your hypothesis after submitting it. You must not be able to — if you can, the whole exercise collapses.
- [ ] Find-in-page for 'fetch(' and 'localStorage' — both must return zero hits, or the dataset will not load on the platform.
- [ ] On a 360px screen, the table must scroll sideways inside its own box while the page itself does not.
- [ ] Deliberately submit a wrong-but-well-argued hypothesis with good evidence rows ticked — you should still be able to pass.


<a id="mcq-with-consequences"></a>
### MCQ-with-Consequences — a night shift of ten calls, no gold stars, damage persists

**When to use:** When you need a short, high-tempo module (10–12 minutes) that still teaches judgement — ideal for Week 1 or as a warm-up before a longer topic sim.  
**Produces:** One standalone HTML simulation file, ~12 minutes, ten decisions with three running meters, reports via healComplete.

#### Prompt

````text
Follow the IESP Build Contract pasted above. Produce ONE standalone HTML file: **MCQ-with-Consequences**. Ten rapid decisions. Each answer immediately moves running meters and the damage carries forward. Crucially, there is **no correct/incorrect feedback during play** — only consequences. The reasoning arrives in a debrief at the end.

## SWAP-TO-RETARGET BLOCK
- `<FILENAME>` = `night-shift-safety-desk.html`
- `<TOPIC>` = Urban Safety
- `<FRAME>` = one night shift on a city safety coordination desk in Karachi
- `<METERS>` = `Harm prevented`, `Public trust`, `Resources left`
- `<CALLS>` = 10
- `<TIME>` = 12 minutes

## THE TEN CALLS — build these, in roughly this order of escalation
1. A missing manhole cover reported on a Korangi service road, at night, near a bus stop.
2. A school crossing request on a major arterial where children currently cross six lanes.
3. Pre-monsoon: a resident reports a blocked nala section. It is not yet raining.
4. Two ambulance requests at once (Edhi and Chhipa are the real operators in Karachi) and one vehicle within reach.
5. A street lighting outage across four consecutive lanes in a dense residential block.
6. A WhatsApp voice note claiming a crime wave in a named neighbourhood is spreading fast. Unverified. **This is the misinformation call** — the strongest move involves verification before amplification, and the debrief should say so.
7. Encroachment blocking a fire lane in a commercial street; the shopkeepers are the same people who report incidents to you.
8. A councillor requests visible work on the main road while your data points at a side street.
9. An overloaded passenger vehicle at a known pickup point at 11pm.
10. End of shift: your own handover note. What you write decides what the day shift can act on.

## HOW EACH CALL WORKS
- The card shows: the call in **under 60 words**, the current meter values, and 3 options (occasionally 4).
- On selection, immediately show a **consequence paragraph of 25–40 words** describing what happened next, plus meter deltas expressed in words, not just numbers ("Public trust: down. The family had already called twice.").
- **Forbidden:** the words "Correct", "Incorrect", "Well done", any tick or cross icon, and any score displayed during play. If an option is defensible but costly, say so in the consequence text rather than grading it.
- **No undo.** The next call arrives with your meters where you left them. Low `Resources left` must genuinely constrain later options — `disabled` at least two later options with a visible explanation of why they are unavailable. That constraint is the whole lesson.
- Include at least two calls where the tempting option is the visible one and the better option is the boring one.

## THE DEBRIEF — where the teaching happens
For each of the ten calls: the option the learner chose, the **best-supported option**, and one sentence of reasoning. Where reasoning rests on a fact (crash risk at unlit junctions, the division of duties between SSWMB and KMC, how ambulance dispatch actually works in Karachi), give a named source and year or a visible `[VERIFY: what to check, where to look]` marker. Do not invent statistics to make a point land.

End with one question in a `<textarea>` (30+ words): "Which call would you handle differently, and what would you need to know to be sure?" Echo it back in a selectable box labelled for pasting into the reflection question on the module page.

## SANDBOX RULES MOST LIKELY TO BE BROKEN IN THIS ARTIFACT
- No `localStorage` — meters live in one in-memory object. Say up front: "About 12 minutes. Not saved — finish in one go."
- Meters must not communicate by colour alone: each shows a label, a number, and a bar with a text state ("low", "strained", "holding").
- Options are `<button>` elements, minimum 44px tall, full width on mobile, with visible focus rings. Move focus to the consequence panel after each choice so keyboard and screen-reader users are not stranded.
- Call `window.healComplete(score)` once, at the end of the debrief. Score = 50 for finishing plus up to 50 from a composite of the three meters. Passing must not require a perfect run — a thoughtful learner with one bad call should clear 70.
- Call `window.healProgress` after each call so the module page shows a live bar.

## RETARGET SKETCHES
- **Public Health:** ten calls on a district immunisation drive — a refusal, a cold-chain failure, a rumour, a stock-out.
- **Water & Environment:** ten calls on a water complaint desk — a burst main, a contamination report, an illegal connection, a tanker price spike.
- **Economic Opportunity:** ten decisions across one week running a placement cell — a no-show, an underpaying employer, a donor request, a promising candidate with no transport.

## SELF-CHECK — state pass or fail on each
1. Search your own output: "Correct", "Incorrect" and any tick/cross must not appear during play.
2. No call body exceeds 60 words; no consequence exceeds 40.
3. At least two later options are genuinely constrained by earlier resource spending, with the reason shown.
4. No storage APIs, no non-whitelisted CDNs, no external images, single file.
5. All meters convey state with text as well as colour; all buttons ≥44px and keyboard reachable; focus moves to the consequence after each choice.
6. Every factual claim in the debrief has a source and year or a `[VERIFY: …]` marker.
7. `healComplete` fires exactly once, at the debrief, and a good-but-imperfect run passes.
8. The whole thing genuinely completes in about 12 minutes — time yourself reading it.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Play it once and time yourself. If it runs past about 15 minutes it is too long for its slot and needs cutting.
- [ ] Find-in-page for 'Correct' and 'Incorrect' — neither should appear anywhere in the playing screens. Consequences replace grading.
- [ ] Spend recklessly on the first three calls, then check that later options actually become unavailable with a visible explanation. If everything stays available, the meters are decorative.
- [ ] Cover the screen with your hand so you cannot see colour: you should still be able to tell from the text whether each meter is healthy or strained.
- [ ] Read the debrief — every factual claim behind a 'best-supported option' needs a source and year or a [VERIFY: ...] tag.
- [ ] Play a decent-but-imperfect run and confirm you still pass. Requiring perfection will drive learners away in Week 1.


<a id="ethics-dilemma-station"></a>
### Ethics Dilemma Station — commit a position, face three rebuttals, name your falsifier

**When to use:** For the Week 1 compulsory ethics module and for the ethics beat inside any topic; swap one line to reframe it for each of the four lenses.  
**Produces:** One standalone HTML simulation file, ~20 minutes, lens-aware, scores process not opinion, reports via healComplete.

#### Prompt

````text
Follow the IESP Build Contract pasted above. Produce ONE standalone HTML file: an **Ethics Dilemma Station**. The learner takes a position on a genuinely hard question, is challenged by three stakeholders who each have a real point, and must either revise or hold with a stated reason. It scores the **quality of the process**, never the opinion.

## SWAP-TO-RETARGET BLOCK
- `<FILENAME>` = `safety-score-dilemma.html`
- `<TOPIC>` = Urban Safety
- `<DILEMMA>` = A city dashboard proposes publishing a per-neighbourhood "safety score" built from complaint and incident data. It would be public, ranked, and would put Lyari at the bottom.
- `<LENS>` = Computer Science / Data  ← **the founder swaps this one line; see the lens table**
- `<TIME>` = 20 minutes

## WHY THIS DILEMMA IS HARD (build the tension honestly)
The score would direct real resources to areas that need them. It would also stigmatise residents, affect rents, insurance and job prospects, and it is built on **complaint data**, which measures who reports, not what happens. Areas where people trust the system to respond report more. That single fact should be discoverable inside the exercise, not announced at the top.

## THE LENS TABLE — same dilemma, different door
Build all four as a small internal object and select with `<LENS>`, so the founder swaps one word:
- **Health:** you sit on the ethics committee; the score would be used to triage ambulance staging. Consent and stigma frame it.
- **Computer Science / Data:** you are asked to write the model card. Which features are in, what is documented, what the score must refuse to claim.
- **Design & Marketing:** you decide how the score is visualised and communicated. A red-to-green choropleth versus a text summary is an ethical decision, not a cosmetic one.
- **Entrepreneurial / Finance:** an insurer wants to license the score. Pricing, and what you contractually forbid.

## THE FIVE-STEP FLOW
1. **Brief** — 120 words max, plus a "what we actually know" panel where each factual claim carries a named source and year, or a visible `[VERIFY: what to check, where to look]` marker. Do not invent crime or complaint statistics for Lyari or anywhere else. If you need a number to make the dilemma work, use `[VERIFY: …]` and phrase the dilemma so it stands without the number.
2. **Commit** — pick one of three stances (publish as designed / publish with named restrictions / do not publish) and write 60+ words justifying it. Locks on submit.
3. **Three rebuttals**, tailored to the stance chosen — nine short rebuttals in total, about 70 words each:
   - a **Lyari residents' association representative**, who must be given the *strongest* argument in the set and written as a competent organiser with agency, never a victim;
   - a **ward officer** who has to allocate ambulances tonight, with or without the score;
   - a **data scientist** who built it and knows exactly which feature is doing the damage.
   After each rebuttal, one required interaction: "Which part of this do you accept?" with 2–3 options plus a free line.
4. **Revise or hold** — the learner restates their position in 40+ words. Holding is a legitimate outcome if reasoned, and the interface must say so.
5. **Falsifier** — "What evidence would change your mind?" Required, 20+ words. Refusing to answer is the only way to fail this station.

## SCORING — read this carefully
Score **process only**: 25 for a committed initial stance with justification, 15 per rebuttal genuinely engaged (45 total), 15 for a restated final position, 15 for a specific falsifier. All three stances can reach 100. Never present any stance as the right answer. In the closing panel, name the strongest argument *against whatever the learner concluded*.

## SANDBOX RULES MOST LIKELY TO BE BROKEN IN THIS ARTIFACT
- **This file cannot send text anywhere** — no fetch, no storage. Every written answer stays in memory. At the end, assemble the learner's stance, revisions and falsifier into one plain-text block in a read-only, fully selectable `<textarea>` labelled: "Copy this and paste it into the reflection question on the module page — it is not saved here." Offer a Copy button that tries `navigator.clipboard.writeText` inside a `try/catch` and, on any failure, selects the textarea and tells the learner to copy manually. Clipboard access can be refused in this sandbox, so the manual path must always work.
- No `localStorage`. Warn at the top: "About 20 minutes of writing. Nothing is saved — finish in one sitting."
- Text-heavy screens still need mobile care: roughly 65 characters per line maximum, body text at least 16px, `<textarea>` at least 6 rows and full width, no fixed heights that trap content. The iframe does not grow — scroll inside your own container and keep the bottom-left 180×56px clear for the platform's Fullscreen button.
- `window.healComplete(score)` fires once at the end, guarded by a boolean.

## RETARGET SKETCHES
- **Water & Environment:** a smart-meter rollout that would let the utility disconnect non-payers remotely in katchi abadis.
- **Public Health:** naming a specific neighbourhood as an outbreak source in a public advisory — faster action, lasting stigma.
- **Economic Opportunity:** an employability score shown to employers, built on university attended and neighbourhood of residence.

## SELF-CHECK — state pass or fail on each
1. All three stances can score 100; no stance is framed as correct anywhere in the output.
2. The Lyari representative has the strongest argument in the set and is written with agency and competence — reread that text specifically for condescension.
3. Nine rebuttals exist (three stances × three stakeholders) and each runs about 70 words.
4. No invented statistics anywhere; every factual claim sourced with a year or `[VERIFY: …]` marked.
5. The copy-out textarea exists, contains everything the learner wrote, and works even if the clipboard API throws.
6. No storage APIs, no non-whitelisted CDNs, no external images, single file.
7. At 360px: comfortable line length, 16px+ text, usable textareas, all controls keyboard reachable with visible focus.
8. `healComplete` fires exactly once and only after the falsifier is answered.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Run it three times choosing a different stance each time. All three must be able to reach full marks — if one stance is quietly treated as the right answer, send it back.
- [ ] Read the Lyari residents' association rebuttal on its own. It must be the sharpest argument in the set and must read as a competent organiser making a case, not a victim being spoken for.
- [ ] Deliberately block clipboard access (or just press Copy and refuse any prompt) — the textarea must still be selectable so the learner can copy by hand.
- [ ] Check the closing panel names the strongest argument against whatever you concluded, not a congratulation.
- [ ] Confirm no crime or complaint statistic about Lyari appears without a source and year or a [VERIFY: ...] tag. This is the highest-risk artifact for that.
- [ ] Swap the <LENS> line to each of the four lenses in turn and confirm the dilemma genuinely reframes rather than just changing a label.


<a id="consequence-ledger"></a>
### Consequence Ledger — the receipt: what you chose, who paid, what you didn't see coming

**When to use:** As the closing section of any decision-based artifact, and as the piece the learner keeps for their capstone and portfolio.  
**Produces:** A drop-in HTML+CSS+JS section (plus a standalone variant) that renders a distributional receipt of the learner's decisions and exports a copyable summary.

#### Prompt

````text
Follow the IESP Build Contract pasted above. Produce a **Consequence Ledger** — the closing screen that turns a learner's run into a receipt: every decision, who gained, who paid, and what they could not see at the time.

## READ THIS FIRST — an architectural constraint, not a preference
Each simulation runs in its own sandboxed iframe with **no storage and no shared state**. A ledger in a *separate* HTML file therefore **cannot** read decisions made in another file. There is no workaround. So build whichever of these two is asked for:

- **MODE A (default — build this unless told otherwise): a drop-in section.** Deliver a self-contained block — one `<section>`, one `<style>` scoped under a `.heal-ledger` prefix, one `<script>` exposing `renderLedger(containerId, decisions)` — that the founder pastes into the **bottom of an existing simulation file**. Define the `decisions` array shape precisely and show a worked example so the host file can build it as the learner plays.
- **MODE B: standalone recall ledger.** A separate file in which the learner re-declares what they chose via a short guided form before the ledger renders. State honestly on screen that this is recall, not a record. Recall plus justification is pedagogically useful, so do not apologise for it — but never pretend the file knows what happened.

## THE DATA SHAPE (Mode A)
```js
renderLedger('ledger', [
  { id: 'lever1', label: 'Repaired the trunk main',
    chose: 'PKR 22m',
    gained: ['Households already on the network'],
    paid:   ['Off-network katchi abadi blocks — nothing reached them'],
    reversible: 'partly',            // 'yes' | 'partly' | 'no'
    evidence: 'PCRWR 2021 water quality report',
    confidence: 'medium',            // learner-declared
    secondOrder: 'Metering data later exposed a leak the ward had denied.' }
]);
```

## WHAT THE LEDGER RENDERS
1. **The table.** Columns: Decision · What you chose · Who gained · **Who paid** · Reversible? · Evidence you relied on · Your confidence. A real `<table>` with `<th scope="col">`, inside `overflow-x:auto`. Below 720px it collapses to stacked cards — each row becomes a card with the column name as a bold label above each value. Never a squeezed table on a phone.
2. **The burden strip.** One horizontal inline-SVG bar per stakeholder group (for a Karachi water run: *households on the network*, *off-network katchi abadi households*, *tanker operators and their workers*, *the utility's own budget*), showing how much of the total cost each group carried. Label every bar with words and a percentage — never colour alone. This strip is the emotional core: it shows at a glance that someone always paid.
3. **"What you couldn't see at the time."** Reveal each decision's `secondOrder` effect one at a time, only after the learner has read the table — a button, not an auto-dump. Second-order effects must be plausible consequences of the stated dynamics, not moralising twists.
4. **Confidence versus outcome.** A short, neutral line: how many decisions the learner marked high-confidence that turned out badly. Overconfidence is the finding, not a scolding.
5. **The export block.** A read-only, fully selectable `<textarea>` containing a clean plain-text version of the whole ledger, headed with the topic, the date the learner ran it, and the line "Produced in the IESP Immersive Experience & Simulation Program, Heal Social Foundation." Label it: "Copy this into your capstone notes and into the reflection question on the module page — it is not saved here." Add a Copy button calling `navigator.clipboard.writeText` inside `try/catch` that, on failure, selects the textarea and shows manual-copy instructions. The clipboard API can be blocked in this sandbox, so the manual path must always work.

## FACTUAL DISCIPLINE
The ledger repeats claims made upstream, so it inherits their obligations. Any figure carried into the export needs its source and year attached, and any `[VERIFY: …]` marker present upstream must be carried through into the export text — never silently dropped, which would launder an unverified number into a learner's portfolio.

## SANDBOX RULES MOST LIKELY TO BE BROKEN IN THIS ARTIFACT
- No `localStorage` and no attempt to persist the ledger. No `fetch`, no upload, no email link. Copy-out text is the only export path.
- No CSS or JS that could collide with the host file: scope every selector under `.heal-ledger`, declare no global variables except the single `renderLedger` function, and add no `<link>` tags (the host file already loads the fonts).
- Do not call `window.healComplete` from the ledger by default — the host simulation owns completion. Expose an optional `onLedgerRead` callback the host can wire up, and say so in a code comment.
- The iframe is a fixed height: the ledger must scroll within the host's existing scroll container, must not use `position:fixed`, and must not cover the bottom-left 180×56px where the platform draws its Fullscreen button.

## RETARGET SKETCHES (stakeholder groups per topic)
- **Public Health:** patients / the unreported and untested / frontline health workers / the district budget.
- **Urban Safety:** pedestrians and children / drivers and transport workers / traders on the affected street / the enforcement budget.
- **Economic Opportunity:** placed graduates / unplaced applicants / employers / women constrained by transport and safety.

## SELF-CHECK — state pass or fail on each
1. Mode A is a genuine drop-in: pasted into an existing simulation, nothing collides — all CSS scoped, exactly one global function.
2. `renderLedger` handles 3 decisions and 12 decisions without breaking the layout; test both.
3. Below 720px the table becomes stacked labelled cards, and the page body never scrolls horizontally.
4. Every burden bar is labelled with words and a percentage, not colour alone.
5. Second-order effects reveal on a button press, never automatically.
6. The export textarea contains the full ledger including any `[VERIFY: …]` markers, and copying works even if the clipboard API throws.
7. No storage APIs, no fetch, no non-whitelisted CDNs, no external images.
8. The ledger does not call `healComplete` unless the host explicitly wires it.

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] Paste the Mode A block into one of your existing simulation files and open it — the host page's own styling must be completely unaffected.
- [ ] Call it once with 3 decisions and once with 12 — neither should break the layout or overflow the page sideways.
- [ ] At 360px the table must become stacked cards with the column name printed above each value. A shrunken seven-column table is a fail.
- [ ] Check the 'Who paid' column is filled for every row. If any decision shows a gain with no cost, the artifact has lost its whole point.
- [ ] Copy the export text and paste it into a notes app — it should read as a clean standalone summary a learner could put in a portfolio, with any [VERIFY: ...] tags still visible.
- [ ] Confirm the second-order effects stay hidden until you press the button, and that they read as plausible consequences rather than moral lessons.


<a id="week1-core-microsim"></a>
### Week 1 Core Micro-Sim — three checkpointed acts against the drop-off cliff

**When to use:** For the three compulsory Week 1 modules (AI literacy, professional ethics, Karachi as a living lab), which currently have no simulation and are where cohorts bleed learners.  
**Produces:** One standalone HTML simulation file, 30–40 minutes in three independently completable acts, reports progress after each act.

#### Prompt

````text
Follow the IESP Build Contract pasted above. Produce ONE standalone HTML file: a **Week 1 Core Micro-Sim**. This is compulsory content every learner sees in their first week, on a phone, before they are invested. It is the highest drop-off point in the programme. Design against that specifically.

## SWAP-TO-RETARGET BLOCK
- `<FILENAME>` = `w1-break-the-classifier.html`
- `<CORE MODULE>` = AI literacy
- `<TIME>` = 35 minutes, in three acts of roughly 11 minutes
- `<PROMISE>` = "By the end you will have made a working model change its mind — and then broken it."

## ANTI-DROP-OFF REQUIREMENTS — not optional
1. **Something interactive within 20 seconds of load.** No wall of text before the first tap. The brief is at most 60 words and sits *beside* the first interaction, not before it.
2. **Three acts, each independently completable.** Call `window.healProgress(33)`, `(66)`, `(100)` at act boundaries. Show "Act 1 of 3 · about 11 minutes" persistently. If the learner reloads after a load-shedding cut they lose at most one act — say so on screen: "Each part is short on purpose. If you lose connection, you only lose the part you're in."
3. **A genuine surprise in Act 1.** Not a fun fact — a moment where the learner's expectation is wrong and they can see exactly why.
4. **Page weight budget: under 150KB total.** Learners pay for mobile data. No large data URIs, no decorative images, at most three font weights.
5. Never more than about 120 words of continuous prose on one screen.

## THE WORKED EXAMPLE — "Break the Classifier" (AI literacy)
A tiny nearest-neighbour classifier, hand-written in about 40 lines of vanilla JS, that routes a citizen complaint to the right agency: **KWSC** (water supply), **SSWMB** (solid waste), or **KMC / district municipal** (roads, drains, lighting). No API, no model file, entirely offline.

- **Act 1 — You classify.** Five real-sounding complaints. The learner routes each, then sees the model's answer. Two are cases where the learner is right and the model is wrong. **The surprise:** the model routes "paani gandaa aa raha hai" (dirty water coming) to KWSC on the word *paani* — but the complaint actually describes sewage backing up into the street, which is not the water supply utility's problem. Show the model's matched keywords so the failure is *explicable*, not magic. Include at least two English/Urdu code-switched complaints, because that is how people actually write. Render any Urdu script with `dir="rtl" lang="ur"` and `line-height: 2.1` in Noto Nastaliq Urdu.
- **Act 2 — You inspect.** Reveal the model's entire training set: 18 example complaints with labels, shown as an editable list. Ask one question: who wrote these examples, and whose complaints are missing? Point out concretely that every example is in complete sentences and full English, while real complaints arrive as fragments, in Roman Urdu, and often by voice.
- **Act 3 — You fix it, and break something else.** The learner edits, adds or removes training examples and re-runs the same five complaints plus three held-out ones. Fixing the sewage case by adding sewage examples must measurably degrade at least one previously-correct case. Show a small before/after accuracy table on the held-out set. End on the actual lesson, stated plainly: models learn from whoever wrote the data, fixing one bias creates another, and the held-out set is the only reason you found out.

## FACTUAL DISCIPLINE
Agency responsibilities in Karachi genuinely overlap and are contested. State the split you use, then mark it `[VERIFY: confirm current division of responsibility between KWSC, SSWMB, KMC and district municipal corporations for sewage, storm drains and street lighting]`. The complaints themselves are invented for teaching — label the training set visibly: *"Example complaints written for IESP training. Not real citizen reports."* Do not invent complaint volumes or resolution rates.

## SANDBOX RULES MOST LIKELY TO BE BROKEN IN THIS ARTIFACT
- **No AI API, no fetch, no model file.** The classifier is plain JavaScript in this file — keyword weights and a similarity score are enough, and being simple enough to fully inspect is the pedagogical point.
- No `localStorage` to save edited training data — in-memory only.
- Editing the training set must not use drag-and-drop. Use a list with per-row Edit / Remove buttons and an "Add example" form. All controls ≥44px and keyboard reachable.
- `window.healComplete(score)` once at the end of Act 3, guarded by a boolean: 40 for completing all three acts, 30 for making at least one training edit and re-running, 30 for a 25+ word answer to "name one kind of complaint this model will keep getting wrong, and why". Echo that answer into a copyable box for the module reflection question.
- The iframe is a fixed height and the platform draws a Fullscreen button over the bottom-left 180×56px — scroll internally and keep that corner clear.

## RETARGET SKETCHES FOR THE OTHER TWO CORE MODULES
- **Professional ethics:** "Whose name is on it?" Act 1, the learner ships a small piece of analysis; Act 2, it is quoted somewhere unexpected with a caveat removed; Act 3, they rewrite it so it survives being quoted out of context. Surprise: the sentence that got misused was the one they were proudest of.
- **Karachi as a living lab:** "Walk one street." Act 1, the learner studies a rendered inline-SVG street scene and logs what they notice; Act 2, three residents' accounts of the same street contradict their observation; Act 3, they design the smallest question that would resolve the contradiction. Surprise: the most visible problem is not the one residents rank first.

## SELF-CHECK — state pass or fail on each
1. Time yourself: is there a real interaction within 20 seconds of load, with no prose wall first?
2. Each act is completable alone; `healProgress` fires at 33, 66 and 100.
3. Act 1 contains a genuine, explicable surprise, and the model's matched keywords are shown.
4. In Act 3, at least one previously-correct case actually breaks after a plausible fix — verify by running it, not by assuming.
5. Total file under 150KB; at most three font weights; no images.
6. Urdu text uses `dir="rtl" lang="ur"` with line-height ~2.1 in Noto Nastaliq Urdu. Note the platform's font bundle contains no italic faces, so never style Urdu italic.
7. No storage APIs, no fetch, no AI API, no non-whitelisted CDNs, single file.
8. Fully usable at 360px, no drag-and-drop, all controls ≥44px and keyboard reachable with visible focus.
9. `healComplete` fires exactly once, at the end of Act 3.
10. Honestly re-time the whole thing: does it fit 35 minutes? If it runs long, cut content rather than rushing the learner.
````

#### Check the output

- [ ] Open it and count to twenty. If you are still reading rather than tapping something, it will lose learners in Week 1 — send it back.
- [ ] Check the file size on disk: under 150KB. Learners are paying for the data that downloads this.
- [ ] Finish Act 1, reload the page, and confirm you have only lost Act 1's work, and that the page told you that would happen before you started.
- [ ] In Act 3, add training examples to fix the sewage complaint, then check the before/after table — something that used to be right must now be wrong. If nothing breaks, the central lesson is missing.
- [ ] Show the Urdu complaints to an Urdu reader: the script must render right-to-left with comfortable line spacing, not cramped or reversed.
- [ ] Confirm the training set carries the visible label saying these are example complaints written for training and not real citizen reports.
- [ ] Time a full run. If it exceeds about 40 minutes, cut content rather than telling learners to hurry.


## Ethics dilemma engine, keyed by lens

> Week 1 does not lecture about "integrity". It drops the learner into a Tuesday in Orangi or a Korangi clinic office, gives three defensible options and no villain option, then - two dilemmas later, once they have moved on - tells them what their earlier choice did to someone. That delayed "oh" is the product. They leave holding a short code (HSF1-CD-CABCAB-1BCA-3ACB-4BBA) that is genuinely theirs, carry it through weeks 2-4, and unfold it at the end into a profile plus a portfolio sentence. No ethics score, no leaderboard.

Three verified codebase facts drove the design and are restated verbatim in every prompt that needs them (each prompt lands in a fresh chat with zero shared memory, so repetition is what makes the seven artifacts interoperate). (1) The iframe has no storage, so a ledger cannot persist in a sim - hence a short human-typeable code, redisplayed after every choice, so a load-shedding reload costs at most one dilemma. (2) src/app/api/progress/complete/route.ts does not persist the meta object from healComplete, so no prompt may assume it survives; the on-screen code is the learner's durable record, submissions.answers is the server's. (3) In src/lib/activity.ts, gradeActivity reads points as a plain number, so "points": 0 is schema-legal, scores nothing, and still stores the answer - the clean way to record an ethical choice without pretending one option is correct, and what lets weeks 2-4 feed the ledger through server-graded activities with near-zero marking load.

Deliberately excluded: AI-scored ethics (a model judging a Pakistani undergraduate's moral reasoning is both unreliable and a bad look with Ziauddin); sprawling free-text reflection (30 learners x several modules would bury a two-person team); any dilemma with an obviously evil option, which teaches nothing; branching narrative trees, which multiply authoring cost and break the fixed-length ledger code; and D3/Three for what is fundamentally text and four bars.


<a id="dilemma-bank-by-lens"></a>
### Dilemma Bank - eight Karachi ethics dilemmas for ONE lens (JSON)

**When to use:** First artifact to build. Run it four times, once per lens, to create the source-of-truth content bank every other prompt in this pack consumes.  
**Produces:** A JSON content bank file (ethics-bank-<lens>.json) - NOT an activity spec, NOT HTML

#### Prompt

````text
Follow the IESP Build Contract pasted above.

You are writing the professional-ethics DILEMMA BANK for ONE learner lens of IESP. Ethics here is discipline-specific: a data scientist's dilemma about re-identifying an "anonymised" clinic dataset is NOT a marketer's dilemma about a misleading campaign statistic. Write for that specificity.

LENS FOR THIS RUN: <LENS: Health | Computer Science-Data | Design & Marketing | Entrepreneurial-Finance>
LENS CODE: <CODE: HL | CD | DM | EF>

DELIVER: one JSON file named ethics-bank-<lens>.json. Output the JSON only, no commentary.

=== FIXED SPECS - use exactly these, do not invent your own ===

LEDGER CODE SPEC v1
Format: HSF1-<LENS>-C<5 letters> then up to 3 topic segments.
"C" marks the Week-1 core segment, followed by exactly 5 letters, one per core dilemma E1..E5 in order. Each letter is the option the learner chose (A, B or C).
Topic digits: 1 Water & Environment, 2 Public Health, 3 Urban Safety, 4 Economic Opportunity.
Example: HSF1-CD-CABCAB-1BCA-3ACB-4BBA
Regex: ^HSF1-(HL|CD|DM|EF)-C[A-C]{5}(-[1-4][A-C]{3}){0,3}$
Because codes use A/B/C, every dilemma must have EXACTLY THREE options.

AXIS MAP - four tensions. BOTH poles of each are legitimate professional values.
1 Speed vs Consent
2 Loyalty vs Disclosure
3 Persuasion vs Precision
4 Proximity vs Scale
Each dilemma is assigned exactly one axis. Each option carries "pull": an integer from {-2,-1,1,2}; negative leans to the left pole, positive to the right. The three options must have three DIFFERENT pull values.

DELAYED-CONSEQUENCE TIMING (fixed): E1 surfaces after E3, E2 after E4, E3 after E5, E4 and E5 surface on the closing Ledger screen. Record this in "delayed_surfaces_after" as "E3", "E4", "E5", "LEDGER", "LEDGER".

=== JSON SHAPE (match exactly) ===
{
  "bank_version": "1.0",
  "lens": "<lens_key>",
  "lens_code": "<CODE>",
  "axis_legend": {"1":"Speed vs Consent","2":"Loyalty vs Disclosure","3":"Persuasion vs Precision","4":"Proximity vs Scale"},
  "dilemmas": [
    {
      "slot": "E1",
      "use": "core_week1",
      "axis": 1,
      "title": "short, concrete, no colon",
      "setting": "one line: place, institution, your role",
      "scenario_text": "...",
      "stakeholders": ["who bears the cost", "who benefits"],
      "choice_options": [
        {"letter":"A","label":"...","text":"...","pull":-2,
         "consequence_text":"...",
         "delayed_consequence_text":"...",
         "delayed_surfaces_after":"E3"}
      ],
      "debrief_note": "names the tension, takes no side",
      "sources": ["Named source, year"],
      "urdu_gloss": {"English term":"Urdu gloss"}
    }
  ],
  "axis_map": {"E1":{"axis":1,"pull":{"A":-2,"B":1,"C":2}}}
}
The axis_map block is mandatory - a later artifact reads a ledger code with ONLY this table available, so it must cover every slot.

WRITE 8 DILEMMAS. E1-E5 are the Week-1 core set (use axes 1, 2, 3, 4, then repeat any one). E6-E8 are alternates the team can swap in.

=== KARACHI SEEDS - use ONLY the block matching <LENS>. Develop them; do not restate them. ===
HEALTH: MUAC tapes run out during a PPHI-supported nutrition screening in Gadap and the district report is due; a free eye camp in Lyari finds a condition outside its scope with no referral budget; a measles rumour circulates on a union council health workers' WhatsApp group in Orangi while you hold a partial line list; a relative at a large Karachi hospital informally shares ER records for your class project.
COMPUTER SCIENCE-DATA: a KWSC complaints dataset whose free-text field contains phone numbers and house addresses, and you want to publish a dashboard; a "de-identified" maternal health extract from a Korangi clinic where union council plus age plus delivery date makes rows unique; a dengue-hotspot model that performs badly in Gadap because reporting there is sparse, while the team wants one clean citywide map; scraping a property listings site against its terms of service to estimate displacement near a katchi abadi.
DESIGN & MARKETING: a donor campaign wants a photograph of a child at a tanker queue in Orangi, with verbal but not written consent and a caption implying destitution; a punchy contamination statistic outperforms the narrower claim your actual source supports; a before-and-after visual where the "after" is a different neighbourhood; an Urdu translation that reads better but softens a safety warning.
ENTREPRENEURIAL-FINANCE: your water-testing pilot in Orangi shows a modest effect but the grant template asks for "beneficiaries reached" and counting footfall inflates it several times over; a tanker operator offers to fund the pilot if you drop the price-transparency feature; a facilitation payment would get your survey permission letter in days instead of months; a low-cost filter subscription in Lyari with auto-renew and a hard-to-find cancellation.

=== WORD BUDGETS (this module must fit 32 minutes on a phone) ===
scenario_text 90-140 words. option label max 9 words. option text 20-35 words. consequence_text 70-110 words. delayed_consequence_text 45-80 words. debrief_note 35-60 words. Sentences max 22 words. No idioms, no rhetorical questions.

=== HARD RULES ===
1. NO FABRICATED STATISTICS. Use only figures attributable to a named source (PCRWR, KWSC, PBS, Sindh Bureau of Statistics, WHO, UNICEF, WWF-Pakistan, a named journal article), with source and year inline. Where you do not know a real figure, write a visible [VERIFY: what to check, where to look] marker instead of a plausible-looking number. Prefer dilemmas that turn on judgement, not on magnitude, so few numbers are needed at all.
2. NO VILLAIN OPTION. All three options must be things a competent, decent professional might actually do under real pressure - deadline, hierarchy, funding, family expectation. If one option is obviously wrong, rewrite the dilemma.
3. CONSEQUENCES ARE CAUSAL, NOT MORAL. Say what happened and to whom. Never "you feel guilty", never "this was unethical".
4. CAREFUL CHOICES ALSO COST SOMETHING. At least two of the five core dilemmas must have a consequence where the cautious option produced a real loss (a delay, a missed case, a lost contract).
5. The learner is the analyst or professional inside the situation, never a visitor observing hardship.
6. Institutions may be named. Never portray a real living individual as a wrongdoer - attribute any wrongdoing to a fictional role such as "the district coordinator".
7. Add urdu_gloss entries for the 2-4 hardest English terms per dilemma (for example "informed consent", "re-identification", "conflict of interest").

=== SELF-CHECK before returning - confirm each in one line, then output the JSON ===
[ ] Valid JSON, parses cleanly, every dilemma has exactly 3 options lettered A, B, C.
[ ] axis_map covers all 8 slots and its pull values match the options exactly.
[ ] delayed_surfaces_after values are exactly E3, E4, E5, LEDGER, LEDGER for E1-E5.
[ ] Every number has a named source and year, or a [VERIFY: ...] marker. Zero invented figures.
[ ] Every dilemma is unmistakably <LENS> work - swapping in another discipline's job title would break it.
[ ] No option is a straw man. At least 2 of 5 core dilemmas punish the cautious choice.
[ ] All word budgets respected; longest sentence under 22 words.
[ ] No real living individual is depicted as a wrongdoer.
````

#### Check the output

- [ ] Paste the JSON into any online JSON validator - it must parse with zero errors
- [ ] Read the three options of any dilemma aloud: if you can instantly tell which is 'the right answer', send it back
- [ ] Search the file for digits - every number must sit next to a named source and year, or a [VERIFY: ...] marker
- [ ] Show one dilemma to someone in a different discipline: they should say 'that is a data person's problem, not mine'
- [ ] Check axis_map lists all 8 slots and its pull values match the options letter for letter


<a id="delayed-consequence-weaver"></a>
### Delayed Consequence Weaver - write or repair the second-order layer

**When to use:** After a dilemma bank exists, when the delayed consequences feel thin, preachy, or interchangeable across the three options.  
**Produces:** Rewritten delayed_consequence_text JSON patch plus a consequence-graph markdown table

#### Prompt

````text
Follow the IESP Build Contract pasted above.

The hardest and most valuable part of the IESP ethics engine is the DELAYED CONSEQUENCE: the thing the learner's Week-1 choice does two dilemmas later, once they have stopped thinking about it. Immediate consequences teach caution; delayed consequences teach systems thinking. Most drafts get this wrong in the same way - they moralise, or all three options end in roughly the same place, which quietly tells the learner the choice never mattered.

Your job: take the dilemma bank below and rewrite ONLY the delayed_consequence_text values, then audit the result.

PASTE OF THE BANK:
<PASTE THE FULL ethics-bank-<lens>.json HERE>

FIXED TIMING (do not change): E1 surfaces after E3, E2 after E4, E3 after E5, E4 and E5 surface on the closing Ledger screen ("LEDGER"). A delayed consequence is read roughly 8-12 minutes after the choice that caused it, on a phone, by someone mid-flow. Budget: 45-80 words. Must be understandable in about 20 seconds without re-reading the original scenario, so open with a 5-8 word anchor that reminds them what they chose ("The estimated MUAC figures you approved...").

=== WHAT A GOOD DELAYED CONSEQUENCE IS ===
It must be a genuine SECOND-ORDER effect - something that happens because of what the first-order consequence set in motion. Use one of these five families and mark which you used:
- INSTITUTIONAL: a policy, budget line, or standard operating procedure hardens around your choice.
- STATISTICAL: your number propagates into someone else's denominator, forecast, or allocation.
- RELATIONAL: a person or organisation changes what they will share with you or with anyone like you next time.
- PRECEDENT: a junior colleague, or you yourself, treats your choice as the new normal in a harder case.
- ABSENCE: something that should have happened does not, and nobody connects it to you - the learner sees the link, the characters do not.
PREFER absence and statistical effects for the Precision and Consent axes; they are the least preachy and the most true to how these failures actually work in Karachi's data and health systems.

=== WHAT IT MUST NOT BE ===
- Not a verdict. Never "this was wrong", "you compromised your integrity", "you learned an important lesson".
- Not karma. Do not punish the shortcut and reward the careful option every time. At least ONE delayed consequence in the set must show a cautious, correct-by-the-book choice producing a real downstream cost - a delayed alert, a family that gave up on the referral, a grant not renewed because the honest number looked unimpressive.
- Not a new dilemma. It reports, it does not ask.
- Not a new statistic. If a figure is needed and you cannot attribute it to a named source with a year, write [VERIFY: what to check, where to look] instead. Realistic-but-invented numbers destroy credibility with our university partner and are the single worst failure mode in this project.
- Not identical across options. If A, B and C all end in roughly the same downstream state, the dilemma is fake - flag it.

=== DELIVER, IN THIS ORDER ===
1. A JSON patch: an array of {"slot", "letter", "delayed_consequence_text", "family"} objects covering every slot and letter in the bank. Valid JSON, nothing else in that block.
2. A CONSEQUENCE GRAPH markdown table with columns: Slot | Axis | Surfaces after | A leads to | B leads to | C leads to | Divergence. Each "leads to" cell is at most 12 words. Divergence is HIGH, MEDIUM or LOW.
3. A FLAGS section: list every slot scoring MEDIUM or LOW divergence, say in one sentence why the options collapse together, and propose one concrete rewrite of the scenario (not the consequence) that would make them genuinely diverge.
4. A KARMA BALANCE line: state which slot and letter is the cautious-choice-that-cost-something, and quote it.

=== SELF-CHECK before returning ===
[ ] Every slot and letter in the pasted bank has a rewritten delayed consequence - none skipped.
[ ] Each is 45-80 words, opens with a 5-8 word anchor to the original choice, and is tagged with one of the five families.
[ ] At least one cautious choice carries a real downstream cost, and it is named explicitly in the KARMA BALANCE line.
[ ] No verdicts, no guilt language, no rhetorical questions.
[ ] Zero new numbers without a named source and year; otherwise a [VERIFY: ...] marker is present.
[ ] Consequence graph covers every slot; every MEDIUM or LOW row appears in FLAGS with a proposed scenario rewrite.
[ ] The JSON patch block parses as valid JSON on its own.
````

#### Check the output

- [ ] Read the Divergence column: if more than one or two rows are MEDIUM or LOW, the dilemmas themselves need fixing before you build the sim
- [ ] Confirm the KARMA BALANCE line exists and actually names a cautious choice that cost something - without it the module reads as moralising
- [ ] Read three delayed consequences cold, without re-reading the scenario: you should still know which choice caused them
- [ ] Search for the words 'wrong', 'should have', 'integrity', 'lesson' - any hit means it slipped into preaching
- [ ] Check the JSON patch block pastes into a validator cleanly and covers every slot and letter


<a id="lens-crosswalk-antiwash"></a>
### Lens Crosswalk - turn one dilemma into four genuinely different ones

**When to use:** When you have a strong dilemma in one lens and need real siblings for the other three, instead of the same story with the job title swapped.  
**Produces:** Three new dilemma JSON objects plus a lens-authenticity audit table

#### Prompt

````text
Follow the IESP Build Contract pasted above.

IESP learners pick ONE lens at onboarding: Health, Computer Science-Data, Design & Marketing, or Entrepreneurial-Finance. The ethics content is keyed to that lens. The failure mode we are guarding against is LENS-WASHING: taking one scenario and swapping the job title, so a marketer and a data scientist face what is really the same dilemma wearing different clothes. That is worse than no lens at all, because paying learners notice immediately.

SOURCE DILEMMA (already written for one lens):
<PASTE ONE FULL DILEMMA JSON OBJECT HERE>
ITS LENS: <SOURCE LENS>

TASK: produce genuine sibling dilemmas for the other THREE lenses, sharing only the underlying ethical tension and the Karachi setting. Everything else must change.

=== THE ANTI-WASH TEST - apply to every sibling before you keep it ===
If you could change the job title in the sibling back to the source lens and nothing else in the scenario would have to change, it is lens-washing. Rewrite it. Four things must genuinely differ per lens:
1. THE ARTIFACT THE LEARNER CONTROLS. Health: a clinical decision, a referral, a screening record. CS-Data: a dataset, a join key, a model, a published dashboard. Design & Marketing: a claim, an image, a caption, an Urdu translation. Entrepreneurial-Finance: a budget line, a price, a grant report field, a term sheet.
2. THE TECHNICAL DETAIL THAT MAKES IT HARD. The sibling must contain one specific, correct discipline detail a practitioner would recognise - a quasi-identifier combination, a referral pathway, a claim-substantiation standard, a unit-economics or cost-recovery constraint. Without this the dilemma is generic.
3. THE PROFESSIONAL NORM INVOKED. Health: informed consent, scope of practice, duty to refer, PMC code of ethics [VERIFY: current name and clause, Pakistan Medical Commission]. CS-Data: re-identification risk, documented model limitations, terms of service, Pakistan's data protection law [VERIFY: exact status, name and year of the Personal Data Protection legislation]. Design & Marketing: substantiation of advertised claims, image consent and dignity, equivalence between the English and Urdu versions of a claim. Entrepreneurial-Finance: accuracy in donor and grant reporting, conflict-of-interest disclosure, fair consumer terms, anti-bribery.
4. WHO HAS POWER OVER THE LEARNER. A supervising clinician, a product manager, a client's brand lead, an investor or grants officer - the pressure should feel different in each.

=== KARACHI GROUNDING ===
Keep the shared setting real: Orangi, Lyari, Korangi, Malir, Gadap, DHA, Saddar; KWSC, KMC, Sindh Solid Waste Management Board, PPHI Sindh, Ziauddin University, large Karachi hospitals; the tanker economy, katchi abadis, informal settlements and informal labour. Learners are analysts solving a problem, never tourists observing hardship. Do not portray any real living individual as a wrongdoer.

=== OUTPUT FORMAT ===
Part 1 - JSON: three dilemma objects matching the source object's schema field for field (slot, use, axis, title, setting, scenario_text, stakeholders, choice_options with letter, label, text, pull, consequence_text, delayed_consequence_text, delayed_surfaces_after, plus debrief_note, sources, urdu_gloss). Keep the same axis and the same three pull values as the source so the ledger code stays comparable across lenses. Exactly three options, lettered A, B, C. Same word budgets as the source: scenario_text 90-140 words, consequence_text 70-110, delayed 45-80.
Part 2 - AUDIT TABLE, markdown, one row per lens including the source, columns: Lens | Artifact controlled | Hard technical detail | Professional norm | Who holds power | Anti-wash verdict (PASS or REWRITE) | If REWRITE, why.
Part 3 - one short paragraph naming the single ethical tension all four share, in plain language, max 60 words.

=== HARD RULES ===
No fabricated statistics: any figure needs a named source and year, or a [VERIFY: what to check, where to look] marker. No villain options - all three choices in every sibling must be things a competent, decent professional might really do. Sentences max 22 words; no idioms; write for a bilingual reader whose academic English is strong but not first-language.

=== SELF-CHECK before returning ===
[ ] Three siblings produced, all matching the source schema field for field, all parsing as valid JSON.
[ ] Each sibling passes the anti-wash test on all four dimensions, and the audit table says PASS for each.
[ ] Each sibling contains one specific discipline detail a practitioner would recognise as correct - or a [VERIFY: ...] marker where I am unsure.
[ ] Axis and the three pull values match the source exactly.
[ ] Every number is sourced or marked [VERIFY: ...]; zero invented figures.
[ ] Karachi references are real places and institutions; no poverty-porn framing; no real individual named as a wrongdoer.
````

#### Check the output

- [ ] Cover the job titles and read all four scenarios: if you cannot tell them apart, it is lens-washing and must go back
- [ ] Check the audit table has a filled Hard technical detail cell for each lens - a vague one means the dilemma is generic
- [ ] Confirm axis and the three pull values are identical to the source, or the ledger comparison across lenses breaks
- [ ] Ask someone from each discipline whether their version sounds like their actual working life
- [ ] Verify every [VERIFY: ...] marker before publishing, especially the data protection law and PMC clause references


<a id="week1-core-ethics-sim"></a>
### Week 1 core ethics engine - the interactive simulation (HTML)

**When to use:** To build the compulsory Week 1 ethics module - the single artifact most responsible for whether learners stay past week one.  
**Produces:** One self-contained HTML simulation for public/simulations/

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build the Week 1 COMPULSORY ethics module for IESP as ONE self-contained HTML file named ethics-engine-<lens>.html. This is the hands-on replacement for an ethics lecture, and Week 1 is where cohorts lose people. It must feel like a real job, on a phone, in 32 minutes.

CONTENT: paste the dilemma bank below verbatim as a single const at the top of your script. Do not rewrite its text, do not add dilemmas, do not invent numbers.
<PASTE THE FULL ethics-bank-<lens>.json HERE>

=== SANDBOX RULES MOST LIKELY TO BITE THIS BUILD - restating deliberately ===
1. localStorage, sessionStorage, cookies and IndexedDB all THROW here. Not "fail silently" - throw, and kill your script. Do not touch them, not even inside try/catch. All state lives in one plain JS object for the session only.
2. A page reload wipes everything, and load-shedding reloads are normal for our learners. So after EVERY choice, render the learner's partial ledger code in a small sticky bar at the top, inside a readonly input they can select and copy. navigator.clipboard is likely to reject in this sandbox - wrap any copy button in try/catch and treat the selectable input as the real mechanism, never as the fallback.
3. beforeunload dialogs will not show (no allow-modals). Do not rely on them. Use a quiet inline line: "Your code is above. Copy it now if your connection is unstable."
4. No libraries. Plain vanilla JS and CSS - no D3 or Three needed for this. One Google Fonts link only: Bricolage Grotesque 700 plus Inter 400 and 600. Mobile data costs our learners money; keep the whole file under about 120 KB and use inline SVG only.

=== SCREEN FLOW ===
1. INTRO (about 60 seconds of reading). States plainly: 5 situations, about 32 minutes, there are no correct answers and nothing here is scored, your choices produce a code you keep and reuse later in the programme. Show the estimated time honestly.
2. DILEMMA CARD, five times, slots E1 to E5 in order: title, setting line, scenario_text, then the three options as full-width tappable cards. Use a real fieldset with a legend and three input type=radio elements with real labels - styled, never replaced by divs. Minimum 44px tap targets. No hover-only behaviour anywhere.
3. CONSEQUENCE CARD, immediately after each choice: heading "What happened", the chosen option's consequence_text, then the debrief_note under a heading "The tension here". A "Continue" button.
4. UPDATE CARD: before E4 show E1's delayed consequence, before E5 show E2's. Heading "Two weeks later" plus a short text label - never colour alone to signal that this is a delayed effect. After E5, show E3's, then E4's and E5's on the ledger screen.
5. LEDGER SCREEN: the full code in a large readonly input; a plain-language recap listing each dilemma, what they chose, and one line of what followed; the four axes shown as simple labelled positions with BOTH poles named as legitimate values (Speed and Consent are both professional virtues); and the instruction to save this code for weeks 2-4.

=== PLATFORM INTEGRATION ===
Call window.healProgress(20/40/60/80/100) after each completed dilemma. Call window.healComplete(100, meta) EXACTLY ONCE, when the ledger screen renders, where meta is {ledgerCode, choices, axisTotals}. This module is completion-based, not correctness-based: always report 100 for a genuine finish, never a moral score. Do NOT assume meta is stored anywhere - the on-screen code is the durable record, so it must be prominent and copyable.

=== WRITING AND ACCESSIBILITY ===
Use the bank's text verbatim. Where the bank supplies urdu_gloss entries, render the Urdu term inline in a span with lang="ur" dir="rtl", font-family Noto Nastaliq Urdu, line-height 2.1. Semantic HTML throughout; move focus to each new card's heading on transition; announce consequence cards with aria-live="polite"; visible focus rings; text contrast at least 4.5:1. Works at 360px with no horizontal scroll. Progress shown as "Situation 3 of 5" in text, not only as a bar.

=== SELF-CHECK before returning ===
[ ] Zero references to localStorage, sessionStorage, cookies or IndexedDB anywhere in the file.
[ ] No external resources except the single Google Fonts link. No images. Under about 120 KB.
[ ] healComplete called exactly once, with 100, on the ledger screen; healProgress called after each dilemma.
[ ] The partial ledger code is visible and selectable from after the first choice onward.
[ ] Ledger code matches ^HSF1-(HL|CD|DM|EF)-C[A-C]{5}$ and its letters match the choices in E1..E5 order.
[ ] Delayed consequences fire at exactly E4, E5, after E5, and the ledger screen.
[ ] Every option is a real radio input with a real label; all tap targets at least 44px; nothing depends on hover.
[ ] No horizontal scroll at 360px; keyboard alone can complete the whole module; focus is always visible.
[ ] Not one word of scenario text was rewritten, and not one number was added.
[ ] Read the intro aloud, timed - the stated 32 minutes is honest.

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] Open the file on a real phone at 360px and finish it with one thumb - no horizontal scroll, no missed taps
- [ ] Reload the page halfway through: you should lose progress but the partial code you copied should still be usable
- [ ] Search the file for 'localStorage', 'sessionStorage', 'cookie', 'indexedDB' - zero hits, or it will crash in the iframe
- [ ] Search for 'src="http' and 'href="http' - the only hits allowed are fonts.googleapis.com and fonts.gstatic.com
- [ ] Complete it with keyboard only (Tab and Space) and confirm you can always see where focus is
- [ ] Time yourself: if it takes over 40 minutes, cut a dilemma rather than shortening the consequences


<a id="topic-microdilemma-activity"></a>
### Topic micro-dilemmas that feed the ledger (graded activity JSON)

**When to use:** For weeks 2-4: three short dilemmas embedded in each topic, so the ledger keeps growing without adding a new simulation or a marking pile.  
**Produces:** A native activity JSON spec to paste into the admin panel

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build a NATIVE GRADED ACTIVITY (JSON spec, not HTML) containing three short professional-ethics micro-dilemmas embedded inside one IESP topic. Purpose: weeks 2-4 must keep feeding the learner's Consequence Ledger without a second simulation and without generating essays a two-person team cannot mark.

TOPIC: <TOPIC: Water & Environment | Public Health | Urban Safety | Economic Opportunity>
TOPIC DIGIT: <DIGIT: 1 | 2 | 3 | 4>
LENS: <LENS: Health | Computer Science-Data | Design & Marketing | Entrepreneurial-Finance>
LENS CODE: <CODE: HL | CD | DM | EF>

=== THE KEY TECHNIQUE - read this twice ===
An ethical choice has no correct answer, but every non-essay question type in our engine is auto-scored. The solution: a question with "points": 0 is fully schema-legal, contributes nothing to the score, and its answer is still stored for us. So each dilemma is recorded as an mcq with "points": 0. The schema still requires an "answer" field on an mcq - set it to the index of the option you consider most defensible and add "(records your choice; not scored)" at the end of the prompt text so the learner is not misled. The SCORED questions are the reasoning questions that follow.

=== EXACT SCHEMA - match this miniature example field for field ===
{
  "intro": "Three decisions from real <TOPIC> work. Your choices are recorded, not marked. At the end you will get three letters to add to your ledger code.",
  "pass_score": 70,
  "questions": [
    {"id":"d1","type":"mcq","points":0,"prompt":"...scenario... What do you do? (records your choice; not scored)","options":["A ...","B ...","C ..."],"answer":1},
    {"id":"d1r","type":"mcq","prompt":"Whichever you chose, who bears the cost first?","options":["...","...","..."],"answer":2},
    {"id":"q5","type":"multi","prompt":"Which two are second-order effects rather than immediate ones?","options":["...","...","...","..."],"answers":[1,3]},
    {"id":"q6","type":"matching","prompt":"Match each decision to the professional duty it strains.","left":["...","..."],"right":["...","..."],"pairs":{"0":1,"1":0}},
    {"id":"q7","type":"order","prompt":"Put these steps in the order a careful practitioner would take them.","items":["...","...","..."],"correctOrder":[1,0,2]},
    {"id":"q8","type":"numeric","prompt":"...","answer":3,"tolerance":0,"unit":"households"},
    {"id":"essay","type":"essay","minWords":80,"prompt":"..."}
  ]
}
Use exactly these type names and field names. matching pairs keys are STRINGS. Essays are not auto-scored, only checked against minWords.

=== WHAT TO WRITE ===
Three micro-dilemmas, slots D1, D2, D3, each set in real <TOPIC> work in Karachi and unmistakably a <LENS> problem - the artifact the learner controls must be a <LENS> artifact (a dataset and its join keys; a clinical or screening decision; a claim, image or Urdu caption; a budget line, price or grant-report field). Scenario text 70-110 words each, embedded directly in the mcq prompt. Exactly three options, prefixed "A ", "B ", "C " so the letters map to the ledger. All three must be defensible under real pressure; no villain option.
Then 6 to 8 SCORED objective questions total across mcq, multi, matching, order and numeric - testing whether the learner can identify who bears a cost, distinguish first- from second-order effects, match a decision to the professional duty it strains, and sequence a defensible process. Objective questions DO have correct answers; make them about analysis, never about which choice was morally right.
Then exactly ONE essay, minWords 80, whose prompt states its three-point rubric inline: (1) names the specific second-order effect of the choice you actually made, (2) names one thing you would need to know before making the same call again, (3) names who you would tell and when. Cap it there - one tight essay, never more.
Finally, the intro must end with the ledger instruction: "Add <DIGIT> followed by your three letters to your ledger code. Example: <DIGIT>BAC".

=== KARACHI AND SOURCING ===
Use real places and institutions - Orangi, Lyari, Korangi, Malir, Gadap, DHA, Saddar; KWSC, KMC, Sindh Solid Waste Management Board, PPHI Sindh, Ziauddin University; the tanker economy, katchi abadis, informal labour. Learners are analysts, never observers of hardship. Every figure needs a named source and year (PCRWR, PBS, Sindh Bureau of Statistics, WHO, UNICEF, WWF-Pakistan, a named journal article) or a visible [VERIFY: what to check, where to look] marker. Numeric questions must be answerable from arithmetic on figures given inside the question itself, so no invented external statistic is needed. Total reading load must fit 20-25 minutes on a phone; sentences max 22 words.

=== SELF-CHECK before returning ===
[ ] Output is one valid JSON object, parses cleanly, no trailing commas, no comments.
[ ] Every question has a unique id; the three dilemma mcqs all carry "points": 0 and an "answer" index, and say "records your choice; not scored".
[ ] 6-8 scored objective questions present; every one has a defensible single correct key, and none asks which choice was morally right.
[ ] Exactly one essay, minWords 80, with all three rubric points stated in its prompt.
[ ] Options are prefixed A, B, C so ledger letters are unambiguous; matching pairs keys are strings.
[ ] pass_score is 70; intro ends with the ledger instruction including the <DIGIT> example.
[ ] Every figure is sourced with a year or marked [VERIFY: ...]; numeric answers are computable from the question text.
[ ] Content is unmistakably <LENS> work inside <TOPIC>; reading load fits 20-25 minutes.
````

#### Check the output

- [ ] Paste into a JSON validator, then into the admin panel - it must save without a schema error
- [ ] Confirm each of the three dilemma questions has "points": 0, or learners will be silently marked wrong for a moral choice
- [ ] Do the activity yourself and check you finish in 20-25 minutes on a phone
- [ ] Check every scored question has one genuinely defensible key - if you argue with any of them, learners will too
- [ ] Confirm the intro tells the learner exactly what to append to their ledger code, with the example


<a id="consequence-ledger-closing"></a>
### The Consequence Ledger - closing reflection simulation (HTML)

**When to use:** At the end of the programme, to turn the code a learner has carried for four weeks into a profile and a portfolio-ready statement.  
**Produces:** One self-contained HTML simulation for public/simulations/

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build the CONSEQUENCE LEDGER, one self-contained HTML file named consequence-ledger.html. It is the closing ethics artifact of IESP: the learner pastes the code they have carried since Week 1, and it reflects their pattern of choices back at them - then hands them something they can show an employer.

=== THE CODE IT READS ===
Format: HSF1-<LENS>-C<5 letters> then 0 to 3 topic segments.
LENS: HL Health, CD Computer Science-Data, DM Design & Marketing, EF Entrepreneurial-Finance.
"C" plus exactly 5 letters (A/B/C) = Week-1 core dilemmas E1..E5 in order.
Topic segments: digit then 3 letters. 1 Water & Environment, 2 Public Health, 3 Urban Safety, 4 Economic Opportunity.
Example complete: HSF1-CD-CABCAB-1BCA-3ACB-4BBA. Example Week 1 only: HSF1-DM-CBACA.
Regex: ^HSF1-(HL|CD|DM|EF)-C[A-C]{5}(-[1-4][A-C]{3}){0,3}$
Before validating, uppercase the input, strip all spaces, and tolerate missing hyphens by reinserting them at the known segment boundaries. Learners type this on a phone; be forgiving. On failure, say precisely what is wrong ("this needs 5 letters after the C, you have 4"), never just "invalid".

=== THE INTERPRETATION TABLES ===
Paste these as consts at the top:
<PASTE THE axis_map BLOCK FROM ethics-bank-<lens>.json HERE>
<PASTE THE axis_map BLOCKS FROM EACH TOPIC MICRO-DILEMMA SET HERE>
Axes, both poles legitimate: 1 Speed vs Consent, 2 Loyalty vs Disclosure, 3 Persuasion vs Precision, 4 Proximity vs Scale. Each choice contributes its pull (-2 to +2) to its axis. Also paste a one-line summary per slot and letter so the page can quote the learner's actual choices back to them - a profile with no specifics is astrology.

=== SANDBOX RULES MOST LIKELY TO BITE THIS BUILD ===
1. No localStorage, sessionStorage, cookies or IndexedDB - they THROW in this iframe and will kill your script. Everything lives in one JS object for the session.
2. navigator.clipboard will probably reject here. Every copyable output must sit in a readonly textarea or input the learner can select; a copy button is a try/catch nicety, never the mechanism.
3. No libraries. D3 is permitted by the contract but do not use it - four labelled bars are plain SVG or CSS, and mobile data costs our learners money. One Google Fonts link: Bricolage Grotesque 700 plus Inter 400 and 600.

=== SCREENS ===
1. ENTER: one large input, a clear label, an example code shown as text, and a "See a sample ledger" button that loads a built-in demo code so the page can be demonstrated without one. Explain in one line what this page does and that it is not a test.
2. PROFILE: for each of the four axes, a horizontal position indicator with BOTH poles named as legitimate professional values, the learner's position marked, AND a text label of the position ("leans toward Consent") - never colour or position alone. Under each axis, quote the 1-2 specific choices that produced it. Then a "What followed" list of the delayed consequences their choices triggered, in plain language.
3. STATEMENT: compose a 5-6 sentence "Ethical Practice Statement" by template composition from their actual pattern - never invent facts about the person. Put it in an editable textarea they can revise and copy, with one line explaining they can paste it into their capstone or their profile.

=== TONE - the thing most likely to go wrong ===
This page reflects; it does not grade. Absolutely no ethics score, no percentage, no grade, no leaderboard, no "you tended to make the wrong call". Every axis position must be describable as a defensible professional stance with a named trade-off. Where a pattern is genuinely risky, name the risk in operational terms ("a consistent lean toward Speed means you will need a colleague who checks consent"), not moral ones.

=== PLATFORM AND ACCESSIBILITY ===
Call window.healComplete(100, meta) exactly once, after a valid code is decoded and the profile has rendered, with meta {ledgerCode, axisTotals}. Do not assume meta is stored - the visible statement is what the learner keeps. Semantic HTML, real labels, aria-live on the decode result, focus moved to the profile heading, visible focus rings, 4.5:1 contrast, 44px tap targets, works at 360px, no hover-only behaviour, under about 100 KB, no images.

=== SELF-CHECK before returning ===
[ ] Zero storage APIs referenced anywhere in the file.
[ ] All five example codes above decode correctly, including the Week-1-only partial code.
[ ] Lowercase input, extra spaces and missing hyphens are all accepted; error messages say exactly what is wrong.
[ ] The demo button works with no code entered.
[ ] Zero scores, grades, percentages or verdicts anywhere in the copy - search the file for "score", "grade", "%" to confirm.
[ ] Every axis states both poles as legitimate and carries a text label, not just a marker position.
[ ] The profile quotes the learner's actual choices; nothing generic.
[ ] The statement is composed from their pattern only and invents no facts about them.
[ ] healComplete called exactly once with 100; no external resources except the Google Fonts link.
[ ] No horizontal scroll at 360px; fully keyboard operable.

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] Test with a complete code, a Week-1-only code, a lowercase code, one with spaces and one with a wrong letter count - all five must behave sensibly
- [ ] Press the demo button with an empty field: a full sample ledger should render, so you can show this to Ziauddin without a real learner
- [ ] Search the file for 'score', 'grade' and '%' - any learner-facing hit means it started grading ethics
- [ ] Read your own generated Ethical Practice Statement and ask whether you would put it on LinkedIn
- [ ] Confirm each axis names both poles as legitimate and shows a text label, not just a coloured marker


<a id="ethics-review-rubric"></a>
### Ethics essay review kit - 90-second rubric, feedback bank, plain-language pass

**When to use:** Before the cohort starts, so the one tightly-scoped essay per module stays markable by two people instead of becoming a backlog.  
**Produces:** A markdown operations document for the review team

#### Prompt

````text
Follow the IESP Build Contract pasted above.

IESP has roughly 30 learners in cohort 1 and no teaching staff to absorb marking. Each ethics module contains exactly ONE essay (minWords 80), stored for human review; everything else is scored by the server. Write the REVIEW KIT that makes those essays markable in about 90 seconds each, consistently, by two non-specialist reviewers.

INPUTS:
<PASTE THE ESSAY PROMPTS FROM YOUR ETHICS MODULES HERE>
ESSAY RUBRIC POINTS THE PROMPTS ASK FOR: (1) names the specific second-order effect of the choice they made, (2) names one thing they would need to know before making the same call again, (3) names who they would tell and when.

DELIVER a single markdown document with these sections and nothing else.

1. THE RUBRIC. Exactly three criteria, matching the three points above. Four levels each: 0 absent, 1 generic, 2 specific, 3 specific and consequential. Each cell gets a one-line observable descriptor a reviewer can check without re-reading the scenario - describe what is ON THE PAGE, not what the learner "understands". Total out of 9. State the pass line and justify it in one sentence.

2. ANCHOR EXAMPLES. For each criterion, one level-1 and one level-3 example answer, 60-90 words each. Write them as genuine Pakistani undergraduate prose - competent academic English that is not first-language, occasional slightly formal construction, real Karachi specifics. Do NOT write polished native-speaker prose; reviewers calibrate against these and over-polished anchors will fail everyone unfairly. Add one line under each explaining precisely what moved it between levels.

3. THE 90-SECOND PROTOCOL. A numbered sequence a reviewer follows per essay: what to read first, what to skim, where to look for each criterion, when to stop reading. Include a time budget table: 30 learners x <NUMBER OF ESSAY MODULES> essays x 90 seconds, converted to reviewer-hours, split across two reviewers, with a realistic suggestion for how to spread it across a week.

4. FEEDBACK BANK. Exactly 12 reusable feedback lines, each 15-30 words, mapped to specific rubric cells, so reviewers paste rather than compose. Written directly to the learner, warm, concrete, never scolding. At least four must point to a specific next action.

5. RED FLAGS - ESCALATE, DO NOT MARK. A checklist covering: real patient, client or personal data disclosed in an essay; a named real living individual accused of wrongdoing; a disclosure that suggests the learner is currently in an unsafe situation; a credible allegation about a partner institution; and signs of unedited AI generation (absence of any Karachi specific, generic institution names, uniform paragraph rhythm, no first-person decision). For each, one line on what the reviewer does next, who they tell, and what they must not write back. Note explicitly where a mandatory-reporting or data-protection duty might apply and mark it [VERIFY: check current Pakistani law and Ziauddin University policy before publishing this section] - do not state a legal duty you cannot source.

6. PLAIN-LANGUAGE PASS. Rewrite rules the content team applies to every ethics scenario before publishing: sentences max 22 words; one idea per sentence; no idioms or sporting metaphors; define any unavoidable technical term inline at first use; prefer concrete Karachi nouns over abstractions. Then a table of 12 unavoidable ethics terms used across the modules with a plain-English definition (max 15 words) and an Urdu gloss, noting that Urdu must render with lang="ur" dir="rtl", Noto Nastaliq Urdu, line-height 2.1. Where you are not confident an Urdu gloss is the term Pakistani professionals actually use, write [VERIFY: confirm with an Urdu-speaking reviewer].

7. CONSISTENCY CHECK. A 20-minute calibration exercise for the two reviewers to run before marking anything: three sample essays to score independently, what agreement level is acceptable, and what to do when they disagree.

CONSTRAINTS: no invented statistics anywhere; no legal claims without a source or a [VERIFY: ...] marker. Written for a smart non-specialist reviewer, not an academic. Total document under 1800 words - a kit nobody reads is worthless.

=== SELF-CHECK before returning ===
[ ] Exactly three rubric criteria, four levels each, every descriptor observable on the page rather than inferred.
[ ] Anchor examples read like real Pakistani undergraduate writing, not polished native prose, and each carries its one-line explanation.
[ ] The time budget table shows real numbers and totals honestly - if 90 seconds is not achievable, say so and cut a criterion.
[ ] Exactly 12 feedback lines, each mapped to a rubric cell, at least four naming a next action.
[ ] Red flags section names the action, the person to tell, and what not to write back, for every flag.
[ ] Every legal or policy claim carries a source or a [VERIFY: ...] marker.
[ ] Every Urdu gloss is either confident or marked [VERIFY: confirm with an Urdu-speaking reviewer].
[ ] Under 1800 words total.
````

#### Check the output

- [ ] Mark three real or invented essays against the rubric with a stopwatch - if it takes over two minutes each, cut a criterion
- [ ] Have a second person mark the same three essays and compare: more than one point of disagreement per essay means the descriptors are too vague
- [ ] Read the anchor examples aloud - if they sound like a native-speaker academic, they will make your cohort look worse than it is
- [ ] Confirm every legal or mandatory-reporting statement carries a [VERIFY: ...] marker, and clear them with Ziauddin before the cohort starts
- [ ] Check the time budget table maths against your actual cohort size and module count


## Assessment, rubrics and grading leverage

> Designed around one operational fact: ~30 learners, no grading staff, and a platform whose essay questions are stored-not-scored. So the pack's spine is "push assessment load upstream into objective questions and template design, and keep exactly one tightly-scoped essay per module."

I read the actual grading engine (src/lib/activity.ts) and the runner (src/components/activity-runner.tsx) rather than trusting the summary schema, and found five behaviours that silently break naive activity specs. Every prompt that touches JSON now enforces them: (1) matching and order give PARTIAL credit while mcq/multi/numeric are all-or-nothing, so a 5-option multi with 3 correct answers is far harsher than it looks; (2) essays add ZERO points but gate passing via the word-count check, so a high minWords is an invisible hard block; (3) a spec with no objective questions auto-scores 100 on word count alone — never ship essay-only; (4) nothing is shuffled and the order question's default student answer is the identity sequence, so correctOrder [0,1,2] hands out free marks; (5) retries are unlimited, answers persist, and per-question ✓/✗ is revealed after each submit, so a 3-option MCQ is brute-forceable in three submissions. That last one drove a real design rule across the pack: prefer matching/order/numeric, whose answer spaces are large, over short MCQs.

What a student actually feels: Week 1 checkpoints that take five minutes and never make them write an essay (prompt 6) — because the drop-off risk is week 1 and nothing kills a paying learner faster than a wall of free-writing on day two. From week 2 they meet the structured response template (prompt 4), which caps them at ~160 words but demands a named union council, a named institution, and an indicator with a publisher — concrete, finishable on a phone during load-shedding, and honest about what "good" means because the rubric is published to them in advance. They get feedback in 72 hours that quotes their own words back (prompt 8), which is the thing that makes a PKR 2,000 program feel real.

Deliberately excluded: anything resembling AI plagiarism detection as a punitive mechanism. Detectors are unreliable and disproportionately flag second-language English writers — precisely this cohort. The AI first-pass grader (prompt 5) is explicitly forbidden from scoring English fluency, and flags only for human conversation, never auto-penalty. Also excluded: 1-5 Likert rubrics (unreliable in untrained hands — everything becomes a 3), sprawling multi-essay assessments, and any peer-review design where peer scores decide pass/fail. Peer review here is a triage signal that tells the team which submissions to read first, which is where its actual leverage is.

The prompts are parameterised with <ANGLE BRACKETS> so one prompt serves all four topics and all four lenses, but each carries a lookup table of real Karachi anchors (Orangi's tanker economy and the Orangi Pilot Project precedent, PPHI basic health units and XDR typhoid in Sindh, the Korangi Causeway dumper-motorcycle conflict with Edhi/Chhipa rather than state EMS, home-based women workers under the Sindh Home-Based Workers Act 2018) so the output is specific rather than generic. Every factual claim path is forced through the [VERIFY: ...] discipline.


<a id="topic-activity-json-builder"></a>
### Build a server-graded activity JSON for a topic module

**When to use:** When a topic simulation exists and you need the graded checkpoint that sits immediately after it.  
**Produces:** One valid activity JSON spec (pasted into admin) plus a private answer-rationale sheet for the team

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build ONE native graded activity JSON spec — the checkpoint a learner completes straight after finishing a simulation.

PARAMETERS
- Topic: <TOPIC: Water & Environment | Public Health | Urban Safety | Economic Opportunity>
- Simulation just completed: <SIM FILENAME e.g. karachi-water-intelligence.html>
- Learner lens: <LENS: Health | Computer Science / Data | Design & Marketing | Entrepreneurial / Finance>
- Week: <2 | 3 | 4>
- Target time: 12 minutes total. Design to actually fit that.

SCENARIO ANCHOR — use the row matching <TOPIC>. Do not invent a different setting.
- Water & Environment: a union council in Orangi where piped KWSC supply arrives two days a week and most households buy from private tankers filled at hydrants; the Orangi Pilot Project's component-sharing sewerage model is the local precedent; local groundwater is not a safe fallback.
- Public Health: a PPHI-run basic health unit in the Gadap catchment seeing a cluster of typhoid cases in under-10s before monsoon; drug resistance changes the treatment ladder; Lady Health Workers are the outreach layer; Indus Hospital and Aga Khan are the referral and lab tier.
- Urban Safety: a stretch of the Korangi Causeway corridor where dumper and container traffic mixes with motorcycles at peak hours; ambulance response is largely Edhi and Chhipa rather than a unified state EMS; KMC, Karachi Traffic Police and the Sindh Solid Waste Management Board each own one piece and nobody owns the whole.
- Economic Opportunity: home-based women workers in Baldia and Korangi doing piece-rate stitching and packing through middlemen; the Sindh Home-Based Workers Act 2018 exists on paper; registration, piece-rate transparency and access to formal finance are the levers; NAVTTC and Sindh TEVTA are the state skills programmes in range.

The learner is an analyst advising a named decision-maker in that scenario. Never frame them as an observer of suffering. Never write a question whose subject is how poor someone is.

ENGINE RULES THAT WILL SILENTLY RUIN THIS SPEC (all verified against the live grader):
1. Nothing is shuffled. Options, matching right-hand lists and order items render exactly as authored.
2. For an "order" question the student's starting answer is the items in authored sequence. If correctOrder is [0,1,2,...] a learner who touches nothing scores full marks. Author items scrambled; correctOrder must never be the identity sequence.
3. "matching" and "order" award partial credit. "mcq", "multi" and "numeric" are all-or-nothing — "multi" requires the exact set, so keep correct answers to 2 or 3 out of 4 or 5 options.
4. Essays score ZERO points. They are a pass gate only: if the word count is not met the learner cannot pass even with every objective question right. Include exactly ONE essay, minWords between 70 and 110.
5. A spec with no objective questions auto-scores 100 on word count alone. Never ship essay-only.
6. "numeric" tolerance defaults to 0. Any answer involving division, a rate or rounding MUST set an explicit tolerance.
7. Retries are unlimited, answers persist, and after each submit the learner sees ✓/✗ per question. A 3-option MCQ falls to brute force in three submits. Use 4–5 options and lean on matching/order/numeric, whose answer spaces are large.
8. "intro" and question "prompt" render as plain text — no markdown, no HTML, no line breaks. Put scenario setup in "intro" as one prose paragraph; keep each prompt to one tight sentence or two.

COMPOSITION: 6 questions, pass_score 70. Exactly one each of matching and order, two mcq, one numeric OR multi, one essay. The numeric question must be arithmetic the learner performs on stated quantities (people per shared tank, cost per litre delivered, hours lost per week) — never a recalled statistic.

DISTRACTORS: every wrong option must be something a reasonable learner might believe after doing the simulation. Ban joke options, ban options containing "always"/"never"/"all", ban a correct answer that is visibly longer or more hedged than its distractors, and vary the correct index across the mcqs so the pattern is not 1,1,2.

FACTS: use only figures attributable to a named source (WHO, UNICEF, PCRWR, KWSC, PBS, Sindh Bureau of Statistics, WWF-Pakistan, a named journal). State source and year inline in the text. Where you do not know a real figure, write [VERIFY: what to check, where to look] instead of inventing one. Never place a [VERIFY] marker inside an answer key or an option the learner must choose between — resolve those to invented-free arithmetic instead.

SCHEMA — match this exactly, including pairs keys as strings:
{"intro":"One plain-text paragraph of scenario.","pass_score":70,"questions":[{"id":"q1","type":"mcq","prompt":"...","options":["a","b","c","d"],"answer":2},{"id":"q2","type":"matching","prompt":"...","left":["KWSC","SSWMB"],"right":["Solid waste lifting","Bulk water supply","Building control"],"pairs":{"0":1,"1":0}},{"id":"q3","type":"order","prompt":"...","items":["Treat the source","Detect contamination","Confirm cases fall"],"correctOrder":[1,0,2]},{"id":"q4","type":"essay","prompt":"...","minWords":80}]}

OUTPUT, in this order:
(1) The complete spec in one fenced json block — strict JSON, straight quotes only, no trailing commas, no comments, unique ids.
(2) A separate ANSWER RATIONALE table for staff: question id, correct answer, one line on why each distractor is wrong, and the single misconception it tests.
(3) A GUESSABILITY LINE: state how many blind submissions a learner would need to guarantee 100%, and if that number is under 6, revise the spec before returning it.

SELF-CHECK before you return — confirm each in one line:
[ ] JSON parses; ids unique; every answer index within range; pairs keys are strings
[ ] correctOrder is not [0,1,2,...] and items are authored scrambled
[ ] exactly one essay, minWords 70–110, and at least four objective questions exist
[ ] every numeric involving division has an explicit tolerance
[ ] no markdown, HTML or line breaks inside intro or any prompt
[ ] every statistic has a named source and year, or is a [VERIFY] marker outside the answer key
[ ] Karachi references are real institutions and neighbourhoods, learner framed as analyst
[ ] a learner reading carefully finishes in 12 minutes
````

#### Check the output

- [ ] Paste the JSON into jsonlint or the admin panel — it saves without a parse error
- [ ] Check the order question: the items as listed must NOT already be in the correct sequence
- [ ] Count the essays: exactly one, and its minWords is under 110
- [ ] Read the four distractors on any MCQ aloud — none should be obviously silly or obviously the longest
- [ ] Every number in the text either names a source and year, or is wrapped in [VERIFY: ...]
- [ ] The guessability line reports 6 or more blind attempts needed


<a id="activity-spec-auditor"></a>
### Audit an existing activity spec for guessable answers and broken JSON

**When to use:** Before any activity goes live to learners, and on every spec inherited from an earlier draft.  
**Produces:** A severity-ranked findings list plus a corrected, drop-in replacement JSON

#### Prompt

````text
Follow the IESP Build Contract pasted above.

You are auditing an existing native activity spec before ~30 paying learners see it. Be adversarial. Assume the author was well-meaning and rushed. Your job is to find what breaks, what gives away answers, and what would embarrass us in front of Ziauddin University.

SPEC UNDER AUDIT:
<PASTE THE FULL JSON HERE>

CONTEXT: topic is <TOPIC>, it follows the simulation <SIM FILENAME>, and it is meant to take <N> minutes.

Check all six categories below and report every hit. These engine behaviours are verified against the live grader — do not assume otherwise.

A. ENGINE-LEVEL DEFECTS (these silently corrupt scoring)
- "order" where correctOrder is [0,1,2,...]: the student's default answer IS the authored sequence, so this hands out free marks. Also flag any order question whose items are authored in near-correct sequence, since order gives partial credit per position.
- Spec with no objective questions: it auto-scores 100 on word count alone.
- Essay with a high minWords: essays contribute zero points but gate passing, so minWords above roughly 110 becomes an invisible hard block. Flag any "points" field on an essay — it is ignored.
- "numeric" with a division, rate or percentage answer and tolerance absent or 0.
- "multi" with 4 or more correct answers, or correct answers out of 6+ options: multi is exact-set, all-or-nothing, with no partial credit.
- pass_score arithmetic: given partial credit on matching/order and all-or-nothing elsewhere, work out the realistic score of a learner who understands the material but slips on one item. If that lands below pass_score, say so.

B. GUESSABILITY (retries are unlimited, answers persist, and per-question ✓/✗ is shown after every submit)
- Compute the worst case: how many blind submissions guarantee 100%? Show the arithmetic. Under 6 is a fail.
- Position bias: nothing is shuffled, so list the correct index of every mcq and flag any run or heavy clustering.
- Classic tells: correct option longest or most hedged; distractors containing "always", "never", "only", "all"; grammatical mismatch between stem and distractors; a distractor that is a joke; two options that mean the same thing (so both must be wrong); the answer to one question stated in the text of another.

C. AMBIGUITY
- Any question with a defensible second answer. Name the second answer and argue for it in one sentence.
- Vague quantifiers ("most", "significant", "a lot") in a stem that must be judged true or false.
- Matching questions where two left items could plausibly map to the same right item.
- Prompts that depend on something in the simulation that the simulation may not actually show — flag as [VERIFY IN SIM: ...].

D. FACTUAL INTEGRITY
- Every number, date, percentage, ranking or superlative: does it name a source and year inline? If not, flag it. Do NOT quietly replace it with a different invented number. Either supply a real figure you can attribute to a named source (WHO, UNICEF, PCRWR, KWSC, PBS, Sindh Bureau of Statistics, WWF-Pakistan, a named journal), or replace it with [VERIFY: what to check, where to look], or rewrite the question so it no longer depends on a recalled figure. State which of the three you did.
- Institutional accuracy: are mandates correct? KWSC does bulk water and sewerage, SSWMB does solid waste, KMC and the DMCs are municipal, PPHI runs primary health facilities in Sindh, ambulance response in Karachi is largely Edhi and Chhipa rather than a unified state EMS. Flag anything that assigns the wrong body the wrong job.

E. CULTURAL AND LEARNER FIT
- Poverty-porn framing, or the learner positioned as a visitor observing hardship rather than an analyst advising a decision-maker.
- Stereotyping by neighbourhood, ethnicity, sect or gender. Assumptions of car ownership, home wifi, or a parent who speaks English.
- Idioms or references that a Karachi undergraduate would not share; US or UK-centric examples.
- Sentences over roughly 30 words, or academic register dense enough to lose a competent second-language reader.

F. RENDERING AND JSON
- "intro" and "prompt" render as PLAIN TEXT: flag markdown (**, ##, -, 1.), HTML tags, and \n line breaks, all of which display literally or collapse.
- Strict JSON problems: curly/typographic quotes, trailing commas, comments, duplicate question ids, non-integer indices, answer index out of range, matching pairs keys that are numbers instead of strings, pairs values out of range for the right array.

OUTPUT, in this order:
(1) VERDICT: SHIP / FIX FIRST / REBUILD, in one line with the single strongest reason.
(2) FINDINGS table: severity (Blocker / Serious / Polish), question id, category letter, what is wrong, the fix in one line. Blockers first. Do not pad with trivia — if a category is clean, say "clean" in one line.
(3) GUESSABILITY arithmetic, shown.
(4) The CORRECTED SPEC as one fenced json block, complete and drop-in, with every Blocker and Serious finding fixed and every unverifiable figure either sourced or marked [VERIFY: ...].
(5) CHANGE LOG: one line per edit so a non-technical reader can see what moved.

SELF-CHECK before returning:
[ ] I ran all six categories, including the ones that came back clean
[ ] I showed the guessability arithmetic rather than asserting a number
[ ] I did not invent any replacement statistic; every unsourced figure was sourced, marked [VERIFY], or designed out
[ ] The corrected JSON parses, ids are unique, indices in range, pairs keys are strings
[ ] correctOrder in the corrected spec is not the identity sequence
[ ] The corrected spec still fits <N> minutes
````

#### Check the output

- [ ] The verdict line appears first and is one of the three allowed words
- [ ] Guessability is shown as arithmetic you can follow, not just a claim
- [ ] No finding says 'consider improving' — every fix is concrete and applied in the corrected JSON
- [ ] The corrected JSON parses and can be pasted into admin without editing
- [ ] The change log has one line per edit and is readable by a non-technical person
- [ ] No statistic was swapped for a different unsourced statistic


<a id="three-minute-rubric"></a>
### Write a rubric a non-expert can apply in under 3 minutes

**When to use:** Once per topic, before the first batch of written submissions arrives.  
**Produces:** A 4-dimension binary-anchored rubric, three calibration exemplars, and a phone-readable grader cheat card

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Write a grading rubric for the written response in the <TOPIC> module of the IESP program. The constraint that governs every design decision: the person applying this rubric is a Heal Social Foundation team member or volunteer who is NOT a subject expert in <TOPIC>, is working through roughly 30 submissions, and must score each one in under 3 minutes without agonising. A rubric that requires expert judgement is a failed rubric here.

WHAT LEARNERS SUBMITTED: a structured response of roughly 120–160 words in which they advise a named decision-maker in <SCENARIO: e.g. a UC chairman in Orangi whose ward has two-day-a-week KWSC supply and a dominant tanker economy>, choosing one lever, naming the trade-off it creates, and naming one indicator they would track with the body that publishes it.

DESIGN RULES — follow all of them.
1. Exactly FOUR dimensions. No more. Name them in plain words, not academic ones.
2. Each dimension scores 0, 1 or 2 only. Never 1–5. Untrained graders collapse 1–5 into "3 for everything"; binary-plus-one forces a decision.
3. Every band descriptor must be OBSERVABLE — something the grader can point at in the text — not an adjective about quality. "Names a specific union council or neighbourhood AND a specific institution" is observable. "Shows good local understanding" is not. Rewrite any descriptor that a grader could not settle by scanning for a concrete feature.
4. The four dimensions must together cover: (a) specificity of the local anchor, (b) whether the chosen lever actually addresses the stated problem, (c) whether a real trade-off or constraint is named rather than a costless win, (d) whether the proposed indicator is measurable and attributed to a body that could plausibly publish it.
5. Total is 8 points. Map to bands: 0–3 Not yet (must revise), 4–5 Meets, 6–7 Strong, 8 Exemplary (portfolio gallery candidate).
6. Include a 30-SECOND TRIAGE RULE at the top: two or three yes/no checks that let a grader assign "Not yet" and move on without reading the whole thing (e.g. no named neighbourhood anywhere, or off-topic, or under the word floor). Say explicitly that triage-outs still get one specific sentence of feedback.
7. Include a HARD STOP: graders stop reading at 200 words. Length is not a virtue and we will not reward it.

FAIRNESS RULES, stated inside the rubric so graders actually see them:
- English fluency is NEVER scored. Grammar, spelling, article use and sentence structure carry zero weight. Many learners are strong analysts writing in their second or third language. Urdu words used for local specifics (nala, katchi abadi, dhabba, hydrant) are correct usage, not errors.
- A learner who cites a real constraint we did not anticipate scores full marks on that dimension even if it differs from the model answer. The rubric rewards defensible reasoning, not matching a key.
- A learner who writes a number without a source loses nothing on the four dimensions but gets a standard feedback line asking for attribution. We teach the habit; we do not punish it in cohort 1.

CALIBRATION EXEMPLARS: write THREE full sample submissions in the voice of a real Pakistani undergraduate — not polished consultant prose. One that scores 2–3 (Not yet), one that scores 5 (Meets), one that scores 8 (Exemplary). Each must be 120–160 words and use the <TOPIC> scenario above. Underneath each, show the four dimension scores with a one-line justification quoting the exact phrase that earned or lost the point. These exemplars are the calibration instrument — if two graders disagree, they re-read these. Make the difference between the 5 and the 8 genuinely instructive: the 5 should be competent but generic, the 8 specific and honest about a cost.

FACTUAL DISCIPLINE: any Karachi fact you assert inside an exemplar or a descriptor must name a source and year, or carry a [VERIFY: what to check, where to look] marker. Do not write a realistic-sounding percentage. The exemplars will be shown to learners as models, so a fabricated figure in an exemplar teaches fabrication.

OUTPUT, in this order:
(1) The 30-second triage rule.
(2) The rubric as a table: dimension, what 0 looks like, what 1 looks like, what 2 looks like.
(3) The band map and what each band means for the learner.
(4) The three calibration exemplars with scored breakdowns.
(5) A GRADER CHEAT CARD: the whole rubric compressed to fit one phone screen — four dimension names, the 2-descriptor for each, the band cut-offs, the two fairness reminders. Under 120 words total.

SELF-CHECK before returning:
[ ] Exactly four dimensions, each scored 0/1/2, total 8
[ ] Every descriptor names something a grader can point at in the text
[ ] No descriptor uses "good", "clear", "strong", "well-written" or "appropriate" as the deciding word
[ ] English fluency is explicitly excluded, in writing, where graders will read it
[ ] Three exemplars exist, each 120–160 words, each scored with quoted evidence
[ ] I timed myself mentally against the Meets exemplar: scoring it takes under 3 minutes
[ ] Every fact in the exemplars is sourced or [VERIFY]-marked
[ ] The cheat card is under 120 words and readable at 360px
````

#### Check the output

- [ ] Hand the cheat card and one exemplar to someone who knows nothing about the topic — they produce the same score you did
- [ ] No band descriptor turns on a subjective adjective; each names a feature you can point to
- [ ] The three exemplars read like real undergraduate writing, not consultant prose
- [ ] The fairness note excluding English fluency from scoring is visible in the rubric itself
- [ ] Scoring the Exemplary sample takes under 3 minutes end to end
- [ ] No exemplar contains an unsourced statistic


<a id="structured-response-template"></a>
### Design a written-response template that is fast to grade

**When to use:** When authoring the essay portion of any module — do this BEFORE writing the rubric.  
**Produces:** An engine-safe essay prompt, the slot template, and the objective questions that offload most of the grading

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Design the written-response component for the <TOPIC> module, lens <LENS>. Your real objective is grading leverage: grading speed is decided at authoring time, not at grading time. A wide-open "reflect on what you learned" prompt produces 30 unstructured essays that cost 10 minutes each to assess. A tightly slotted prompt produces 30 comparable responses that cost 2 minutes each. Build the second thing.

THE CORE MOVE: the platform stores essays for human review but does NOT score them — objective questions carry the entire numeric score, and the essay only gates passing via a minimum word count. So push every machine-checkable part of the answer OUT of the essay and INTO objective questions, and leave the essay to carry only the reasoning a human must actually read.

Concretely, split the learner's thinking in two:
- MACHINE-CHECKABLE (goes into mcq / multi / matching / numeric): which lever they chose from a fixed enumerated list; which institution owns that lever; which indicator they would track; who publishes that indicator; the arithmetic of scale or cost.
- HUMAN-ONLY (goes into the single essay): WHY that lever over the runner-up, and what it costs — who bears the downside, what gets worse, what they would do if the constraint bit.

SCENARIO ANCHOR — use the row for <TOPIC>:
- Water & Environment: advising a UC chairman in Orangi with two-day-a-week KWSC piped supply and a dominant private tanker economy filling at hydrants; the Orangi Pilot Project's component-sharing model is the local precedent.
- Public Health: advising the in-charge of a PPHI basic health unit in the Gadap catchment facing a pre-monsoon typhoid cluster in under-10s, with Lady Health Workers as the outreach layer and Indus Hospital as referral.
- Urban Safety: advising a KMC official on the Korangi Causeway corridor where dumper and container traffic mixes with motorcycles at peak hours and ambulance cover is largely Edhi and Chhipa.
- Economic Opportunity: advising a Sindh labour department officer on home-based women workers in Baldia doing piece-rate work through middlemen, with the Sindh Home-Based Workers Act 2018 unimplemented.

Give the decision-maker a NAME AND A CONSTRAINT — a fixed budget, a fixed timeframe, or one thing they are not allowed to do. Constraints are what force trade-offs, and trade-offs are what make responses gradeable.

THE TEMPLATE: five labelled slots, each with a word cap, totalling 120–160 words. Something in the shape of: SITUATION (25 words, in their own words, naming the specific place) / LEVER (20 words, chosen from the enumerated list) / WHY NOT THE ALTERNATIVE (40 words, naming the runner-up lever and why it loses here) / COST (35 words, who bears the downside) / MEASURE (30 words, the indicator, the publishing body, the check frequency). Tune the slot names and caps to <TOPIC>, but keep five slots and keep the total under 160 words. Every slot must map 1:1 to a rubric dimension — state that mapping explicitly.

ENGINE CONSTRAINTS — the essay prompt is stored as a plain-text string and rendered as plain text. No markdown, no HTML, and line breaks collapse. So the slot labels must survive as one continuous paragraph, e.g. "Write five labelled lines. SITUATION (max 25 words): ... LEVER (max 20 words): ...". Set minWords to the realistic floor for the template, between 70 and 110 — remember the word count is a HARD PASS GATE, so a learner who writes a sharp 65-word answer would be blocked, which we do not want. Include exactly one essay question in the module.

MOBILE REALITY: this is typed on a phone, possibly on mobile data, possibly during load-shedding. Word caps are a kindness. State the caps as maximums, not minimums, everywhere except the one platform-enforced floor.

WRITE FOR A SECOND-LANGUAGE READER: short sentences, concrete nouns, no academic hedging in the prompt itself. Tell learners explicitly that they will not be marked on English, and that Urdu terms for local specifics are welcome.

OUTPUT, in this order:
(1) The essay question object, ready to paste, as one fenced json block: {"id":"q6","type":"essay","prompt":"...one continuous plain-text string...","minWords":<N>}
(2) The enumerated LEVER LIST (4–5 levers, real and specific to the scenario, each one sentence, each genuinely defensible so there is no single obvious winner).
(3) THREE objective questions in valid JSON that capture the machine-checkable parts — at minimum one matching question pairing levers to the institution that owns them, and one numeric that requires arithmetic on stated quantities rather than a recalled figure (set a tolerance if it involves division).
(4) The SLOT-TO-RUBRIC MAP: a five-row table showing which slot feeds which rubric dimension and what the grader looks for in that slot.
(5) A 40-word learner-facing note explaining why the format is tight — respect their time by explaining the constraint rather than just imposing it.

FACTS: any figure must name a source and year or be replaced with [VERIFY: what to check, where to look]. The lever list must describe real, plausible interventions for Karachi — no imaginary programmes, no imaginary agencies.

SELF-CHECK before returning:
[ ] The essay prompt is one continuous plain-text string with no markdown, no HTML, no \n
[ ] minWords is between 70 and 110 and is genuinely achievable within the slot caps
[ ] Slot caps total 120–160 words
[ ] Every slot maps to exactly one rubric dimension, and the map is shown
[ ] The lever list has no single obviously-correct answer
[ ] The objective JSON parses; the numeric question has a tolerance if it involves division; matching pairs keys are strings
[ ] The decision-maker has a name and a binding constraint
[ ] Nothing in the output penalises English fluency
````

#### Check the output

- [ ] Paste the essay prompt into the admin field — it displays as readable prose with no stray asterisks or collapsed lines
- [ ] minWords is comfortably below what a learner filling every slot would write
- [ ] Each of the five slots maps to exactly one rubric dimension in the table
- [ ] Pick any two levers from the list and argue for each — both should be defensible
- [ ] The objective JSON parses and its numeric question can be answered from stated quantities alone
- [ ] Total learner writing is under 160 words


<a id="ai-first-pass-grader"></a>
### Build the AI first-pass grading prompt the team reruns every week

**When to use:** Once, then reuse every grading cycle — this generates the tool, not the grades.  
**Produces:** A reusable batch-grading prompt with a strict output schema, plus the human spot-check protocol

#### Prompt

````text
Follow the IESP Build Contract pasted above.

You are building a TOOL, not grading anything right now. Produce a reusable batch-grading prompt that the Heal Social Foundation team will paste into a fresh chat every week, followed by a batch of learner submissions, to get a consistent first-pass score. Human review then samples and moderates it. Write the tool so that a non-technical team member can use it unchanged for months.

INPUTS THE TOOL WILL RECEIVE at run time (design around these):
- The rubric for the module: four dimensions, each scored 0/1/2, total 8. <PASTE RUBRIC WILL GO HERE>
- The three calibration exemplars with their official scores. <PASTE EXEMPLARS WILL GO HERE>
- A batch of up to 10 submissions, each as: PSEUDONYM, then the response text. Real names are stripped before the batch is assembled.

THE GENERATED TOOL MUST ENFORCE THESE RULES. Write them into the tool in imperative voice.

EVIDENCE DISCIPLINE
- For every dimension score, quote the exact span from the submission that earned it, verbatim, in quotation marks. If no span can be quoted, the score is 0 and the reason must read "no evidence found" — never infer intent, never give credit for what the learner probably meant.
- Never paraphrase a submission in a way that improves it. Do not fill gaps. Do not assume a learner who named Orangi also understood the tanker economy unless they said so.
- Never invent a submission, a pseudonym or a quote. If a submission is empty, truncated or unreadable, output status NO_SUBMISSION and move on.

WHAT IS NOT SCORED — state this prominently in the tool
- English fluency, grammar, spelling, article use, sentence structure: zero weight. These learners are Pakistani undergraduates writing in a second or third language and many of the strongest analysts write the least polished English. Penalising fluency here would be both unfair and a program failure.
- Urdu or mixed-language terms for local specifics (nala, katchi abadi, hydrant, dhabba, mohalla) are correct domain vocabulary, not errors.
- Length beyond the word floor. A tight 110-word answer can score 8.
- Agreement with a model answer. A defensible alternative scores full marks.

FLAG, NEVER AUTO-PENALISE. The tool outputs flags for a human to look at, and flags never change the score:
- FLAG_BORDERLINE: total is 3, 4, 5 or 6 — near a band boundary, so a human decides.
- FLAG_TOP: total is 8 — these become portfolio gallery and certificate showcases, so every 8 gets human confirmation.
- FLAG_UNSOURCED_NUMBER: the submission states a statistic without naming a source. Do not deduct. This triggers a teaching feedback line.
- FLAG_OFF_TOPIC: the response addresses a different scenario or topic.
- FLAG_POSSIBLE_COPY: two submissions in the batch share distinctive phrasing. Report both pseudonyms and quote the overlapping span. Assert nothing about intent.
- FLAG_GENERIC: the response would read identically for any of the four IESP topics — no place, no institution, no specific mechanism. Note that this is a content observation and explicitly NOT an accusation of AI use; the tool must never claim to detect AI-written text, because such detection is unreliable and disproportionately misfires on second-language writers. Any conversation about authorship is a human one.
- FLAG_DISTRESS: the submission discloses personal hardship, safety risk or crisis. Score normally, flag immediately, and instruct that a human read this within 24 hours.

CALIBRATION STEP: the tool must begin every run by scoring the three provided exemplars FIRST and printing its scores against the official ones. If it deviates by more than 1 point on any exemplar, it must say "CALIBRATION FAILED — do not trust this batch" and stop rather than grading the real submissions. Build this in as step one of the tool's procedure.

OUTPUT SCHEMA the tool must emit — one block per submission, nothing else, no preamble, no summary prose:
PSEUDONYM | D1 score | D2 | D3 | D4 | TOTAL | BAND | FLAGS | evidence quotes (one short quote per dimension) | one feedback sentence addressed to the learner, specific to their text, under 30 words, naming one concrete improvement.
Then a final BATCH SUMMARY: count per band, list of all flagged pseudonyms grouped by flag, and the three most common weaknesses across the batch with a one-line teaching note for each — that summary is what the team uses to write the cohort-wide follow-up message.

ALSO PRODUCE, alongside the tool, the HUMAN SPOT-CHECK PROTOCOL as a short numbered procedure: which submissions a human must read regardless of AI score (all FLAG_TOP, all FLAG_DISTRESS, all FLAG_OFF_TOPIC, all FLAG_POSSIBLE_COPY, plus a random 20% of the unflagged), how to log agreement or disagreement, what to do when the human and the AI differ by 2+ points (human wins, and the disagreement is recorded so the rubric can be sharpened), and a stop rule — if the human disagrees on more than 3 of 10 spot-checks, stop using the batch and re-run after fixing the rubric.

SELF-CHECK before returning:
[ ] I produced a reusable prompt, not a set of grades
[ ] The tool calibrates on the three exemplars first and can abort
[ ] Every score in the schema requires a verbatim quote or the literal words "no evidence found"
[ ] The tool is explicitly forbidden from scoring English fluency and from claiming to detect AI authorship
[ ] Flags never alter scores
[ ] The output schema is machine-readable enough to paste into a spreadsheet
[ ] The spot-check protocol names exactly who a human must read and includes a stop rule
[ ] A non-technical person could run this by pasting the rubric, the exemplars and 10 submissions

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] The deliverable is a prompt you can paste and reuse, not a batch of grades
- [ ] Run it once with the three exemplars only — it reproduces their official scores within 1 point
- [ ] Every dimension score in the output carries a quoted span from the learner's own words
- [ ] Search the tool text for 'AI-generated' — it must forbid, not perform, authorship detection
- [ ] Flagged submissions keep the same score they would have had unflagged
- [ ] The output pastes into a spreadsheet as columns without reformatting


<a id="week1-core-checkpoint-bank"></a>
### Zero-grading checkpoints for the three compulsory Week 1 core modules

**When to use:** Setting up Week 1, where drop-off is highest and grading capacity is lowest.  
**Produces:** Three complete activity JSON specs (AI literacy, professional ethics, Karachi as a living lab)

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce THREE separate activity JSON specs — one checkpoint for each compulsory Week 1 core module. Week 1 is where cohorts lose people, so these have two jobs at once: prove to a learner who just paid PKR 2,000 that this program is real, and create ZERO grading work for a team that has none to spare.

HARD CONSTRAINTS FOR ALL THREE
- 5 minutes each, maximum. Five or six questions. Design to actually fit.
- NO ESSAY QUESTIONS AT ALL in any of the three. This is deliberate: essays score zero points, gate passing on word count, and create human review load. Week 1 must be fully self-grading. All three specs must be 100% objective.
- pass_score 70.
- These sit after a short hands-on module, so questions must reward having DONE the thing, not having read about it.
- Lens is <LENS: Health | Computer Science / Data | Design & Marketing | Entrepreneurial / Finance>. The lens changes the worked example and the ethics case, never the underlying rule being tested. Produce the set for this one lens; the founder reruns for the others.

ENGINE RULES THAT WILL BITE HERE (verified against the live grader)
- Nothing is shuffled, and an "order" question starts with the student's answer set to the authored sequence — so correctOrder must never be [0,1,2,...] and items must be authored scrambled.
- "matching" and "order" award partial credit; "mcq", "multi" and "numeric" are all-or-nothing, and "multi" needs the exact set, so keep it to 2–3 correct out of 4–5.
- Retries are unlimited, answers persist between sessions, and the learner sees ✓/✗ per question after each submit. A 3-option MCQ is brute-forced in three submits, so use 4–5 options and lean on matching and order.
- "intro" and "prompt" are plain text: no markdown, no HTML, no line breaks.
- Answers persisting between sessions is a feature here — say nothing in the intro that implies a single sitting, because load-shedding is normal and a learner may return mid-activity.

MODULE 1 — AI LITERACY (5 min)
Test judgement, not vocabulary. Nobody needs to define "large language model". Test: recognising a confidently wrong AI output; knowing that an AI-stated statistic needs a named source before it goes in a report; distinguishing a task where AI helps from one where it must not be trusted alone; recognising that pasting someone's personal data into a public chatbot is a disclosure. Build at least one question around a short, realistic AI output that contains a plausible-sounding but unsourced Karachi statistic, and ask what the learner should do with it — the correct answer is to seek attribution or mark it unverified, and the distractors should be the tempting shortcuts. Use a <LENS>-appropriate worked task (a clinical summary, a dataset cleaning step, a campaign line, a cost projection). This question doubles as the program's inoculation against fabricated data, so make it land.

MODULE 2 — PROFESSIONAL ETHICS (5 min)
Ground every question in a situation a Pakistani undergraduate on a real project would face, not an abstract dilemma: a community member shares health information informally and asks you not to write it down; your data shows a result that embarrasses the partner organisation hosting you; someone offers you a photograph of a family in a katchi abadi that would make your report more powerful and was taken without asking; a WhatsApp group contains a survey spreadsheet with names and phone numbers. Include one matching question pairing a situation to the principle it engages (consent, confidentiality, dignity in representation, conflict of interest, data minimisation). Frame the learner as a professional with obligations, never as a visitor. Reframe one scenario through <LENS>.

MODULE 3 — KARACHI AS A LIVING LAB (5 min)
This is the module that must feel like a home advantage. Test who actually owns what, because that is real, useful, non-obvious civic knowledge: KWSC for bulk water and sewerage, the Sindh Solid Waste Management Board for solid waste, KMC and the DMCs for municipal functions, PPHI for primary health facilities in Sindh, Karachi Traffic Police, the cantonment boards as separate jurisdictions, and the reality that emergency ambulance response is largely Edhi and Chhipa rather than a single state EMS. Build the matching question around that. Include one "order" question on how a citizen complaint actually travels, and one numeric requiring arithmetic on stated quantities (people served by a shared connection, trips per week, hours lost) — never a recalled statistic. Name real areas: Orangi, Lyari, Korangi, Malir, Gadap, Baldia, Landhi, Saddar, DHA.

FACTS: every figure must name a source and year inline (WHO, UNICEF, PCRWR, KWSC, PBS, Sindh Bureau of Statistics, WWF-Pakistan, a named journal) or be replaced with [VERIFY: what to check, where to look]. Never put a [VERIFY] marker inside an answer key or inside an option the learner must choose between — design those questions around arithmetic or institutional mandates instead, which you can state confidently.

SCHEMA — match exactly, note pairs keys are strings:
{"intro":"One plain-text paragraph.","pass_score":70,"questions":[{"id":"q1","type":"mcq","prompt":"...","options":["a","b","c","d"],"answer":2},{"id":"q2","type":"matching","prompt":"...","left":["Solid waste lifting","Bulk water supply"],"right":["KWSC","SSWMB","Karachi Traffic Police"],"pairs":{"0":1,"1":0}},{"id":"q3","type":"order","prompt":"...","items":["Third step","First step","Second step"],"correctOrder":[1,2,0]}]}

OUTPUT: three fenced json blocks, clearly labelled CORE 1 / CORE 2 / CORE 3, then a short table for each giving the correct answer and the one misconception each question targets, then one line per module estimating actual completion time in minutes.

SELF-CHECK before returning:
[ ] Zero essay questions across all three specs
[ ] All three JSON blocks parse; ids unique within each spec; indices in range; pairs keys are strings
[ ] No correctOrder is the identity sequence and no items list is authored in correct order
[ ] No multi has more than 3 correct answers
[ ] Every numeric involving division has an explicit tolerance
[ ] No markdown, HTML or line breaks in any intro or prompt
[ ] Every institutional claim is one I can state confidently; every statistic is sourced or [VERIFY]-marked and never inside an answer key
[ ] Each module genuinely completes in 5 minutes
[ ] Nothing frames the learner as an observer of hardship
````

#### Check the output

- [ ] Search all three specs for "essay" — zero hits
- [ ] All three JSON blocks parse and paste into admin cleanly
- [ ] No order question lists its items already in the right sequence
- [ ] Do one checkpoint yourself with a timer — under 5 minutes
- [ ] The living-lab matching question tests real mandates you could defend to a Ziauddin faculty member
- [ ] No [VERIFY] marker sits inside an answer option or answer key


<a id="peer-review-protocol"></a>
### Peer review as a triage signal, not a grade

**When to use:** When the written-submission backlog outruns the team, or as the standing week-3 fallback.  
**Produces:** A full peer-review protocol document plus the companion activity JSON that captures reviews

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Design the peer-review protocol for the IESP cohort, and the platform activity that captures it. Cohort size is <N = 30> Solutions Builders. The module under review is <TOPIC>, and submissions are ~120–160 word structured responses scored against a four-dimension 0/1/2 rubric.

THE STRATEGIC POINT, which must be stated plainly in the protocol: peer review here is NOT a grading substitute. Undergraduate peers are not calibrated and their scores cannot decide who passes. Peer review earns its place by doing two things staff grading cannot afford: it gives every learner feedback within 48 hours instead of a week, and it produces a TRIAGE SIGNAL that tells the team which submissions to read first. Design every element to serve those two purposes. Any element that only exists to look rigorous, cut it.

ASSIGNMENT MECHANICS
- Each learner reviews exactly 2 peers and receives exactly 2 reviews. Never 3 — it will not get done.
- Use a fixed offset ring: with learners numbered 1..N, learner i reviews i+1 and i+7 (wrapping). Explain in one line why an offset ring beats random pairing: it guarantees full coverage, it is reproducible if someone drops out, and it makes reciprocal "you scored me high so I score you high" pairs impossible because no two learners ever review each other.
- Give the exact drop-out repair rule: if learner k does not submit, who covers their two reviews, stated as a rule the team can apply in 30 seconds without recomputing the whole ring.
- Pseudonymous both ways. Give a naming scheme that is neutral and non-guessable and does not encode the ring position (so a learner cannot work out who they are reviewing). Avoid anything that hints at gender, ethnicity or neighbourhood.

THE REVIEW ITSELF — capped at 5 minutes and roughly 60 words of writing
- THREE observable yes/no checks a peer can answer without expertise. These must be things you can point at, not judgements: does the response name a specific neighbourhood or union council; does it name a specific institution or body; does it name something that gets WORSE as a result of the recommendation. Adapt the third to <TOPIC> if a better observable trade-off marker exists, but keep all three answerable by scanning.
- ONE "strongest specific": the reviewer quotes the single most concrete sentence from the response. Quoting, not summarising — this is the discipline that makes review real, and it takes 20 seconds.
- ONE "one concrete improvement", capped at 30 words, and it must name a thing to add, not a vague wish. Give three worked examples of good improvement notes and three of useless ones ("good work, add more detail" is useless).
- NO overall score. Peers do not produce a number. Removing the number removes the social awkwardness, removes grade inflation, and removes the temptation to treat peer output as a grade.

THE TRIAGE RULE — the part that actually saves staff time. Specify precisely how the team converts peer output into a read-first queue. Something in this shape, tuned by you: any submission where BOTH reviewers answered "no" to the same observable check goes to the top of the human queue; any submission where the two reviewers disagree on all three checks goes second (disagreement usually means the response is ambiguous, which is exactly what a human needs to judge); everything where both reviewers answered yes to all three gets a fast confirm-only read. State the expected time saving in plain arithmetic: 30 submissions at 3 minutes is 90 minutes; how much does this queue actually save, honestly, including the cost of running the protocol.

CALIBRATION AND ANTI-COLLUSION
- A 10-minute calibration warm-up before reviewing: all learners review the SAME published exemplar, then see how the team answered the three checks and why. Write the exemplar and the team's answers.
- Review quality is itself checked in 20 seconds per review by the team: did the reviewer quote an actual sentence from the response? Yes/no. State the consequence of a no — one nudge, then the reviewer's own review requirement is marked incomplete. Keep it proportionate; this is a paid program, not a disciplinary system.
- Handle the WhatsApp reality directly: learners will be in group chats together. Say what happens if two learners coordinate, and design so that coordinating is pointless — since there is no score to inflate, the main risk is empty reciprocal praise, which the quote requirement already catches.

TONE FOR LEARNERS: they are peers giving professional feedback, not judges. Write two short model reviews in that register — one for a strong response, one for a weak one — showing how to be specific and useful without being harsh. Second-language English is never a subject of review comment; say so explicitly in the learner-facing instructions.

COMPANION ACTIVITY JSON: produce the spec that captures ONE peer review inside the platform. Use three mcq questions for the observable checks (each with options like "Yes, and here is the phrase" / "No" / "Partly" — note these are self-reports about someone else's work, so pick the "answer" index that represents an acceptable completed review rather than a correctness key, and explain that choice in a comment OUTSIDE the JSON). Add one essay for the quote and the improvement note, minWords 40. Remember: essays score zero points and gate passing on word count, and intro and prompt render as plain text with no markdown or line breaks. Note explicitly that because peer review is participation rather than correctness, pass_score should be set low (e.g. 40) so a learner who completes the review in good faith always passes.

OUTPUT: (1) the protocol as a numbered procedure the team follows; (2) the exact learner-facing instructions, under 250 words, mobile-readable; (3) the calibration exemplar and the team's answers; (4) the two model reviews; (5) the triage rule with the honest time arithmetic; (6) the companion activity JSON in a fenced block.

SELF-CHECK before returning:
[ ] Peers produce no score anywhere in the design
[ ] The offset ring is specified with actual numbers and a stated drop-out repair rule
[ ] No two learners review each other — verify this is true for the ring I specified
[ ] The whole review fits in 5 minutes and ~60 words
[ ] The triage rule is mechanical enough to apply without judgement, and the time saving arithmetic is honest including protocol overhead
[ ] Learner instructions are under 250 words and readable at 360px
[ ] The companion JSON parses, has a low pass_score, and its essay minWords is 40
[ ] English fluency is explicitly off-limits as review subject matter

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] Trace the offset ring for 30 learners — confirm nobody reviews someone who reviews them back
- [ ] No peer output is a number or a grade
- [ ] The triage rule can be applied by sorting a spreadsheet, with no judgement calls
- [ ] The stated time saving accounts for the cost of running the protocol, not just the grading avoided
- [ ] Learner instructions fit on one phone screen and take under 5 minutes to act on
- [ ] The companion JSON parses and its pass_score lets a good-faith review pass


<a id="grading-batch-runbook"></a>
### The two-hour grading run: 30 submissions, feedback out in 72 hours

**When to use:** Every time a module's submissions close and someone has to actually sit down and grade them.  
**Produces:** A timed run-of-show, a moderation procedure, and a 20-line feedback bank with mandatory personalisation slots

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Write the operational runbook for grading one module's written submissions. This is a logistics document, not a pedagogy essay. The reader is a Heal Social Foundation team member with a laptop, a spreadsheet, roughly two hours, and no subject expertise in <TOPIC>.

THE SITUATION, stated honestly at the top of the runbook: <N = 30> submissions, <G = 2> people available, target of feedback to every learner within 72 hours of the deadline. Every learner paid PKR 2,000 of their own or their family's money. Silence after submission is the fastest way to lose a cohort, so the deadline that matters is the feedback deadline, not the scoring deadline.

PRODUCE THESE SEVEN PARTS.

1. PRE-FLIGHT (target 15 minutes). The exact spreadsheet columns to set up before reading anything: pseudonym, real name (in a separate sheet, never in the grading sheet), submission text, D1–D4, total, band, flags, feedback line sent, grader initials, moderated y/n. State the pseudonymisation step and why it matters — a grader who knows a name grades the person, not the text. Include the sanity checks to run first: who submitted nothing, who submitted under the word floor, who submitted to the wrong module.

2. CALIBRATION ROUND (target 15 minutes, non-negotiable, both graders together). Both score the SAME three submissions independently, then compare. Give the resolution rule for disagreement, and the abort condition: if the two graders differ by 2+ points on more than one of the three, the rubric is the problem, not the graders — stop, fix the ambiguous descriptor, restart. Say plainly that skipping calibration is how a cohort ends up with two different standards and an appeals problem.

3. THE PASS (target 60 minutes for 30 submissions across 2 graders). The per-submission loop, in order, with a time budget for each step: apply the 30-second triage; read to the 200-word stop; score four dimensions; pick a feedback line from the bank and personalise it; log. State the anti-drift rule: after every 10 submissions, re-score one already-scored submission blind and check you land within 1 point of your earlier score. Fatigue drift is real and this catches it in 90 seconds.

4. MODERATION (target 20 minutes). Which submissions get a second pair of eyes, no exceptions: everything scoring 8 (these go to the portfolio gallery and are the public face of the program), everything at the 3/4 boundary (the pass line), everything flagged, and a random 10% of the rest. The disagreement rule: the two graders talk for 60 seconds; if they still disagree, the higher score stands and the case is logged for the next rubric revision. Say why the higher score stands — in cohort 1 with an unproven rubric, the fairness risk sits with us, not the learner.

5. THE FEEDBACK BANK. Write 20 reusable feedback sentences, each tied to a specific rubric miss, each with a MANDATORY personalisation slot marked <QUOTE THEIR PHRASE> or <NAME THE THING THEY MISSED>. A learner must never receive a message that could have been sent to anyone else — canned feedback is worse than none because it proves nobody read it. Group them: 5 for the local-specificity dimension, 5 for lever-fit, 5 for trade-off, 5 for measurement. Each sentence under 30 words. Each one names something concrete to do next time, not a judgement. Include 3 additional lines for the top band that say something real about what the learner did well, because strong learners get generic praise everywhere and remember the specific kind. Also include the standard unsourced-number teaching line: warm, non-punitive, explaining the [VERIFY] habit and why a named source and year is what separates an analyst from an opinion.

6. THE SEND. What actually goes to each learner: their band, the four dimension scores, one personalised sentence, and one line on what a higher band looks like. Explicitly NOT the raw rubric table — it reads as bureaucratic and invites line-by-line argument. Include the cohort-wide follow-up message template: the three most common weaknesses across the batch with one teaching line each, sent to everyone, which is often the highest-leverage teaching moment of the whole week because it costs one message and reaches thirty people.

7. APPEALS AND RESITS. A short, honest policy. Who can ask for a re-read, in what window, what evidence they need to give (they must name which dimension and why, not just "I think I deserve more"), who does the re-read (not the original grader), and that a re-read can move a score down as well as up. Then the resit rule, and be honest about the platform: objective activities already allow unlimited retries with per-question feedback, so resits only concern the written response. State how many resubmissions a learner gets and by when.

FACTUAL DISCIPLINE: any figure in an example feedback line must name a source and year, or use [VERIFY: what to check, where to look]. The feedback bank will be pasted to real learners, so a fabricated example figure will propagate.

FORMAT: markdown, headings per part, time budget in the heading of each timed part, and a one-page CHECKLIST at the very end that a grader can keep open in a second tab — every step as a tickbox, no prose.

SELF-CHECK before returning:
[ ] Every timed part has a minute budget and the budgets sum to about two hours for 30 submissions across 2 graders
[ ] Calibration comes before any real grading and has a stated abort condition
[ ] The anti-drift re-score check is in the pass loop
[ ] All 20 feedback lines have a mandatory personalisation slot and are under 30 words
[ ] No feedback line is sendable as-is without the grader adding something specific
[ ] Moderation covers all 8s, all 3/4 boundary cases, all flags, and a 10% sample
[ ] The appeals policy states that scores can move down
[ ] Any figure in an example is sourced or [VERIFY]-marked
[ ] The final checklist fits one page and is pure tickboxes
````

#### Check the output

- [ ] The time budgets add up to roughly two hours for 30 submissions across 2 graders
- [ ] Every one of the 20 feedback lines has a <SLOT> that cannot be left unfilled
- [ ] Pick any 3 feedback lines at random — none could be sent to a different learner unchanged
- [ ] Calibration appears before the main pass and has an explicit abort condition
- [ ] The moderation list includes all top-band scores, not just borderline ones
- [ ] The one-page checklist is tickboxes only and needs no reading of the main document


## Capstone, portfolio and credential

> Week 4 is where a learner either produces something they will show people for years, or quietly submits filler and never mentions IESP again. So the pack is built around ONE artifact: a 700-900 word Decision Memo with fixed section headings. Everything else (workbench, submission activity, rubric, gallery card, video, LinkedIn copy, employer explainer) is a derivative of that memo. The learner writes once and reuses seven times. That is the only honest way 4 hours becomes a portfolio piece.

Three deliberate bets. (1) The memo's mandatory sections include "What I gave up" and "What I could not verify". Almost no Pakistani undergraduate portfolio piece contains either, and hiring managers and admissions readers recognise calibrated honesty immediately. It is also the same discipline as the [VERIFY:] rule, so integrity is taught as craft, not compliance. (2) Every prompt separates scenario parameters (budgets, household counts - invented on purpose, must be labelled fictional) from empirical claims about Karachi (never invented; sourced or VERIFY-marked). Collapsing those two is the failure mode that would embarrass Heal in front of Ziauddin. (3) The credential prompts say the real objection out loud - "you paid PKR 2,000, so it's a purchase" - because a learner who has rehearsed an honest answer is credible and one who has not is defensive.

Grading load was the binding constraint. The submission activity is six objective questions (including a numeric every learner computes from the same scenario table, which cannot be faked without doing the work) plus exactly two essays, one of which is a URL. That is roughly one human read per learner. The reviewer kit exists so a volunteer calibrates in ten minutes from three full exemplars and marks from a sentence bank instead of composing feedback from scratch.

Deliberately excluded: peer review (needs coordination we cannot staff in cohort 1); any capstone step requiring a laptop, paid software, a site visit, or a stable upload; audio/video recording inside the sim (getUserMedia is unreliable in a sandbox with no allow-same-origin); a designed certificate image (the verify page plus QR already exists and is the stronger claim); and anything that would let a learner imply they worked for KW&SC, PPHI or Ziauddin. The workbench also assumes storage throws, so "copy your draft out" is a first-class, always-visible feature rather than an ending - on load-shedding and patchy mobile data, losing an hour of drafting is how you lose a learner permanently.


<a id="capstone-brief"></a>
### The capstone brief (one per topic)

**When to use:** When you need the week-4 deliverable brief for a topic, written so a learner can actually finish it in four hours.  
**Produces:** Markdown document (goes on the module page and as a downloadable handout)

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce the **Capstone Brief** for the IESP topic <TOPIC = Water & Environment | Public Health | Urban Safety | Economic Opportunity>. Output one Markdown document. No HTML, no code.

**Reader.** A Pakistani undergraduate in Karachi reading on a phone. They finished the week-1 core and two other topics, they have their own degree coursework, and they have about 4 hours across week 4. Sentences under 22 words. No academic throat-clearing. Concrete place names beat abstractions.

**Two kinds of number - the rule that matters most.**
1. *Scenario parameters* (budget, household count, timeline, staff on hand) are invented by us on purpose; they are the puzzle. Put every one under a heading exactly: `## Scenario parameters (fictional - set by IESP for this exercise)`.
2. *Empirical claims about Karachi or Pakistan* (prices, coverage rates, disease burden, crash counts, wages) may never be invented. Each carries a named source and year inline, e.g. "(PCRWR, 2021)", or is replaced with `[VERIFY: what to check, where to look]`. If you are not certain a figure is real, use the VERIFY marker. A realistic-looking invented statistic is the worst possible output.

**Scenario seed - use the one matching <TOPIC>, keep every named institution.**

*Water & Environment.* The learner advises the Union Council chairman of a UC in Orangi Town, roughly 1,200 households. Piped supply from KW&SC (Karachi Water & Sewerage Corporation, formerly KWSB) arrives intermittently on an unpublished valve rotation; households top up from private tankers filled at hydrants. OPP-RTI (Orangi Pilot Project - Research and Training Institute) has lane-level drawings for this area and will share them. Four levers: negotiate a published valve-rotation schedule with the KW&SC sub-divisional engineer; build one community underground tank plus booster at the school; subsidise household storage; repair leaks on the tertiary line. Constraint: PKR 4.5 million CSR grant, spent within 6 months, and one indicator that an untrained volunteer can measure with a phone.

*Public Health.* The learner advises the in-charge of a PPHI Sindh Basic Health Unit in Korangi on routine immunisation (EPI Sindh) dropout between a child's first and third contact. Levers: extend fixed-site hours; two Lady Health Workers doing home follow-up; Urdu SMS or IVR reminders; a referral tie-up with nearby private clinics; a monthly outreach camp. Constraint: 2 LHWs, 3 outreach days a month, PKR 900,000 for the year. Indus Hospital & Health Network and Aga Khan University publish work in this space.

*Urban Safety.* The learner advises a KMC district officer and a school principal on one 3 km corridor in Landhi where children cross a fast road to reach school. Edhi and Chhipa run the de facto ambulance service; injuries land at JPMC or Civil Hospital. Levers: at-grade signalised crossing with a warden; lighting on the darkest 600 m; moving a bus stop away from the school gate; school-time speed calming. Constraint: PKR 8 million, 9 months, and a before/after indicator that does not depend on police data.

*Economic Opportunity.* The learner advises the programme manager of a Sindh TEVTA-affiliated centre in Lyari: 300 graduates last year, weak conversion into earnings. Levers: employer-linked apprenticeship with a Korangi Industrial Area factory via KATI, or in SITE; a payments-and-banking clinic (bank account plus a working freelance payout route, since PayPal is not available in Pakistan); a communication add-on; equipment and connectivity support instead of more training hours. Constraint: PKR 2.5 million, 6 months, and women graduates' mobility limits on on-site placement must be addressed, not ignored.

**Structure - use these headings in this order.**
1. `# Capstone: <title naming the actual decision>` and one line: "You have about 4 hours. Here is where they go."
2. **Your role** - 60 words, second person, learner is an analyst advising a named client.
3. **What is actually happening here** - 150-200 words, every claim sourced or VERIFY-marked.
4. `## Scenario parameters (fictional - set by IESP for this exercise)` - a small table.
5. **Your four levers** - one paragraph each, each with the strongest honest argument FOR it. No lever may be an obvious loser.
6. **What you submit** - exactly four things: (a) a **Decision Memo, 700-900 words**, with these mandatory headings in this order: *The decision I recommend* (max 40 words) / *What is true about this place* / *Three options I considered* / *Why I chose mine, and the number I computed* / *What I gave up* / *What I could not verify* (at least two items, each with where to look) / *Who could be harmed, and how I would reduce it*; (b) one **Evidence Exhibit** - a small table or simple chart, every figure sourced or VERIFY-marked, ending with the line "What this exhibit does not show:"; (c) a **2-minute video pitch** (link); (d) a **60-word portfolio blurb**.
7. **Through your lens** - four bullets, one per lens (Health / Computer Science & Data / Design & Marketing / Entrepreneurial & Finance), each naming one specific extra thing that lens adds to the Evidence Exhibit.
8. **Your four sittings** - a 4 x 50-minute plan, then: "If you only have two hours, do sittings 1 and 3, then the memo."
9. **How you will be marked** - 5 plain-English bullets.
10. **Ready-to-submit checklist** - 8 checkboxes.

**Tone.** Learners are analysts solving a problem, never visitors observing hardship. Say residents, households, graduates - never "the poor". Do not use the phrase "tanker mafia"; write "the informal tanker market".

**Self-check before returning - state each result.**
- [ ] Count of empirical claims, and confirmation that each has a named source and year or a [VERIFY: ...] marker.
- [ ] Every invented number sits under the fictional scenario-parameters heading.
- [ ] All named institutions are real and correctly spelled.
- [ ] Memo section headings appear exactly as listed.
- [ ] Sittings total about 200 minutes, not more.
- [ ] Nothing requires a laptop, paid software, a site visit, or a stable internet connection.
- [ ] Whole brief is under 1,400 words.
````

#### Check the output

- [ ] Every Karachi fact has a named source and year inline, or a [VERIFY: ...] marker - open the doc and count them; zero unmarked bare statistics
- [ ] Budgets and household counts appear ONLY under the heading that says fictional scenario parameters
- [ ] The four levers each sound genuinely defensible - if you can pick the 'right' answer in ten seconds, send it back
- [ ] The four sittings add up to roughly 200 minutes and none of them need a laptop or a site visit
- [ ] The memo headings match the ones you will grade against and the ones the submission activity asks for


<a id="capstone-workbench-sim"></a>
### Capstone Workbench simulation (offline draft scaffolder + pitch timer)

**When to use:** When you want a week-4 module that walks the learner through writing the memo on their phone instead of staring at a blank page.  
**Produces:** Standalone HTML simulation for public/simulations/ (completion rule: reported)

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Build `capstone-workbench.html`: a single self-contained file that walks a Solutions Builder through drafting their capstone Decision Memo on a phone, then rehearsing the 2-minute pitch. Vanilla JS and CSS only - no libraries at all (D3 is allowed by the contract but is not needed here; do not include it).

**Three sandbox rules that will bite this artifact specifically.**
1. `localStorage`, `sessionStorage`, cookies and IndexedDB all THROW. There is no autosave and there can never be one. Keep the draft in one plain JS object in memory.
2. Because of rule 1, "get your words out of this tab" is a first-class feature, not an ending. A sticky bar at the top must always read: "Draft lives only in this tab. Copy it out before you close it." with an always-reachable **Copy my draft** button.
3. No microphone, no camera, no recording. `getUserMedia` is unreliable here. The pitch step is a timer and cue cards only.

**Copy-out mechanism - implement exactly this.** A panel that assembles the whole draft as plain Markdown into a visible, selectable, read-only `<textarea>` at least 10 rows tall. A Copy button that tries `navigator.clipboard.writeText(...)` inside try/catch, falls back to `textarea.select()` plus `document.execCommand('copy')`, and on failure shows: "Copy button blocked. Long-press the text above, choose Select all, then Copy." Always render the textarea even when copying works. Add a best-effort `beforeunload` warning but never rely on it.

**Flow - seven steps, one screen each, with a step counter ("3 of 7") and Back/Next.** Every step shows: the question, one worked example sentence from a *different* topic than the learner's (so they cannot copy it), a textarea, a live word counter with the target range, and a one-line "why this section matters to an employer".

1. *The decision I recommend* - target 25-40 words. Hard-stop nudge above 40.
2. *What is true about this place* - 120-180 words. Below the box, a fixed reminder: "Every number needs a source and a year, or write [VERIFY: what to check, where to look]." Add a live counter that scans the text and displays "Numbers found: N. Sources or VERIFY markers found: M." - if N > M, show an amber warning line (with text, never colour alone).
3. *Three options I considered* - three separate small boxes, each 40-70 words, each labelled "the strongest argument FOR this option".
4. *Why I chose mine, and the number I computed* - a small calculator strip (three labelled numeric inputs and a computed result the learner names themselves) plus 120-180 words. Show the arithmetic as a sentence they can paste.
5. *What I gave up* - 60-100 words. Example placeholder shows a real tradeoff, not a humblebrag.
6. *What I could not verify* - two boxes, each needing a claim and a place to look. Next stays disabled until both have text.
7. *Pitch rehearsal* - assembles a 6-line cue card from steps 1, 4 and 5, then a Start button running a 120-second countdown with section markers at 0:12, 0:35, 1:05, 1:35 and 1:50. Show the current cue line in large type, minimum 20px, and the time remaining. Reset button. No audio.

At step 7, after the first full timer run OR when the learner opens the copy-out panel with steps 1-6 non-empty, call `window.healComplete(100, {steps_filled: <n>, words: <total>})` exactly once. Guard it with a boolean so it can never fire twice.

**Layout and accessibility.** Single column, works at 360px, no horizontal scroll. Tap targets 44px minimum. Real `<label>` elements tied to every input. Visible focus ring. Nothing hover-only. Headings 'Bricolage Grotesque', body 'Inter', the assembled draft and counters 'IBM Plex Mono' - Google Fonts only. Teal #0f8b80 for primary actions, coral #ef4423 for warnings paired with a word like "Warning:", surface #ffffff on #f6faf9. Radius 1.25rem. Keep total file under ~60KB; no images, inline SVG only.

**Content rule.** The example sentences you write must reference real Karachi institutions (KW&SC, PPHI Sindh, KMC, Sindh TEVTA, OPP-RTI, Edhi) and must not contain any statistic. Where an example would naturally carry a number, write it as `[VERIFY: ...]` so the example teaches the habit.

**Self-check before returning.**
- [ ] Search your own output for `localStorage`, `sessionStorage`, `document.cookie`, `indexedDB`, `fetch(`, `getUserMedia`, `<img src`, and any CDN other than fonts.googleapis.com - all must be absent.
- [ ] `healComplete` is called at most once; confirm the guard.
- [ ] The copy-out textarea renders even if the Copy button fails.
- [ ] Every input has an associated label; tab order runs top to bottom; focus is visible.
- [ ] Renders with no horizontal scroll at 360px width.
- [ ] No example sentence contains an unsourced number.
- [ ] State the final file size in KB.
````

#### Check the output

- [ ] Open it, type into three steps, and reload the page - it should lose everything AND you should have been warned loudly beforehand; that is correct behaviour, not a bug
- [ ] The Copy my draft button is reachable from every step, and the draft text is visible and selectable even if the button does nothing
- [ ] Shrink your browser to 360px wide - no sideways scrolling, every button still comfortably tappable
- [ ] Type '45% of households' into step 2 with no source and confirm the warning line appears in words, not just colour
- [ ] The 2-minute timer changes the cue line at the marked times and never records audio


<a id="capstone-submission-activity"></a>
### Capstone submission activity JSON (objective gate + memo)

**When to use:** When you need the graded submission step in the admin panel that actually gates the certificate without burying you in essays.  
**Produces:** Activity JSON spec, pasted into the admin activity editor

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Write the **capstone submission activity JSON** for the IESP topic <TOPIC>. Return valid JSON only, in one fenced code block, with a short plain-English note after it listing which questions a learner could answer without doing the capstone (there should be none).

**How grading actually works here, so design to it.** The score is computed over objective questions only. Essays are never auto-scored; they are stored for human review and only checked against `minWords`. A submission passes when score >= `pass_score` AND every essay meets its minimum word count. Matching and order questions award partial credit. So a learner with perfect objective answers still fails if their memo is 400 words when `minWords` is 600 - say so in the `intro`.

**Design constraint that drives everything.** Roughly 30 learners x free essays with no staff is a grading bottleneck. Use exactly six objective questions and exactly two essays: the memo, and a link. Nothing else.

**The six objective questions.**
- `mcq` on fact discipline: four candidate sentences from a memo, only one acceptable; the distractors should be an unsourced statistic, a statistic sourced to "studies show", and a scenario parameter presented as a real-world fact.
- `multi` on what belongs in "What I could not verify": five candidates, 2-3 correct, distractors being things that are simply unknown-to-anyone versus things the learner personally did not check.
- `matching`: five factual questions matched to the body that could settle each one - draw from PBS (Pakistan Bureau of Statistics), Sindh Bureau of Statistics, PCRWR, KW&SC, EPI Sindh, WHO, and the relevant local institution for <TOPIC>.
- `order`: the six steps of the analysis in the correct sequence (define the decision, establish what is true, list options, compute the comparison number, choose and state the tradeoff, name what is unverified).
- `numeric`: an arithmetic result every learner must compute from the SAME scenario-parameter table in the capstone brief - for example a per-household or per-beneficiary cost. Set `tolerance` to allow honest rounding, and set `unit`. This is the question that cannot be answered without opening the brief.
- One more `mcq` on ethics through the lens: which stakeholder is most likely to be harmed by the recommended class of intervention, with plausible distractors.

**The two essays.**
- The memo: `minWords` 600, prompt tells them to paste the full Decision Memo including all seven required headings, and warns them to draft in the Capstone Workbench or a notes app first because a long form on mobile data is fragile.
- The link: `minWords` 12, prompt asks for the public URL of the 2-minute video plus one sentence naming the decision it argues.

Set `pass_score` to 70.

**Match this schema exactly** (ids unique, no trailing commas, `pairs` keys are strings):
```json
{
  "intro": "Submit your capstone. Objective questions are graded instantly; your memo is read by a reviewer.",
  "pass_score": 70,
  "questions": [
    {"id":"q1","type":"mcq","prompt":"Which sentence belongs in your memo?","options":["A","B","C","D"],"answer":2},
    {"id":"q2","type":"multi","prompt":"Which belong under 'What I could not verify'?","options":["A","B","C","D","E"],"answers":[0,3]},
    {"id":"q3","type":"matching","prompt":"Match the question to the body that could answer it.","left":["...","..."],"right":["PCRWR","PBS"],"pairs":{"0":0,"1":1}},
    {"id":"q4","type":"order","prompt":"Put the analysis steps in order.","items":["...","...","..."],"correctOrder":[1,0,2]},
    {"id":"q5","type":"numeric","prompt":"Cost per household of Option B, to the nearest rupee?","answer":3750,"tolerance":5,"unit":"PKR per household"},
    {"id":"q7","type":"essay","prompt":"Paste your full Decision Memo.","minWords":600}
  ]
}
```

**Fact discipline.** Any real-world figure inside a question or option must carry a named source and year, or a `[VERIFY: ...]` marker. Numbers used in the `numeric` question must come only from the fictional scenario-parameter table, and the prompt must say so.

**Self-check before returning.**
- [ ] The JSON parses. State that you mentally parsed it and there are no trailing commas.
- [ ] Exactly six objective questions and exactly two essays.
- [ ] Every question type carries its exact required fields (`answer` / `answers` / `left`+`right`+`pairs` / `items`+`correctOrder` / `answer`+`tolerance`+`unit` / `minWords`).
- [ ] `pairs` keys are strings; all index values are inside the array bounds.
- [ ] Recompute the numeric answer from the scenario parameters and show your arithmetic below the code block.
- [ ] No question is answerable by guessing from general knowledge.
- [ ] No unsourced real-world statistic anywhere in the JSON.
````

#### Check the output

- [ ] Paste the JSON into the admin editor and confirm it saves without a schema error
- [ ] Do the numeric question yourself from the brief's scenario table - if you cannot get the same answer, the brief and the activity disagree
- [ ] Read the six objective questions cold: could a learner who never opened the capstone brief pass them? If yes, reject
- [ ] Only two essays exist, and one of them is a link - confirm you are signing up for one real read per learner
- [ ] The memo essay's minWords matches the memo length the brief asks for (600 minimum against a 700-900 word target)


<a id="capstone-rubric-reviewer-kit"></a>
### Capstone rubric + volunteer reviewer calibration kit

**When to use:** Before anyone marks a single capstone, so two different reviewers give the same memo the same score.  
**Produces:** Markdown document: learner-facing rubric, reviewer scoring sheet, three full worked exemplars, feedback sentence bank

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce the **IESP Capstone Rubric and Reviewer Calibration Kit** for topic <TOPIC>. One Markdown document, four parts. It must let a volunteer reviewer who has never seen IESP mark their first memo correctly within ten minutes of opening it.

**Part 1 - Learner-facing rubric (shown before they start).** Five criteria, four levels each (Not yet / Developing / Solid / Distinction), in a table. Each cell is a plain-English observable behaviour, not an adjective. Write "names one number they computed themselves and shows the arithmetic", never "demonstrates strong analytical ability". The five criteria:
1. *Decision clarity* - is there one recommendation, stated in under 40 words, that a busy client could act on?
2. *Evidence honesty* - are figures sourced with organisation and year, and are unknowns marked rather than filled in?
3. *Reasoning* - is there a comparison number, computed by the learner, with the method visible?
4. *Tradeoff* - do they name what their choice costs, specifically and without self-congratulation?
5. *People* - do they name who could be harmed and what they would do about it, in this specific Karachi context?
End Part 1 with a short box: "Three things that will cost you marks fastest" - an invented statistic; an empty "What I could not verify" section; a recommendation that ignores the budget cap.

**Part 2 - Reviewer scoring sheet.** Each criterion scored 0-3, total out of 15. State the pass line (recommend 8/15 with no criterion at 0, and make the reasoning explicit). Add a hard rule: any memo containing a specific statistic with no source and no VERIFY marker cannot score above Developing on Evidence honesty, no matter how good the rest is. Include a 90-second triage order so reviewers read efficiently: recommendation first, then "What I could not verify", then the computed number, then the rest. Add a note on what to do with a memo that is excellent but clearly AI-drafted with no local specificity - the fix is to ask for two named local details, not to accuse.

**Part 3 - Three full worked exemplars.** Write three complete Decision Memos for <TOPIC>, each 700-900 words, using the seven mandatory headings, at these levels: one that fails (scores about 5/15), one solid pass (about 10/15), one distinction (about 14/15). After each, give the filled scoring sheet with a one-line justification per criterion. The failing one must fail in realistic ways - confident tone, no sources, a recommendation that quietly exceeds the budget, a "What I could not verify" section that says "nothing significant". Do not make it stupid; make it plausible, because that is what reviewers will actually receive. Every real-world figure inside every exemplar must be sourced with organisation and year or written as `[VERIFY: ...]`, INCLUDING inside the failing exemplar - mark the failing one's fabrications explicitly as `[EXAMPLE OF A FABRICATED FIGURE - DO NOT REUSE]` so the document never launders a fake number into circulation.

**Part 4 - Feedback sentence bank.** Twenty-five ready sentences a reviewer can pick from, grouped by criterion, each written directly to the learner in second person, specific and non-crushing. Plus three complete feedback templates (one per level) of 60-90 words that a reviewer assembles in under two minutes. Every template must end with one concrete next action the learner can take in 20 minutes.

**Tone and context.** Reviewers may be Ziauddin University faculty or volunteers. Assume no training. Learners paid PKR 2,000 and will read feedback closely; never sarcastic, never generic praise. Use real institution names throughout (KW&SC, PPHI Sindh, EPI Sindh, KMC, Sindh TEVTA, OPP-RTI, KATI, Edhi, JPMC) and no invented ones.

**Self-check before returning.**
- [ ] Every rubric cell describes something a reader can point at in the text.
- [ ] The three exemplars are genuinely different in quality and all three are plausible submissions.
- [ ] All exemplar figures are sourced, VERIFY-marked, or explicitly flagged as deliberate examples of fabrication.
- [ ] The scores you assign match the rubric cells you cite; re-score one exemplar to confirm.
- [ ] A reviewer could mark a memo in under 10 minutes using only Parts 2 and 4.
- [ ] No criterion can be satisfied by writing more words.
````

#### Check the output

- [ ] Give the failing exemplar and the rubric to someone who has never seen IESP; they should land within one point of the stated score
- [ ] Every rubric cell names something you can literally underline in a memo - no 'demonstrates understanding'
- [ ] The failing exemplar reads like a real confident student submission, not a strawman
- [ ] No fabricated statistic appears anywhere except inside explicit [EXAMPLE OF A FABRICATED FIGURE] tags
- [ ] You can assemble real feedback for one learner in under two minutes using Part 4


<a id="portfolio-gallery-entry"></a>
### Portfolio gallery entry format + learner writing guide

**When to use:** When you are defining how a finished capstone appears in the public gallery, and teaching learners to write their entry.  
**Produces:** Markdown spec: field list with character limits, three worked examples, learner guide, moderation checklist

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce the **IESP Portfolio Gallery Entry Specification and Writing Guide**. One Markdown document. This defines what a finished capstone looks like in the public gallery, and teaches a Solutions Builder to write theirs.

**The test every decision must pass.** A hiring manager at a Karachi company, or an admissions reader at a university abroad, is looking at this on a phone for about 40 seconds, and has already seen fifty CVs claiming "leadership" and "passion for social impact". The entry must, in those 40 seconds, prove that this person made a specific decision under a specific constraint and knows what they do not know. Generic impact language is the failure mode, not the goal.

**Part 1 - Field spec.** Define each field with an exact character limit, a one-line rule, one good example and one rejected example. The gallery must render on a 360px screen, so limits are tight and non-negotiable.
- `entry_title` (max 70 chars) - must name the decision, not the theme. Good: "Recommended a published valve schedule over new storage for 1,200 households in Orangi". Rejected: "Water Project - Karachi".
- `topic` and `lens` - fixed values from the four topics and four lenses.
- `the_call` (max 180 chars) - the recommendation in one sentence a non-expert understands.
- `the_constraint` (max 120 chars) - the budget, timeline or capacity limit that made it hard. Must be labelled as a scenario parameter.
- `three_findings` - exactly three bullets, max 140 chars each. At least one must contain a number with its source and year, or a `[VERIFY: ...]` marker.
- `the_tradeoff` (max 200 chars) - what the recommendation gives up.
- `what_i_could_not_verify` (max 200 chars) - at least one item. This field is mandatory and is the single strongest signal in the whole entry; say so in the guide.
- `exhibit` - one table or simple chart image, plus a 90-char caption ending with what it does not show.
- `video_url` - the 2-minute pitch.
- `credential_url` - `https://<DOMAIN>/verify/<CERT ID>`, shown as "Verify this credential".
- Learner identity fields, which should map onto what the platform already stores on a spotlight profile: display name, headline, city, country, short bio, and what they are working on now. Note that publishing is opt-in and requires explicit consent, and that consent can be withdrawn.
- A mandatory footer line, fixed wording, on every entry: "This analysis was produced in a simulated advisory scenario as part of the Immersive Experience & Simulation Program. Scenario parameters are fictional; cited figures are sourced."

**Part 2 - Three complete worked examples**, from three different topics and three different lenses, every field filled to spec, using real Karachi institutions (KW&SC, OPP-RTI, PPHI Sindh, EPI Sindh, KMC, Sindh TEVTA, KATI, Edhi, JPMC). Every figure sourced with organisation and year or `[VERIFY: ...]`.

**Part 3 - Learner writing guide, about 500 words.** Second person, short sentences, written for someone whose English is academic but not first-language. Include: a 15-minute path from finished memo to finished entry (the entry is a compression of the memo, not new writing); a before/after rewrite of a weak title into a strong one; and a list of eight phrases to delete on sight - "passionate about", "leveraged synergies", "gained valuable insights", "eye-opening experience", "raised awareness", "the underprivileged", "changed my life", "cutting-edge". Explain in one line why each fails with a Pakistani employer specifically: they signal a certificate collector, and the reader is scanning for someone who can do the work on Monday.

**Part 4 - Moderation checklist for Heal**, ten items, covering: no unsourced statistic; no claim of having worked for or with a named institution; no identifiable resident named or photographed without consent; no poverty framing; the disclosure footer present; the verify link resolving; character limits respected; the video link publicly reachable.

**Self-check before returning.**
- [ ] Every field has a character limit and both a good and a rejected example.
- [ ] The three worked examples respect every limit - count the characters and state the counts.
- [ ] Every figure in every example is sourced or VERIFY-marked.
- [ ] No example implies the learner was employed by or acting for a real institution.
- [ ] Read one example aloud in 40 seconds; if you cannot, the limits are too loose.
- [ ] The disclosure footer appears verbatim on all three examples.
````

#### Check the output

- [ ] Read one worked example on your phone with a timer - 40 seconds should be enough to know what the person decided and what it cost
- [ ] Every title names a decision; if a title would work as a chapter heading, it fails
- [ ] The 'what I could not verify' field is filled in every example, and reads as confidence rather than weakness
- [ ] Character counts are actually respected - spot-check two fields
- [ ] The simulation disclosure footer is present verbatim so nobody can read the entry as real consulting work


<a id="video-pitch-kit"></a>
### 2-minute video pitch: script skeleton + recording guide for a nervous first-timer

**When to use:** When a learner has finished the memo and now has to point a phone at their own face for two minutes.  
**Produces:** Markdown document: timed script skeleton with word budgets, one filled example, recording and upload guide

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce the **IESP 2-Minute Pitch Kit** for topic <TOPIC>. One Markdown document. This is a deliverable, not an admissions gate - nobody is rejected for a shaky video, and the guide must say that in the first three lines, because fear of being judged is the main reason this step does not get done.

**Reader.** A Pakistani undergraduate who has probably never recorded themselves speaking. Likely anxious about their accent, their room, and their face. Filming on a phone, at home, with siblings and traffic outside, possibly during load-shedding. Write warmly and practically. Short sentences. No hype.

**Part 1 - The script skeleton, with timings and word budgets.** Speak at about 125 words per minute, which is slower than normal conversation and clearer for a non-native speaker under stress. Total budget about 250 words. Give a table with, for each beat: the time window, the word budget, what the beat must do, one fill-in-the-blank line, and one sentence on why a viewer needs it.
- 0:00-0:12, ~25 words - Name, university, and the decision in one sentence. No throat-clearing, no "Hi everyone, my name is... and today I'm going to talk about". Start with the decision.
- 0:12-0:35, ~48 words - The place and the constraint. One number, with its source and year, or a stated uncertainty.
- 0:35-1:05, ~62 words - The options and the one number you computed. Say the arithmetic out loud.
- 1:05-1:35, ~62 words - The recommendation and what it gives up.
- 1:35-1:50, ~31 words - What you could not verify and where you would look.
- 1:50-2:00, ~22 words - Close: your name, Impact Certification, Heal Social Foundation, and "verify at" the link.
Add a hard rule: never read a paragraph aloud. Convert the script into six cue-card lines of at most eight words each, and give the six cue lines for the filled example.

**Part 2 - One filled example** for <TOPIC>, at the real word budget, using real institutions and with every figure sourced with organisation and year or written as `[VERIFY: ...]`. Speak it in your head against the clock and state the estimated runtime. Then show the same pitch compressed to its six cue lines.

**Part 3 - Recording guide, practical and local.** Cover: face a window mid-morning or late afternoon and never sit with the window behind you; the cheapest stability rig is the phone leaned against a stack of books at eye level; record horizontally for portfolio use and say that vertical is acceptable if that is what they have; the quietest surface in most homes is a room with a bed and a curtain, because cloth kills echo - avoid bare tiled rooms; if a generator or traffic is loud, wired earphones with an inline mic beat the phone mic; tape the cue card just beside the lens, not below the screen, so the eyeline stays close.

Also cover the psychology, concretely: do a deliberate throwaway take first and delete it unwatched; three takes maximum, then keep the best and move on; if you stumble, pause, breathe, and repeat the sentence rather than restarting; clarity beats accent, so slow down and put one idea in each sentence; speaking a single Urdu phrase when quoting a resident is natural and good, and should be translated in the next sentence.

**Part 4 - Captions, file and upload.** Auto-captions mangle Karachi words, so always check and correct: Orangi, Korangi, Landhi, Lyari, katchi abadi, KW&SC, PPHI, TEVTA, and every number. Record 1080p at 30fps; aim under about 150 MB; upload over wifi where possible. If upload keeps failing, the fallback is an unlisted YouTube video or a Drive file with link sharing set so anyone with the link can view - and the guide must tell them to open their own link in a private browser window to confirm it actually works before submitting. Add a one-line note that a video with no face on camera, narrating over the exhibit instead, is fully acceptable if being on camera is not possible for them.

**Self-check before returning.**
- [ ] Word budgets sum to about 250 and the beats sum to 120 seconds.
- [ ] The filled example is at budget - state its actual word count.
- [ ] Six cue lines, each eight words or fewer.
- [ ] Every figure in the example is sourced or VERIFY-marked.
- [ ] The first three lines say clearly that this is not an admissions gate.
- [ ] Every recording tip is doable with only a phone, a window, books and earphones.
- [ ] The whole document is readable on a phone in under six minutes.
````

#### Check the output

- [ ] Read the filled example aloud with a stopwatch - it should land between 1:50 and 2:05, not 3 minutes
- [ ] The very first line of the pitch is the decision, not a greeting
- [ ] Nothing in the recording guide requires a tripod, a ring light, a quiet office, or paid editing software
- [ ] The opening reassures a nervous learner explicitly that the video is a deliverable, not a test they can fail
- [ ] The captions section names the specific Karachi words that auto-captions get wrong


<a id="linkedin-share-pack"></a>
### LinkedIn share pack: post copy, certification entry, and honesty rules

**When to use:** On completion day, when learners want to post and you need them to sound credible rather than inflated.  
**Produces:** Markdown document: exact LinkedIn field values, four post variants by lens, headline options, banned-claims list

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce the **IESP LinkedIn Share Pack**. One Markdown document, ready to copy and paste. Parameters the learner fills: <FIRST NAME>, <TOPIC>, <LENS>, <CERT ID>, <DOMAIN>, <UNIVERSITY>.

**Part 1 - The Licenses & Certifications entry, exact values.** Give the field-by-field values LinkedIn asks for:
- Name: `Impact Certification - Immersive Experience & Simulation Program (IESP)`
- Issuing organisation: `Heal Social Foundation`
- Issue date: month and year of issue
- Expiration date: leave blank; the credential does not expire
- Credential ID: `<CERT ID>`
- Credential URL: `https://<DOMAIN>/verify/<CERT ID>`
Add one line telling the learner to open that URL themselves first and confirm it shows their name, and a note that the same page is what the QR code on their certificate resolves to.

**Part 2 - Four post variants, one per lens** (Health / Computer Science & Data / Design & Marketing / Entrepreneurial & Finance), each 120-170 words, each following the same spine but sounding like a different person wrote it:
1. Open with the decision, not the certificate. First line must survive LinkedIn's "see more" truncation at roughly 140 characters and must make someone want to expand.
2. One sentence of situation naming a real place and a real institution.
3. The number they computed and what it changed in their thinking.
4. One sentence naming what they could not verify - this is the line that makes the post credible and almost nobody writes it.
5. One line of plain disclosure: this was a simulated advisory scenario, and the fee-based programme is run by Heal Social Foundation, a Section 42 non-profit, with Ziauddin University as MOU partner.
6. The verify link and a light close. Maximum three hashtags, and no emoji spam - at most one.
Also give a 40-word ultra-short variant for people who hate posting, and a 60-word version suitable for a WhatsApp status or an Instagram caption, since that is where many learners' networks actually are.

**Part 3 - Headline and About-section snippets.** Three profile headline options under 120 characters that reference the analytical capability, not the certificate. One 55-word About paragraph. One three-line "Projects" section entry with a link to the portfolio gallery entry.

**Part 4 - Honesty rules, stated as a hard list.** This part protects both the learner and Heal, so write it plainly and explain the reason for each rule in a clause.
Never write or imply: that they were "selected for" or "accepted into" the programme if enrolment was open; that they "worked with" or "consulted for" KW&SC, PPHI, KMC, Sindh TEVTA, Ziauddin University or any other named body; that the programme was a fellowship, internship, or job; that there was a stipend; that any real-world outcome occurred - no household got water, no child got vaccinated, no job was created; that the credential is a degree, a licence, or accredited by HEC.
Always: use "completed", not "awarded" or "honoured to receive"; say "simulated scenario" or "scenario-based analysis" at least once; keep the verify link visible.
Add a short "cringe filter": six overused openers to avoid ("Thrilled to announce", "Humbled and honoured", "I am excited to share that I have successfully completed", "This journey has taught me", "Grateful to Almighty and my mentors for this milestone", "Excited to embark on") with a better replacement line for each - and note kindly that these are extremely common in Pakistani LinkedIn precisely because they feel safe, which is exactly why leading with the decision stands out.

**Part 5 - Two worked example posts**, fully written for two different topics with a real place, one sourced figure with organisation and year (or a `[VERIFY: ...]` marker), and the disclosure line intact.

**Self-check before returning.**
- [ ] Every LinkedIn field value is given literally, ready to paste.
- [ ] Each post variant's first 140 characters work as a standalone hook - quote them and count.
- [ ] Every variant contains the simulation disclosure and the verify link.
- [ ] No variant contains an unsourced statistic, a claimed real-world outcome, or a claimed relationship with a named institution.
- [ ] Word counts stated for each variant.
- [ ] No banned opener appears anywhere except in the list of things to avoid.
````

#### Check the output

- [ ] Every post variant names the simulation explicitly - paste one into LinkedIn's preview and confirm the disclosure is visible before 'see more' or immediately after
- [ ] The Credential URL format matches your live verify page exactly and loads a real certificate
- [ ] No variant claims a real-world result or a relationship with KW&SC, PPHI, KMC, TEVTA or Ziauddin
- [ ] The first 140 characters of each post make you want to click - if the hook is the certificate, send it back
- [ ] A learner could paste the Licenses & Certifications values without asking you a single follow-up question


<a id="employer-credential-explainer"></a>
### Explaining the credential to an employer (and to an admissions reader)

**When to use:** When a learner is asked 'what is IESP?' in an interview, or is attaching the credential to an application.  
**Produces:** Markdown document: one-page explainer, spoken scripts, hard-question answers, CV entry, SOP paragraph

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Produce **"Explaining Your Impact Certification"** - a Markdown document a Solutions Builder keeps and uses when someone who has never heard of IESP asks what it is. Parameters: <TOPIC>, <CERT ID>, <DOMAIN>.

**The core strategic instruction.** Lead with the work, not the credential. Nobody in Karachi has heard of IESP, and no explanation of the programme will impress them. What can impress them is a 700-900 word decision memo about their city with sourced figures and a named tradeoff. So every script in this document follows the same move: describe the problem you analysed, then the decision you made, then mention the programme and the verify link last, as evidence rather than as the headline.

**Part 1 - The 30-second spoken answer** to "what is this IESP thing on your CV?" About 75 words. Write it to be said out loud, contractions allowed. Then a 15-second version for when the interviewer is clearly moving on.

**Part 2 - The 150-word written explainer** the learner can paste into an email or a job application's free-text box. It must state: that IESP is a four-week simulation-based programme run by Heal Social Foundation, a Section 42 non-profit registered with SECP (CUIN 0265422), with Ziauddin University as MOU partner; that the work was scenario-based analysis of real Karachi problems using published sources; that assessment was graded and the credential is independently verifiable at `https://<DOMAIN>/verify/<CERT ID>`; and that the fee was PKR 2,000 with no stipend. Do not hide the fee. Stating it first removes its power as a gotcha.

**Part 3 - The four hard questions, answered honestly.** For each: the question as it is really asked, a short honest answer of 40-70 words, and a one-line note on why honesty outperforms deflection here.
1. "So you paid for this certificate?" - Yes, PKR 2,000, which is what a non-profit charges to run and assess the programme. Redirect immediately: the payment is not the claim; the memo and the graded assessments are, and both are checkable. Offer the memo.
2. "Did you actually work with KW&SC / PPHI / the government?" - No. It was a simulated advisory scenario built on published data. Saying this plainly is a credibility gain, and the learner should say it before being asked whenever the project comes up.
3. "Is it recognised or accredited? Is it HEC approved?" - It is not a degree and not an accreditation. It is a verifiable record that specific graded work was completed. Say what it is; never inflate.
4. "Everyone has online certificates now. Why should I care about this one?" - Because you can read the actual output in four minutes and check the sources yourself. Then hand over the memo or the gallery link.
Add one more line of coaching: if an interviewer is dismissive, do not defend the programme; ask if they would like to see the one-page memo. The artifact ends the argument.

**Part 4 - CV and application formatting.** Give the exact lines for a Pakistani CV, which conventionally has Education, Certifications and Projects sections. Show the credential as a two-line Certifications entry with the verify URL, and separately as a three-line Projects entry that leads with the decision and the constraint - and explain that the Projects entry does more work than the Certifications entry, because employers here are used to internship certificate letters and are unmoved by another certificate line. Include a note on what to put in an ATS-scanned application versus a human-read one.

**Part 5 - The admissions paragraph.** A 110-word paragraph for a statement of purpose or scholarship application, written for a reader who has never been to Pakistan and needs context in one clause, not a paragraph. It must show initiative, one concrete local detail, one moment of intellectual honesty about the limits of the analysis, and no self-congratulation. Add three lines of guidance on why the honesty sentence is the part admissions readers remember, and one rewritten before/after example showing a bragging version becoming a credible one.

**Part 6 - A short note for the person checking.** Five lines a learner can forward to an HR officer explaining what the verify page shows, that certificate data is immutable once issued, and that a revoked credential displays as revoked rather than disappearing.

**Self-check before returning.**
- [ ] Every script leads with the work and mentions the credential last.
- [ ] The PKR 2,000 fee and the absence of a stipend are stated openly, never buried.
- [ ] Nothing claims accreditation, employment, a real-world outcome, or a relationship with any named institution.
- [ ] Word counts stated for the 30-second, 150-word, and 110-word pieces - read the spoken one aloud and confirm the timing.
- [ ] Every answer to a hard question would still be true if the interviewer called Heal to check.
- [ ] Plain English throughout; no sentence over 25 words.

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] Ask a friend who has never heard of IESP to read Part 2 and tell you what the learner actually did - if they can only tell you they got a certificate, it fails
- [ ] The 'so you paid for it' answer states the fee in the first sentence and then redirects to the memo
- [ ] No script implies accreditation, employment, or work with a real institution - check every paragraph
- [ ] The Projects CV entry leads with the decision and constraint, and reads stronger than the Certifications entry
- [ ] Read the 30-second answer aloud with a stopwatch; it should land at 28-35 seconds, not 60


## Learner experience, accessibility, ops and recruitment

> Authored directly rather than by a subagent (the design agent for this category was cut off by a session limit). Covers everything surrounding the content: bilingual handling, a low-bandwidth audit, the cold-open test, recruitment collateral, the trial runbook, feedback instruments, and post-completion outcome tracking. Deliberately excluded: paid-ads copy (no budget, and organic university channels are the higher-leverage route), and an alumni-community platform (premature at 30 learners).


<a id="bilingual-urdu-pass"></a>
### Bilingual pass — where Urdu genuinely helps, and where it is tokenism

**When to use:** After any learner-facing artifact is drafted in English, before it ships.  
**Produces:** Markdown decision table plus corrected bilingual HTML snippets

#### Prompt

````text
Follow the IESP Build Contract pasted above.

You are doing a bilingual pass on an IESP learner-facing artifact. I will paste the artifact below.

Start from a position of scepticism about bilingual content. Half-translated interfaces are worse than monolingual ones: they signal effort without delivering comprehension, and they often produce broken typography. Your job is to decide *surgically* where Urdu earns its place.

**Step 1 — Classify every text element in the artifact into one of four buckets:**

1. **Translate (high value).** Consent language, payment and refund terms, the no-stipend disclosure, safety or ethics warnings, and anything where a misunderstanding has a real cost to the learner. A student agreeing to publish their work must understand exactly what they agreed to.
2. **Gloss (medium value).** Domain terms a learner may know in Urdu but not English, or vice versa — fecal coliform, catchment, informal settlement, attrition. Provide the English term with a short Urdu gloss in parentheses on first use. Do not translate the whole sentence.
3. **Leave in English (translating would harm).** Technical/professional vocabulary the learner needs to carry into a job interview or a CV. Translating these deprives them of the term they will actually be assessed on. Say so explicitly where it applies.
4. **Cut entirely.** Text that is only there because someone felt a section needed words. Bilingual work is expensive; do not spend it on filler.

Produce this as a table: element | current English | bucket | rationale | Urdu text if applicable.

**Step 2 — Fix the typography.** Urdu in Noto Nastaliq Urdu is not a drop-in font swap. For every element you are translating or glossing, produce the corrected HTML with:
- `dir="rtl" lang="ur"` on the Urdu element (not on the whole page unless the whole page is Urdu)
- `line-height: 2.1` minimum — Nastaliq has deep descenders and clips at normal line heights
- Adequate vertical spacing between lines; Nastaliq needs more room than Latin type
- Correct handling of mixed-direction runs: an Urdu sentence containing an English term or a number needs the Latin run wrapped so it does not reverse. Show the exact markup.
- Never centre long Urdu body text; it hurts readability in Nastaliq

**Step 3 — Sanity-check the translation itself.** Use natural, spoken Karachi Urdu, not formal literary Urdu and not a machine-literal rendering. A 20-year-old undergraduate should read it and hear a person, not a government form. Where a phrase has no natural Urdu equivalent, say so and recommend keeping the English term with a gloss rather than coining something awkward.

**Flag honestly:** if you are not confident in a translation, mark it `[VERIFY: Urdu phrasing — confirm with a native Karachi speaker]` rather than guessing. A wrong translation in a consent notice is a real problem, not a cosmetic one.

**Self-check before returning:**
- [ ] Every element is classified into exactly one bucket with a stated reason
- [ ] I have recommended AGAINST translating at least some things, with reasons
- [ ] Every Urdu snippet has dir, lang, and line-height set
- [ ] Mixed-direction runs (numbers, English terms inside Urdu) are handled explicitly
- [ ] Uncertain translations carry a [VERIFY] marker
- [ ] I have not silently expanded scope into translating the entire artifact

--- ARTIFACT TO PASS OVER ---
<PASTE THE ARTIFACT HERE>

---

**HARD CONTRACT REMINDER — this artifact is a sandboxed HTML file. Three things kill it silently, so re-read them before you write a line:**
1. `localStorage`, `sessionStorage` and cookies **throw** in this iframe (no same-origin). Hold all state in a plain in-memory JS variable. If you catch yourself persisting anything, stop.
2. The **only** external libraries that load are Google Fonts, D3, and Three.js from the CDNs named in the contract. Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie and every external image host fail silently offline. Vanilla JS/CSS or D3/Three — nothing else.
3. Call `window.healComplete(score)` exactly once, only when the learner genuinely finishes. Do not define it; it already exists.

````

#### Check the output

- [ ] It recommends leaving some things in English and explains why — a pass that translates everything has not engaged with the question
- [ ] Every Urdu snippet sets dir, lang and line-height 2.1
- [ ] Consent, payment and disclosure language is in the translate bucket
- [ ] Uncertain phrasing is flagged rather than guessed
- [ ] Paste one Urdu snippet into the artifact and confirm it renders without clipped descenders at 360px


<a id="low-bandwidth-audit"></a>
### Low-bandwidth and mobile audit — will this actually load on a Redmi on mobile data?

**When to use:** On every interactive HTML artifact before it goes into public/simulations/.  
**Produces:** Markdown audit with severity-ranked findings plus a corrected full replacement file

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Audit the HTML artifact I paste below for a learner on a mid-range Android phone (360px viewport, ~3 year old device, mobile data they pay for, patchy signal, possibly during load-shedding). Be adversarial. Assume it fails until proven otherwise.

**Hard failures — find every instance and fix them:**

1. **Storage APIs.** `localStorage`, `sessionStorage`, `document.cookie`, IndexedDB. These THROW in this sandbox — the iframe has no same-origin. Any one of these kills the whole artifact at load. This is the single most common generated-code failure. Search specifically for it.
2. **Non-whitelisted external resources.** Only Google Fonts, D3, and Three.js from the named CDNs are rewritten to self-hosted copies. Anything else — Chart.js, Tailwind CDN, React, GSAP, anime.js, Lottie, any external image or icon host, any analytics — will silently fail to load offline. Replace with vanilla JS/CSS or inline SVG.
3. **External images.** Any `<img src="http...">` is a failure. Replace with inline SVG or CSS, or a small data URI.

**Weight and performance:**
- Estimate total transferred bytes. Anything over ~500KB deserves justification; over 1MB needs cutting. State the estimate and the biggest contributors.
- Flag large data URIs, unminified inline libraries, and oversized inline datasets. If an inline dataset is bloating the file, recommend sampling it down and say how many rows are actually needed to make the pedagogical point.
- Flag anything that animates continuously (drains battery) or runs a tight `requestAnimationFrame` loop when idle.
- If Three.js is used: does it degrade or at least not hang on a low-end GPU? Is there a static fallback?

**Layout and interaction at 360px:**
- Any horizontal overflow of the page body is a failure. Wide tables, charts and code blocks must scroll inside their own container, not push the page.
- Tap targets under 44px.
- Hover-only interactions — a phone has no hover. Any tooltip, reveal, or control that only appears on hover is unreachable. This is very common in D3 charts specifically; check every one.
- Text below 16px in body copy (triggers iOS zoom and is hard to read).
- Fixed-position elements that cover content when the on-screen keyboard opens.
- Anything requiring precise dragging — hard on a small touchscreen. Recommend a tap-based alternative.

**Resilience:**
- If the learner rotates the device mid-task, is state lost?
- If they background the app and return, does it still work?
- Is there any long form whose contents would be lost on an accidental back-navigation? Flag it; suggest chunking into steps.

**Output format:**
First, a severity-ranked findings table: severity (fatal/major/minor) | location | problem | fix. Then the **complete corrected file**, not a diff — I want to paste it straight in. Then a one-line verdict on whether the estimated weight is acceptable.

**Self-check before returning:**
- [ ] I searched explicitly for localStorage/sessionStorage/cookies and reported the result even if zero
- [ ] I listed every external URL and classified each as whitelisted or not
- [ ] I checked every interactive element for hover dependence
- [ ] I gave a concrete byte estimate, not a vague statement
- [ ] The corrected file is complete and self-contained, and still calls healComplete() correctly
- [ ] I did not introduce any new external dependency in my fixes

--- ARTIFACT TO AUDIT ---
<PASTE THE FULL HTML HERE>

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] It explicitly reports on storage APIs even when it finds none
- [ ] It lists every external URL and classifies each
- [ ] It gives a real byte estimate, not hand-waving
- [ ] The returned file is complete and still calls healComplete once
- [ ] Open the corrected file at 360px in a browser devtools mobile view and confirm no horizontal scroll


<a id="cold-open-test"></a>
### The cold-open test — can a confused learner self-serve at 11pm with nobody to ask?

**When to use:** On any module, brief, or flow before the trial cohort touches it.  
**Produces:** Markdown walkthrough transcript with friction log and prioritised fixes

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Role-play, in character and in detail, a first encounter with the IESP artifact I paste below.

**Your character:** Ayesha, 20, third-semester BS student at a Karachi university. Smart, busy, mildly sceptical. She paid PKR 2,000 herself and is quietly worried it was a waste. It is 11:40pm on a weeknight. She has a midterm in three days. She is on her phone, in bed, on mobile data. There is nobody to ask for help and she will not email support — she will just close the tab and maybe not come back.

Write a **minute-by-minute transcript of her first 10 minutes**, in first person, including her unspoken reactions. Be honest and unflattering where warranted. Specifically capture:

- **The first 30 seconds.** What does she see? Does she understand what this is and what she is meant to do? Is there a reason to continue, or does it read as an assignment?
- **The first real decision point.** Does she know what is being asked? Does she have the information she needs, or is she guessing?
- **The first moment of friction.** Where exactly does she hesitate, re-read, or consider quitting? Quote the specific text or element that caused it.
- **The moment she would close the tab.** Be specific. There almost always is one — find it. If you genuinely cannot find one, say so and defend that claim.
- **Whether she would tell a friend about this.** And what she would actually say, in her words.

Then produce:

**A friction log** — a table of every point of confusion, ranked by how likely it is to cause an exit: location | what confused her | why | fix.

**The three highest-leverage fixes**, with the exact replacement text or markup for each. Not descriptions of fixes — the actual words to paste in.

**A verdict on the opening.** Does something in the first two minutes make her want to continue? If not, write the opening that would. IESP's whole premise is that this is not boring; the opening is where that promise is kept or broken.

**Be genuinely critical.** A glowing walkthrough is a failed test and tells us nothing. If it is boring, say it is boring. If the instructions are unclear, quote them and say why. If it feels like homework with extra steps, say that. If it patronises her or explains something she obviously knows, flag it. The point of this exercise is to find problems before 30 paying learners do.

**Self-check before returning:**
- [ ] The transcript names at least one specific moment she would consider quitting
- [ ] Every friction point quotes the actual text or element responsible
- [ ] My three fixes are literal replacement text, not descriptions
- [ ] I judged the first two minutes specifically, since that is where the drop-off is
- [ ] I have not been polite at the expense of being useful

--- ARTIFACT TO TEST ---
<PASTE THE ARTIFACT, OR A DESCRIPTION OF THE FLOW, HERE>

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] It identifies a specific quit moment rather than concluding everything is fine
- [ ] Friction points quote real text from the artifact
- [ ] The fixes are paste-ready wording, not advice
- [ ] It judges the first two minutes explicitly
- [ ] If the walkthrough is entirely positive, treat the test as failed and re-run with a harsher framing


<a id="recruitment-collateral"></a>
### Recruitment pack — university society outreach, flyer, and honest launch posts

**When to use:** Four to six weeks before a cohort opens, when filling seats.  
**Produces:** Markdown pack: outreach emails, one-page flyer copy, WhatsApp message, LinkedIn posts

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Write the organic recruitment pack for IESP cohort <NUMBER>, opening <DATE>, <N> seats.

**The single hardest constraint, and you must not paper over it:** IESP is a *paid* program with *no stipend*. Pakistani students overwhelmingly expect internships to pay them, not the reverse. Heal is legally required to disclose this plainly and must not bury it. So every piece of copy here has to lead with the outcome — a real portfolio artifact and a verifiable credential — and state the cost honestly and early. Copy that hides the price until the end will produce angry applicants, refund requests, and reputational damage with the exact university partners this depends on. Do not write hype. Write something a sceptical final-year student would find credible.

Also avoid the word "internship" entirely. This is a program, and the distinction is both legal and strategic.

**Produce all of the following:**

1. **Email to a university career services office / department head** (~200 words). Formal but not stiff. Leads with what their students get and what the university gets (a Ziauddin MOU already exists — reference the model, do not overclaim a relationship that does not exist with the recipient). Makes one specific, small ask — forwarding to a mailing list — not a meeting.

2. **Message to a student society** (IEEE branch, ACM chapter, medical or business society) — ~120 words, WhatsApp-appropriate register, written to be forwarded verbatim into a 300-person group. Society officers are hunting for things to share; make it trivially shareable.

3. **One-page flyer copy.** Headline, three benefit lines, a four-week structure summary, the price stated plainly, who it is for, and a single call to action. Specify what image or visual should sit where, but do not attempt ASCII layout.

4. **Three LinkedIn posts**, each in a different register:
   - a launch announcement
   - a post built around a *learner artifact* (the strongest format — describe the artifact-shaped post structure so it can be reused every cohort)
   - a last-call post for remaining seats
   No emoji walls, no "thrilled to announce", no fake urgency. Pakistani professional LinkedIn has a strong sincerity norm; hype reads as a scam.

5. **A short FAQ** answering the questions a sceptical student actually asks: Why do I pay? Is this a job? Will anyone recognise this certificate? How much time? What if I cannot finish? What exactly do I have at the end?

**Rules for all copy:**
- Every factual claim about outcomes must be one Heal can actually stand behind today. If a claim needs evidence that does not exist yet — employer recognition, placement rates, alumni outcomes — either cut it or mark `[VERIFY: do we have evidence for this?]`. Do not invent testimonials, statistics, or partner endorsements.
- Mention the Section 42 non-profit status and the no-stipend disclosure where a reader would reasonably expect it.
- Write in the English register used by educated Karachi professionals — clear, direct, not Americanised.

**Self-check before returning:**
- [ ] The price and the no-stipend fact appear early in every piece, not buried
- [ ] The word "internship" appears nowhere
- [ ] No invented testimonials, statistics, placement rates, or partner claims
- [ ] Claims needing evidence carry a [VERIFY] marker
- [ ] The society message is short enough to forward without editing
- [ ] Nothing reads as hype or manufactured urgency

--- CONTEXT TO FILL IN ---
Cohort: <NUMBER>  Opens: <DATE>  Seats: <N>  Topics offered: <LIST>
````

#### Check the output

- [ ] Price and no-stipend status appear in the first third of every piece
- [ ] No fabricated testimonials, stats, or partner endorsements
- [ ] The word 'internship' is absent
- [ ] The society message is genuinely forwardable as-is
- [ ] Read the LinkedIn posts aloud — if any sentence sounds like a press release, send it back


<a id="trial-runbook"></a>
### Trial cohort runbook — running the first 8–12 learners without a team

**When to use:** Before the free trial cohort starts.  
**Produces:** Markdown operations runbook with day-by-day schedule, scripts and escalation rules

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Write the operations runbook for IESP's **first trial cohort**: 8–12 learners, free (explicitly framed as "help us test this", not as a product), running <DURATION>, staffed by exactly two people who both have other jobs.

Design for the actual constraint: there is no support team, no ticketing system, and no capacity for anything that scales with learner count. WhatsApp is the support channel because that is where these students already are.

**Produce:**

1. **A day-by-day run-of-show** for the trial period. What the team does each day, with a realistic time estimate per task. If total daily load exceeds about 45 minutes, cut scope and say what you cut.

2. **Pre-launch checklist** — everything that must be true before the first learner logs in. Include the unglamorous items: are accounts provisioned, is the admin cohort dashboard showing real data, has someone completed the entire program end to end as a learner, does the certificate actually issue and verify, is the WhatsApp group created.

3. **The learner-facing messages**, written out verbatim and ready to send:
   - the invitation (framing this as testing, setting the expectation that things may break, and being clear it is free)
   - the welcome/kickoff message with what to do first
   - a mid-trial nudge for someone who has not started
   - a mid-trial nudge for someone who started and stalled
   - the wrap-up and feedback request
   Keep each short enough to read on a lock screen.

4. **A triage rule set.** What counts as a bug to fix immediately during the trial versus a note for later. Be concrete: a learner blocked from progressing is immediate; a cosmetic misalignment is not. Include what to do when a learner reports something that cannot be reproduced.

5. **A daily observation log template** — the small number of things worth recording per learner per day. This is the raw material for improving cohort 2, and it is worthless if it is too burdensome to actually fill in. Keep it to a handful of fields.

6. **Explicit stop conditions.** What would mean the trial has found something serious enough to pause and fix before continuing rather than pressing on.

**Design principles to follow:** nothing in this runbook may require a tool that does not exist. No automated emails, no notification system, no dashboards beyond the admin cohort view that is already built. Manual is correct at this size — the goal is to learn what to automate later, not to automate now.

**Self-check before returning:**
- [ ] Daily team time stays under ~45 minutes, or I explicitly said what I cut to get there
- [ ] Every learner-facing message is written out in full, not described
- [ ] Nothing depends on tooling that does not exist (no email automation, no notifications)
- [ ] The observation log is short enough that a tired person will actually complete it
- [ ] Stop conditions are concrete and testable, not vague

--- CONTEXT TO FILL IN ---
Trial dates: <START>–<END>   Learners: <N>   Topics live: <LIST>   Team: <NAMES>

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] Daily ops load is realistic for two part-time people
- [ ] All learner messages are verbatim and lock-screen short
- [ ] It assumes no email automation or notification system
- [ ] The observation log has few enough fields to survive contact with reality
- [ ] Stop conditions are specific enough to act on


<a id="feedback-and-outcomes"></a>
### Feedback instrument for a small trial, plus the 3-month outcome survey

**When to use:** End of the trial cohort, and again 3 months after any cohort completes.  
**Produces:** Markdown: two survey instruments with question rationale and an analysis guide

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Design two separate instruments for IESP. Keep them distinct — they answer different questions.

---

**INSTRUMENT 1 — Trial cohort feedback (n = 8–12).**

The statistical reality: with 8–12 responses, Likert averages are noise. Do not design a satisfaction survey. Design an instrument that surfaces *specific, actionable, quotable* problems. Favour open questions with tight framing over rating scales.

Requirements:
- Completable in under 8 minutes on a phone, or learners will not finish it.
- Include the two questions that actually predict something: whether they would recommend it *and* what they would say, and — crucially — **where exactly they nearly quit**. That second one is worth more than the rest of the survey combined.
- Ask about the specific moments the team cannot observe: what was confusing, what felt like filler, what took much longer than expected, what they skipped.
- Ask directly whether it was worth PKR 2,000 — and since the trial was free, ask the counterfactual: would you have paid, and what would you have expected for that money?
- Include one question that gives a usable testimonial if the answer is positive, without leading the witness.
- Avoid questions whose answers cannot change anything. If a question's answer would not alter a decision, cut it and say why.

For each question, give a one-line rationale for why it earns its place. Then give a short analysis guide: with this few responses, what patterns are meaningful versus what is noise, and how to avoid over-reacting to a single loud opinion.

---

**INSTRUMENT 2 — Three-month outcome survey.**

Sent three months after completion. This has two jobs at once and must serve both:

1. **Learner outcomes** — did this actually do anything for them? Ask about concrete, checkable events, not feelings: did they put it on a CV or LinkedIn, did anyone ask about it in an interview, did they get an internship/job/admission, did they use the method or artifact again, did they reference the portfolio piece anywhere.
2. **Impact evidence for a Section 42 non-profit** — Heal needs defensible outcome data for donors, partners, and PCP certification. Design the questions so the answers are aggregable and quotable without being leading or inflating what happened.

Also include the referral ask here rather than at completion, because by three months there is either a real outcome to point at or there is not — and a referral backed by an actual result is worth far more than one prompted by a certificate high.

Be honest in the design: most respondents will report no dramatic outcome, and the instrument must capture modest and null results cleanly rather than pushing people toward a success narrative. Fabricated or inflated impact data is worse than no data for an organisation seeking certification.

**Self-check before returning:**
- [ ] Instrument 1 is under 8 minutes and asks where they nearly quit
- [ ] Every question has a stated rationale, and I cut questions that fail it
- [ ] The analysis guide warns against over-reading n=10
- [ ] Instrument 2 asks about checkable events, not feelings
- [ ] Null and modest outcomes can be recorded cleanly; nothing leads the respondent
- [ ] Neither instrument asks anything Heal could not act on

--- CONTEXT TO FILL IN ---
Cohort: <NUMBER>   Completion date: <DATE>   Topics offered: <LIST>

**Factual discipline:** any figure, statistic, citation or claim about Karachi must be attributable to a named source with a year stated inline. Where you do not know a real value, write `[VERIFY: what to check, and where to look]` instead of inventing a plausible number. Invented-but-realistic data is the worst failure mode for this programme.

````

#### Check the output

- [ ] Instrument 1 asks explicitly where learners nearly quit
- [ ] Rating-scale questions are rare and justified given n≈10
- [ ] Every question has a rationale and would change a decision
- [ ] Instrument 2 asks about checkable events rather than satisfaction
- [ ] Null results can be recorded without the survey nudging toward a success story


<a id="consent-and-safeguarding"></a>
### Consent, refund policy and safeguarding copy for a paying youth audience

**When to use:** Before the first rupee is taken and before any learner work is published.  
**Produces:** Markdown: consent notices, refund policy, data handling summary, moderation rules

#### Prompt

````text
Follow the IESP Build Contract pasted above.

Draft the trust-and-safety copy IESP needs before taking payment and before publishing any learner work. This is a Section 42 non-profit taking money from students, publishing their work, and holding their personal data — the copy has to be plain, honest and specific.

Write in clear English at roughly a 14-year-old reading level. No legalese: a student should be able to read any of this once and know exactly what they agreed to. Where a term genuinely has a legal meaning, explain it in a parenthetical.

**Produce:**

1. **Portfolio publication consent.** Learners' capstone artifacts go into a public gallery. The consent notice must state exactly: what is published (the artifact, their name?, their institution?, their photo?), where it appears, whether it is indexed by search engines, how long it stays up, and how to withdraw it later. Offer a genuine granular choice — publish anonymously, publish with first name only, publish fully attributed — rather than a single all-or-nothing checkbox. Withdrawal must be a real, easy option, not a theoretical one.

2. **LinkedIn / marketing consent.** Separate from the above and must not be bundled with it. If Heal wants to feature a learner in marketing, that is a distinct permission with its own opt-in. State plainly that declining has no effect on their certificate or standing.

3. **Refund policy.** PKR 2,000, four-week program, no stipend. Cover: the refund window, what happens if the learner cannot complete for personal reasons, what happens if Heal cancels or postpones a cohort, and what happens if the learner is dissatisfied with the content. Recommend a specific, defensible position and explain the reasoning — a generous, clearly-stated policy costs little at this price point and prevents disputes that would be far more expensive in reputation.

4. **Data handling summary.** In plain language: what is collected (email, name, progress, submissions), why, who can see it, whether it is shared with anyone, and how to request deletion. Note where third-party processors are involved without pretending to more precision than is known — mark `[VERIFY: confirm processor list]` rather than guessing.

5. **Safeguarding and conduct.** The audience is young adults, some possibly under 18. Cover: a short code of conduct, how to report a concern and to whom, moderation rules for anything learner-submitted that appears publicly, and whether under-18s are accepted at all — flag this as a decision the team must consciously make, since it carries real obligations, rather than letting it happen by default.

6. **A moderation checklist** for the person approving portfolio entries before they go public: what must be checked (personal data of third parties, identifiable individuals in photos, unverified claims presented as fact, defamatory statements about named institutions, contact details).

Where you are drafting something whose legal specifics depend on Pakistani law or Heal's own registration terms, mark it `[VERIFY: confirm with legal / SECP registration terms]`. Do not state legal conclusions with false confidence.

**Self-check before returning:**
- [ ] Portfolio consent offers granular options, not all-or-nothing
- [ ] Marketing consent is separate and explicitly optional with no penalty
- [ ] The refund policy takes a specific position and justifies it
- [ ] The under-18 question is raised as an explicit decision, not assumed
- [ ] Anything legally uncertain carries a [VERIFY] marker
- [ ] A student could read each notice once and correctly state what they agreed to
````

#### Check the output

- [ ] Portfolio consent has granular options and a real withdrawal path
- [ ] Marketing consent is unbundled from portfolio consent
- [ ] The refund policy is specific, not 'at our discretion'
- [ ] The under-18 question is surfaced as a decision to make
- [ ] Legal uncertainty is flagged rather than asserted
- [ ] Read each notice aloud — if a sentence needs re-reading, simplify it
