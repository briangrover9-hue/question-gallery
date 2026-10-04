# Question Gallery

A single-page outreach experience. A small yellow computer sits on a desk. A visitor clicks the screen, picks any category (and optionally a brand and email), and opens a gallery of questions with an example visual for each. The last step is "Find time with us", which books a call and tells us what they cared about.

Nothing in this repo is client data. All visuals are illustrative layouts with no numbers.

## Files

- `index.html` is the whole front end (HTML, CSS and JS in one file).
- `api/lead.js` is a serverless function. It receives a lead, emails the people in `NOTIFY_TO`, and can also post the lead to a HubSpot form.

## Personalized links

Add an anchor to the page link and it opens already loaded:

- `https://YOUR-HOST/#halo-top` fills the brand.
- `https://YOUR-HOST/#halo-top.frozen-desserts` fills the brand and the category.

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

3. Set `MEETING_URL` near the top of the script in `index.html` to your HubSpot meetings link. The visitor's email is added to it, so the booking lands on the same contact.
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
- Create four contact properties (single-line text; `gallery_opened` can be multi-line): `gallery_category`, `gallery_question`, `gallery_opened`, `gallery_event`.
- Build a workflow on that form: set the contact owner, create a task ("Follow up: {company} asked about {gallery_question}"), and send an internal notification.

## Notes

- The page sends nothing until `LEAD_CFG.endpoint` is set (it is `/api/lead` in this repo). When it is empty the page says so plainly.
- The function rate-limits by IP, clips every field, ignores a hidden `website` field (a honeypot), and sends plain text only.
- Rate limiting is per function instance and best effort. Use your host's firewall for stronger limits.
