# AI Resume Builder — Verification Steps

## 1. Persistence after refresh

- Open **Builder** (`/builder` or `builder.html`).
- Enter name, email, summary, add one experience, add one or more projects, add 5+ skills across Technical / Soft / Tools (use tag input: type skill + Enter), add GitHub or LinkedIn URL.
- Refresh the page (F5 or Cmd+R).
- **Expected:** All fields and sections are pre-filled from `localStorage` under key `resumeBuilderData`. Form and live preview match what you had before refresh.

**Check in DevTools:** Application → Local Storage → select your origin → key `resumeBuilderData` should contain a JSON object with `personal`, `summary`, `education`, `experience`, `projects`, `skills` (object with `technical`, `softSkills`, `tools`), `links`.

---

## 2. ATS score updates live while editing

- Open **Builder** with empty or partial data.
- Note the **ATS Readiness Score** (e.g. 0/100) and **suggestions** below the meter.
- Add **name**. Score +10; “Add your name (+10 points)” disappears.
- Add **email**. Score +10.
- Add **summary** over 50 characters. Score +10.
- Add at least **1 experience** with bullets. Score +15.
- Add at least **1 education** entry. Score +10.
- Add at least **5 skills** (any mix of Technical, Soft, Tools). Score +10.
- Add at least **1 project**. Score +10.
- Add **phone**. Score +5.
- Add **LinkedIn** and/or **GitHub** links. Score +5 each.
- Use **action verbs** in summary (e.g. built, led, designed). Score +10.
- **Expected:** Score updates on every change. Score is capped at 100. Suggestions list only missing items with their point values.

---

## 3. Live preview and empty sections

- Clear data (or use a fresh incognito window) and open Builder.
- **Expected:** Preview shows name/contact (or placeholders) and no section headers for Summary, Education, Experience, Projects, Skills, Links when those sections are empty.
- Fill **Summary** only. **Expected:** Preview shows “Summary” section with your text; other sections still hidden.
- Add **Education**, **Experience**, **Projects**, **Skills**. **Expected:** Sections appear with real content; typography is clean.

---

## 4. ATS score rules (deterministic)

| Rule | Points | Condition |
|------|--------|-----------|
| Name | +10 | Provided |
| Email | +10 | Provided |
| Summary | +10 | > 50 characters |
| Experience | +15 | ≥ 1 entry with bullets |
| Education | +10 | ≥ 1 entry |
| Skills | +10 | ≥ 5 total (Technical + Soft + Tools) |
| Projects | +10 | ≥ 1 project |
| Phone | +5 | Provided |
| LinkedIn | +5 | URL provided |
| GitHub | +5 | URL provided |
| Action verbs in summary | +10 | e.g. built, led, designed |
| **Cap** | 100 | Total score min 0, max 100 |

Suggestions list missing items with their point value (e.g. “Add your email (+10 points)”).

---

## 5. Routes and design

- **Routes:** `/`, `/builder`, `/preview`. Optional Build Track: `/rb/01-problem` … `/rb/08-ship`, `/rb/proof`.
- **Design:** Premium design system (tokens, serif/sans, accent, spacing). ATS block: meter (or on Preview, circular gauge) + band label + suggestions.
- **Storage:** Resume data in `resumeBuilderData`; template in `resumeBuilderTemplate`; theme in `resumeBuilderThemeColor`.

---

## 6. Template and color (Classic, Modern, Minimal)

- Open **Builder** or **Preview**. **Expected:** Template picker (3 thumbnails) and color theme picker (5 circles) above the content.
- Select **Modern**. **Expected:** Two-column layout; left sidebar (name, contact, skills, links) uses accent color; right column: summary, education, experience, projects. Skill pills in sidebar have visible text (semi-transparent background).
- Select **Minimal**. **Expected:** Single column, no section borders, compact spacing.
- Select **Classic**. **Expected:** Single column, section title rules, serif headings.
- Change **color** (e.g. Navy, Burgundy). **Expected:** Accent updates in headings, borders, and Modern sidebar. Refresh: template and color persist.

---

## 7. Bullet structure guidance (Experience & Projects)

- In **Builder**, add one **Experience** entry. In the description textarea, enter one line: `Helped the team with tasks.` (no action verb at start, no number).
- **Expected:** Below the textarea, a subtle inline message: “Start with a strong action verb. Add measurable impact (numbers).”
- Change to: `Built the dashboard and cut load time by 40%.` **Expected:** Guidance disappears.
- Same behavior for **Project** descriptions. **Expected:** Input is never blocked; guidance is advisory only.

**Action verbs checked:** Built, Developed, Designed, Implemented, Led, Improved, Created, Optimized, Automated (case-insensitive).

---

## 8. Top 3 Improvements panel

- In **Builder**, below the ATS Score block, **Expected:** A section titled “Top 3 Improvements” with a list (0–3 items).
- With empty or partial resume, **Expected:** Up to 3 items such as: “Add at least 2 projects.”, “Add measurable impact (numbers) in bullets.”, “Expand summary (target 40+ words).”, “Add more skills (target 8+).”, “Add experience (internship or project work).”
- Add content. **Expected:** Corresponding items disappear; list shrinks or empties.

---

## 9. Export (Download PDF and Copy as Text)

- On **Preview** page, **Expected:** Buttons: “Download PDF” and “Copy Resume as Text”.
- **Download PDF:** Click the button. **Expected:** Toast “PDF export ready! Check your downloads.”; browser print dialog opens. In print preview: only the resume content is shown; nav, pickers, and export buttons are hidden.
- **Copy Resume as Text:** Click the button. **Expected:** Plain text is copied to the clipboard (Name, Contact, Summary, Education, Experience, Projects, Skills, Links). Button briefly shows “Copied!”.
- **Validation warning:** If name is missing or (no projects and no experience), a message appears near the buttons: “Your resume may look incomplete.” Export is not blocked.

---

## 10. Layout and print

- On **Preview**, with a full resume: **Expected:** No section overlapping another; consistent spacing; long lines wrap (no horizontal scroll). Print output: clean margins, no cut-off sections.
