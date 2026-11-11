# Divine Toolbox — Mathematical Architecture (Draft 1.0)

## Design decision

The Divine Toolbox uses a **divine-first symbolic framework**. The pantheon is the organizing system; mathematics makes readings repeatable, internally consistent, explainable, and personal. It does not claim that a formula can prove supernatural causation or predict external events.

The canonical list of Gods remains in **gods-data.js**. The engine must never create substitute Gods or silently rewrite their roles, family relationships, generations, domains, or allegiances.

## System layers

1. **Input layer** — date of birth, reading date, question, chosen intention, and optional user-entered context.
2. **Pantheon layer** — reads names, roles, functions, wisdom, group/class, generation, parents, and children from the canonical data.
3. **Mathematical layer** — deterministic signatures, cycles, resonance ordering, relationship analysis, and (where suitable) weighted scoring.
4. **Interpretation layer** — presents selected Gods using their authored pantheon text, followed by clearly marked reflective prompts.
5. **Tool layer** — birthday readings, decision rituals, relationship reflections, planning, learning, and future modules.
6. **Explanation layer** — shows the equation, inputs, participating Gods, and why the result was produced.

## Birthday reading: Divine Cycle Equation

For birth date b=(yb, mb, db) and reading date t=(yt, mt, dt), use modulus M=997.

**Birth signature**

    B = (31 × birth_month + 17 × birth_day + (birth_year mod 97)) mod 997

**Date pulse**

    D = floor(UTC(date(t)) / 86400000) mod 997

For each God i:

- Ni = hash(name_i) mod 997
- Gi = ((generation_i + 2) × 53) mod 997
- Pi = hash(sorted(parent_names_i)) mod 997

**Divine resonance index**

    Ri = (13B + 7D + 11Ni + 17Gi + 5Pi) mod 997

The engine sorts Gods by Ri, then selects three while preferring distinct pantheon groups. Ties are broken by God name. Identical pantheon data and inputs always produce the same result.

**Interpretation rule:** the index is a symbolic ordering key only. It is not a probability, a measure of divine strength, a luck score, or evidence that an event will happen. The reading uses selected Gods' existing wisdom/function/role/job text as its source material.

## Formula integrity and testing

- **Determinism:** identical pantheon data and inputs produce identical output.
- **Date boundaries:** test leap days, year boundaries, local noon, and tomorrow.
- **Data integrity:** every selected God exists in the canonical data; parent/child names are references, not generated entities.
- **Explainability:** every output exposes its inputs and equation version.
- **Privacy:** birthday data stays in the browser unless a future feature explicitly asks for storage or sync.
- **Versioning:** coefficient or selection changes increment the engine version and are documented.
- **No fabricated confidence:** symbolic readings do not receive predictive accuracy percentages.

## Future divine modules

Each tool should have an equation chosen for its purpose, rather than forcing one universal score onto every subject.

- **Decision ritual:** user-defined criteria and importance weights; compare options transparently without pretending to know the user's values.
- **Relationship reflection:** user-selected dimensions and mutual consent; distinguish compatibility prompts from claims about another person's feelings.
- **Planning cycle:** available time, energy, task size, dependencies, and chosen priority.
- **Learning path:** topic, current knowledge, practice time, and spaced-repetition intervals.
- **Wealth/resource ritual:** arithmetic, budgets, scenarios, and explicit assumptions; never supernatural financial guarantees.
- **Forecasting:** symbolic divine reading stays separate from evidence-based weather, calendar, or statistical forecasts.

## Canon and authorship safeguards

The engine reads the pantheon; it does not decide divine allegiance, invent doctrine, assign new Gods, or resolve open canon questions. Any new divine meaning or canonical equation remains a proposal until approved.
