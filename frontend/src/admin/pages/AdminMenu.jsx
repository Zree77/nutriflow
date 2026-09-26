import { useEffect, useState } from 'react'
import adminApi from '../adminApi'

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', ...style }}>
    {children}
  </div>
)

const CATEGORY_OPTIONS = ['Sandwich', 'Salad', 'Bowl', 'Smoothie', 'Wrap', 'Other']
const TIER_OPTIONS = ['Standard', 'Premium']
const GOAL_OPTIONS = ['High Protein', 'Weight Loss', 'Weight Gain', 'Balanced Diet', 'Diabetic Friendly']

const NUTRITION_FIELDS = ['calories', 'protein', 'carbs', 'fats', 'fiber', 'sugar', 'sodium']

const INITIAL_FORM = {
  menuId: '', name: '', description: '', price: '',
  category: CATEGORY_OPTIONS[0], vegNonVeg: 'Veg', tier: TIER_OPTIONS[0],
  goalCategory: [], isAvailable: true, image: '',
  nutrition: { calories: '', protein: '', carbs: '', fats: '', fiber: '', sugar: '', sodium: '' },
  ingredients: '',            // comma-separated text in the form, converted to array on submit
  removableIngredients: '',   // comma-separated text, converted to [{name}] on submit
  allergens: '',              // comma-separated text, converted to array on submit
  optionalAddons: [],         // [{name, extraPrice}]
}

export default function AdminMenu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Modal state
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    try {
      // GET /menu is public — no auth required
      const res = await adminApi.get('/menu')
      setItems(res.data?.data ?? res.data ?? [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu items.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const openCreate = () => { setForm(INITIAL_FORM); setFormError(''); setEditItem(null); setModal('create') }
  const openEdit = (item) => {
    setForm({
      menuId: item.menuId || '',
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      category: item.category || CATEGORY_OPTIONS[0],
      vegNonVeg: item.vegNonVeg || 'Veg',
      tier: item.tier || TIER_OPTIONS[0],
      goalCategory: Array.isArray(item.goalCategory) ? item.goalCategory : [],
      isAvailable: item.isAvailable ?? true,
      image: item.image || '',
      nutrition: {
        calories: item.nutrition?.calories ?? '',
        protein: item.nutrition?.protein ?? '',
        carbs: item.nutrition?.carbs ?? '',
        fats: item.nutrition?.fats ?? '',
        fiber: item.nutrition?.fiber ?? '',
        sugar: item.nutrition?.sugar ?? '',
        sodium: item.nutrition?.sodium ?? '',
      },
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
      removableIngredients: Array.isArray(item.removableIngredients) ? item.removableIngredients.map(r => r.name).join(', ') : '',
      allergens: Array.isArray(item.allergens) ? item.allergens.join(', ') : '',
      optionalAddons: Array.isArray(item.optionalAddons) ? item.optionalAddons.map(a => ({ name: a.name || '', extraPrice: a.extraPrice ?? '' })) : [],
    })
    setEditItem(item)
    setFormError('')
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditItem(null) }

  const toggleGoalCategory = (goal) => {
    setForm(f => {
      const has = f.goalCategory.includes(goal)
      return { ...f, goalCategory: has ? f.goalCategory.filter(g => g !== goal) : [...f.goalCategory, goal] }
    })
  }

  const updateNutritionField = (field, value) => {
    setForm(f => ({ ...f, nutrition: { ...f.nutrition, [field]: value } }))
  }

  const addAddonRow = () => {
    setForm(f => ({ ...f, optionalAddons: [...f.optionalAddons, { name: '', extraPrice: '' }] }))
  }
  const updateAddonRow = (idx, field, value) => {
    setForm(f => {
      const updated = [...f.optionalAddons]
      updated[idx] = { ...updated[idx], [field]: value }
      return { ...f, optionalAddons: updated }
    })
  }
  const removeAddonRow = (idx) => {
    setForm(f => ({ ...f, optionalAddons: f.optionalAddons.filter((_, i) => i !== idx) }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim()) { setFormError('Item name is required.'); return }
    if (!form.menuId.trim()) { setFormError('Menu ID is required.'); return }
    if (!form.category.trim()) { setFormError('Category is required.'); return }
    if (!form.vegNonVeg) { setFormError('Please select Veg or Non-Veg.'); return }
    if (!form.tier) { setFormError('Please select a tier.'); return }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) { setFormError('Enter a valid price.'); return }

    // Validate addon rows (if any were added, both name and a valid non-negative price are required)
    for (const addon of form.optionalAddons) {
      if (!addon.name.trim()) { setFormError('Every addon needs a name (or remove the empty row).'); return }
      if (addon.extraPrice === '' || isNaN(Number(addon.extraPrice)) || Number(addon.extraPrice) < 0) {
        setFormError(`Enter a valid price for addon "${addon.name}".`); return
      }
    }

    setFormLoading(true)
    try {
      const toArray = (text) => text.split(',').map(s => s.trim()).filter(Boolean)
      const nutrition = {}
      NUTRITION_FIELDS.forEach(f => { nutrition[f] = form.nutrition[f] === '' ? 0 : Number(form.nutrition[f]) })

      const payload = {
        ...form,
        price: Number(form.price),
        nutrition,
        ingredients: toArray(form.ingredients),
        removableIngredients: toArray(form.removableIngredients).map(name => ({ name })),
        allergens: toArray(form.allergens),
        optionalAddons: form.optionalAddons.map(a => ({ name: a.name.trim(), extraPrice: Number(a.extraPrice) })),
      }

      if (modal === 'create') {
        await adminApi.post('/menu', payload)
      } else {
        await adminApi.put(`/menu/${editItem._id}`, payload)
      }
      closeModal()
      fetchItems()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await adminApi.delete(`/menu/${deleteTarget._id}`)
      setDeleteTarget(null)
      fetchItems()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const filtered = items.filter(item =>
    !search || item.name?.toLowerCase().includes(search.toLowerCase()) || item.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Menu</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>Manage food items and availability</p>
        </div>
        <button onClick={openCreate}
          style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#10B981', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'opacity 0.2s' }}>
          + Add Item
        </button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <input placeholder="Search by name or category…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#334155', outline: 'none', fontFamily: 'inherit' }}
        />
      </Card>

      {error && <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}

      {loading ? (
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>Loading menu…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {filtered.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '14px', gridColumn: '1/-1' }}>No items found.</p>
          ) : filtered.map(item => (
            <div key={item._id} style={{
              background: '#fff', borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)', transition: 'box-shadow 0.2s',
              opacity: item.isAvailable ? 1 : 0.6,
              border: item.isAvailable ? '1px solid transparent' : '1px solid #FEE2E2',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'}
            >
              {item.image && (
                <div style={{ height: '160px', overflow: 'hidden', background: '#F1F5F9' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                </div>
              )}
              {!item.image && (
                <div style={{ height: '100px', background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '36px' }}>🥗</span>
                </div>
              )}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A', flex: 1 }}>{item.name}</h3>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                    background: item.isAvailable ? '#D1FAE5' : '#FEE2E2',
                    color: item.isAvailable ? '#065F46' : '#991B1B', marginLeft: '8px', flexShrink: 0,
                  }}>
                    {item.isAvailable ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {item.category && <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#94A3B8', textTransform: 'capitalize' }}>{item.category}</p>}
                {Array.isArray(item.goalCategory) && item.goalCategory.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {item.goalCategory.map(goal => (
                      <span key={goal} style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: '#EFF6FF', color: '#1D4ED8' }}>{goal}</span>
                    ))}
                  </div>
                )}
                {(!Array.isArray(item.goalCategory) || item.goalCategory.length === 0) && (
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#B45309' }}>⚠ No goal category assigned</p>
                )}
                {item.description && <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748B', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '17px', color: '#10B981' }}>₹{item.price}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(item)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#334155', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#10B981' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#E2E8F0' }}>
                      Edit
                    </button>
                    <button onClick={() => setDeleteTarget(item)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #FEE2E2', background: '#FFF5F5', color: '#991B1B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FFF5F5'; e.currentTarget.style.color = '#991B1B' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
              {modal === 'create' ? 'Add Menu Item' : 'Edit Menu Item'}
            </h3>
            {formError && <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>{formError}</div>}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { field: 'menuId', label: 'Menu ID *', type: 'text', placeholder: 'e.g. HP006' },
                { field: 'name', label: 'Name *', type: 'text', placeholder: 'e.g. Grilled Chicken Bowl' },
                { field: 'price', label: 'Price (₹) *', type: 'number', placeholder: '0' },
                { field: 'image', label: 'Image URL', type: 'url', placeholder: 'https://...' },
              ].map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Category *</label>
                <select value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: '#fff' }}
                >
                  {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Veg / Non-Veg *</label>
                  <select value={form.vegNonVeg}
                    onChange={e => setForm(f => ({ ...f, vegNonVeg: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: '#fff' }}
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Tier *</label>
                  <select value={form.tier}
                    onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: '#fff' }}
                  >
                    {TIER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Goal Categories</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {GOAL_OPTIONS.map(goal => {
                    const active = form.goalCategory.includes(goal)
                    return (
                      <button type="button" key={goal} onClick={() => toggleGoalCategory(goal)}
                        style={{
                          padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          border: active ? '1px solid #10B981' : '1px solid #E2E8F0',
                          background: active ? '#D1FAE5' : '#F8FAFC',
                          color: active ? '#065F46' : '#64748B',
                        }}>
                        {goal}
                      </button>
                    )
                  })}
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#94A3B8' }}>Select every goal this dish should appear under (e.g. Weight Loss, High Protein). Leave empty and it won't show in any goal-based menu.</p>
              </div>

              {/* Nutrition */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Nutrition (per serving)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { field: 'calories', label: 'Calories (kcal)' },
                    { field: 'protein', label: 'Protein (g)' },
                    { field: 'carbs', label: 'Carbs (g)' },
                    { field: 'fats', label: 'Fats (g)' },
                    { field: 'fiber', label: 'Fiber (g)' },
                    { field: 'sugar', label: 'Sugar (g)' },
                    { field: 'sodium', label: 'Sodium (mg)' },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>{label}</label>
                      <input type="number" min="0" placeholder="0" value={form.nutrition[field]}
                        onChange={e => updateNutritionField(field, e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Ingredients</label>
                <input type="text" placeholder="e.g. Rolled Oats, Almond Milk, Chia Seeds" value={form.ingredients}
                  onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8' }}>Comma-separated list.</p>
              </div>

              {/* Removable Ingredients */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Removable Ingredients</label>
                <input type="text" placeholder="e.g. Honey, Cinnamon" value={form.removableIngredients}
                  onChange={e => setForm(f => ({ ...f, removableIngredients: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8' }}>Comma-separated. These show up as removable toggles under "Customize Ingredients" (Premium plans only).</p>
              </div>

              {/* Allergens */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Allergens</label>
                <input type="text" placeholder="e.g. Nuts, Dairy, Gluten" value={form.allergens}
                  onChange={e => setForm(f => ({ ...f, allergens: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8' }}>Comma-separated.</p>
              </div>

              {/* Optional Addons */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Optional Addons</label>
                {form.optionalAddons.map((addon, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input type="text" placeholder="Addon name" value={addon.name}
                      onChange={e => updateAddonRow(idx, 'name', e.target.value)}
                      style={{ flex: 2, boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                    />
                    <input type="number" min="0" placeholder="Extra ₹" value={addon.extraPrice}
                      onChange={e => updateAddonRow(idx, 'extraPrice', e.target.value)}
                      style={{ flex: 1, boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                    />
                    <button type="button" onClick={() => removeAddonRow(idx)}
                      style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #FEE2E2', background: '#FFF5F5', color: '#991B1B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addAddonRow}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px dashed #10B981', background: '#F0FDF4', color: '#065F46', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Add Addon
                </button>
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#94A3B8' }}>Only shown to customers on Premium plans.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Description</label>
                <textarea rows={3} placeholder="Short description…" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="isAvailable" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#10B981' }} />
                <label htmlFor="isAvailable" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Active (visible to customers)</label>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: formLoading ? '#E2E8F0' : '#10B981', color: formLoading ? '#94A3B8' : '#fff', fontWeight: 600, fontSize: '14px', cursor: formLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {formLoading ? 'Saving…' : modal === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '380px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Delete "{deleteTarget.name}"?</h3>
            <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '14px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#EF4444', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}