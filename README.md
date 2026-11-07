# Mayerfield BrewHaus Backend

REST API for the Mayerfield BrewHaus application. The service provides user registration and login, JWT-protected menu management, and public menu browsing backed by PostgreSQL.

## Features

- Register users and log in with email and password.
- Hash passwords with `bcryptjs`.
- Issue JSON Web Tokens (JWTs) that expire after one hour.
- List menu items, optionally filter them by category, and retrieve an item by ID.
- Create, update, and delete menu items with a valid bearer token.
- Seed the database with sample coffee, drinks, bakery, and tea menu items.

## Requirements

- Node.js with support for the `--env-file` option (Node.js 20.6 or newer).
- PostgreSQL with `gen_random_uuid()` available.
- npm.

## Getting started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file in the project root:

   ```dotenv
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database>
   JWT_SECRET=replace-with-a-long-random-secret
   PORT=5000
   ```

   `DATABASE_URL` and `JWT_SECRET` are required for database-backed and authentication features. `PORT` is optional and defaults to `5000`. Keep real credentials out of source control.

3. Create the database tables and add the sample menu:

   ```sh
   npm run migrate
   ```

   The migration reads `config/schema.sql` and runs it in a transaction. It can be rerun safely; existing tables are preserved and sample menu items are not duplicated.

4. Start the API:

   ```sh
   npm run dev
   ```

   For a normal start, use `npm start`. Both scripts load `.env` and run `server.js`. The root endpoint at `http://localhost:5000/` returns a short service status message (substitute your configured port if different).

## API

All API routes are prefixed with `/api/v1`. Requests with JSON bodies should use `Content-Type: application/json`.

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public | Register with `name`, `email`, and `password`. |
| `POST` | `/api/v1/auth/login` | Public | Log in with `email` and `password`; returns a JWT and user details. |

Example registration body:

```json
{
  "name": "Taylor Example",
  "email": "taylor@example.com",
  "password": "your-password"
}
```

Example login body:

```json
{
  "email": "taylor@example.com",
  "password": "your-password"
}
```

The login response contains a `token`. Send it in the `Authorization` header for protected menu operations:

```text
Authorization: Bearer <token>
```

### Menu

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/menu` | Public | Return menu categories and items. |
| `GET` | `/api/v1/menu?category=Hot%20Coffee` | Public | Filter menu items by exact category. The `All` category returns all items. |
| `GET` | `/api/v1/menu/:id` | Public | Return one menu item by UUID. |
| `POST` | `/api/v1/menu` | Bearer token | Create a menu item. |
| `PUT` | `/api/v1/menu/:id` | Bearer token | Replace a menu item's fields. |
| `DELETE` | `/api/v1/menu/:id` | Bearer token | Delete a menu item. |

Create and update menu item bodies use these fields:

```json
{
  "name": "Classic Espresso",
  "description": "A double shot of espresso.",
  "price": 3.5,
  "category": "Hot Coffee",
  "image": "https://example.com/espresso.jpg",
  "isPopular": true
}
```

`description`, `image`, and `isPopular` are optional when creating an item; `isPopular` defaults to `false`. The API maps `isPopular` to the database column `is_popular`. Updates submit the item fields in the request body.

The menu list response has this shape:

```json
{
  "categories": ["All", "Hot Coffee", "Cold Drinks", "Bakery", "Tea & Others"],
  "items": []
}
```

### Orders

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/orders` | Public; optional token | Return the caller's orders, or all orders for an admin. Anonymous requests return an empty list. |
| `GET` | `/api/v1/orders/:id` | Public; optional token | Return an order if it belongs to the caller, or any order for an admin. Anonymous or unauthorized requests return not found. |

## Database

The SQL schema in [`config/schema.sql`](config/schema.sql) defines:

- `users`: UUID, name, role, unique email, hashed password, and creation timestamp.
- `menu_items`: UUID, name, description, price, category, image URL, popularity flag, and creation timestamp.
- `orders` and `order_items`: UUID-backed order records with foreign keys to users and menu items.

The PostgreSQL connection pool is configured in [`config/db.js`](config/db.js) using `DATABASE_URL`.

## Project layout

```text
.
├── config/
│   ├── db.js
│   └── schema.sql
├── scripts/
│   └── migrate.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── authroute.js
│   └── menuroute.js
├── server.js
└── package.json
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the server for development. |
| `npm start` | Start the server. |
| `npm run migrate` | Apply the database schema and seed sample menu items. |
| `npm test` | No automated test suite is configured yet; this script currently exits with an error. |

## Notes

- The API currently enables CORS for all origins.
- Any successfully authenticated user can perform the protected menu operations; the current API does not define role-based authorization.
- Registration and menu endpoints rely on database constraints and currently do not provide comprehensive request validation.