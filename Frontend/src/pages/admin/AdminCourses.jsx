import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { BookOpen, CheckCircle, XCircle, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const res = await api.get('/admin/courses')
      setCourses(res.data?.courses || res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(courseId, action) {
    setActionLoading(courseId + action)
    try {
      await api.patch(`/admin/courses/${courseId}/${action}`)
      await fetchCourses()
    } catch (err) {
      alert(err.message || `Failed to ${action} course`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" message="Loading course catalog..." /></div>

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manage Courses</h1>
              <p className="text-xs text-slate-500 mt-0.5">Review, approve, or reject instructor submissions</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            {courses.length} courses total
          </span>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-semibold">{error}</div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {courses.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-3">
              <BookOpen size={48} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">No courses found in database</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Instructor</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map(course => (
                    <tr key={course._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-14 h-9 rounded-xl object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="w-14 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                              <BookOpen size={16} className="text-slate-400" />
                            </div>
                          )}
                          <span className="font-bold text-slate-900 text-sm max-w-xs truncate">{course.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm font-medium">{course.instructor?.name || '—'}</td>
                      <td className="px-6 py-4 text-slate-800 text-sm font-extrabold">
                        {course.price === 0 ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">Free</span>
                        ) : (
                          `$${Number(course.price).toFixed(2)}`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                          course.published && course.approved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {course.published && course.approved ? 'Published' : 'Draft / Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/courses/${course._id}`} target="_blank">
                            <button className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View Course Page">
                              <Eye size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleAction(course._id, 'approve')}
                            disabled={actionLoading === course._id + 'approve' || (course.published && course.approved)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-sm"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(course._id, 'reject')}
                            disabled={actionLoading === course._id + 'reject' || (!course.published && !course.approved)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 disabled:opacity-40 transition-colors shadow-sm"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
