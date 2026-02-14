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

---

## 6. Template tabs (Classic, Modern, Minimal)

- Open **Builder** or **Preview**. **Expected:** Three tabs above the content: Classic | Modern | Minimal. Classic is selected by default (or the last saved choice).
- Click **Modern**. **Expected:** Resume layout updates (e.g. section titles uppercase, tighter name size). Content and data unchanged. ATS score unchanged.
- Click **Minimal**. **Expected:** More compact layout (smaller type, tighter spacing). Still B&W, no flashy elements.
- Click **Classic**. **Expected:** Default layout restored.
- Refresh the page. **Expected:** The last selected template remains (stored in `localStorage` key `resumeBuilderTemplate`).
- On **Preview** page, switch template. **Expected:** Same three options; layout switches; content identical. Persist and refresh: template choice is remembered.

---

## 7. Bullet structure guidance (Experience & Projects)

- In **Builder**, add one **Experience** entry. In the description textarea, enter one line: `Helped the team with tasks.` (no action verb at start, no number).
- **Expected:** Below the textarea, a subtle inline message appears: “Start with a strong action verb. Add measurable impact (numbers).”
- Change the line to: `Built the dashboard.` **Expected:** “Add measurable impact (numbers).” still shown (no digit/%/k/M/x).
- Add a number: `Built the dashboard and cut load time by 40%.` **Expected:** Guidance disappears or only “Start with a strong action verb” if you remove the verb.
- Add a **Project** with description: `Fixed bugs.` **Expected:** Same guidance (action verb + numbers). Change to `Developed API used by 3 teams.` **Expected:** Guidance clears.
- **Expected:** Input is never blocked; guidance is advisory only.

**Action verbs checked:** Built, Developed, Designed, Implemented, Led, Improved, Created, Optimized, Automated (case-insensitive).

---

## 8. Top 3 Improvements panel

- In **Builder**, below the ATS Score block, **Expected:** A section titled “Top 3 Improvements” with a list (0–3 items).
- With empty or partial resume, **Expected:** Up to 3 items such as: “Add at least 2 projects.”, “Add measurable impact (numbers) in bullets.”, “Expand summary (target 40+ words).”, “Add more skills (target 8+).”, “Add experience (internship or project work).”
- Add content (e.g. 2 projects, numbers in bullets, 40+ word summary, 8+ skills, 1 experience). **Expected:** Corresponding improvement items disappear; list shrinks or empties.
- **Expected:** ATS score logic is unchanged; template switching does not change the score.

---

## 9. Export (Print / PDF and Copy as Text)

- On **Preview** page, **Expected:** Two buttons: “Print / Save as PDF” and “Copy Resume as Text”.
- **Print / Save as PDF:** Click the button. **Expected:** Browser print dialog opens. In print preview (or when printing): only the resume content is shown; nav, template tabs, and export buttons are hidden. Resume uses white background, black/gray text only, no colored accents. Margins and spacing look consistent; sections and items avoid splitting across pages where possible.
- **Copy Resume as Text:** Click the button. **Expected:** Plain text is copied to the clipboard in this order: Name, Contact, Summary, Education, Experience, Projects, Skills, Links. Paste into a text editor to confirm structure. Button briefly shows “Copied!”.
- **Validation warning:** If name is missing **or** (no projects **and** no experience), a calm message appears above or near the buttons: “Your resume may look incomplete.” Export is **not** blocked; user can still Print or Copy.

---

## 10. Layout precision

- On **Preview**, with a full resume: **Expected:** No section overlapping another; consistent vertical spacing between sections and items; long lines wrap and do not overflow (no horizontal scroll). Print output respects the same (no cut-off sections, clean margins).
