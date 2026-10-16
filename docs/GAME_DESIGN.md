# Game Design & Simulation Model

This document explains how the simulation works under the hood, and how each mechanic maps to a real-world lesson about leading enterprise AI transformation. All tunable numbers live in [`src/engine/balance.ts`](../src/engine/balance.ts).

---

## 1. The core loop

```
                ┌──────────── Quarter (×8) ────────────┐
  Event card → Planning (spend capacity + budget) → End quarter → Board review
       ▲                                                            │
       └────────────────────────────────────────────────────────────┘
```

1. **Event**: a crisis, opportunity, dilemma, or risk-driven incident. Every choice produces a **debrief**.
2. **Planning**: you have **team capacity** (3 per quarter, +1 per hired engineering squad). Most actions cost 1 capacity plus budget.
3. **End quarter**: pilots resolve, live systems deliver value and gain adoption, run costs are paid, and risk is assessed.
4. **Board review**: trust moves based on value against expectations, executive support, PoC purgatory, risk, and budget discipline. **Trust below 15 = fired.**

## 2. Discovery & triage

Each of the 8 departments hides 2–3 use cases (21 total). Auditing a department reveals them, plus the department's true **data readiness** (0–100).

Every use case defines:

| Field | Meaning |
|---|---|
| `clues` | Audit observations. A careful reader can infer the right approach from them. |
| `value` | Value potential ($M/quarter at 100% adoption with the ideal approach, ×1.8 global scale). |
| `dataRequirement` | Readiness an approach with `dataMult = 1.0` needs. |
| `sensitivity` | Blast radius when things go wrong (privacy, legal, customer harm). |
| `ideal` / `acceptable` | Which approaches fit the *shape* of the problem. |

Several use cases are **process problems in disguise** (a 7-signature approval policy, 14 duplicated onboarding forms, 5 sequential review rounds). The ideal answer there is **Process Redesign**, with no AI at all.

## 3. The six approaches

| Approach | Pilot | Quarters | Run cost/q | Risk weight | Data mult | Start adoption |
|---|---|---|---|---|---|---|
| Process Redesign | $120K | 1 | $0 | 0.00 | 0.0 | 55% |
| Buy: Vendor AI / Copilot | $250K | 1 | $120K | 0.35 | 0.3 | 20% |
| RAG Assistant | $550K | 2 | $80K | 0.55 | 0.9 | 25% |
| Agentic Workflow | $950K | 2 | $180K | 1.00 | 0.8 | 22% |
| Fine-Tuned Model | $1.3M | 3 | $50K | 0.60 | 1.2 | 25% |
| Predictive ML | $650K | 2 | $50K | 0.45 | 1.0 | 30% |

Costs are multiplied by the use case's `scale`.

### Fit determines value

| Fit | Base pilot success | Share of value potential captured |
|---|---|---|
| Ideal | 82% | 100% |
| Acceptable | 60% | 60% |
| Poor | 40% | 22% |

A poor-fit pilot can still "succeed" technically. The debrief then explains why **technical success ≠ business value**.

**Pilot success chance** = base(fit) + 8% (if evals policy) + 15% × iterations − 1.2% × readiness gap, clamped to [5%, 95%].

**Readiness gap** = max(0, `dataRequirement × dataMult − departmentReadiness`). Data Foundation Sprints (+22 readiness) close it.

Outcomes: `success` (100% value), `mixed` (55% value), `failed` (can't scale: iterate or kill).

## 4. Production, adoption & value

```
value/quarter = useCase.value × 1.8 × fitValue × resultValue × (adoption / 100) × (HITL ? 0.85 : 1)
```

Adoption grows every quarter:

```
growth = 5 + 4 × literacyLevel + (morale − 50) / 6
       + 8  if the department has AI champions
       + 10 for process changes
       + 3  for bought tools when the sanctioned tool catalog exists
       + 2  with human-in-the-loop (people trust overseen systems)
```

Adoption is capped at 95%. **Lesson: deployment is worth nothing until people use it.**

## 5. Risk

```
projectRisk = riskWeight × sensitivity × 28 × stageFactor × (HITL ? 0.45 : 1) × (1 − mitigation)
totalRisk   = riskBase + Σ projectRisk × scenario.regulation          (clamped 0–100)
```

- `stageFactor` is 0.25 for pilots and 1.0 in production.
- `mitigation` (max 60%) comes from policies: AUP 5%, Review Board 12%, Evals 18% (generative builds), Privacy 15% (sensitive cases), Bias Audits 25% (people-impacting).
- **Shadow AI drift:** without a sanctioned tool catalog, `riskBase` grows +2.5 per quarter (+1 with an AUP), and +1 more if you banned AI tools.
- **Incidents:** each quarter, `chance = (risk − 25) / 100` (max 55%) of drawing a risk-driven incident whose preconditions match your portfolio (hallucinations need customer-facing GenAI, prompt injection needs live agents, and so on).

## 6. The board

```
expected  = scenario.expectations[quarter] × hype
perceived = value × (KPI dashboard ? 1.0 : 0.65)
```

| Trust factor | Rule |
|---|---|
| Honeymoon | +2 in Q1 |
| Value vs. expectations | `(perceived / expected − 1) × 10 × weight`, clamped [−10, +8]; `weight` ramps from 0.7 in Q2 to 1.0 by Q4 |
| Board patience | −3 × (streak − 1) once 2+ consecutive quarters land below 60% of target |
| Executive support | `(weighted stakeholder average − 50) / 8`; CEO and CFO count 1.5× |
| PoC purgatory | −2 per pilot whose results sat a full quarter undecided (max −8) |
| Risk alarm | −(risk − 60) / 5 when risk exceeds 60; +1 when risk is below 25 with 2+ live systems |
| Budget overrun | −8 if the budget is negative |
| Workforce unrest | −3 if morale is below 25 |

Next quarter's budget allocation = `scenario.allocation × (0.5 + trust / 100)`. Hype decays 10% toward 1.0 each quarter.

## 7. Stakeholders

Six executives (0–100 support) react to your decisions. The CTO likes building and dislikes buying, the CFO loves kills and measured ROI, the CISO loves policies and HITL, the CHRO loves training and transparency, the COO loves process fixes, and the CEO loves launches and demos. Their weighted average feeds board trust every quarter, and their quips appear in your inbox.

## 8. Scoring (1,000 points)

| Component | Max | Full marks at |
|---|---|---|
| Value delivered | 300 | Scenario value target ($15–16M) |
| ROI | 150 | 1.8x |
| Adoption at scale | 150 | 100% average adoption across 5+ live systems |
| Risk management | 150 | Final risk ≤ 20 |
| Board trust | 150 | Trust ≥ 85 |
| Morale | 100 | Morale ≥ 80 |

Getting fired multiplies the score by 0.6 and caps the grade at **D**. Grades: S ≥ 850, A ≥ 720, B ≥ 580, C ≥ 440, D ≥ 300.

**Archetypes** come from play style: Transformation Architect, Pragmatic Operator, Change Whisperer, Governance Hawk, PoC Collector, Hype Merchant, Cowboy Builder, and Steady Hand.

## 9. Balance verification

`src/engine/balance.test.ts` plays 24 seeded games per scenario with three scripted bots:

| Bot | Strategy | Expected result |
|---|---|---|
| Expert | Ideal approaches, data sprints when needed, fast scale/kill decisions, governance, and change management | Survives ≥ 80% of games, ROI > 1x, mostly S/A (Relaxed), A (Standard), B/C (Brutal) |
| Random | Random approaches and decisions | Scores ≥ 150 points below the expert; usually fired |
| Idle | Does nothing | Fired in ≥ 90% of games |

A regression test also confirms that "ship one cheap win, then coast" eventually gets you fired.

## 10. Real-world references

Debriefs cite well-documented public cases, paraphrased: *Moffatt v. Air Canada* (2024), Samsung's 2023 restrictions on generative AI, Amazon's scrapped recruiting model (Reuters, 2018), *Mata v. Avianca* (2023), the Chevrolet-dealer and DPD chatbot incidents (2023–24), Klarna's 2025 commitment to keep humans reachable, the EU AI Act's high-risk classification for employment AI, the OWASP Top 10 for LLM Applications, Gartner's 2024 prediction about abandoned GenAI PoCs, and MIT NANDA's 2025 "GenAI Divide" report. Company names inside the game (Pemberton, Synergex, McAllister & Partners, and the rest) are fictional.
