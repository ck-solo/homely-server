# Property Listings API Documentation

> **Author:** Subrat Palai
> **Branch:** `subrat`
> **Last Updated:** 07 June 2026

---

## Overview

This module implements the **core rental listing engine** for the Homely application. It allows property owners to create and manage rental listings with image uploads, while tenants can browse available properties.

### What's Included

- Listing creation with multipart image uploads (up to 10 images)
- Listing update with ownership verification
- Image storage via ImageKit (using existing `storage.service.js`)
- Owner-scoped listing retrieval
- Public listing browsing (approved listings only)
- Input validation for all listing fields
- Strict OWNER-only access on write operations via `auth.middleware.js`
- Request validation via `express-validator`

### What's NOT Included (Future Work / Other Teammates)

- Listing deletion
- Admin approval/rejection flow
- Advanced search and filtering (geo-based, text search)
- Pagination and sorting
- Listing performance metrics

---

## Files Created / Modified

### Files I Created (My Deliverables)

| File | Purpose |
|------|---------|
| `services/listing.service.js` | Business logic for creating, updating, and fetching listings |
| `controllers/listing.controller.js` | HTTP request/response handling for listing endpoints |
| `routes/v1/listing.routes.js` | Route definitions with auth, multer, and validation middleware |
| `middlewares/validators/listing.validator.js` | Input validation rules for create and update operations |

### Files I Extended (Teammate's Code — Minimal Additions)

| File | What I Added |
|------|-------------|
| `repositories/contracts/IListingRepository.js` | Added `update()` and `findByOwner()` contract methods |
| `repositories/implementations/mongoListingRepository.js` | Added `update()` and `findByOwner()` implementations |
| `routes/v1/index.routes.js` | Mounted `/listings` route under v1 |

### Files I Did NOT Touch (Teammate's Work)

| File | Owner |
|------|-------|
| `models/listing.model.js` | Shobhit Srivastava |
| `repositories/contracts/IListingRepository.js` (base) | Shobhit Srivastava |
| `repositories/implementations/mongoListingRepository.js` (base) | Shobhit Srivastava |
| `services/storage.service.js` | Ankush Saha |

---

## Architecture

```
Client Request (multipart/form-data)
     |
     v
+-----------------+
|   Routes (v1)   |  -- Defines endpoints, wires middleware chain
+--------+--------+
         |
         v
+-----------------+
| AuthMiddleware  |  -- Verifies Bearer token + OWNER role
+--------+--------+
         |
         v
+-----------------+
|     Multer      |  -- Parses multipart form, extracts image files
+--------+--------+
         |
         v
+-----------------+
|   Validators    |  -- Validates request body fields
+--------+--------+
         |
         v
+-----------------+
|   Controller    |  -- Handles HTTP req/res
+--------+--------+
         |
         v
+-----------------+
|    Service      |  -- Business logic (image upload, ownership check)
+--------+--------+
         |
         v
+-----------------+
|   Repository    |  -- Database operations via Mongoose
+--------+--------+
         |
         v
+-----------------+
|    MongoDB      |
+-----------------+
```

---

## API Endpoints

**Base URL:** `http://localhost:9000/api/v1/listings`

### 1. Create Listing

```
POST /api/v1/listings
```

**Auth:** Required (Bearer token)
**Role:** OWNER only
**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string | Yes | Max 200 characters |
| `description` | string | Yes | Max 2000 characters |
| `city` | string | Yes | - |
| `longitude` | number | Yes | Between -180 and 180 |
| `latitude` | number | Yes | Between -90 and 90 |
| `rentBudget` | number | Yes | Non-negative |
| `propertyType` | string | Yes | `PG` / `Hostel` / `Flat` / `Apartment` / `House` |
| `genderPreference` | string | No | `Male` / `Female` / `Co-ed` (defaults to `Co-ed`) |
| `amenities` | string | No | JSON array string or comma-separated (e.g. `"WiFi,AC,Parking"`) |
| `images` | file[] | No | Up to 10 files, max 5MB each, JPEG/PNG/WebP only |

**Success Response:** `201 Created`
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "listing": {
      "_id": "684a1b2c3d4e5f6a7b8c9d0e",
      "ownerRef": {
        "_id": "665a1b2c3d4e5f6a7b8c9d0e",
        "name": "Subrat Kumar",
        "email": "subrat@example.com",
        "phone": "+919876543210"
      },
      "title": "Spacious 2BHK Flat near Metro",
      "description": "Fully furnished flat with balcony...",
      "city": "Bangalore",
      "location": {
        "type": "Point",
        "coordinates": [77.5946, 12.9716]
      },
      "rentBudget": 15000,
      "propertyType": "Flat",
      "genderPreference": "Co-ed",
      "amenities": ["WiFi", "AC", "Parking"],
      "images": [
        "https://ik.imagekit.io/xxx/homely/listings/img1.jpg",
        "https://ik.imagekit.io/xxx/homely/listings/img2.jpg"
      ],
      "availabilityStatus": true,
      "approvalStatus": "PENDING",
      "createdAt": "2026-06-07T18:00:00.000Z",
      "updatedAt": "2026-06-07T18:00:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status | Scenario |
|--------|----------|
| `400 Bad Request` | Validation failed (missing/invalid fields) |
| `401 Unauthorized` | No token / invalid token |
| `403 Forbidden` | User role is not OWNER |

---

### 2. Update Listing

```
PUT /api/v1/listings/:id
```

**Auth:** Required (Bearer token)
**Role:** OWNER only (must be the listing's creator)
**Content-Type:** `multipart/form-data`

**URL Params:**

| Param | Type | Required | Rules |
|-------|------|----------|-------|
| `id` | string | Yes | Valid MongoDB ObjectId |

**Form Fields (all optional):**

| Field | Type | Rules |
|-------|------|-------|
| `title` | string | Max 200 characters |
| `description` | string | Max 2000 characters |
| `city` | string | - |
| `longitude` | number | Between -180 and 180 |
| `latitude` | number | Between -90 and 90 |
| `rentBudget` | number | Non-negative |
| `propertyType` | string | `PG` / `Hostel` / `Flat` / `Apartment` / `House` |
| `genderPreference` | string | `Male` / `Female` / `Co-ed` |
| `availabilityStatus` | boolean | `true` / `false` |
| `amenities` | string | JSON array string or comma-separated |
| `images` | file[] | Up to 10 new files (appended to existing images) |

**Success Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Listing updated successfully",
  "data": {
    "listing": { ... }
  }
}
```

**Error Responses:**

| Status | Scenario |
|--------|----------|
| `400 Bad Request` | Validation failed / invalid listing ID format |
| `401 Unauthorized` | No token / invalid token |
| `403 Forbidden` | User is not the listing's owner |
| `404 Not Found` | Listing with given ID does not exist |

---

### 3. Get All Listings (Public)

```
GET /api/v1/listings
```

**Auth:** Not required
**Description:** Returns all listings with `approvalStatus: "APPROVED"` for tenants to browse.

**Success Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Listings fetched successfully",
  "data": {
    "listings": [ ... ],
    "count": 12
  }
}
```

---

### 4. Get Single Listing (Public)

```
GET /api/v1/listings/:id
```

**Auth:** Not required

**Success Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Listing fetched successfully",
  "data": {
    "listing": { ... }
  }
}
```

**Error Responses:**

| Status | Scenario |
|--------|----------|
| `400 Bad Request` | Invalid listing ID format |
| `404 Not Found` | Listing not found |

---

### 5. Get My Listings (Owner)

```
GET /api/v1/listings/owner/my-listings
```

**Auth:** Required (Bearer token)
**Role:** OWNER only

**Success Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Your listings fetched successfully",
  "data": {
    "listings": [ ... ],
    "count": 3
  }
}
```

---

## How Teammates Can Use This

### Creating a listing (Postman / Frontend)

```
POST /api/v1/listings
Headers:
  Authorization: Bearer <access_token>
Body (form-data):
  title: "Spacious 2BHK Flat"
  description: "Fully furnished flat near metro station"
  city: "Bangalore"
  longitude: 77.5946
  latitude: 12.9716
  rentBudget: 15000
  propertyType: "Flat"
  genderPreference: "Co-ed"
  amenities: '["WiFi","AC","Parking"]'
  images: [file1.jpg, file2.jpg]
```

### Frontend integration notes

- Use `FormData` API for multipart uploads
- Append images as `images` field (not `image`)
- Amenities can be sent as a JSON stringified array
- New images on update are **appended** to existing ones, not replaced

---

## Key Design Decisions

1. **Ownership Verification** - On update, the service checks `ownerRef._id === req.user.id` before allowing changes. A non-owner gets `403 Forbidden`.

2. **Image Upload** - Uses the existing `storage.service.js` (ImageKit) setup by Ankush. Images are uploaded to `/homely/listings/` folder. Max 10 images per request, 5MB each.

3. **Amenities Parsing** - Since multipart forms send everything as strings, amenities are parsed flexibly: accepts JSON array string (`'["WiFi","AC"]'`) or comma-separated string (`"WiFi,AC,Parking"`).

4. **Route Ordering** - `/owner/my-listings` is declared BEFORE `/:id` to prevent Express from treating "owner" as a listing ID parameter.

5. **Approval Status** - New listings default to `PENDING`. The public GET endpoint only returns `APPROVED` listings. Admin approval flow is handled separately.

6. **Field Whitelisting** - On update, only explicitly allowed fields are accepted. The `ownerRef` and `approvalStatus` cannot be modified by the owner.

---

## Validation Rules Summary

### Create Listing
| Field | Rule |
|-------|------|
| title | Required, max 200 chars |
| description | Required, max 2000 chars |
| city | Required |
| longitude | Required, -180 to 180 |
| latitude | Required, -90 to 90 |
| rentBudget | Required, >= 0 |
| propertyType | Required, enum: PG/Hostel/Flat/Apartment/House |
| genderPreference | Optional, enum: Male/Female/Co-ed |
| amenities | Optional, JSON array or CSV string |

### Update Listing
- All fields are **optional**
- Listing ID in URL params must be a valid MongoDB ObjectId
- Same validation rules apply when a field is provided

---

## Error Response Format

All errors follow the global format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Title is required" },
    { "field": "rentBudget", "message": "Rent budget must be a non-negative number" }
  ]
}
```

---

## Listing Schema Reference (from `listing.model.js`)

| Field | Type | Default |
|-------|------|---------|
| `ownerRef` | ObjectId (ref: User) | Required |
| `title` | String | Required |
| `description` | String | Required |
| `city` | String | Required |
| `location` | GeoJSON Point | Required |
| `rentBudget` | Number | Required |
| `propertyType` | Enum: PG/Hostel/Flat/Apartment/House | Required |
| `genderPreference` | Enum: Male/Female/Co-ed | Co-ed |
| `amenities` | [String] | [] |
| `images` | [String] | [] |
| `availabilityStatus` | Boolean | true |
| `approvalStatus` | Enum: PENDING/APPROVED/REJECTED | PENDING |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |
