require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const app = require("./src/app");

const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}`;

let server;
let adminToken = "";
let instructorToken = "";
let studentToken = "";
let student2Token = "";

let adminUser = null;
let instructorUser = null;
let studentUser = null;

let categoryId = "";
let freeCourseId = "";
let paidCourseId = "";
let sectionId = "";
let previewLessonId = "";
let paidLessonId = "";
let reviewId = "";
let paymentId = "";
let mockSessionId = "";

const timestamp = Date.now();

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTests() {
  console.log("==========================================");
  console.log("   COURSEALMS BACKEND - API VERIFICATION");
  console.log("==========================================");

  // Connect to DB and start server
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database connected for test suite.");

  server = app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });

  try {
    // 1. Health Check
    console.log("\n--- Phase 1: Base & Health Check ---");
    const health = await request("/");
    assert(health.status === 200 && health.data.success === true, "Health check responds with success");

    // 2. Authentication Suite
    console.log("\n--- Phase 2: Authentication ---");
    // Register Admin
    const regAdmin = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Admin Tester",
        email: `admin_${timestamp}@coursea.test`,
        password: "password123",
        role: "admin"
      }
    });
    assert(regAdmin.status === 201, "Register admin succeeds");
    adminToken = regAdmin.data.data.token;
    adminUser = regAdmin.data.data.user;

    // Register Instructor
    const regInst = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Instructor Tester",
        email: `inst_${timestamp}@coursea.test`,
        password: "password123",
        role: "instructor"
      }
    });
    assert(regInst.status === 201, "Register instructor succeeds");
    instructorToken = regInst.data.data.token;
    instructorUser = regInst.data.data.user;

    // Register Student 1
    const regStudent = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Student Tester",
        email: `student_${timestamp}@coursea.test`,
        password: "password123",
        role: "student"
      }
    });
    assert(regStudent.status === 201, "Register student succeeds");
    studentToken = regStudent.data.data.token;
    studentUser = regStudent.data.data.user;

    // Register Student 2 (for non-enrolled negative tests)
    const regStudent2 = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Student Two",
        email: `student2_${timestamp}@coursea.test`,
        password: "password123"
      }
    });
    assert(regStudent2.status === 201, "Register second student succeeds");
    student2Token = regStudent2.data.data.token;

    // Duplicate email registration should fail
    const dupReg = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Duplicate",
        email: `student_${timestamp}@coursea.test`,
        password: "password123"
      }
    });
    assert(dupReg.status === 400 && dupReg.data.success === false, "Duplicate email registration rejected");

    // Login Student
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: `student_${timestamp}@coursea.test`,
        password: "password123"
      }
    });
    assert(loginRes.status === 200 && loginRes.data.data.token, "Login with valid credentials succeeds");

    // Get Current User (/me)
    const meRes = await request("/api/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(meRes.status === 200 && meRes.data.data.user.email === `student_${timestamp}@coursea.test`, "GET /api/auth/me returns current user");

    // Update Profile
    const profileRes = await request("/api/auth/profile", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { name: "Updated Student Name" }
    });
    assert(profileRes.status === 200 && profileRes.data.data.user.name === "Updated Student Name", "Update profile succeeds");

    // Change Password
    const pwRes = await request("/api/auth/change-password", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { currentPassword: "password123", newPassword: "newpassword123" }
    });
    assert(pwRes.status === 200, "Change password succeeds");

    // Re-login with new password
    const reLogin = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: `student_${timestamp}@coursea.test`,
        password: "newpassword123"
      }
    });
    assert(reLogin.status === 200, "Login with new password succeeds");
    studentToken = reLogin.data.data.token;

    // Logout
    const logoutRes = await request("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(logoutRes.status === 200, "POST /api/auth/logout succeeds");

    // 3. User Management APIs (Admin)
    console.log("\n--- Phase 3: Admin User Management ---");
    const allUsers = await request("/api/users", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(allUsers.status === 200 && allUsers.data.count >= 3, "Admin retrieves all users");

    // Student forbidden from admin routes
    const forbiddenUsers = await request("/api/users", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(forbiddenUsers.status === 403, "Student is blocked from GET /api/users");

    // Get Single User
    const oneUser = await request(`/api/users/${studentUser._id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(oneUser.status === 200, "Admin gets single user by ID");

    // Admin updates user
    const updateUserRes = await request(`/api/users/${studentUser._id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: "Student Verified" }
    });
    assert(updateUserRes.status === 200, "Admin updates user successfully");

    // 4. Category Suite
    console.log("\n--- Phase 4: Category Management ---");
    const createCat = await request("/api/categories", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: `Web Development ${timestamp}`,
        description: "Modern Fullstack Web Development courses",
        image: "https://example.com/cat.jpg"
      }
    });
    assert(createCat.status === 201, "Admin creates category");
    categoryId = createCat.data.data.category._id;

    // Get Categories (Public)
    const getCats = await request("/api/categories");
    assert(getCats.status === 200 && getCats.data.count > 0, "Public retrieves categories");

    // Get Single Category
    const getCat = await request(`/api/categories/${categoryId}`);
    assert(getCat.status === 200, "Get single category by ID");

    // Update Category
    const updateCat = await request(`/api/categories/${categoryId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { description: "Updated Category Description" }
    });
    assert(updateCat.status === 200, "Admin updates category");

    // 5. Course Suite
    console.log("\n--- Phase 5: Course Management ---");
    // Create Free Course
    const createFreeCourse = await request("/api/courses", {
      method: "POST",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: {
        title: `Free Intro to Web Dev ${timestamp}`,
        description: "Complete free introductory course",
        price: 0,
        category: categoryId,
        level: "beginner",
        requirements: ["Computer", "Internet"],
        whatYouWillLearn: ["HTML", "CSS", "JavaScript"]
      }
    });
    assert(createFreeCourse.status === 201, "Instructor creates free course");
    freeCourseId = createFreeCourse.data.data.course._id;

    // Create Paid Course
    const createPaidCourse = await request("/api/courses", {
      method: "POST",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: {
        title: `Fullstack Mastery ${timestamp}`,
        description: "Comprehensive paid web course",
        price: 49.99,
        category: categoryId,
        level: "advanced",
        requirements: ["Basic JS knowledge"],
        whatYouWillLearn: ["Node.js", "Express", "MongoDB", "React"]
      }
    });
    assert(createPaidCourse.status === 201, "Instructor creates paid course");
    paidCourseId = createPaidCourse.data.data.course._id;

    // Publish Courses
    const pub1 = await request(`/api/courses/${freeCourseId}/publish`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: { published: true }
    });
    assert(pub1.status === 200 && pub1.data.data.course.published === true, "Instructor publishes free course");

    const pub2 = await request(`/api/courses/${paidCourseId}/publish`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: { published: true }
    });
    assert(pub2.status === 200 && pub2.data.data.course.published === true, "Instructor publishes paid course");

    // Public Course Search & Filter
    const filterCourses = await request(`/api/courses?search=Intro&level=beginner&maxPrice=10`);
    assert(filterCourses.status === 200 && filterCourses.data.count >= 1, "Course filtering with search and price queries works");

    // Instructor own courses
    const myCourses = await request("/api/courses/my-courses", {
      method: "GET",
      headers: { Authorization: `Bearer ${instructorToken}` }
    });
    assert(myCourses.status === 200 && myCourses.data.count >= 2, "Instructor retrieves their own created courses");

    // Instructor public courses endpoint
    const instCourses = await request(`/api/instructors/${instructorUser._id}/courses`);
    assert(instCourses.status === 200 && instCourses.data.count >= 2, "Public gets instructor's published courses");

    // Category courses
    const catCourses = await request(`/api/categories/${categoryId}/courses`);
    assert(catCourses.status === 200 && catCourses.data.count >= 2, "Get courses in a category");

    // 6. Section Suite
    console.log("\n--- Phase 6: Section Management ---");
    const createSec = await request(`/api/courses/${freeCourseId}/sections`, {
      method: "POST",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: { title: "Section 1: Foundations", order: 1 }
    });
    assert(createSec.status === 201, "Instructor creates section");
    sectionId = createSec.data.data.section._id;

    // Update section order
    const updateSecOrder = await request(`/api/sections/${sectionId}/order`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: { order: 2 }
    });
    assert(updateSecOrder.status === 200, "Update section order succeeds");

    // Get Course Sections
    const getSecs = await request(`/api/courses/${freeCourseId}/sections`);
    assert(getSecs.status === 200 && getSecs.data.count >= 1, "Get course sections succeeds");

    // 7. Lesson Suite
    console.log("\n--- Phase 7: Lesson Management ---");
    // Create preview lesson
    const createPrevLesson = await request(`/api/sections/${sectionId}/lessons`, {
      method: "POST",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: {
        title: "Welcome & Setup",
        description: "Introduction video",
        videoUrl: "https://example.com/welcome.mp4",
        duration: 10,
        order: 1,
        isPreview: true
      }
    });
    assert(createPrevLesson.status === 201, "Instructor creates preview lesson");
    previewLessonId = createPrevLesson.data.data.lesson._id;

    // Create regular lesson
    const createLesson2 = await request(`/api/sections/${sectionId}/lessons`, {
      method: "POST",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: {
        title: "Deep Dive into Variables",
        description: "Core concepts video",
        videoUrl: "https://example.com/lesson2.mp4",
        duration: 25,
        order: 2,
        isPreview: false
      }
    });
    assert(createLesson2.status === 201, "Instructor creates non-preview lesson");
    paidLessonId = createLesson2.data.data.lesson._id;

    // Preview Route (Public)
    const prevRes = await request(`/api/lessons/${previewLessonId}/preview`);
    assert(prevRes.status === 200, "Public can view preview lesson");

    const nonPrevRes = await request(`/api/lessons/${paidLessonId}/preview`);
    assert(nonPrevRes.status === 403, "Public CANNOT view non-preview lesson via preview endpoint");

    // 8. Wishlist Suite
    console.log("\n--- Phase 8: Wishlist Management ---");
    const addWish = await request(`/api/wishlist/${paidCourseId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(addWish.status === 201, "Student adds course to wishlist");

    // Check wishlist item
    const checkWishTrue = await request(`/api/wishlist/${paidCourseId}/check`, {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(checkWishTrue.status === 200 && checkWishTrue.data.data.inWishlist === true, "Check wishlist returns true");

    // Get wishlist
    const getWish = await request("/api/wishlist", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(getWish.status === 200 && getWish.data.count >= 1, "Student retrieves wishlist");

    // Remove from wishlist
    const delWish = await request(`/api/wishlist/${paidCourseId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(delWish.status === 200, "Student removes course from wishlist");

    const checkWishFalse = await request(`/api/wishlist/${paidCourseId}/check`, {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(checkWishFalse.status === 200 && checkWishFalse.data.data.inWishlist === false, "Check wishlist returns false after deletion");

    // 9. Enrollment Suite
    console.log("\n--- Phase 9: Enrollment Management ---");
    // Free course enrollment
    const enrollFree = await request("/api/enrollments", {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { courseId: freeCourseId }
    });
    assert(enrollFree.status === 201, "Student enrolls in free course without payment");

    // Duplicate enrollment check
    const dupEnroll = await request("/api/enrollments", {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { courseId: freeCourseId }
    });
    assert(dupEnroll.status === 400, "Duplicate enrollment prevented");

    // Check enrollment
    const checkEnrolled = await request(`/api/enrollments/${freeCourseId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(checkEnrolled.status === 200 && checkEnrolled.data.data.isEnrolled === true, "Check enrollment confirms student is enrolled");

    // My Enrolled Courses
    const myEnrollments = await request("/api/enrollments/my-courses", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(myEnrollments.status === 200 && myEnrollments.data.count >= 1, "Student views enrolled courses");

    // 10. Progress Tracking Suite
    console.log("\n--- Phase 10: Progress Tracking ---");
    const initialProg = await request(`/api/progress/${freeCourseId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(initialProg.status === 200 && initialProg.data.data.progress.percentage === 0, "Initial course progress is 0%");

    // Mark preview lesson completed
    const markLesson = await request(`/api/progress/${previewLessonId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(markLesson.status === 200 && markLesson.data.data.percentage > 0, "Marking lesson completed updates progress percentage");

    // Get completed lessons
    const completedList = await request(`/api/progress/${freeCourseId}/completed-lessons`, {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(completedList.status === 200 && completedList.data.data.completedLessons.length === 1, "Completed lessons query lists 1 completed lesson");

    // Mark lesson incomplete
    const unmarkLesson = await request(`/api/progress/${previewLessonId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(unmarkLesson.status === 200 && unmarkLesson.data.data.percentage === 0, "Marking lesson incomplete resets progress percentage to 0");

    // 11. Review Suite
    console.log("\n--- Phase 11: Reviews ---");
    // Non-enrolled student cannot review
    const nonEnrolledReview = await request(`/api/courses/${freeCourseId}/reviews`, {
      method: "POST",
      headers: { Authorization: `Bearer ${student2Token}` },
      body: { rating: 5, comment: "I am not enrolled yet" }
    });
    assert(nonEnrolledReview.status === 403, "Non-enrolled student is blocked from posting review");

    // Enrolled student reviews
    const addReview = await request(`/api/courses/${freeCourseId}/reviews`, {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { rating: 5, comment: "Outstanding learning content!" }
    });
    assert(addReview.status === 201, "Enrolled student posts review");
    reviewId = addReview.data.data.review._id;

    // Duplicate review check
    const dupReview = await request(`/api/courses/${freeCourseId}/reviews`, {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { rating: 4, comment: "Another review attempt" }
    });
    assert(dupReview.status === 400, "Student cannot post multiple reviews for same course");

    // Get course reviews
    const courseReviews = await request(`/api/courses/${freeCourseId}/reviews`);
    assert(courseReviews.status === 200 && courseReviews.data.count >= 1, "Public retrieves course reviews and average rating");

    // Update review
    const updateRev = await request(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { rating: 4, comment: "Updated: Really great course!" }
    });
    assert(updateRev.status === 200 && updateRev.data.data.review.rating === 4, "Student updates own review");

    // 12. Payment & Stripe Suite
    console.log("\n--- Phase 12: Stripe & Payments ---");
    const checkoutRes = await request("/api/payments/create-checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { courseId: paidCourseId }
    });
    assert(checkoutRes.status === 200 && checkoutRes.data.data.sessionId, "Create checkout session returns session info");
    mockSessionId = checkoutRes.data.data.sessionId;
    paymentId = checkoutRes.data.data.paymentId;

    // Simulate Stripe Webhook for successful payment
    const webhookRes = await request("/api/payments/webhook", {
      method: "POST",
      body: {
        type: "checkout.session.completed",
        data: {
          object: {
            id: mockSessionId,
            amount_total: 4999,
            currency: "usd",
            client_reference_id: studentUser._id.toString(),
            metadata: {
              courseId: paidCourseId.toString(),
              studentId: studentUser._id.toString()
            }
          }
        }
      }
    });
    assert(webhookRes.status === 200 && webhookRes.data.received === true, "Stripe webhook processes completed payment");

    // Verify student is now enrolled in the paid course automatically!
    const checkPaidEnrollment = await request(`/api/enrollments/${paidCourseId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(checkPaidEnrollment.status === 200 && checkPaidEnrollment.data.data.isEnrolled === true, "Student is automatically enrolled in paid course via webhook");

    // Student payment history
    const myPayments = await request("/api/payments/my-payments", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(myPayments.status === 200 && myPayments.data.count >= 1, "Student views payment history");

    // Single payment detail
    const onePay = await request(`/api/payments/${paymentId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(onePay.status === 200, "Get payment details by ID");

    // 13. Course Stats & Instructor APIs
    console.log("\n--- Phase 13: Instructor Stats & Enrolled Students ---");
    const courseStudents = await request(`/api/courses/${freeCourseId}/students`, {
      method: "GET",
      headers: { Authorization: `Bearer ${instructorToken}` }
    });
    assert(courseStudents.status === 200 && courseStudents.data.count >= 1, "Instructor views enrolled students for course");

    const courseStats = await request(`/api/courses/${freeCourseId}/stats`, {
      method: "GET",
      headers: { Authorization: `Bearer ${instructorToken}` }
    });
    assert(courseStats.status === 200 && courseStats.data.data.totalStudents >= 1, "Instructor views course statistics");

    // 14. Admin Management Suite
    console.log("\n--- Phase 14: Admin Dashboard & Management ---");
    const dashboard = await request("/api/admin/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      dashboard.status === 200 &&
      dashboard.data.data.totalUsers >= 4 &&
      dashboard.data.data.totalCourses >= 2 &&
      dashboard.data.data.totalEnrollments >= 2,
      "Admin dashboard aggregates platform statistics"
    );

    const adminCourses = await request("/api/admin/courses", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminCourses.status === 200 && adminCourses.data.count >= 2, "Admin retrieves all courses");

    const adminEnrollments = await request("/api/admin/enrollments", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminEnrollments.status === 200 && adminEnrollments.data.count >= 2, "Admin retrieves all enrollments");

    const adminPayments = await request("/api/admin/payments", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminPayments.status === 200 && adminPayments.data.count >= 1, "Admin retrieves all payments");

    const adminReviews = await request("/api/admin/reviews", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminReviews.status === 200 && adminReviews.data.count >= 1, "Admin retrieves all reviews");

    // Admin approves course
    const approveRes = await request(`/api/admin/courses/${paidCourseId}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(approveRes.status === 200 && approveRes.data.data.course.approved === true, "Admin approves course");

    // Admin rejects course
    const rejectRes = await request(`/api/admin/courses/${paidCourseId}/reject`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(rejectRes.status === 200 && rejectRes.data.data.course.approved === false, "Admin rejects course");

    // Admin deletes review
    const delRev = await request(`/api/admin/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(delRev.status === 200, "Admin deletes inappropriate review");

    // 15. File Upload Suite
    console.log("\n--- Phase 15: File Uploads ---");
    const formData = new FormData();
    const testBlob = new Blob(["dummy test image content"], { type: "image/png" });
    formData.append("file", testBlob, "sample_thumbnail.png");

    const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: formData
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.status === 200 && uploadData.success === true && uploadData.data.url, "Upload image file succeeds and returns URL");

    console.log("\n==========================================");
    console.log("   🎉 ALL API TESTS PASSED SUCCESSFULLY! 🎉");
    console.log("==========================================\n");
  } catch (error) {
    console.error("Test execution halted with error:", error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
    console.log("Server stopped and database connection closed.");
  }
}

runTests();
