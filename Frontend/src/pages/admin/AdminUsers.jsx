import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Users } from 'lucide-react'

const ROLES = ['student', 'instructor', 'admin']

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-700',
  instructor: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [changingRole, setChangingRole] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data?.users || res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId, newRole) {
    setChangingRole(userId)
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      alert(err.message || 'Failed to update role')
    } finally {
      setChangingRole(null)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" message="Loading platform users..." /></div>

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manage Users</h1>
              <p className="text-xs text-slate-500 mt-0.5">Control permissions, assign instructor status, and audit member profiles</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            {users.length} registered users
          </span>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-semibold">{error}</div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {users.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-3">
              <Users size={48} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user, index) => (
                    <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.profileImage || user.avatar ? (
                            <img src={user.profileImage || user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                          user.role === 'admin'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : user.role === 'instructor'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          disabled={changingRole === user._id}
                          className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
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
