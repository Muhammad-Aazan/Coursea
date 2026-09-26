import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  ShoppingCart,
  Star,
  ShieldCheck,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, subtext, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value ?? '—'}</p>
      {subtext && <p className="text-xs text-slate-500 font-medium">{subtext}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(err => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" message="Loading administrative metrics..." /></div>

  const grossSales = stats?.totalRevenue ?? 0;
  const platformNet = stats?.platformRevenue ?? Number((grossSales * 0.15).toFixed(2));
  const instructorPayouts = stats?.instructorPayouts ?? Number((grossSales - platformNet).toFixed(2));

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Console</h1>
            </div>
            <p className="text-sm text-slate-500">
              Platform administration, revenue distribution, user roles, and catalog moderation
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span>Commission Rate: 15%</span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-semibold">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Financial Performance / Commission Breakdown */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Revenue & Marketplace Earnings</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                  icon={DollarSign}
                  label="Platform Commission"
                  value={`$${Number(platformNet).toFixed(2)}`}
                  subtext="15% net website revenue"
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Gross Sales Volume"
                  value={`$${Number(grossSales).toFixed(2)}`}
                  subtext={`${stats.totalPayments || 0} completed transactions`}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                />
                <StatCard
                  icon={Percent}
                  label="Instructor Payouts"
                  value={`$${Number(instructorPayouts).toFixed(2)}`}
                  subtext="85% paid out to teachers"
                  iconBg="bg-indigo-50"
                  iconColor="text-indigo-600"
                />
              </div>
            </div>

            {/* Platform Metrics */}
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Platform Demographics</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  label="Total Accounts"
                  value={stats.totalUsers}
                  subtext={`${stats.totalStudents || 0} students • ${stats.totalInstructors || 0} teachers`}
                  iconBg="bg-slate-100"
                  iconColor="text-slate-700"
                />
                <StatCard
                  icon={GraduationCap}
                  label="Enrolled Students"
                  value={stats.totalStudents}
                  subtext="Registered learners"
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                />
                <StatCard
                  icon={BookOpen}
                  label="Total Courses"
                  value={stats.totalCourses}
                  subtext={`${stats.publishedCourses || 0} live in catalog`}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                />
                <StatCard
                  icon={ShoppingCart}
                  label="Total Enrollments"
                  value={stats.totalEnrollments}
                  subtext="Active course enrollments"
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                />
              </div>
            </div>

            {/* Management Modules */}
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-slate-900">Administrative Tools</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    title: 'Course Moderation',
                    desc: 'Review, approve, or reject instructor submissions',
                    href: '/admin/courses',
                    badge: `${stats.totalCourses} courses`
                  },
                  {
                    title: 'User Management',
                    desc: 'Manage roles (student, instructor, admin) and accounts',
                    href: '/admin/users',
                    badge: `${stats.totalUsers} users`
                  },
                  {
                    title: 'Category Taxonomy',
                    desc: 'Create and organize disciplines & subcategories',
                    href: '/admin/categories',
                    badge: 'Taxonomy'
                  },
                  {
                    title: 'Review Moderation',
                    desc: 'Audit student feedback and remove spam reviews',
                    href: '/admin/reviews',
                    badge: 'Feedback'
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Open Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
