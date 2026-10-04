# Setup: send every lead to HubSpot and email the team

There are two routes. Route A needs no backend. Pick one.

## Route A: HubSpot only (recommended, about 15 minutes)

The page posts each lead straight to a HubSpot form. HubSpot makes the contact, and a workflow emails the team.

### 1. Create three contact properties
HubSpot, Settings, Data Management, Properties, object type Contact, Create property. All "Single-line text" except the second:

| Label | Internal name | Type |
| --- | --- | --- |
| Gallery question | `gallery_question` | Single-line text |
| Gallery opened | `gallery_opened` | Multi-line text |
| Gallery event | `gallery_event` | Single-line text |

`email` and `company` already exist, so the page's email and company fields map to them with no new property.

### 2. Create the form
Marketing, Lead Capture, Forms, Create form, Embedded form. Add exactly these fields: Email, Company name, Gallery question, Gallery opened, Gallery event. Make the last three hidden fields. Publish it.

Open the form's Share tab, then Embed code. You will see two values: `portalId` (this account is 20268287, already in the page) and `formId`. The `formId` is the form ID you need.

### 3. Build the workflow
Automation, Workflows, Create workflow, Contact-based. Trigger: "Form submission" is this form. Actions:
1. Set property value: Lead status = New.
2. Set contact owner (or rotate owners).
3. Create task: "Follow up: {{company}} asked about {{gallery_question}}".
4. Send internal email notification to the two people who should hear about every lead. Include the contact's email, company, `gallery_event`, `gallery_question` and `gallery_opened`.

Turn the workflow on. Set it to re-enroll so repeat submissions from the same email (email typed, load, meeting, session summary) each notify, or leave re-enrollment off if you only want the first.

### 4. Point the page at the form
In `index.html`, find `LEAD_CFG` near the top of the script and put the form ID in `formGuid`. Leave `endpoint` empty.

### 5. Host the page
Any static host works: Netlify (drag the folder in), Vercel, GitHub Pages (needs a paid plan for a private repo), or a HubSpot page. Only `index.html` is needed.

### 6. Test
Open the hosted page, go in, enter a work email on a real company domain, press Load. In HubSpot, Contacts, you should see the contact with company and `gallery_event` = load within a minute. Open two questions, then close the tab: a `session` summary lands on the same contact.

## Route B: your own backend (instant emails, logs)

Use this if you want an email the second a lead arrives, independent of HubSpot. Steps are in README.md: deploy to Vercel, add a Resend key, set `NOTIFY_TO`. It can also forward to the HubSpot form, so you can run both.
