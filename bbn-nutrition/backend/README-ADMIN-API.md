# BBN Nutrition Admin API Documentation

This document provides detailed information about the admin API endpoints for product and category management in the BBN Nutrition application.

## Authentication

All admin API endpoints require authentication with an admin user token. Include the token in the request headers:

```
Authorization: Bearer <your-admin-token>
```

## Product Management

### Get All Products

```
GET /api/admin/products
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of products per page (default: 10)
- `sort` (optional): Sort field (e.g., "name", "price", "createdAt")
- `order` (optional): Sort order ("asc" or "desc")
- `search` (optional): Search term for product name or description
- `category` (optional): Filter by category ID
- `brand` (optional): Filter by brand name
- `inStock` (optional): Filter by stock status (true/false)
- `featured` (optional): Filter by featured status (true/false)
- `bestSeller` (optional): Filter by best seller status (true/false)
- `newArrival` (optional): Filter by new arrival status (true/false)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "data": [/* array of product objects */]
}
```

### Get Single Product

```
GET /api/admin/products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {/* product object */}
}
```

### Create Product

```
POST /api/admin/products
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "category": "categoryId",
  "brand": "Brand Name",
  "stockQuantity": 100,
  "nutritionFacts": "{\"servingSize\":\"1 scoop (30g)\",\"servingsPerContainer\":30,\"calories\":120,\"protein\":24,\"carbs\":3,\"fat\":1}",
  "variants": "[{\"name\":\"Chocolate\",\"price\":29.99,\"inStock\":true,\"stockQuantity\":50},{\"name\":\"Vanilla\",\"price\":29.99,\"inStock\":true,\"stockQuantity\":50}]",
  "tags": "[\"protein\",\"supplement\"]",
  "featured": true,
  "bestSeller": false,
  "newArrival": true,
  "discount": 10,
  "weight": 2.5,
  "dimensions": "{\"length\":10,\"width\":5,\"height\":15}",
  "shippingWeight": 3.0,
  "metaTitle": "Product Name | BBN Nutrition",
  "metaDescription": "High-quality product description"
}
```

**Note:** You can also upload product images using multipart/form-data. The API supports up to 5 images per product.

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {/* created product object */}
}
```

### Update Product

```
PUT /api/admin/products/:id
```

**Request Body:**
Same fields as Create Product, all fields are optional.

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {/* updated product object */}
}
```

### Delete Product

```
DELETE /api/admin/products/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {}
}
```

### Bulk Update Product Stock

```
PUT /api/admin/products/bulk-stock
```

**Request Body:**
```json
{
  "updates": [
    {
      "productId": "productId1",
      "stockQuantity": 100
    },
    {
      "productId": "productId2",
      "stockQuantity": 50
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "modifiedCount": 2
  }
}
```

### Bulk Update Featured Status

```
PUT /api/admin/products/bulk-featured
```

**Request Body:**
```json
{
  "updates": [
    {
      "productId": "productId1",
      "featured": true
    },
    {
      "productId": "productId2",
      "featured": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Featured status updated successfully",
  "data": {
    "modifiedCount": 2
  }
}
```

### Bulk Delete Products

```
DELETE /api/admin/products/bulk
```

**Request Body:**
```json
{
  "productIds": ["productId1", "productId2", "productId3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Products deleted successfully",
  "data": {
    "deletedCount": 3
  }
}
```

## Category Management

### Get All Categories (Public)

```
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [/* array of category objects */]
}
```

### Get Single Category (Public)

```
GET /api/categories/:id
```

**Response:**
```json
{
  "success": true,
  "data": {/* category object */}
}
```

### Create Category

```
POST /api/admin/categories
```

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category description",
  "parentId": "parentCategoryId" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {/* created category object */}
}
```

### Update Category

```
PUT /api/admin/categories/:id
```

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated category description",
  "parentId": "newParentCategoryId" // optional, set to null to remove parent
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {/* updated category object */}
}
```

### Delete Category

```
DELETE /api/admin/categories/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {}
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [/* validation errors if applicable */]
}
```

## Testing

A test script is provided to verify the functionality of the admin API endpoints:

```
node test-admin-products.js
```

This script tests all the product and category management endpoints and provides a summary of the test results.