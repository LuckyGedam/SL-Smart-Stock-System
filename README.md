# 🏪 SL Crockeries — Smart Stock Priority System (SSPS)

Stock management system for SL Crockeries, Nagpur.

---

## ⚡ Quick Start (Windows)

**Double-click `START.bat`** — it will install everything and open the app automatically.

Or manually:

```powershell
# Terminal 1 — Backend
.venv\Scripts\activate
uvicorn backend.main:app --reload --port 8000

# Terminal 2 — Frontend
npm run dev
```

App opens at: **http://localhost:3000**  
API Docs at: **http://localhost:8000/docs**

---

## 🔑 Login Credentials

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Manager | manager  | manager123  |
| Sales   | sales    | sales123    |

---

## 📊 Excel Upload Format

Your Excel file must have these columns (any order, extra columns ignored):

| Column       | Description              |
|--------------|--------------------------|
| SKU          | Unique product code      |
| Product Name | Name of the product      |
| Category     | e.g. Glassware, Crockery |
| Stock        | Current stock quantity   |
| Added Date   | YYYY-MM-DD format        |
| Barcode      | Barcode number           |

Use the **convert_stock.py** script to convert your S L Crockeries stock report to this format.

---

## 🚀 Deployment

### Option 1: Local Network (Same WiFi)
```powershell
# Find your IP
ipconfig
# Share http://YOUR_IP:3000 with others on same network
```

### Option 2: Production (VPS/Cloud)
1. Set environment variables in `.env`:
```
SECRET_KEY=your-long-random-secret
CORS_ORIGINS=https://your-domain.com
VITE_API_URL=https://your-api-domain.com/api
```
2. Build frontend: `npm run build`
3. Serve `dist/` folder with Nginx/Apache
4. Run backend with: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

---

## 📁 Project Structure
```
├── backend/           # FastAPI Python backend
│   ├── api/routes.py  # All API endpoints
│   ├── config.py      # Settings & env vars
│   ├── data/ssps.db   # SQLite database
│   └── utils/uploads.py  # Excel parser
├── src/               # React TypeScript frontend
│   ├── api/sspsApi.ts # API client
│   ├── components/    # UI components
│   └── App.tsx        # Main app
├── START.bat          # One-click Windows start
├── .env               # Environment config
└── convert_stock.py   # Excel converter tool
```
