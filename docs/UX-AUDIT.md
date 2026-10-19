# UI and UX audit

**Date:** 19 October 2026 · **Version reviewed:** `main` at `3a25836` (the same build that is live on GitHub Pages) · **Written by:** Claude Code (AI), for review by Michael

This is the working list of UI and UX improvements. Tick an item when it ships and put its ID in the commit message, for example `fix(UX-01): let scorecard charts shrink on phones`.

## How the audit was done

- Played the game in Chrome from the title screen to the scorecard: events, audits, triage, a pilot, board reviews, scaling to production, and both end screens (fired and finished).
- Checked two sizes: desktop (1440px wide) and a phone-sized frame 390px wide (the width of an iPhone 12 to 15).
- Read every UI component and the store. Measured element sizes in the browser, calculated text contrast against WCAG AA, and moved through dialogs with the keyboard only.
- Lint, typecheck, tests and the production build all pass. The game loads about 177 KB of JavaScript (gzipped).

**Not covered:** real iPhone and Android devices, a screen reader (VoiceOver or NVDA), sessions with real players, game balance, and the written content. The automated Chrome window ran in the background, which slows animations, so animation speed was not judged.

## What already works well

- The core loop is easy to follow: event, spend capacity, end the quarter, board review. The board review shows exactly why trust moved.
- Debriefs are the best part. Each one gives a verdict, the reason, a real-world parallel and a Playbook principle, and the decision log keeps them all.
- Triage shows honest trade-offs for each approach (cost, time, risk, data fit) without giving the answer away.
- The foundations are solid: shared Button and Modal components, a visible focus outline, reduced-motion support, a table view for every chart, and status shown in words as well as colour.
- Auto-save and "Continue" survive a page reload.

## Summary

| Priority | Meaning | Items |
|---|---|---|
| **P1** | Visibly broken, can lose progress, or blocks some players. Fix first. | 7 |
| **P2** | Makes the game noticeably harder to learn or use. | 15 |
| **P3** | Polish and nice-to-haves. | 30 |

**Effort:** S = under 2 hours · M = half a day to a day · L = more than a day.

**Suggested order:**

1. Quick fixes (about a day): UX-01, 02, 03, 07, 12, 14, 16, 17, 20, 22
2. Dialogs and feedback: UX-04, 05, 06, 08, 23, 25
3. Phone layout: UX-09, 10, 11, 32, 33, 34, 39
4. Learning loop: UX-13, 15, 18, 29, 30
5. Accessibility sweep: UX-21, 35, 36, 37, 38, 40
6. Everything else in P3

**About the README:** it says the game is "keyboard-navigable" and "playable on phones". Today both are only partly true. UX-06 fixes most of the keyboard gap, and UX-01, 02, 09 and 10 fix most of the phone gap.

---

## P1: fix first

- [x] **UX-01: Scorecard charts are cut off on phones** · Phone · S
  - **What happens:** on a 390px phone, both charts on the end screen are 634px wide, so their right side (the latest quarters, the end labels and the card border) is cut off. Desktop is fine.
  - **Fix:** let the chart shrink. Add `min-w-0` to the chart's `<figure>`, or `grid-cols-1` to the grid that holds the two charts. The chart first renders 600px wide, and a plain one-column grid never lets it get narrower.
  - **Where:** `src/components/screens/EndScreen.tsx:163`, `src/components/charts/LineChart.tsx:36`

- [x] **UX-02: Long button labels run off narrow screens** · Phone · S
  - **What happens:** button text never wraps. On a 390px phone, the title screen's "Continue: Pemberton Logistics, Q2 · Year 1" button is 404px wide and is cut off on both sides. On the pilot results screen, "Scale to production · $500K · 1 capacity" is 21px wider than its card.
  - **Fix:** allow wrapping on small screens, or use shorter labels on phones (for example "Continue · Q2 Y1", with the company name as a second line). Check every button that combines an action, a price and a capacity.
  - **Where:** `src/components/ui/Button.tsx:43` (`whitespace-nowrap`), `src/components/screens/TitleScreen.tsx:95`, `src/components/portfolio/ProjectModal.tsx:240`

- [x] **UX-03: Tooltips on the first and last metric tiles are cut off** · Desktop · S
  - **What happens:** hovering "Budget" (far left) or "Morale" (far right) opens a 288px tooltip centred on the tile. The part past the edge of the screen is clipped, so the first or last words of each line are missing.
  - **Fix:** keep tooltips inside the screen. Anchor them to the left edge for tiles on the left and to the right edge for tiles on the right, or use a positioning helper such as Floating UI that flips and shifts.
  - **Where:** `src/components/ui/Tooltip.tsx:20`, `src/styles/index.css:147` (`#root` hides horizontal overflow)

- [x] **UX-04: Pop-up messages cover the dialog you are working in** · All screens · M
  - **What happens:** toasts sit above every dialog. Right after an audit, the "Good call" debrief toast and an executive's comment cover the use-case clues you need to read next, for up to 10 seconds. On phones, two toasts cover about 30% of the screen. After scaling a pilot, they hid the new "Live in production" card.
  - **Fix:** while a dialog is open, show the message inside it (a slim banner at the top) or hold toasts until it closes. On phones, show one compact toast at a time at the top of the screen.
  - **Where:** `src/components/feedback/Toasts.tsx:72` (z-index 58, above dialogs at 50 and 55), `src/store/gameStore.ts:170`

- [x] **UX-05: Destructive actions have no confirmation or undo** · All screens · M
  - **What happens:** one click on "Abandon & start over" deletes the saved game. "Kill it", "Kill pilot" and "Retire system" are permanent too, and on phones "Kill it" sits directly under "Scale to production".
  - **Fix:** add a confirm step for Abandon ("Abandon this game? Your save will be deleted."). For Kill and Retire, either confirm or offer "Undo" until the end of the quarter. The engine is pure, so keeping the previous state for one step is cheap.
  - **Where:** `src/components/hud/TopBar.tsx:93`, `src/components/portfolio/ProjectModal.tsx:123`, `:261`, `:303`

- [x] **UX-06: Dialogs let keyboard focus escape, and lose it when they close** · Accessibility · M
  - **What happens:** a dialog moves focus into itself when it opens but does not keep it there. On day one the tutorial closes on top of the first event, and focus does not go back into the event. Pressing Tab then moved through "How to play", "Mute sound", "Menu" and the metric tiles hidden behind the dialog. Focus never returns to the button that opened a dialog.
  - **Fix:** keep Tab and Shift+Tab inside the open dialog, make the rest of the page `inert`, and return focus to the opening button on close. The native `<dialog>` element does most of this for you.
  - **Where:** `src/components/ui/Modal.tsx:27-40`

- [x] **UX-07: On phones, the board review opens scrolled to the bottom** · Phone · S
  - **What happens:** the "Begin next quarter" button has `autoFocus`, so the dialog scrolls down to it. On a 390×757 screen the review opened 222px down, which hid the headline and the first figures. The event result screen uses the same autofocus, so a long debrief will open scrolled down too.
  - **Fix:** focus the dialog or its heading first and keep the scroll position at the top. If the button keeps autofocus, focus it with `{ preventScroll: true }`.
  - **Where:** `src/components/report/QuarterReportModal.tsx:143`, `src/components/events/EventModal.tsx:129`

## P2: important

- [ ] **UX-08: Key rules are hidden in hover-only tooltips** · Touch and screen readers · M
  - **What happens:** what each metric means, and what each executive loves and hates, appear only on hover or focus. On touch screens they appear only as a side effect of a tap; in testing, one stayed open over the tab bar with no way to close it. Screen readers never get the text, because nothing links it to its tile (`aria-describedby`).
  - **Fix:** use tap-to-open popovers with a close button (or a small "i" button), linked with `aria-describedby`. On phones, show the executives' loves and hates as visible text in the People tab.
  - **Where:** `src/components/ui/Tooltip.tsx`, `src/components/hud/MetricTile.tsx:70`, `src/components/people/StakeholderPanel.tsx:37`

- [ ] **UX-09: On phones, the scoreboard fills the whole first screen** · Phone · M
  - **What happens:** the header wraps onto three rows and the seven metric tiles stack into four rows. Together they take about 570px of an 800px screen, so the game itself starts below the fold, and every tab switch means scrolling past the scoreboard again.
  - **Fix:** a compact phone scoreboard: one row with the three or four numbers that matter most (budget, trust, risk, capacity) that expands on tap. Move the help, sound and menu icons onto the title row.
  - **Where:** `src/components/hud/TopBar.tsx:22`, `src/components/hud/MetricsBar.tsx:43`

- [ ] **UX-10: On phones, two of the five tabs are off-screen** · Phone · M
  - **What happens:** the tab bar scrolls sideways, and "Playbook" and "People" start off-screen. On phones, People is the only place to see the executives and the inbox. The tab bar also scrolls away with the page.
  - **Fix:** a fixed bottom navigation bar on phones with all five tabs visible (icon plus short label), combined with the action bar. At minimum, make the tab bar sticky and fit all five tabs.
  - **Where:** `src/components/screens/GameScreen.tsx:38`

- [ ] **UX-11: On phones, the pilot results screen is cramped and the decision is far down** · Phone · S
  - **What happens:** the result stamp and three figure tiles share one row, so the tile labels wrap onto three or four lines and the figures barely fit. Scale, Iterate and Kill come after the full debrief, a long scroll away.
  - **Fix:** below about 640px, stack the stamp above the figures. Make "Your decision" a sticky footer, like the "Launch pilot" bar on the triage screen.
  - **Where:** `src/components/portfolio/ProjectModal.tsx:187`, `:216-268`

- [ ] **UX-12: Ending a quarter never warns you** · All screens · S
  - **What happens:** I ended Q1 with 1 of 3 capacity unused and got no prompt; the unused capacity is simply lost. Pilots still waiting for a decision drop into PoC purgatory, also without a prompt.
  - **Fix:** if capacity is left or a pilot is undecided, show a short confirmation that lists them ("1 capacity unused · 1 pilot will enter PoC purgatory") with "End anyway" and "Go back".
  - **Where:** `src/components/hud/ActionBar.tsx:74`, `src/store/gameStore.ts:174`

- [ ] **UX-13: Day one stacks the tutorial on top of the first event** · Onboarding · L
  - **What happens:** a new game shows the quarter title card, then a five-slide text tutorial opened on top of the first event (two dialogs stacked), then the event. All of this happens before the player has seen the dashboard the tutorial describes.
  - **Fix:** show the tutorial before the event, not over it, and cut it down to the core loop. Teach the rest in context: a guided first quarter that points at Capacity, the Org Map and "End quarter" when each becomes relevant.
  - **Where:** `src/store/gameStore.ts:135`, `src/components/screens/GameScreen.tsx:116-120`, `src/components/feedback/HowToPlay.tsx`

- [ ] **UX-14: The company recommended for learning isn't the default** · Onboarding · S
  - **What happens:** the setup screen preselects Pemberton Logistics (Standard). The card that says "A good place to learn the fundamentals" is Lumen Home & Living (Relaxed).
  - **Fix:** preselect Lumen for a first game (for example, when no game has been finished yet) and tag it "Recommended for your first game".
  - **Where:** `src/components/screens/SetupScreen.tsx:21`

- [ ] **UX-15: Approaches are hard to compare during triage** · Core loop · M
  - **What happens:** "Best for" and "Watch out" appear only on the selected card, and that card grows and pushes the next row down. To compare all six approaches you have to click each one in turn. On phones the six cards form one long column.
  - **Fix:** show a one-line "Best for" on every card. Consider a compact comparison table (cost, time, risk, data fit) as a second view, especially on phones.
  - **Where:** `src/components/org/TriagePanel.tsx:127`

- [ ] **UX-16: Some actions hide that they use capacity** · Core loop · S
  - **What happens:** "Data sprint" and "Recruit AI champions" each use 1 capacity, but their buttons show only the price ("Data sprint (+22 readiness) · $350K"). The Audit and Launch buttons show both.
  - **Fix:** use one cost format everywhere: "$350K · 1 capacity". A small shared cost-label helper keeps it consistent.
  - **Where:** `src/components/org/DepartmentModal.tsx:45-53`, `src/engine/actions.ts:83-86`

- [ ] **UX-17: Disabled buttons don't say why** · Feedback · S
  - **What happens:** Data sprint, Champions, Scale and Iterate put the reason (for example "No team capacity left this quarter.") only in a `title` tooltip, which touch and keyboard users never see. Strategy cards that can't be afforded still show their price instead of the reason. Audit and Launch get it right: they show the reason as text.
  - **Fix:** show the reason as small text under, or instead of, every disabled button.
  - **Where:** `src/components/org/DepartmentModal.tsx:49`, `src/components/portfolio/ProjectModal.tsx:243-255`, `src/components/strategy/StrategyPanel.tsx:88-92`

- [ ] **UX-18: The "fired" scorecard doesn't explain what went wrong** · Learning · M
  - **What happens:** the fired screen promises "Here is what happened, and what to do differently" but gives no reason. The trust factors behind each board review (value below target, PoC purgatory, risk and so on) are kept only for the latest quarter.
  - **Fix:** store each quarter's trust factors in `history`, then add a "Why the board lost confidence" card with the two or three biggest losses and one concrete tip for each. This changes the save format (see UX-26).
  - **Where:** `src/components/screens/EndScreen.tsx:61-65`, `src/engine/types.ts:96`, `src/engine/turn.ts:243`

- [ ] **UX-19: The browser Back button exits the game** · Navigation · M
  - **What happens:** screens and dialogs don't add browser history entries, so Back (or the Android back gesture) leaves the site instead of closing the dialog or returning to the title screen. Auto-save means nothing is lost, but it is jarring, especially on phones.
  - **Fix:** add a history entry when a dialog opens or the screen changes, and handle `popstate` to close the dialog or go back one screen.
  - **Where:** `src/App.tsx`, `src/store/gameStore.ts` (`goTo`, `openDept`, `openProject`)

- [ ] **UX-20: Some text fails contrast checks** · Accessibility · S
  - **What happens:** WCAG AA needs a contrast ratio of at least 4.5:1 for normal text.
    - Text in `ink-500` is 2.6 to 2.8:1: the title screen footnote, the name placeholder, and the "Empty" column labels.
    - Locked badges and locked Playbook cards are faded to 50% opacity, so the text that explains how to earn them drops to 2.2 to 2.5:1.
    - When "Launch pilot" is disabled it shows the reason as its label, at about 2.3:1.
  - **Fix:** use `ink-400` or lighter for all text. Show "locked" with an icon and a muted border instead of fading the text.
  - **Where:** `src/components/screens/TitleScreen.tsx:132`, `src/components/screens/SetupScreen.tsx:43`, `src/components/screens/EndScreen.tsx:200`, `src/components/playbook/PlaybookPanel.tsx:81`, `src/components/org/TriagePanel.tsx:162`

- [ ] **UX-21: A lot of text is 10 to 11px** · Accessibility and phones · M
  - **What happens:** 38 places use 10 to 11px text for real information: metric subtitles, stat labels, executive titles, inbox senders, badge descriptions.
  - **Fix:** make 12px the smallest size, and 14px for anything players must read to make a decision. The small all-caps labels can stay because larger text always sits next to them.
  - **Where:** for example `src/components/hud/MetricTile.tsx:80,87`, `src/components/people/StakeholderPanel.tsx:63,101`, `src/components/screens/EndScreen.tsx:133,154,206`

- [ ] **UX-22: Shared links have no preview image** · Sharing · S
  - **What happens:** the page has `og:title` and `og:description` but no `og:image`, `og:url` or `twitter:card`. A link posted on LinkedIn, Slack or WhatsApp shows no picture.
  - **Fix:** add a 1200×630 preview image (the dashboard screenshot in `docs/screenshots/` is a good start) and the missing tags, using absolute URLs.
  - **Where:** `index.html:13-18`

## P3: polish

- [ ] **UX-23: The event card flip shows scrollbars mid-animation** · Polish · S
  - **What happens:** during the 3D flip from question to debrief, the dialog briefly shows horizontal and vertical scrollbars.
  - **Fix:** `overflow-x: hidden` (or `overflow: clip`) on the flip container.
  - **Where:** `src/components/events/EventModal.tsx:40-56`, `src/components/ui/Modal.tsx:64`

- [ ] **UX-24: The tutorial's Next button moves between slides** · Polish · S
  - **What happens:** the slides have different heights, so "Next" moves (by 23px between slides 1 and 2) and quick clicks miss it.
  - **Fix:** give the slide body a fixed minimum height.
  - **Where:** `src/components/feedback/HowToPlay.tsx:119-127`

- [ ] **UX-25: The top-bar menu doesn't close on an outside click or Escape** · Polish · S
  - **Fix:** close it on an outside click, on Escape and after choosing an item, and move focus into the menu when it opens.
  - **Where:** `src/components/hud/TopBar.tsx:80-103`

- [ ] **UX-26: An incompatible update deletes saves without telling the player** · Trust · S
  - **What happens:** when `SAVE_VERSION` changes, the saved game is thrown away with no message, and the player just finds "New game".
  - **Fix:** show a one-line notice on the title screen ("The game was updated and your previous save couldn't be kept."). This matters as soon as UX-18 changes the save format.
  - **Where:** `src/store/gameStore.ts:245-249`

- [ ] **UX-27: Setup cards use unexplained numbers** · Onboarding · S
  - **What happens:** "Regulation ×1.35" means nothing until you've read the design document.
  - **Fix:** say it in plain words ("AI risk counts 35% more here"), and do the same for "Board trust 50" ("you're fired below 15").
  - **Where:** `src/components/screens/SetupScreen.tsx:86-89`

- [ ] **UX-28: Clues get smaller just when you need them** · Core loop · S
  - **What happens:** the audit clues are 14px and bright on the use-case card, but 12px and dimmer on the triage screen, where you actually choose the approach.
  - **Fix:** make them at least as prominent on the triage screen.
  - **Where:** `src/components/org/TriagePanel.tsx:50-56`

- [ ] **UX-29: The early Playbook is a wall of "???"** · Learning · M
  - **What happens:** early in a game the Playbook shows 35 identical locked cards that all say "Make decisions in this area to unlock this principle."
  - **Fix:** show unlocked principles first and summarise locked ones by category ("5 more in Build vs. Buy"), or give each locked card a hint about how to unlock it.
  - **Where:** `src/components/playbook/PlaybookPanel.tsx:71-98`

- [ ] **UX-30: The board review doesn't suggest a next step** · Learning · M
  - **Fix:** add one or two suggestions based on the biggest trust factors, for example "Value is 0% of target: get a pilot into production."
  - **Where:** `src/components/report/QuarterReportModal.tsx`

- [ ] **UX-31: Nothing says how long a game takes** · Onboarding · S
  - **Fix:** time a few playthroughs, then show the typical length on the title and setup screens (for example "about N minutes · saves automatically").
  - **Where:** `src/components/screens/TitleScreen.tsx:83-91`

- [ ] **UX-32: Long dialogs on phones lose their close button** · Phone · S
  - **What happens:** the ✕ scrolls away with the content in long bottom sheets (department and project). The height limit uses `92vh`, which mobile browser toolbars can cover.
  - **Fix:** a sticky dialog header with the close button, and `dvh` instead of `vh`.
  - **Where:** `src/components/ui/Modal.tsx:64,73-81`

- [ ] **UX-33: Empty Kanban columns take up space on phones** · Phone · S
  - **What happens:** each empty column is at least 220px tall and just says "Empty".
  - **Fix:** collapse empty columns to one line on small screens.
  - **Where:** `src/components/portfolio/PortfolioBoard.tsx:48`

- [ ] **UX-34: The action bar gets tall on phones** · Phone · S
  - **What happens:** with a pilot awaiting a decision, the sticky bar wraps onto three rows (about 130px).
  - **Fix:** on phones, shorten the "awaiting decision" pill to an icon and a count.
  - **Where:** `src/components/hud/ActionBar.tsx:53-64`

- [ ] **UX-35: Screen readers aren't told what changed** · Accessibility · M
  - **What happens:** metric changes are never announced (the floating +/− numbers are hidden from screen readers). Toasts and the quarter title card create their live region at the same moment as their text, which screen readers often miss.
  - **Fix:** one permanent `aria-live="polite"` region that reads a short summary after each action ("Pilot launched. Budget 3.4 million, 1 capacity left.").
  - **Where:** `src/components/hud/MetricTile.tsx:104`, `src/components/feedback/Toasts.tsx:30,72`, `src/components/feedback/QuarterTransition.tsx:39`

- [ ] **UX-36: Whole cards are buttons** · Accessibility · M
  - **What happens:** department cards and decision log entries are `<button>` elements that contain headings and lists. Screen readers read the whole card as one long button name, and the HTML is invalid.
  - **Fix:** make the card a plain container with one clearly labelled button or link.
  - **Where:** `src/components/org/OrgMap.tsx:56`, `src/components/playbook/PlaybookPanel.tsx:108`

- [ ] **UX-37: Arrow keys don't work in pickers and tabs** · Accessibility · M
  - **What happens:** the company picker, the approach picker and both tab bars use radio and tab roles but respond only to Tab. The tabs have no `aria-controls`.
  - **Fix:** arrow-key navigation with a roving `tabindex`, following the standard ARIA patterns for radio groups and tabs.
  - **Where:** `src/components/screens/SetupScreen.tsx:47`, `src/components/org/TriagePanel.tsx:58`, `src/components/screens/GameScreen.tsx:38`, `src/components/playbook/PlaybookPanel.tsx:30`

- [ ] **UX-38: Pop-ups disappear before you finish reading** · Accessibility · S
  - **What happens:** debrief toasts close after 10 seconds even while you are reading them. WCAG 2.2.1 asks for a way to pause.
  - **Fix:** pause the timer on hover and focus, and add a "Read in Playbook" link.
  - **Where:** `src/components/feedback/Toasts.tsx:10-17`

- [ ] **UX-39: Some tap targets are tiny** · Phone · S
  - **What happens:** the toast ✕ is about 22px and the tutorial dots are 6px tall. WCAG 2.2 asks for at least 24px; 44px is comfortable on a phone.
  - **Where:** `src/components/feedback/Toasts.tsx:32`, `src/components/feedback/HowToPlay.tsx:131-136`

- [ ] **UX-40: Reduced-motion players still wait for reveals and count-ups** · Accessibility · S
  - **What happens:** animations follow the reduced-motion setting, but the two-second "Analyzing pilot results" reveal and the counting numbers still run, and nobody can skip the reveal.
  - **Fix:** skip the reveal and the count-ups under reduced motion, and let anyone click to skip the reveal.
  - **Where:** `src/components/portfolio/ProjectModal.tsx:145-161`, `src/components/ui/AnimatedNumber.tsx:18-25`

- [ ] **UX-41: Colours are hard-coded in 29 places, and the charts use the old palette** · Visual · M
  - **What happens:** components use 29 different hex values instead of the theme tokens. For example, `#6fa8c9` appears 10 times and is the same as `--color-metric-adoption`. The end-screen chart lines (`#c98500`, `#3987e5`, `#9085e9`, `#d95926`) are brighter than the softened palette from the last two commits.
  - **Fix:** move the colours into tokens in `index.css`. Pick the chart colours from the soft palette and check that each pair of lines is easy to tell apart.
  - **Where:** `src/components/screens/EndScreen.tsx:170-183`, `src/components/hud/MetricsBar.tsx:10-15`, `src/styles/index.css:3-29`

- [ ] **UX-42: The same thing has different labels** · Copy · S
  - The scorecard says "Fired in Q6"; everywhere else says "Q2 · Year 2".
  - The impact chips say "CHRO", but the executive's title is "Chief People Officer".
  - Strategy buttons say "1 cap" (elsewhere "1 capacity") and show only a price, not the action ("Adopt · $100K · 1 capacity").
  - **Where:** `src/components/screens/EndScreen.tsx:59`, `src/engine/diff.ts:20`, `src/components/strategy/StrategyPanel.tsx:89-91`

- [ ] **UX-43: Department names and titles get cut off** · Visual · S
  - **What happens:** at 1440px wide the Org Map shows "Operations & Supply …", "Group Control…" and "Chief Reven…".
  - **Fix:** allow two lines, or shorten the text in the data.
  - **Where:** `src/components/org/OrgMap.tsx:81-84`

- [ ] **UX-44: Look-alike icons, and hover effects that do nothing** · Visual · S
  - All three companies use the same building icon, and all six policies use the same shield. Distinct icons would make them easier to scan.
  - The six feature cards on the title screen lift on hover but can't be clicked.
  - **Where:** `src/components/screens/SetupScreen.tsx:72`, `src/components/strategy/StrategyPanel.tsx:124`, `src/components/screens/TitleScreen.tsx:121`

- [ ] **UX-45: Chart details** · Visual · S
  - The value chart's axis goes up to $5.00M for data that peaks around $2.7M (its rounding jumps from 3 to 5), so almost half the chart is empty.
  - The "Table view" button sits in a different place on each chart, because it wraps under the longer subtitle.
  - **Where:** `src/components/charts/LineChart.tsx:26-32,90-101`

- [ ] **UX-46: "Copy results" could share better** · Sharing · S
  - On phones, open the system share sheet (`navigator.share`). If copying fails, say so; at the moment it fails silently.
  - **Where:** `src/components/screens/EndScreen.tsx:40-49`

- [ ] **UX-47: No confirmation where you act** · Feedback · S
  - **What happens:** after "Launch pilot" the dialog goes back to the use-case list. The only feedback is a sound, a changed button label and number changes on the scoreboard behind the dialog.
  - **Fix:** a short confirmation inside the dialog, for example "RAG pilot launched · results at the end of Q2 · −$550K · −1 capacity".
  - **Where:** `src/components/org/TriagePanel.tsx:32-35`

- [ ] **UX-48: Auditing takes two clicks** · Core loop · S
  - **What happens:** the department card says "Audit to reveal 3 use cases", but clicking it opens a dialog that contains only the Audit button.
  - **Fix:** put an "Audit" button on the card itself, and keep the dialog for the details.
  - **Where:** `src/components/org/OrgMap.tsx:88-95`, `src/components/org/DepartmentModal.tsx:117`

- [ ] **UX-49: Events hide your numbers** · Core loop · M
  - **What happens:** the event dialog can't be closed or minimised, so you can't check your budget or trust before you choose, even though some choices cost money.
  - **Fix:** show budget, trust and capacity in the event dialog's header, or add a "peek at dashboard" option.
  - **Where:** `src/components/events/EventModal.tsx:38`

- [ ] **UX-50: Sound is on by default** · Polish · S
  - Many people will try the game at work. Consider starting muted (or asking once), and add a volume setting.
  - **Where:** `src/store/gameStore.ts:113`

- [ ] **UX-51: Page basics** · Polish · S
  - The browser tab title never changes ("Q3 · Year 1 · AI Transformation Simulator" would help). There's no `<noscript>` message, and no home-screen icon (`apple-touch-icon` and a web manifest) for players who save the game to their phone.
  - **Where:** `index.html`, `src/App.tsx`

- [ ] **UX-52: Nothing links to the source code or the person who made it** · Sharing · S
  - A player who enjoys the game can't find the code or the person behind it. Add a small footer on the title and end screens, for example "Source on GitHub · made by …".
  - **Where:** `src/components/screens/TitleScreen.tsx:132`, `src/components/screens/EndScreen.tsx:237`
