# Handoff: moving the Question Gallery onto the Harmonya site

Goal: the gallery lives at a Harmonya address (for example `gallery.harmonya.com`) and the main site links to it.

## What this is

One static page with a few security headers. There is no database and no build server. `src/question-gallery.html` is the source. `python3 build.py` writes the deployable folder to `dist/` (page, 404, and `netlify.toml` with the headers).

## Where leads go today

1. Netlify Forms, form name `gallery-lead`, which emails the people set under Netlify, Forms, Notifications.
2. HubSpot form "Question Gallery lead" in portal 20268287. The form ID is in `LEAD_CFG` near the top of the script in `src/question-gallery.html`.

New contacts from that HubSpot form are not set as marketing contacts, on purpose, so they do not count against the marketing contact tier.

The page sends no page address to HubSpot. HubSpot silently drops form submissions whose page address is on netlify.app (they return success and never create a contact), so do not add `pageUri` back until the page lives on a harmonya.com address.

The page remembers a visitor on their device for 30 days (local storage key `qg-me`, company and work email only, no cookies). A returning visitor skips the form and creates a `return` lead instead. "Not you?" and the settings button "Forget me on this device" clear it. If you add a consent banner later, list this key.

One visitor creates at most one `load`, one `meeting` and a few `session` leads in 12 hours. The check lives in the browser (`track()` in the source), so clearing site data resets it.

## Move steps

1. Harmonya Netlify team: create the project there (or transfer it). Connect this repo. `netlify.toml` already sets the build command (`python3 build.py`), the publish folder (`dist`) and the security headers, so every push deploys on its own.
2. GitHub: transfer this repo into the Harmonya org.
3. DNS (Cory): add a CNAME record, host `gallery`, pointing to the Netlify project address. In Netlify, Domain management, add the custom domain. Netlify issues the SSL certificate.
4. Netlify Forms notifications: add the recipients again on the new project (they do not move with a transfer).
5. HubSpot: add the HubSpot tracking code to the page head if you want visits tied to contacts.
6. Search engines: the page has `noindex`. Remove that meta tag in `build.py` when you want it indexed.
7. Links from the main site: a plain link or a button. To embed in an iframe, the headers already allow `*.harmonya.com`.

## Before promoting it

- Confirm the demo data is cleared for public use.
- Four numbers come from a PDF and were not rebuilt from the data: the RTD coffee spaces, the AI-readiness listing counts, and the jitters review stat.
- Nine cards use mock data. They say so on the card.
- Delete test submissions in Netlify Forms and the QA test contacts in HubSpot.
