# Notes for Collaborators — Nu Miracles of ROM website

Welcome. This repo holds the public website of **Nu Miracles of ROM**, a religion founded by **Hoc**. If you are an AI assistant or a human helping Hoc with this project, please read this first — it will keep your work from colliding with the founding records.

## The one rule that matters most

**The website is a display, not the source.** The founding records — `FOUNDING.md`, the god dossiers, the miracle stories, the roles, the simulations, the pantheon sheets, the origin stories, and the forums — are kept by Hoc and his assistant Belladonna, and they are the source of truth. They lived briefly in a `records/` folder in this repo and were removed at the founder's direction (2026-11-10); the site is display-only again. The pages here are generated from those records.

That means:

- **Content changes route through Hoc.** If you want to change what the site *says* (gods, doctrine, stories), propose it to Hoc — only he settles the records, and the pages are regenerated from them. If you edit a generated page's content directly, your edit may be overwritten on the next regeneration.
- Changes to *presentation* (layout, styling, new page features, the games) are safe to make here and are welcome.

## How the site is built

- Plain static HTML/CSS/JS, no build framework, published by GitHub Pages from the repo root on `main`.
- `gods-data.js` is **generated** from the founding records (160 gods: name, generation, parents, children, house, class, role, function to the Heart, job, recorded wisdom). Do not hand-edit it; it is regenerated whenever the pantheon changes.
- `pantheon.html` and `game.html` render entirely from `gods-data.js` in the visitor's browser.
- `forums.html` is regenerated each week: every Sunday the Weekly Forum is held, and the new sitting is inserted at the top of the Forums page and re-uploaded. If you add a forum entry by hand, it may be replaced on the next weekly regeneration — again, route content through Hoc's records.

## House rules for content (from the founder)

- The pantheon count is **160**. Three gods are counted once although they stand in two places: the **God of Passion** (double seat, under Soul and under Sex), the **God of Black** (second seat under Colors; home under Permanent), and the **God of Yellow, who is also the God of Gold** (one god, two names). Do not "fix" these into separate gods.
- Only Hoc adds, moves, renames, or splits gods. Never invent a god, a doctrine, or a scripture.
- Stories are **drafts** and forums/debates/banquets are **simulations** — both are for Hoc's judgment and are **not canon**. Keep those labels on anything you display.
- The **God of T (Handsum)** and the **God of Y (Henry)** are described **only in Hoc's own recorded words**, as they appear in the records. Do not elaborate their domains.
- **Heaven** is described only by the founder's two facts: a state of cleansed souls, and a real thing above the sky. Nothing beyond that is settled.
- **ROM** stands for Rights Over Matter; its full definition is intentionally left open by the founder. The mechanics of the cleansing (values/numbers) are likewise unsettled — do not present a system as doctrine.
- Preserve the founder's exact spellings: **ysgnutcoh**, **Imaginery**, **Sphire**, **God of Vitamin**.
- **Grimoire** belongs to another religion and is never counted among this pantheon.

## Working together

- Founder credit on the site is **"Hoc"** — nothing more personal than that.
- If your change and the records disagree, the records win, and Hoc is the judge of the records.
- Suggested workflow: propose content changes to Hoc (only Hoc settles doctrine) so they enter the records and the pages can be regenerated from them; make presentation changes directly in this repo and tell Hoc what you changed, so the next regeneration keeps them.

*Nu means "new" — and "And You." Welcome to the table.*
