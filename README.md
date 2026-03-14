# StockFlow — Inventory Management System

A full-stack inventory management system built for the Odoo Hackathon. StockFlow covers the complete warehouse workflow: products, categories, warehouses, locations, receipts, deliveries, transfers, stock adjustments, and real-time KPI dashboards — all inspired by Odoo's inventory module.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 21 (standalone components), Tailwind CSS v4, TypeScript |
| **Backend** | Node.js, Express 5, TypeScript |
| **ORM** | TypeORM 0.3 |
| **Database** | MySQL 8 |
| **Auth** | JWT (`jsonwebtoken`) + `bcryptjs` |

---

## Project Structure

```
Odoo Hackathon/
├── Backend/          — Express REST API
│   ├── src/
│   │   ├── config/       — Database connection
│   │   ├── entities/     — TypeORM entities
│   │   ├── middleware/   — JWT auth middleware
│   │   └── modules/      — Feature modules (auth, products, stock, …)
│   ├── package.json
│   └── tsconfig.json
│
└── Frontend/         — Angular SPA
    ├── src/
    │   ├── app/
    │   │   ├── core/services/    — HTTP services
    │   │   └── modules/          — Dashboard, operations, auth pages
    ├── package.json
    └── tsconfig.json
```

---

## Prerequisites

Make sure the following are installed before you begin:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9 or later (comes with Node.js)
- **MySQL** 8.0 — [mysql.com](https://dev.mysql.com/downloads/)
- **Angular CLI** v21 — install globally:

```bash
npm install -g @angular/cli
```

---

## Database Setup

1. Start your MySQL server.
2. Create a database for the project:

```sql
CREATE DATABASE stockflow;
```

> The schema is auto-created by TypeORM on first run (`synchronize: true`). You do **not** need to run any migration scripts.

---

## Backend Setup

### 1. Navigate to the backend folder

```bash
cd "Backend"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create a `.env` file in the `Backend/` folder:

```env
# Server
PORT=3000

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=stockflow

# JWT
JWT_SECRET=your_super_secret_key_here

# CORS (comma-separated list of allowed frontend origins)
CORS_ORIGINS=http://localhost:4200
```

> Replace `your_mysql_password` with your actual MySQL root password and set a strong `JWT_SECRET`.

### 4. Run the backend in development mode

```bash
npm run dev
```

The API will be available at **`http://localhost:3000`**.

You should see a message like:

```
Database connected successfully
Server running on port 3000
```

---

## Frontend Setup

### 1. Open a new terminal and navigate to the frontend folder

```bash
cd "Frontend"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the frontend dev server

```bash
npm start
```

The app will be available at **`http://localhost:4200`**.

---

## Running Both Together

Open two terminal windows side by side:

| Terminal 1 (Backend) | Terminal 2 (Frontend) |
|---|---|
| `cd "Backend" && npm run dev` | `cd "Frontend" && npm start` |

Then open **`http://localhost:4200`** in your browser.

---

## First-Time Login

1. Open `http://localhost:4200/auth/register`
2. Create an account (any email and password)
3. Log in at `http://localhost:4200/auth/login`

---

## Features

### Dashboard
- KPI cards: total products, stock value, low-stock alerts, pending operations
- Real-time data from the backend

### Stock
- Live stock balance table per product and location
- Add new products with initial stock quantity, unit price, reserved quantity
- Edit stock levels, unit price, and reorder point inline

### Settings
- **Warehouses** — create, edit, toggle active, delete
- **Locations** — storage locations scoped to warehouses (Internal, View, Input/Output, Virtual types)
- **Categories** — product categories CRUD

### Contacts
- **Suppliers** and **Customers** managed in a single tabbed view

### Operations
- **Receipts** — inbound goods from suppliers
- **Deliveries** — outbound orders to customers
- Stock ledger records every movement automatically

### Move History
- Full audit log of all stock movements

---

## API Reference

All endpoints are prefixed with `/api/` and require a JWT Bearer token except for auth routes.

| Resource | Base Path |
|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/forgot-password`, `/verify-otp`, `/reset-password` |
| Categories | `GET/POST/PUT/DELETE /api/categories` |
| Products | `GET/POST/PUT/DELETE /api/products` |
| Warehouses | `GET/POST/PUT/DELETE /api/warehouses` |
| Locations | `GET/POST/PUT/DELETE /api/locations` |
| Suppliers | `GET/POST/PUT/DELETE /api/suppliers` |
| Customers | `GET/POST/PUT/DELETE /api/customers` |
| Receipts | `GET/POST /api/receipts`, validate/cancel actions |
| Deliveries | `GET/POST /api/deliveries`, validate/cancel actions |
| Stock Balances | `GET /api/stock/balances`, `PUT /api/stock/balances/:id` |
| Stock Ledger | `GET /api/stock/ledger` |
| Dashboard KPIs | `GET /api/dashboard` |
| Health Check | `GET /health` |

---

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (nodemon) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm test` | Run unit tests (Vitest) |

### Frontend

| Command | Description |
|---|---|
| `npm start` | Start Angular dev server at `localhost:4200` |
| `npm run build` | Build for production into `dist/` |
| `npm test` | Run unit tests |

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Backend server port |
| `DB_HOST` | Yes | — | MySQL host |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_USER` | Yes | — | MySQL username |
| `DB_PASSWORD` | Yes | — | MySQL password |
| `DB_NAME` | Yes | — | MySQL database name |
| `JWT_SECRET` | Yes | — | Secret key for signing JWT tokens |
| `CORS_ORIGINS` | No | `*` | Comma-separated list of allowed CORS origins |

---

## Troubleshooting

**`ER_NOT_SUPPORTED_AUTH_MODE` on MySQL 8**
Run the following in your MySQL shell:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

**Port 3000 already in use**
Change the `PORT` value in your `.env` file and ensure the frontend service URL in `Frontend/src/app/core/services/*.service.ts` matches.

**`npm install` fails with peer dependency errors**
Use `npm install --legacy-peer-deps`.

**Angular CLI not found**
```bash
npm install -g @angular/cli
```
