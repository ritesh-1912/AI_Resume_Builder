# AI Resume Builder — Verification Steps

## 1. Persistence after refresh

- Open **Builder** (`/builder` or `builder.html`).
- Enter name, summary, add one experience, add two projects, add 8+ skills (comma-separated), add GitHub or LinkedIn URL.
- Refresh the page (F5 or Cmd+R).
- **Expected:** All fields and sections are pre-filled from `localStorage` under key `resumeBuilderData`. Form and live preview match what you had before refresh.

**Check in DevTools:** Application → Local Storage → select your origin → key `resumeBuilderData` should contain a JSON object with `personal`, `summary`, `education`, `experience`, `projects`, `skills`, `links`.

---

## 2. Score changes live while editing

- Open **Builder** with empty or partial data.
- Note the **ATS Readiness Score** (e.g. 0/100) and any **suggestions** below the meter.
- **Add a summary** of 40–120 words (e.g. 50 words). Score should increase by 15 (e.g. 0 → 15); suggestion “Write a stronger summary…” should disappear when in range.
- **Add at least 2 projects.** Score +10; “Add at least 2 projects” should disappear.
- **Add at least 1 experience.** Score +10; “Add at least one experience entry” should disappear.
- **Add 8+ skills** (comma-separated). Score +10; “Add more skills (target 8+)” should disappear.
- **Add GitHub or LinkedIn link.** Score +10; “Add a GitHub or LinkedIn link” should disappear.
- **Add a number or % in an experience/project description** (e.g. “Increased performance by 30%”). Score +15; “Add measurable impact (numbers) in bullets” should disappear.
- **Complete education** (degree, school, year for at least one entry). Score +10; “Complete education…” should disappear.
- **Expected:** Score updates on every change (no “Save” click). Score is capped at 100. At most 3 suggestions shown at a time.

---

## 3. Live preview is real and hides empty sections

- Clear data (or use a fresh incognito window) and open Builder.
- **Expected:** Preview shows name/contact (or placeholders) and no section headers for Summary, Education, Experience, Projects, Skills, Links when those sections are empty.
- Fill **Summary** only. **Expected:** Preview shows “Summary” section with your text; other sections still hidden.
- Add one **Education** entry (degree, school, year). **Expected:** “Education” section appears in preview with that content.
- Add **Experience** and **Projects**. **Expected:** Those sections appear with real content; typography is clean; section headers: Summary, Education, Experience, Projects, Skills, Links (only those with content).

---

## 4. ATS score rules (deterministic v1)

| Rule | Points | Condition |
|------|--------|-----------|
| Summary | +15 | 40–120 words |
| Projects | +10 | ≥ 2 projects |
| Experience | +10 | ≥ 1 experience entry |
| Skills | +10 | ≥ 8 comma-separated items |
| Links | +10 | GitHub or LinkedIn URL present |
| Numbers in bullets | +15 | Any experience/project description contains digit, %, or k/M/x |
| Education complete | +10 | At least one entry with degree, school, and year |
| **Cap** | 100 | Total score min 0, max 100 |

Suggestions are derived from missing rules; max 3 shown.

---

## 5. Routes and design unchanged

- **Routes:** `/`, `/builder`, `/preview`, `/proof` (and `/rb/*` for Build Track) unchanged.
- **Design:** KodNest Premium (tokens, serif/sans, accent, spacing) unchanged; ATS block is calm, minimal (meter + label + value + list).
- **Storage:** Resume data is stored only in `localStorage` under `resumeBuilderData`; no server or other keys used for this feature.
