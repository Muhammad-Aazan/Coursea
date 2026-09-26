import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'

// Public pages
import Home from './pages/public/Home'
import CourseCatalog from './pages/public/CourseCatalog'
import CourseDetails from './pages/public/CourseDetails'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import InstructorProfile from './pages/public/InstructorProfile'
import FAQ from './pages/public/FAQ'
import ContactUs from './pages/public/ContactUs'
import PrivacyPolicy from './pages/public/PrivacyPolicy'

// Student pages
import MyCourses from './pages/student/MyCourses'
import CoursePlayer from './pages/student/CoursePlayer'
import WishlistPage from './pages/student/WishlistPage'
import PaymentHistory from './pages/student/PaymentHistory'
import PaymentSuccess from './pages/student/PaymentSuccess'
import ProfileSettings from './pages/student/ProfileSettings'
import NotificationsPage from './pages/student/NotificationsPage'
import MockCheckout from './pages/student/MockCheckout'

// Instructor pages
import InstructorDashboard from './pages/instructor/InstructorDashboard'
import InstructorCourses from './pages/instructor/InstructorCourses'
import CreateCourse from './pages/instructor/CreateCourse'
import EditCourse from './pages/instructor/EditCourse'
import ManageCurriculum from './pages/instructor/ManageCurriculum'
import CourseStudents from './pages/instructor/CourseStudents'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCategories from './pages/admin/AdminCategories'
import AdminReviews from './pages/admin/AdminReviews'

// Layout with Navbar + Footer (used by most pages)
function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

// 404 page
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-black text-gray-100 mb-2">404</h1>
      <p className="text-xl font-bold text-gray-700 mb-2">Page not found</p>
      <p className="text-gray-400 mb-8 text-sm">The page you are looking for doesn't exist or has been moved.</p>
      <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
        Go to Home
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* CoursePlayer: full-screen classroom, NO Navbar/Footer */}
        <Route
          path="/learn/:courseId"
          element={
            <ProtectedRoute roles={['student', 'admin', 'instructor']}>
              <CoursePlayer />
            </ProtectedRoute>
          }
        />

        {/* All other pages use MainLayout (Navbar + Footer) */}
        <Route element={<MainLayout />}>

          {/* ── Public Routes ── */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/instructor/:instructorId" element={<InstructorProfile />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<PrivacyPolicy />} />

          {/* ── Student Routes ── */}
          <Route path="/my-courses"
            element={<ProtectedRoute roles={['student', 'admin', 'instructor']}><MyCourses /></ProtectedRoute>} />
          <Route path="/wishlist"
            element={<ProtectedRoute roles={['student', 'admin', 'instructor']}><WishlistPage /></ProtectedRoute>} />
          <Route path="/payment-history"
            element={<ProtectedRoute roles={['student', 'admin', 'instructor']}><PaymentHistory /></ProtectedRoute>} />
          <Route path="/payment/success"
            element={<ProtectedRoute roles={['student', 'admin', 'instructor']}><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/checkout/mock"
            element={<ProtectedRoute roles={['student', 'admin', 'instructor']}><MockCheckout /></ProtectedRoute>} />
          <Route path="/profile"
            element={<ProtectedRoute roles={['student', 'instructor', 'admin']}><ProfileSettings /></ProtectedRoute>} />
          <Route path="/notifications"
            element={<ProtectedRoute roles={['student', 'instructor', 'admin']}><NotificationsPage /></ProtectedRoute>} />

          {/* ── Instructor Routes ── */}
          <Route path="/instructor/dashboard"
            element={<ProtectedRoute roles={['instructor', 'admin']}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/courses"
            element={<ProtectedRoute roles={['instructor', 'admin']}><InstructorCourses /></ProtectedRoute>} />
          <Route path="/instructor/create-course"
            element={<ProtectedRoute roles={['instructor', 'admin']}><CreateCourse /></ProtectedRoute>} />
          <Route path="/instructor/edit-course/:courseId"
            element={<ProtectedRoute roles={['instructor', 'admin']}><EditCourse /></ProtectedRoute>} />
          <Route path="/instructor/curriculum/:courseId"
            element={<ProtectedRoute roles={['instructor', 'admin']}><ManageCurriculum /></ProtectedRoute>} />
          <Route path="/instructor/students/:courseId"
            element={<ProtectedRoute roles={['instructor', 'admin']}><CourseStudents /></ProtectedRoute>} />

          {/* ── Admin Routes ── */}
          <Route path="/admin/dashboard"
            element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/courses"
            element={<ProtectedRoute roles={['admin']}><AdminCourses /></ProtectedRoute>} />
          <Route path="/admin/users"
            element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/categories"
            element={<ProtectedRoute roles={['admin']}><AdminCategories /></ProtectedRoute>} />
          <Route path="/admin/reviews"
            element={<ProtectedRoute roles={['admin']}><AdminReviews /></ProtectedRoute>} />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
