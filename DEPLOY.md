# Deploy – Hạnh Phúc website

Free setup, no server to maintain:

- **Website** → Cloudflare Pages (free, HTTPS, auto-deploys on every `git push`)
- **Contact form** → Google Sheet via Google Apps Script (free; staff see new requests in the sheet, optional email)

```
Browser ──> https://<project>.pages.dev  (static Angular build)
   └─ form POST ──> Apps Script /exec ──> Google Sheet "Đăng ký" (+ email)
```

---

## 1. Contact form → Google Sheet (≈5 minutes)

1. Use the **center's** Google account (not a personal one) and create a new Google Sheet, e.g. *Hạnh Phúc – Đăng ký tư vấn*.
2. In the sheet: **Extensions → Apps Script**.
3. Delete the sample code and paste everything from [`apps-script/Code.gs`](apps-script/Code.gs).
   - Optional: set `NOTIFY_EMAIL` (top of the file) to get an email for every new request.
4. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← required so the public site can post to it
5. **Authorize** when asked (Google shows an "unverified app" warning for your own script: *Advanced → Go to … (unsafe)*; it's your own code).
6. Copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`).
   Opening it in a browser should show `{"ok":true,"service":"hanh-phuc-contact"}`.
7. Paste it into `src/environments/environment.ts`:

   ```ts
   contactEndpoint: 'https://script.google.com/macros/s/XXXX/exec',
   ```

8. Commit and push.

> The `/exec` URL is public by design. The script only appends rows; it can't read the sheet back.
> It validates every field, blocks spreadsheet formulas, and drops bot submissions (hidden honeypot field).

**Changing the script later:** edit the code, then **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.
That keeps the same URL. ("New deployment" would create a new URL you'd have to paste again.)

## 2. Website → Cloudflare Pages (≈5 minutes)

1. Sign up / log in at <https://dash.cloudflare.com> (free).
2. **Workers & Pages → Create → Pages → Connect to Git** → authorize GitHub → choose **`phdat/happy-center-ui`**.
3. Build settings:

   | Setting | Value |
   | --- | --- |
   | Project name | `hanh-phuc` (becomes `https://hanh-phuc.pages.dev`; pick any free name) |
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist/happy-web/browser` |
   | Root directory | *(leave empty)* |

   Node version comes from the `.node-version` file (24).

4. **Save and Deploy**. The first build takes ~2 minutes.
5. Every later `git push` to `main` redeploys automatically. Other branches get their own preview URL.

## 3. Check it's live

- Open `https://<project>.pages.dev`, fill the form with a test name, and send.
- A new row should appear in the **Đăng ký** tab of the sheet (and an email if you set `NOTIFY_EMAIL`).
- Delete the test row.

## Later: own domain

Buy a domain (e.g. `hanhphuc.edu.vn` / `.vn` from a Vietnamese registrar, or `.com` via Cloudflare),
then **Pages project → Custom domains → Set up a domain** and follow the DNS steps.
