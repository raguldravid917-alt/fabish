# Fabish Storefront REST API Documentation

This REST API is built using Node.js, Express, and Mongoose under a scalable Controller-Service-Repository architecture. 

---

## Centralized Response Format
All responses are formatted consistently:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 60
  }
}
```

---

## Authentication Endpoints (`/api/auth` & `/api/admin`)

### 1. Customer Registration
*   **Route**: `POST /api/auth/register`
*   **Access**: Public
*   **Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "password123"
    }
    ```

### 2. Customer Login
*   **Route**: `POST /api/auth/login`
*   **Access**: Public
*   **Body**:
    ```json
    {
      "email": "jane@example.com",
      "password": "password123"
    }
    ```
*   **Returns**: JWT access token inside body, sets HttpOnly secure cookie `refreshToken`.

### 3. Admin Login
*   **Route**: `POST /api/admin/login`
*   **Access**: Admin Role Check
*   **Body**:
    ```json
    {
      "email": "admin@fabish.com",
      "password": "admin123"
    }
    ```

### 4. Refresh Token Rotation
*   **Route**: `POST /api/auth/refresh`
*   **Access**: Public (Cookie read or request body)
*   **Returns**: New Access Token + Rotated Refresh Token Cookie.

### 5. Profile Lookup & Update
*   **Route**: `GET /api/auth/profile` / `PUT /api/auth/profile`
*   **Access**: Private (Bearer Token)

---

## Products Endpoints (`/api/products`)

### 1. List Products
*   **Route**: `GET /api/products`
*   **Access**: Public
*   **Query Parameters**:
    *   `page`: Number (default: `1`)
    *   `limit`: Number (default: `12`)
    *   `keyword`: Search term (utilizes Mongoose Text Search Index)
    *   `category`: Category slug
    *   `minPrice` / `maxPrice`: Numeric filter bounds
    *   `sort`: `priceAsc` | `priceDesc` | `title-ascending` | `title-descending` | `newest` | `rating`
    *   `featured` / `bestSeller` / `newArrival` / `trending`: `true` | `false`

### 2. Create Product
*   **Route**: `POST /api/products`
*   **Access**: Private/Admin
*   **Body**: Multipart form-data (supports up to 10 files under the `images` key) or raw JSON:
    ```json
    {
      "title": "Aura Moisturizer Gel",
      "description": "Rich nourishing gel",
      "price": 2400,
      "category": "moisturizer",
      "stock": 50,
      "sku": "AURA-MOIST-01",
      "tags": ["moisturizer", "sensitive", "gel"]
    }
    ```

### 3. Update Product
*   **Route**: `PUT /api/products/:id`
*   **Access**: Private/Admin
*   **Body**: Multipart or JSON matching fields.

### 4. Soft Delete Product
*   **Route**: `DELETE /api/products/:id`
*   **Access**: Private/Admin
*   *Marks product status as `'Deleted'` so it is hidden from storefront but preserved in db.*

### 5. Restore / Patch Products
*   **PATCH** `/api/products/:id/restore`
*   **PATCH** `/api/products/:id/status` (Sets status to `'Draft'` | `'Published'` | `'Hidden'`)
*   **PATCH** `/api/products/:id/featured`
*   **PATCH** `/api/products/:id/trending`
*   **PATCH** `/api/products/:id/bestseller`
*   **PATCH** `/api/products/:id/newarrival`

### 6. Bulk Action Updates
*   **PATCH** `/api/products/bulk-status`
    ```json
    {
      "ids": ["id1", "id2"],
      "action": "delete" // "delete" | "publish" | "hide"
    }
    ```

---

## Category Endpoints (`/api/categories`)
*   **GET** `/api/categories` — Retrieves active category list.
*   **POST** `/api/categories` — Creates categories (Admin only).
*   **PUT** `/api/categories/:id` — Edits categories (Admin only).
*   **DELETE** `/api/categories/:id` — Soft-deletes a category (Admin only).

---

## Order Endpoints (`/api/orders`)
*   **POST** `/api/orders` — Checkout order items. Validates stock levels, dynamically computes shipping fees, and records order in db.
*   **GET** `/api/orders/myorders` — Retrieve active user's orders.
*   **GET** `/api/orders/:id` — Details of a specific order.
*   **PUT** `/api/orders/:id/pay` — Mark order as paid.
*   **PUT** `/api/orders/:id/deliver` — Mark order as delivered (Admin only).
*   **GET** `/api/orders/stats` — Admin dashboard sales statistics aggregate.

---

## Review Endpoints (`/api/reviews`)
*   **GET** `/api/reviews/product/:productId` — Retrieve reviews.
*   **POST** `/api/reviews` — Post review (Rating 1-5). Automatically triggers Average Rating & reviewsCount recalculations on the Product.
*   **DELETE** `/api/reviews/:id` — Remove review.

---

## Wishlist & Cart Database Endpoints (`/api/wishlist` & `/api/cart`)
*   **GET** / **POST** `/api/wishlist/toggle` — Toggles products in DB wishlist.
*   **GET** / **PUT** `/api/cart` — Syncs item counts in DB cart.
