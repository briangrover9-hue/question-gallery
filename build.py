import re,os,sys,shutil
sp=os.path.dirname(os.path.abspath(__file__))+'/src'
SITE=os.environ.get('SITE_URL','https://harmonya-question-gallery.netlify.app').rstrip('/')
out=sys.argv[1] if len(sys.argv)>1 else os.path.dirname(os.path.abspath(__file__))+'/dist'
m=open(sp+'/question-gallery.html',encoding='utf-8').read()
m=m.replace('netlify:false','netlify:true',1)
i=m.index('</style>')+len('</style>')
head_part,body_part=m[:i],m[i:]
head_part=re.sub(r'<meta charset="utf-8">\s*','',head_part,count=1)
head_part=re.sub(r'<title>.*?</title>\s*','',head_part,count=1)
fav="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='8' y='6' width='48' height='46' rx='12' fill='%23f3b81b'/%3E%3Crect x='15' y='13' width='34' height='24' rx='4' fill='%23071821'/%3E%3Crect x='20' y='43' width='24' height='3' rx='1.5' fill='%23c98f00'/%3E%3C/svg%3E"
desc="Pick a tile and see the kind of question Harmonya answers about a category, with illustrative demo data."
html=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Question Gallery | Harmonya</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#f5f8ff">
<meta name="robots" content="noindex,nofollow">
<meta property="og:type" content="website">
<meta property="og:title" content="Question Gallery | Harmonya">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{SITE}/">
<meta property="og:image" content="{SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A small yellow computer on a pale desk with the text: Click the screen to see what we can find out for you.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{SITE}/og.png">
<link rel="icon" href="{fav}">
{head_part}
</head>
<body>
<form name="gallery-lead" method="POST" data-netlify="true" netlify-honeypot="bot-field" hidden aria-hidden="true">
<input type="hidden" name="form-name" value="gallery-lead">
<input name="bot-field" tabindex="-1" autocomplete="off"><input name="type"><input name="email"><input name="company"><input name="question"><input name="opened"><input name="page">
</form>
{body_part}
</body>
</html>
'''
os.makedirs(out,exist_ok=True)
for _o in (sp+'/og.png',sp+'/src/og.png'):
    if os.path.exists(_o):shutil.copy(_o,out+'/og.png');break
open(out+'/index.html','w',encoding='utf-8').write(html)
open(out+'/404.html','w',encoding='utf-8').write('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Not found | Harmonya</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f8ff;color:#1b1d22;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px}a{color:#1b1d22}</style></head><body><p>That page does not exist. <a href="/">Back to the Question Gallery</a></p></body></html>
''')
toml='''[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.hsforms.com; form-action 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'self' https://*.harmonya.com"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
'''
open(out+'/netlify.toml','w').write(toml)
print('built',len(html))
