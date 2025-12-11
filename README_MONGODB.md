MongoDB Backend Setup (Express + Mongoose)

This project now includes a simple Node/Express backend that connects to MongoDB and exposes endpoints to store and retrieve orders.

Files added:
- `server.js` – Express server and MongoDB connection
- `models/Order.js` – Mongoose model for orders
- `package.json` – dependencies and scripts
- `.env.example` – example environment variables file

Quick start (Windows PowerShell):

1) Install dependencies:

```powershell
cd "C:\Users\madil\OneDrive\Desktop\CLG\WebDev\cafe_web"
npm install
```

2) Create a `.env` file in the project root (copy `.env.example`):

```powershell
copy .env.example .env
# then edit .env and replace <username>, <password>, and host with your MongoDB connection details
notepad .env
```

3) Start the server in development mode:

```powershell
npm run dev
```

4) API endpoints:
- `POST /api/orders` – create an order. Body: `{ userId, items: [{name, price, qty}], total, address }`
- `GET  /api/orders` – list orders (optional query `?userId=...`)

Notes:
- For production use, secure the API (authentication, validation, rate-limiting).
- If you prefer to run the backend separately from the static files, host it on Heroku/Vercel/Render or on your own server and update front-end AJAX URLs accordingly.

Example POST (using curl):

```powershell
curl -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -d "{\"userId\":\"user123\",\"items\":[{\"name\":\"Latte\",\"price\":120,\"qty\":2}],\"total\":240,\"address\":\"123 Main St\"}"
```

If you want, I can:
- Wire up the front-end `checkout` button to call `POST /api/orders` (requires the server to be running and a `MONGODB_URI` set).
- Add basic validation and authentication middleware.
- Help deploy the backend to a hosting provider.

Tell me which next step you want me to do.