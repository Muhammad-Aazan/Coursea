# Coursea LMS Backend

A complete, clean, beginner-friendly REST API backend for **Coursea**, an Online Learning Management System.

Built with **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, **JWT**, **bcryptjs**, **Multer**, and **Stripe**.

---

## Features

- **Authentication & Authorization**: Role-based access control (`student`, `instructor`, `admin`) with JWT and secure bcrypt password hashing.
- **User Management**: Admin controls for listing, updating, deleting users, and assigning roles.
- **Course Marketplace**: Advanced query filtering (`search`, `category`, `level`, `minPrice`, `maxPrice`, `sort`).
- **Curriculum Architecture**: Hierarchical Course ➔ Section ➔ Lesson layout with lesson reordering and free preview capability.
- **Enrollment & Learning Access**: Enrollment verification, free course enrollment, and gated lesson access for paid courses.
- **Interactive Progress Tracking**: Lesson completion status, automated progress percentage calculation, and synchronization with student enrollment records.
- **Reviews & Ratings**: Student reviews (restricted to enrolled students), duplicate review protection, and aggregate course ratings.
- **Wishlist**: Add/remove courses and quick wishlist status checking.
- **Stripe Payments**:
  - Secure Stripe Checkout Session generation (`POST /api/payments/create-checkout`).
  - Stripe Webhook handler (`POST /api/payments/webhook`) for signature verification and automatic enrollment activation.
  - Development mock session fallback for testing without live API keys.
- **Admin Dashboard**: Aggregated platform metrics (total users, students, instructors, courses, enrollments, payments, revenue). Course approval/rejection workflows and review moderation.
- **File Uploads**: Multer disk storage for avatars, thumbnails, and lesson videos served statically at `/uploads`.

---

## Project Structure

```
Backend/
├── src/
│   ├── app.js               # Express application, global middleware, routes registration
│   ├── config/
│   │   └── db.js            # MongoDB database connection
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   ├── lessonController.js
│   │   ├── paymentController.js
│   │   ├── progressController.js
│   │   ├── reviewController.js
│   │   ├── sectionController.js
│   │   ├── uploadController.js
│   │   ├── userController.js
│   │   └── wishlistController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification & role authorization (protect, authorize)
│   │   ├── error.js         # Centralized error handler and 404 handler
│   │   └── upload.js        # Multer disk storage & file filter
│   ├── models/
│   │   ├── Category.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Lesson.js
│   │   ├── Payment.js
│   │   ├── Progress.js
│   │   ├── Review.js
│   │   ├── Section.js
│   │   ├── User.js
│   │   └── Wishlist.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── instructorRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── sectionRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── userRoutes.js
│   │   └── wishlistRoutes.js
│   └── utils/
│       └── token.js         # JWT generation helper
├── server.js                # Server entry point (starts listener)
├── test-api.js              # Complete automated end-to-end API test suite
├── .env                     # Environment variables
├── .gitignore
└── package.json
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24+ recommended)
- **MongoDB**: MongoDB Atlas URI or local instance

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables (`.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

### 4. Running the Server
```bash
# Start server in production mode
npm start

# Start server in development mode (with auto-reload)
npm run dev
```

### 5. Running the Test Suite
The backend comes with an end-to-end verification suite testing all 15 phases against MongoDB:
```bash
npm test
```

---

## API Documentation

### Base URL: `http://localhost:5000/api`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register student, instructor, or admin |
| `POST` | `/login` | Public | Login and obtain JWT token |
| `GET` | `/me` | Protected | Get current user's profile |
| `PATCH` | `/profile` | Protected | Update profile name or image |
| `PATCH` | `/change-password` | Protected | Change password |
| `POST` | `/logout` | Protected | Logout session |

### 2. User Management - Admin (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Admin | Get all users |
| `GET` | `/:id` | Admin | Get single user by ID |
| `PATCH` | `/:id` | Admin | Update user details |
| `DELETE` | `/:id` | Admin | Delete user account |
| `PATCH` | `/:id/role` | Admin | Change user role (`student`, `instructor`, `admin`) |

### 3. Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | List all categories |
| `GET` | `/:id` | Public | Get single category |
| `GET` | `/:id/courses` | Public | Get published courses in category |
| `POST` | `/` | Admin | Create category |
| `PATCH` | `/:id` | Admin | Update category |
| `DELETE` | `/:id` | Admin | Delete category (checks associated courses) |

### 4. Courses (`/api/courses`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Search & filter courses (`?search=`, `?category=`, `?level=`, `?minPrice=`, `?maxPrice=`, `?sort=`) |
| `GET` | `/:id` | Public | Get course details with sections and lessons |
| `GET` | `/my-courses` | Instructor | Get instructor's own courses |
| `POST` | `/` | Instructor | Create new course |
| `PATCH` | `/:id` | Instructor | Update course |
| `DELETE` | `/:id` | Instructor | Delete course and its sections/lessons |
| `PATCH` | `/:id/publish` | Instructor | Toggle publish/unpublish |
| `GET` | `/instructors/:id/courses` | Public | Get courses by specific instructor |
| `GET` | `/:id/students` | Instructor | List enrolled students |
| `GET` | `/:id/stats` | Instructor | Get course stats (students, rating, revenue) |

### 5. Sections (`/api/sections` & `/api/courses/:courseId/sections`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/courses/:courseId/sections` | Public | List sections for a course |
| `POST` | `/courses/:courseId/sections` | Instructor | Create new section |
| `PATCH` | `/sections/:id` | Instructor | Update section title |
| `DELETE` | `/sections/:id` | Instructor | Delete section and its lessons |
| `PATCH` | `/sections/:id/order` | Instructor | Update section display order |

### 6. Lessons (`/api/lessons` & `/api/sections/:sectionId/lessons`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/sections/:sectionId/lessons` | Enrolled / Instructor | List lessons in section |
| `GET` | `/lessons/:id/preview` | Public | Access preview lesson video |
| `GET` | `/lessons/:id` | Enrolled / Instructor | Access full lesson content |
| `POST` | `/sections/:sectionId/lessons` | Instructor | Add lesson to section |
| `PATCH` | `/lessons/:id` | Instructor | Update lesson content |
| `DELETE` | `/lessons/:id` | Instructor | Delete lesson |
| `PATCH` | `/lessons/:id/order` | Instructor | Update lesson order |

### 7. Enrollments (`/api/enrollments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Protected | Enroll in free course or with valid payment ID |
| `GET` | `/my-courses` | Protected | Get student's enrolled courses |
| `GET` | `/:courseId` | Protected | Check if student is enrolled in course |
| `GET` | `/courses/:courseId/enrollments`| Instructor/Admin | View course enrollments |
| `GET` | `/detail/:id` | Protected | View enrollment details |

### 8. Progress Tracking (`/api/progress`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/:courseId` | Protected | Get progress and completion percentage |
| `POST` | `/:lessonId` | Protected | Mark lesson as completed (auto-updates %) |
| `DELETE` | `/:lessonId` | Protected | Mark lesson as incomplete (recalculates %) |
| `GET` | `/:courseId/completed-lessons` | Protected | List completed lesson IDs |

### 9. Reviews (`/api/reviews` & `/api/courses/:courseId/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/courses/:courseId/reviews` | Public | List course reviews and average rating |
| `POST` | `/courses/:courseId/reviews` | Enrolled Student | Add review (1 review per enrolled student) |
| `GET` | `/reviews/:id` | Public | Get single review |
| `PATCH` | `/reviews/:id` | Owner | Update review rating and comment |
| `DELETE` | `/reviews/:id` | Owner / Admin | Delete review |

### 10. Wishlist (`/api/wishlist`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Protected | View student's wishlist |
| `GET` | `/:courseId/check` | Protected | Check if course is in wishlist |
| `POST` | `/:courseId` | Protected | Add course to wishlist |
| `DELETE` | `/:courseId` | Protected | Remove course from wishlist |

### 11. Payments & Stripe (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/create-checkout` | Protected | Generate Stripe Checkout Session |
| `POST` | `/webhook` | Stripe Public | Handle Stripe checkout completion & auto-enroll |
| `GET` | `/my-payments` | Protected | Student's payment history |
| `GET` | `/:id` | Protected | Payment record details |

### 12. Admin Management (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard` | Admin | Total platform metrics & revenue |
| `GET` | `/users` | Admin | List all registered users |
| `GET` | `/courses` | Admin | List all courses (published & draft) |
| `GET` | `/enrollments` | Admin | List all enrollments across platform |
| `GET` | `/payments` | Admin | List all payments across platform |
| `GET` | `/reviews` | Admin | List all reviews across platform |
| `DELETE` | `/reviews/:id` | Admin | Moderate / delete inappropriate review |
| `PATCH` | `/courses/:id/approve` | Admin | Approve & publish course |
| `PATCH` | `/courses/:id/reject` | Admin | Reject & unpublish course |

### 13. File Upload (`/api/upload`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Protected | Upload single image or video file (multipart `file`) |

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Detailed error message"
}
```
