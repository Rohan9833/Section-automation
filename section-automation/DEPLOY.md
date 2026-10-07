# Deploying Section-Automation on your VPS

I can't SSH into your server myself (this sandbox can only reach package
registries, not arbitrary IPs), so here's exactly what to run yourself.
Everything below assumes Ubuntu/Debian + nginx, which matches your usual
setup. Replace `<APPUSER>` with the actual Linux user that will run this app
via PM2 (e.g. `deploy`, `node`, whatever you normally use).

## 1. Upload the files

From your machine:
```bash
# The automation app itself
scp -r deploy-ready <APPUSER>@<SERVER_IP>:/var/www/section-automation

# Your master presentation (the actual slides) — this becomes the template
# every link is copied from. Point this at your existing ppt-updated folder.
scp -r ppt-updated <APPUSER>@<SERVER_IP>:/var/www/ppt-updated
```

## 2. Create the folders the app needs

SSH in as root (or with sudo):
```bash
mkdir -p /var/www/ppt-links
mkdir -p /etc/nginx/snippets/ppt-links
mkdir -p /var/log/custom

# The app user needs to write here; nginx (www-data) needs to read here.
chown -R <APPUSER>:www-data /var/www/ppt-links /etc/nginx/snippets/ppt-links
chmod -R 750 /var/www/ppt-links /etc/nginx/snippets/ppt-links

# nginx writes access logs here
chown www-data:www-data /var/log/custom
```

## 3. Let the app reload nginx (without giving it full root)

Create `/etc/sudoers.d/ppt-nginx-reload`:
```
<APPUSER> ALL=(root) NOPASSWD: /usr/sbin/nginx -t, /usr/bin/systemctl reload nginx
```
Then lock the file down:
```bash
chmod 440 /etc/sudoers.d/ppt-nginx-reload
```
This is intentionally narrow — the app can only run those two exact
commands as root, nothing else.

## 4. One-time change to your main nginx config

Open your existing `digilateral.com` server block (usually
`/etc/nginx/sites-available/digilateral.com`) and add this single line
anywhere inside the `server { ... }` block:

```nginx
include /etc/nginx/snippets/ppt-links/*.conf;
```

That's it — you never touch this file again. Every link the app generates
from now on drops its own `.conf` file into that folder automatically, e.g.:

```nginx
location ^~ /shivam/digi {
    alias /var/www/ppt-links/shivam/digi/;
    index index.html;
    try_files $uri $uri/ =404;
    access_log /var/log/custom/shivam-digi-ppt.log;
}
```

Test and reload once manually to pick up the include:
```bash
nginx -t && systemctl reload nginx
```

## 5. Configure and start the app

```bash
cd /var/www/section-automation
cp .env.example .env
nano .env   # confirm the paths match what you created above
npm install
pm2 start app.js --name section-automation
pm2 save
```

## 6. Try it

Open `http://<SERVER_IP>:3000` (or however you're reaching the app — put it
behind its own nginx location too if you want a clean admin URL like
`https://digilateral.com/ppt-admin`), fill the form, submit.

You should get redirected straight to:
```
https://digilateral.com/shivam/digi
```
served entirely by nginx — Node isn't in the request path for viewers at
all, so the page loads fast and stays up even if the Node app is ever down.

## How it stays multi-tenant

Each submission:
1. Copies `/var/www/ppt-updated` → `/var/www/ppt-links/<user>/<company>/`
2. Bakes only the selected section into that copy
3. Writes `/etc/nginx/snippets/ppt-links/<user>-<company>.conf`
4. Reloads nginx

So `/shivam/digi` and `/raj/usv` can each show a different section forever,
independently, until you regenerate that specific link again.

## If you ever want to update the master template

Editing `/var/www/ppt-updated` only affects **future** links. Existing
generated folders under `/var/www/ppt-links/...` are frozen copies and won't
change until regenerated.
