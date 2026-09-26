import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../api/client'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import CourseCard from '../../components/course/CourseCard'
import StarRating from '../../components/common/StarRating'
import { User, BookOpen, Users, Globe, Briefcase, Star } from 'lucide-react'

export default function InstructorProfile() {
  const { instructorId } = useParams()
  const [instructor, setInstructor] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get(`/instructors/${instructorId}/public`)
        setInstructor(res.data?.instructor)
        setCourses(res.data?.courses || [])
      } catch (err) {
        setError('Instructor not found')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [instructorId])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  if (error || !instructor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">{error || 'Instructor not found'}</p>
          <Link to="/courses" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold">Browse Courses</Link>
        </div>
      </div>
    )
  }

  const totalStudents = courses.reduce((acc, c) => acc + (c.enrollmentsCount || 0), 0)
  const totalReviews = courses.reduce((acc, c) => acc + (c.reviewsCount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0 border-4 border-slate-700">
              {instructor.profileImage ? (
                <img src={instructor.profileImage} alt={instructor.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{instructor.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">{instructor.name}</h1>
              {instructor.headline && (
                <p className="text-blue-400 font-semibold mt-1">{instructor.headline}</p>
              )}
              {instructor.bio && (
                <p className="text-slate-300 text-sm mt-3 max-w-2xl leading-relaxed">{instructor.bio}</p>
              )}
              {instructor.website && (
                <a href={instructor.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-blue-400 hover:text-blue-300 text-sm">
                  <Globe size={14} />
                  {instructor.website}
                </a>
              )}

              {/* Stats */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-6 mt-5">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <BookOpen size={16} className="text-blue-400" />
                  <span><strong className="text-white">{courses.length}</strong> Courses</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Users size={16} className="text-green-400" />
                  <span><strong className="text-white">{totalStudents.toLocaleString()}</strong> Students</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Star size={16} className="text-yellow-400" />
                  <span><strong className="text-white">{totalReviews}</strong> Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Courses by {instructor.name}
          <span className="ml-2 text-gray-400 font-normal text-base">({courses.length})</span>
        </h2>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No published courses yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
