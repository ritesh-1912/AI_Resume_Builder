# AI Resume Builder

A structured resume builder with live preview, ATS scoring, and multiple templates. Built with vanilla HTML, CSS, and JavaScript.

## Features

- **Builder** — Form-based editor for personal info, summary, education, experience, projects, and skills (Technical, Soft, Tools). Live preview updates as you type.
- **Preview** — Full resume view with template and color picker, ATS score (circular gauge), and export actions.
- **Templates** — Classic (single-column, serif, rules), Modern (two-column with colored sidebar), Minimal (clean, generous whitespace).
- **Color themes** — Teal, Navy, Burgundy, Forest, Charcoal. Stored in `localStorage`.
- **ATS scoring** — Deterministic 0–100 score with point-based rules; suggestions list missing items. Score band: Needs Work (0–40), Getting There (41–70), Strong Resume (71–100).
- **Persistence** — Resume data, template, and theme saved to `localStorage`. No backend required.
- **Export** — Download PDF (opens print dialog; toast: “PDF export ready!”) and Copy Resume as Text.

## Project structure

- **design-system/** — App entry and assets.
  - `index.html` — Home (Start Building, link to Build Track).
  - `builder.html` — Resume form + live preview + ATS block.
  - `preview.html` — Full resume, template/color pickers, ATS circle, export buttons.
  - `resume-app.js` — Data model, localStorage, ATS logic, live preview and preview-page rendering.
  - `resume-app.css` — Resume builder and preview styles.
  - `design-system.css`, `app.css` — Design tokens and shared UI.
  - **rb/** — Optional Build Track (8 steps); `rb/proof.html` for step proof and submission links.

## Running locally

Serve the `design-system` folder (e.g. with VS Code Live Server, or `npx serve design-system`). Open `index.html` or `builder.html`. No build step required.

## Deployment

The repo is set up for Vercel with `outputDirectory: "design-system"`. Routes: `/`, `/builder`, `/preview`, and `/rb/*` for the Build Track.

## Storage keys

- `resumeBuilderData` — Resume content (personal, summary, education, experience, projects, skills, links).
- `resumeBuilderTemplate` — `classic` | `modern` | `minimal`.
- `resumeBuilderThemeColor` — `teal` | `navy` | `burgundy` | `forest` | `charcoal`.

## License

MIT (or as specified in the repo).
