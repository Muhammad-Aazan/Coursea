import { useNavigate } from 'react-router-dom'
import { Bell, BookOpen, Star, Trophy, X, Info, CheckCheck, Trash2 } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

const TYPE_ICONS = {
  new_enrollment: <BookOpen size={20} className="text-blue-500" />,
  new_review: <Star size={20} className="text-yellow-500" />,
  course_approved: <Trophy size={20} className="text-green-500" />,
  course_rejected: <X size={20} className="text-red-500" />,
  general: <Info size={20} className="text-gray-400" />
}

const TYPE_BG = {
  new_enrollment: 'bg-blue-50',
  new_review: 'bg-yellow-50',
  course_approved: 'bg-green-50',
  course_rejected: 'bg-red-50',
  general: 'bg-gray-50'
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const navigate = useNavigate()

  const handleClick = async (n) => {
    if (!n.isRead) await markAsRead(n._id)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Bell className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              <CheckCheck size={16} />
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <Bell size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">You're all caught up!</p>
            <p className="text-gray-400 text-sm mt-1">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n._id}
                className={`flex items-start gap-4 bg-white rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-all ${
                  !n.isRead ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                }`}
                onClick={() => handleClick(n)}
              >
                {/* Type Icon */}
                <div className={`p-2 rounded-xl flex-shrink-0 ${TYPE_BG[n.type] || 'bg-gray-50'}`}>
                  {TYPE_ICONS[n.type] || TYPE_ICONS.general}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm text-gray-900 ${!n.isRead ? 'font-bold' : 'font-semibold'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Delete */}
                <button
                  onClick={e => { e.stopPropagation(); deleteNotification(n._id) }}
                  className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
