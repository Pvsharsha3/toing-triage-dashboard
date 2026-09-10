# Toing Discount Triage Dashboard

Instantly diagnose partner discount escalations on Toing — paste an `order_id`, get a root-cause verdict and routing decision in seconds.

**Live demo (GitHub Pages):** `https://<your-username>.github.io/toing-triage-dashboard/`

---

## What it shows

| Signal | Routing |
|--------|---------|
| 🟡 Anchor Price RDPO | Toing Anchor-Price POC |
| 🔵 Swiggy-Flown FVO | Swiggy Discounting POC (stop it on Swiggy) |
| 🟢 Genuine Toing FVO | Toing Discounting Owner |

Per-item: 4-price grid (Toing anchor / final, Swiggy anchor / final), offer validity, copy-to-clipboard block.

---

## Quick start (demo mode — no Snowflake needed)

```bash
cd frontend
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173). Uses the 4 baked test orders.

---

## Deploy to GitHub Pages (free, 2 minutes)

1. Create a new GitHub repo named `toing-triage-dashboard`
2. Push this directory:

```bash
cd toing-triage-dashboard
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/toing-triage-dashboard.git
git push -u origin main
```

3. Go to **Settings → Pages → Source → GitHub Actions**
4. The workflow runs automatically and publishes to  
   `https://<your-username>.github.io/toing-triage-dashboard/`

---

## Connect a live backend (optional — for real order_ids)

### 1. Set up Snowflake key-pair auth

```bash
# Generate key pair
openssl genrsa -out rsa_key.pem 2048
openssl rsa -in rsa_key.pem -pubout -out rsa_key.pub

# Register the public key with Snowflake (run in SnowSQL):
# ALTER USER <your.email@swiggy.in>
#   SET RSA_PUBLIC_KEY='<contents of rsa_key.pub — strip header/footer lines>';
```

### 2. Run the backend locally

```bash
cd backend
python -m venv .venv
.venv/Scripts/Activate.ps1     # Windows
# source .venv/bin/activate    # Mac/Linux

pip install -r requirements.txt
cp .env.example .env           # fill in your SF_ values + set MOCK_MODE=false

uvicorn main:app --reload
```

### 3. Point the frontend at the backend

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:8000
```

### 4. Deploy the backend to Render (free tier)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → connect repo
3. **Root directory:** `backend`
4. **Build command:** `pip install -r requirements.txt`
5. **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (`SF_USER`, `SF_ACCOUNT`, etc.) in Render dashboard
7. For `SF_PRIVATE_KEY_B64`: `base64 -w0 rsa_key.pem` (Linux/Mac) or `[Convert]::ToBase64String([IO.File]::ReadAllBytes('rsa_key.pem'))` (PowerShell)
8. Add `VITE_API_URL` as a GitHub secret (repo Settings → Secrets)
9. Uncomment `VITE_API_URL` line in `.github/workflows/deploy.yml` and redeploy

---

## Test order IDs (demo)

| order_id | Demonstrates |
|----------|-------------|
| `246255027129300` | Pure anchor gap — ₹140, true RDPO = 0 |
| `246367024173056` | All 3 cases — anchor ₹239 + Swiggy-flow ₹53 + native; replicated offer |
| `246997806119199` | Same-day realtime (transformer source) |
| `247567714163587` | Cancelled order — ₹404 anchor gap, no money moved |

---

## Role requirement

For live Snowflake queries: `FOOD_RANDG` (or any role with SELECT on the tables in `backend/logic.py`).
