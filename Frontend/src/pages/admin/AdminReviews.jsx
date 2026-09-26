import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StarRating from '../../components/common/StarRating'
import { MessageSquare, Trash2 } from 'lucide-react'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    try {
      const res = await api.get('/admin/reviews')
      setReviews(res.data?.reviews || res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(reviewId) {
    if (!window.confirm('Delete this review? This cannot be undone.')) return
    try {
      await api.delete(`/admin/reviews/${reviewId}`)
      setReviews(prev => prev.filter(r => r._id !== reviewId))
    } catch (err) {
      alert(err.message || 'Failed to delete review')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="text-green-500" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
          <span className="ml-auto text-sm text-gray-500">{reviews.length} reviews</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
        )}

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {review.student?.avatar ? (
                        <img src={review.student.avatar} alt={review.student.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-semibold">
                          {review.student?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{review.student?.name || 'Unknown'}</span>
                        <span className="text-gray-400 text-xs mx-2">•</span>
                        <span className="text-gray-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <StarRating value={review.rating} readonly size={14} />
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                    {review.course && (
                      <p className="text-xs text-gray-400">
                        Course: <span className="text-blue-500">{review.course.title}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                    title="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
