# Question Gallery

A single-page outreach experience. A small yellow computer sits on a desk. A visitor clicks the screen, adds a company and a work email, and opens a gallery of questions. Each card has a real example drawn in Paint style where we have one, a plain description of how we answer it, and a way to find time with us. The last step is "Find time with us", which books a call and tells us what they cared about.

Nothing in this repo is client data. Every number on the page comes from Harmonya's own food and beverage demo data, and the page says so wherever one appears.

See SETUP.md. The fastest route is Netlify Forms, which stores every lead and emails the team. The backend below is optional.

## Files

- `src/question-gallery.html` is the source. `python3 build.py` writes the deployable folder to `dist/`.
- `HANDOFF.md` has the steps to move this to the Harmonya site.
- `api/lead.js` is a serverless function. It receives a lead, emails the people in `NOTIFY_TO`, and can also post the lead to a HubSpot form.

## Personalized links

Add an anchor to the page link and it opens already loaded:

- `https://YOUR-HOST/#acme` fills the company name.
- `https://YOUR-HOST/#acme-brands` fills "Acme Brands".

Letters, numbers, `-`, `_` and `.` only.

## Deploy (Vercel, about five minutes)

1. Import this repo in Vercel. No build step.
2. Set these environment variables (Settings, Environment Variables). Never commit them.

| Variable | What it is |
| --- | --- |
| `NOTIFY_TO` | Comma-separated addresses that get every lead |
| `RESEND_API_KEY` | API key from resend.com |
| `MAIL_FROM` | A sender on a domain verified in Resend, for example `Question Gallery <gallery@yourdomain.com>` |
| `ALLOWED_ORIGINS` | Comma-separated page origins allowed to post, for example `https://your-project.vercel.app` |
| `HUBSPOT_PORTAL_ID` | Optional. Your HubSpot account ID |
| `HUBSPOT_FORM_GUID` | Optional. The form that receives the lead |

3. `MEETING_URL` near the top of the script in `index.html` is already set to the HubSpot meetings link. The visitor's email is added to it, so the booking lands on the same contact.
4. Test it:

```bash
curl -s -X POST https://YOUR-HOST/api/lead \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://YOUR-HOST' \
  -d '{"type":"meeting","email":"test@example.com","brand":"Test Brand","category":"Snacks","question":"Test","opened":["Test"],"page":"https://YOUR-HOST/"}'
```

You should get `{"ok":true,...}` and an email.

## HubSpot (optional second destination)

Create one form with these fields, then give its portal ID and form GUID to the function.

- `email` and `company` already exist on contacts.
- Create three contact properties (single-line text; `gallery_opened` can be multi-line): `gallery_question`, `gallery_opened`, `gallery_event`.
- Build a workflow on that form: set the contact owner, create a task ("Follow up: {company} asked about {gallery_question}"), and send an internal notification.

## What gets tracked

Every event carries the email, brand, category, the questions opened so far and the page. Events fire whether or not the visitor books a call.

| `type` | When it fires |
| --- | --- |
| `email` | A valid work email is typed (load form or the ask), even if nothing else happens |
| `load` | They press Load |
| `meeting` | They press Find time with us |
| `session` | They leave or switch tabs after opening at least one question: a summary of everything they opened |

Each event is emailed to `NOTIFY_TO`, logged by the host, and (if configured) sent to HubSpot. Repeated HubSpot submissions with the same email update the same contact.

## Email checks

The page rejects personal and disposable email domains. The function repeats that check and also looks up the domain's mail servers, so an address on a domain that cannot receive mail is refused with a 400.

## Notes

- The page sends nothing until `LEAD_CFG.endpoint` is set (it is `/api/lead` in this repo). When it is empty the page says so plainly.
- The function rate-limits by IP, clips every field, ignores a hidden `website` field (a honeypot), and sends plain text only.
- Rate limiting is per function instance and best effort. Use your host's firewall for stronger limits.
