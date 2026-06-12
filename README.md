# kirdyaev.com

Personal website for Aleksei Kirdyaev — Product Design Lead.

## Stack

Plain HTML + CSS + JS. No build step, no dependencies.  
Activities feed is driven by `activities.json`.

## Updating the feed

Edit `activities.json`. Each entry:

```json
{
  "date": "2026-06-01",       // ISO date, shown as "Jun 2026"
  "type": "article",          // see types below
  "title": "Title here",
  "description": "Optional short description.",
  "link": "https://..."       // leave "" if no URL
}
```

**Types:** `article` · `talk` · `case` · `ai` · `mentorship` · `career` · `award`

Items are displayed in the order listed — put newest first.

## Deploy

### Vercel (current)

1. Push to GitHub
2. Import repo in Vercel — zero config needed
3. To use a custom domain: Vercel → Project → Settings → Domains

### Local preview

```bash
npx serve .
# or
python3 -m http.server 8080
```

> Note: `fetch('activities.json')` requires a server (won't work with `file://`).
