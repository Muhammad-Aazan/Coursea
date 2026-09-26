import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null) // null = create, obj = edit
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const res = await api.get('/categories')
      setCategories(res.data?.categories || res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingCategory(null)
    setFormName('')
    setFormDesc('')
    setFormError('')
    setShowModal(true)
  }

  function openEdit(cat) {
    setEditingCategory(cat)
    setFormName(cat.name)
    setFormDesc(cat.description || '')
    setFormError('')
    setShowModal(true)
  }

  async function handleSave() {
    if (!formName.trim()) {
      setFormError('Category name is required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory._id}`, { name: formName.trim(), description: formDesc.trim() })
      } else {
        await api.post('/categories', { name: formName.trim(), description: formDesc.trim() })
      }
      setShowModal(false)
      await fetchCategories()
    } catch (err) {
      setFormError(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(catId, catName) {
    if (!window.confirm(`Delete category "${catName}"? This cannot be undone.`)) return
    try {
      await api.delete(`/categories/${catId}`)
      setCategories(prev => prev.filter(c => c._id !== catId))
    } catch (err) {
      alert(err.message || 'Failed to delete category')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Tag className="text-purple-500" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {categories.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Tag size={48} className="mx-auto mb-4 text-gray-300" />
              No categories yet. Create one!
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  {cat.description && <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{formError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g., Web Development"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
