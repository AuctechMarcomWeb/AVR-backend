# AVR Backend API

Node.js + Express + MongoDB backend for the AVR Interior Design platform. Handles authentication, content management (blogs, gallery, portfolio, sliders, testimonials), contact & booking forms, image uploads, and an admin dashboard.

---

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + OTP via WhatsApp
- **Image Upload**: Cloudinary (via Multer memory storage)
- **Password Hashing**: bcrypt
- **Rate Limiting**: express-rate-limit

---

## Getting Started

```bash
npm install
npm run dev   # or node index.js
```

Create a `.env` file with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Authentication Flow

```
User enters phone
    │
    ▼
POST /api/auth/registerOrLogin   ← sends OTP via WhatsApp
    │
    ▼
POST /api/auth/verifyOtp         ← returns JWT authToken
    │
    ▼
Use authToken in Authorization: Bearer <token>
```

Password-based login is also supported for admin users created via `createUser`.

---

## API Reference

Base URL: `http://localhost:5000`

All protected routes require: `Authorization: Bearer <token>`

---

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/registerOrLogin` | Public | Send OTP to phone number |
| POST | `/verifyOtp` | Public | Verify OTP → returns JWT token |
| POST | `/resendOtp` | Public | Resend OTP to phone |
| POST | `/loginWithPassword` | Public | Login with phone + password |
| GET | `/profile` | Protected | Get logged-in user profile |
| POST | `/createPassword` | Protected | Set password for first time |
| POST | `/updatePassword` | Protected | Change existing password |
| POST | `/resetPassword` | Protected | Force-reset password |
| POST | `/createUser` | Public | Admin creates a user directly |
| GET | `/getAllUsers` | Public | List all users (pagination + search) |
| PATCH | `/update/:id` | Public | Update user fields by ID |
| PUT | `/updateRole/:userId` | Public | Change user role (User / Admin) |
| DELETE | `/delete/:id` | Protected | Delete user by ID |

**Query params for `getAllUsers`:** `page`, `limit`, `search`, `sortBy` (recent/oldest), `isPagination`

---

### 📤 Upload — `/api/upload`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/uploadImage` | Public | Upload image to Cloudinary |

**Body:** `multipart/form-data` with field name `file`  
**Response:** `{ imageUrl: "https://res.cloudinary.com/..." }`

---

### 📝 Blogs — `/api/blogs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get all blogs (with comment count) |
| GET | `/:id` | Public | Get single blog + its comments |
| POST | `/` | Protected | Create a new blog |
| PUT | `/:id` | Protected | Update blog |
| DELETE | `/:id` | Protected | Delete blog |

**Query params for GET /:** `page`, `limit`, `search`, `isActive`, `sortBy` (recent/oldest), `isPagination`

**Create body fields:** `url`, `heading`, `seoTitle` *(required)*, `metaKeywords`, `shortDescription`, `mainImage`, `multipleImages[]`, `mainImageName`, `details`, `isActive`

---

<!-- ### 💬 Comments — `/api/comments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Public | Add comment to a blog |
| GET | `/` | Public | Get all comments (paginated) |
| GET | `/blog/:blogId` | Public | Get all active comments for a blog |
| PUT | `/:id` | Protected | Update comment (e.g. toggle isActive) |
| DELETE | `/:id` | Protected | Delete comment | -->

**Create body fields:** `blogId` *(required)*, `name` *(required)*, `email` *(required)*, `message` *(required)*

---

### 🖼️ Gallery — `/api/gallery`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get all gallery items |
| GET | `/:id` | Public | Get single gallery item |
| POST | `/` | Protected | Add gallery item |
| PUT | `/:id` | Protected | Update gallery item |
| DELETE | `/:id` | Protected | Delete gallery item |

**Query params for GET /:** `page`, `limit`, `search`, `isActive`, `serviceType`, `sortBy`, `isPagination`

**Create body fields:** `url` *(required)*, `title`, `serviceType`, `isActive`

---

### 🎠 Home Slider — `/api/homeSlider`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get all sliders/banners |
| GET | `/:id` | Public | Get single slider |
| POST | `/` | Protected | Create slider |
| PUT | `/:id` | Protected | Update slider |
| DELETE | `/:id` | Protected | Delete slider |

**Create body fields:** `image` *(required)*, `title`, `heading`, `subHeading`, `isActive`

---

### ⭐ Testimonials — `/api/testimonials`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get all testimonials |
| GET | `/:id` | Public | Get single testimonial |
| POST | `/` | Protected | Create testimonial |
| PUT | `/:id` | Protected | Update testimonial |
| DELETE | `/:id` | Protected | Delete testimonial |

**Create body fields:** `profileImage` *(required)*, `title`, `description`, `rating` (0–5), `isActive`

---

### 🏠 Portfolio — `/api/portfolio`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get all portfolios |
| GET | `/slug/:slug` | Public | Get portfolio by slug (for frontend URLs) |
| GET | `/:id` | Public | Get portfolio by MongoDB ID |
| POST | `/` | Protected | Create portfolio |
| PUT | `/:id` | Protected | Update portfolio |
| DELETE | `/:id` | Protected | Delete portfolio |

**Query params for GET /:** `page`, `limit`, `search`, `category`, `featured`, `activeStatus`, `sortBy` (recent/oldest/order), `isPagination`

**Create body fields:** `title` *(required)*, `slug` *(required, unique)*, `category` *(required)*, `thumbnailImage` *(required)*, `description` *(required)*, `clientName`, `location`, `duration`, `bannerImage`, `shortDescription`, `galleryImages[]`, `featured`, `activeStatus`, `order`

---

### 📩 Contact — `/api/contact`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Public | Submit contact form (public) |
| GET | `/` | Protected | Get all contact submissions |
| GET | `/:id` | Protected | Get single contact by ID |
| PUT | `/:id` | Protected | Update contact record |
| DELETE | `/:id` | Protected | Delete contact record |

**Create body fields:** `name`, `email`, `phone`, `subject`, `message` — all required

---

### 📅 Book Consultation — `/api/bookConslution`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Public | Submit consultation booking (public) |
| GET | `/` | Protected | Get all bookings |
| GET | `/:id` | Protected | Get single booking |
| PUT | `/:id` | Protected | Update booking (e.g. status) |
| DELETE | `/:id` | Protected | Delete booking |

**Create body fields:** `name`, `email`, `phone`, `date`, `slot`, `address` — all required. `remarks` — optional.

**Query params for GET /:** `page`, `limit`, `search`, `status`, `sortBy`, `isPagination`

---

### 📊 Dashboard — `/api/dashboard`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get content stats (counts for blogs, gallery, sliders, testimonials, contacts) |

**Response shape:**
```json
{
  "blogs": { "totalBlogs": 10, "activeBlogs": 8 },
  "testimonials": { "totalTestimonials": 5, "activeTestimonials": 5 },
  "homeSliders": { "totalSliders": 3, "activeSliders": 3 },
  "gallery": { "totalGalleryItems": 20, "activeGalleryItems": 18 },
  "contacts": { "totalContacts": 12 }
}
```

---

## Standard Response Format

All endpoints return a consistent JSON envelope:

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses follow the same shape with a non-2xx `statusCode` and `data: null`.

---

## Postman Collection

Import `ARV-Backend.postman_collection.json` from the repo root.

Set the `baseUrl` collection variable to your server URL (default: `http://localhost:5000`).  
After login, copy the `authToken` from the response and set it as the `authToken` collection variable.
