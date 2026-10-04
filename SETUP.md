# Setup: track every lead and email the team

Netlify is the quickest route. It stores every submission and emails whoever you choose, with no backend to build.

## 1. Put the page on Netlify (about 3 minutes)

Option A, drag and drop: Netlify, Sites, Add new site, Deploy manually. Drag in the folder that holds `index.html` and `netlify.toml`.

Option B, from GitHub: Add new site, Import an existing project, pick this repo. Leave the build command empty. Publish directory is `.`.

Either way Netlify detects the form named `gallery-lead` while it deploys. Check: Site, Forms. You should see `gallery-lead`.

## 2. Email the team on every lead

Site configuration, Notifications, Form submission notifications, Add notification, Email notification. Choose the form `gallery-lead` and one recipient. Add a second notification for each additional person.

## 3. Test

Open the live page, click the screen, add a company and a work email on a real company domain, and press Load. In Netlify, Forms, `gallery-lead`, you should see the submission within a minute. Open a question and press Find time with us: a second submission appears with the question. Close the tab: a third arrives with everything they opened.

Each row has the event type: `email` (typed a valid work email), `load`, `meeting` (pressed Find time with us) or `session` (a summary of what they opened when they left). Every row carries the email, company and the page.

## Limits to know

- Netlify's free plan caps form submissions each month. One visitor can create up to three rows, so check the current limit on your plan before a big post.
- Work-email checking (personal and disposable domains) happens in the page, not on the server.

## Optional: also send leads to HubSpot

Create three contact properties (`gallery_question`, `gallery_opened`, `gallery_event`) and one form with email, company and those three as hidden fields. Put the form's ID in `formGuid` near the top of the script. The page then sends each lead to both places. Use a workflow on the form to assign an owner, create a task and send an internal email. See the HubSpot notes in README.md.

## Optional: your own backend

`api/lead.js` is a serverless function that emails a list, checks the domain can receive mail, and forwards to HubSpot. Use it only if you need instant emails independent of Netlify and HubSpot.
