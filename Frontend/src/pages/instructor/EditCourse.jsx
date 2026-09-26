import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../api/client'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { ArrowLeft, Upload, Save, Plus, Trash2 } from 'lucide-react'

const LEVELS = ['beginner', 'intermediate', 'advanced', 'all']
const LANGUAGES = ['English', 'Urdu', 'Hindi', 'Arabic', 'French', 'Spanish', 'German']

export default function EditCourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState([])

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [level, setLevel] = useState('beginner')
  const [language, setLanguage] = useState('English')
  const [category, setCategory] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [whatYouWillLearn, setWhatYouWillLearn] = useState([''])
  const [requirements, setRequirements] = useState([''])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, catRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get('/categories')
        ])
        const c = courseRes.data.course
        setTitle(c.title || '')
        setDescription(c.description || '')
        setPrice(String(c.price ?? '0'))
        setLevel(c.level || 'beginner')
        setLanguage(c.language || 'English')
        setCategory(c.category?._id || c.category || '')
        setThumbnail(c.thumbnail || '')
        setWhatYouWillLearn(c.whatYouWillLearn?.length > 0 ? c.whatYouWillLearn : [''])
        setRequirements(c.requirements?.length > 0 ? c.requirements : [''])
        setCategories(catRes.data?.categories || catRes.data || [])
      } catch (err) {
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await api.upload(file)
      setThumbnail(res.data?.url || '')
    } catch (err) {
      setError('Failed to upload thumbnail')
    } finally {
      setUploading(false)
    }
  }

  // Dynamic list helpers
  const addItem = (setter, list) => setter([...list, ''])
  const removeItem = (setter, list, idx) => setter(list.filter((_, i) => i !== idx))
  const updateItem = (setter, list, idx, val) => setter(list.map((item, i) => i === idx ? val : item))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.patch(`/courses/${courseId}`, {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        level,
        language,
        category: category || undefined,
        thumbnail,
        whatYouWillLearn: whatYouWillLearn.filter(s => s.trim()),
        requirements: requirements.filter(s => s.trim())
      })
      setSuccess('Course updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update course')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/instructor/courses" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm">
            <ArrowLeft size={16} /> Back to My Courses
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Thumbnail */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Course Thumbnail</h2>
            <div className="flex items-start gap-4">
              <div className="w-40 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                {thumbnail ? (
                  <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-700">
                  <Upload size={16} />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" disabled={uploading} />
                </label>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB. 16:9 ratio recommended.</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Complete Python Bootcamp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="What is this course about?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select value={level} onChange={e => setLevel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* What you'll learn */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">What Students Will Learn</h2>
            {whatYouWillLearn.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input value={item} onChange={e => updateItem(setWhatYouWillLearn, whatYouWillLearn, idx, e.target.value)}
                  placeholder={`Learning objective ${idx + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {whatYouWillLearn.length > 1 && (
                  <button type="button" onClick={() => removeItem(setWhatYouWillLearn, whatYouWillLearn, idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addItem(setWhatYouWillLearn, whatYouWillLearn)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <Plus size={16} /> Add objective
            </button>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">Requirements / Prerequisites</h2>
            {requirements.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input value={item} onChange={e => updateItem(setRequirements, requirements, idx, e.target.value)}
                  placeholder={`Requirement ${idx + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {requirements.length > 1 && (
                  <button type="button" onClick={() => removeItem(setRequirements, requirements, idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addItem(setRequirements, requirements)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <Plus size={16} /> Add requirement
            </button>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pb-8">
            <Link to="/instructor/courses" className="flex-1 text-center py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">
              Cancel
            </Link>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
