import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Check, X, Sparkles } from 'lucide-react'
import type { Category, Language } from '../../types/finance'
import { v4 as uuid } from '../../utils/uuid'
import { formatCurrency } from '../../utils/format'
import { CATEGORY_COLORS } from '../../data/mockData'
import { t } from '../../services/i18n'

const ICON_OPTIONS = [
  'Tag', 'UtensilsCrossed', 'Car', 'Home', 'Heart', 'Tv', 'Banknote',
  'TrendingUp', 'Zap', 'MoreHorizontal', 'ShoppingBag', 'Coffee',
  'Plane', 'Music', 'BookOpen', 'Dumbbell', 'Briefcase', 'Gift',
]

function normalizeKey(str: string): string {
  return str.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex gap-1 flex-wrap" style={{ maxWidth: 112 }}>
      {CATEGORY_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-4 h-4 rounded-full border-2 transition-all shrink-0"
          style={{
            background: c,
            borderColor: value === c ? '#fff' : 'transparent',
          }}
        />
      ))}
    </div>
  )
}

// ── Inline edit row ──────────────────────────────────────────────────────────

interface EditRowProps {
  initial: Category
  onSave: (cat: Category) => void
  onCancel: () => void
}

function EditRow({ initial, onSave, onCancel }: EditRowProps) {
  const [draft, setDraft] = useState<Category>(initial)

  function save() {
    const key = draft.key.trim() ? normalizeKey(draft.key) : normalizeKey(draft.name)
    onSave({ ...draft, key })
  }

  return (
    <tr className="border-b border-white/[0.06] bg-accent/[0.03]">
      <td className="py-2 pl-4 pr-2">
        <ColorPicker value={draft.color} onChange={(c) => setDraft((d) => ({ ...d, color: c }))} />
      </td>
      <td className="py-2 px-2">
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="bg-surface-2 border border-accent/30 rounded px-2 py-1 text-sm text-white w-36 outline-none"
        />
      </td>
      <td className="py-2 px-2">
        <input
          value={draft.key}
          onChange={(e) =>
            setDraft((d) => ({ ...d, key: e.target.value.toUpperCase().replace(/\s/g, '_') }))
          }
          className="bg-surface-2 border border-accent/30 rounded px-2 py-1 text-xs font-mono text-white w-28 outline-none"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          min={0}
          value={draft.budgeted || ''}
          onChange={(e) => setDraft((d) => ({ ...d, budgeted: parseFloat(e.target.value) || 0 }))}
          className="bg-surface-2 border border-accent/30 rounded px-2 py-1 text-xs font-mono text-white w-24 outline-none"
        />
      </td>
      <td className="py-2 px-2">
        <select
          value={draft.icon}
          onChange={(e) => setDraft((d) => ({ ...d, icon: e.target.value }))}
          className="bg-surface-2 border border-accent/30 rounded px-2 py-1 text-xs text-white outline-none"
        >
          {ICON_OPTIONS.map((ico) => (
            <option key={ico} value={ico}>{ico}</option>
          ))}
        </select>
      </td>
      <td className="py-2 px-2" />
      <td className="py-2 pl-2 pr-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={save}
            disabled={!draft.name.trim()}
            className="p-1 rounded text-success hover:bg-success/10 transition-colors disabled:opacity-30"
          >
            <Check size={13} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded text-muted hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Add row ──────────────────────────────────────────────────────────────────

interface AddRowProps {
  categories: Category[]
  lang: Language
  onAdd: (cat: Category) => void
  onCancel: () => void
}

function AddRow({ categories, lang, onAdd, onCancel }: AddRowProps) {
  const s = t(lang).categories
  const usedColors = new Set(categories.map((c) => c.color))
  const defaultColor =
    CATEGORY_COLORS.find((c) => !usedColors.has(c)) ?? CATEGORY_COLORS[0]

  const [draft, setDraft] = useState({
    name: '',
    key: '',
    color: defaultColor,
    budgeted: 0,
    icon: 'Tag',
  })

  function save() {
    if (!draft.name.trim()) return
    const key = draft.key.trim() ? normalizeKey(draft.key) : normalizeKey(draft.name)
    onAdd({ id: `cat-${uuid()}`, ...draft, key })
  }

  return (
    <tr className="border-b border-accent/20 bg-accent/[0.03]">
      <td className="py-2 pl-4 pr-2">
        <ColorPicker value={draft.color} onChange={(c) => setDraft((d) => ({ ...d, color: c }))} />
      </td>
      <td className="py-2 px-2">
        <input
          autoFocus
          placeholder={s.namePlaceholder}
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          className="bg-surface-2 border border-accent/30 rounded px-2 py-1 text-sm text-white w-36 outline-none placeholder:text-muted/50"
        />
      </td>
      <td className="py-2 px-2">
        <input
          placeholder={s.keyPlaceholder}
          value={draft.key}
          onChange={(e) =>
            setDraft((d) => ({ ...d, key: e.target.value.toUpperCase().replace(/\s/g, '_') }))
          }
          className="bg-surface-2 border border-accent/30 rounded px-2 py-1 text-xs font-mono text-white w-28 outline-none placeholder:text-muted/50"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          min={0}
          placeholder="0"
          value={draft.budgeted || ''}
          onChange={(e) => setDraft((d) => ({ ...d, budgeted: parseFloat(e.target.value) || 0 }))}
          className="bg-surface-2 border border-accent/30 rounded px-2 py-1 text-xs font-mono text-white w-24 outline-none placeholder:text-muted/50"
        />
      </td>
      <td className="py-2 px-2">
        <select
          value={draft.icon}
          onChange={(e) => setDraft((d) => ({ ...d, icon: e.target.value }))}
          className="bg-surface-2 border border-accent/30 rounded px-2 py-1 text-xs text-white outline-none"
        >
          {ICON_OPTIONS.map((ico) => (
            <option key={ico} value={ico}>{ico}</option>
          ))}
        </select>
      </td>
      <td className="py-2 px-2" />
      <td className="py-2 pl-2 pr-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={save}
            disabled={!draft.name.trim()}
            className="p-1 rounded text-success hover:bg-success/10 transition-colors disabled:opacity-30"
          >
            <Check size={13} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded text-muted hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Read-only row ────────────────────────────────────────────────────────────

interface CategoryRowProps {
  category: Category
  onEdit: () => void
  onDelete: (id: string) => void
}

function CategoryRow({ category, onEdit, onDelete }: CategoryRowProps) {
  return (
    <motion.tr
      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      <td className="py-3 pl-4 pr-2">
        <span
          className="w-3 h-3 rounded-full inline-block"
          style={{ background: category.color }}
        />
      </td>

      <td className="py-3 px-2 text-sm text-white/80">{category.name}</td>

      <td className="py-3 px-2">
        <span className="text-[10px] font-mono text-muted bg-white/[0.05] px-1.5 py-0.5 rounded">
          {category.key}
        </span>
      </td>

      <td className="py-3 px-2 font-mono text-xs text-muted">
        {category.budgeted > 0 ? (
          formatCurrency(category.budgeted)
        ) : (
          <span className="text-muted/30">—</span>
        )}
      </td>

      <td className="py-3 px-2 text-xs text-muted/60">{category.icon}</td>

      <td className="py-3 px-2">
        {category.autoCreated && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-accent/25 text-accent bg-accent/[0.06]">
            <Sparkles size={9} />
            auto
          </span>
        )}
      </td>

      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            className="p-1 rounded text-muted hover:text-white transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category.id)}
            className="p-1 rounded text-muted hover:text-danger transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

// ── Main view ────────────────────────────────────────────────────────────────

interface CategoriesViewProps {
  categories: Category[]
  lang: Language
  onAdd: (cat: Category) => void
  onUpdate: (cat: Category) => void
  onDelete: (id: string) => void
}

export function CategoriesView({
  categories,
  lang,
  onAdd,
  onUpdate,
  onDelete,
}: CategoriesViewProps) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const s = t(lang).categories

  function handleAdd(cat: Category) {
    onAdd(cat)
    setAdding(false)
  }

  function handleSaveEdit(cat: Category) {
    onUpdate(cat)
    setEditingId(null)
  }

  const autoCount = categories.filter((c) => c.autoCreated).length

  return (
    <div className="flex-1 p-4 min-h-0 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{s.title}</h2>
          <p className="text-xs text-muted mt-0.5">{s.subtitle}</p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => { setAdding(true); setEditingId(null) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs hover:bg-accent/15 transition-colors"
          >
            <Plus size={13} />
            {s.add}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 glass rounded-xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-y-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10" style={{ background: '#1B1736' }}>
              <tr className="border-b border-white/[0.06]">
                {s.cols.map((h, i) => (
                  <th
                    key={i}
                    className="py-2.5 px-2 text-left text-[10px] font-medium text-muted uppercase tracking-wider first:pl-4 last:pr-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adding && (
                <AddRow
                  categories={categories}
                  lang={lang}
                  onAdd={handleAdd}
                  onCancel={() => setAdding(false)}
                />
              )}
              <AnimatePresence initial={false}>
                {categories.map((cat) =>
                  editingId === cat.id ? (
                    <EditRow
                      key={cat.id}
                      initial={cat}
                      onSave={handleSaveEdit}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      onEdit={() => { setEditingId(cat.id); setAdding(false) }}
                      onDelete={onDelete}
                    />
                  ),
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="shrink-0 px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-4">
          <span className="text-[10px] text-muted">{s.count(categories.length)}</span>
          {autoCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-accent">
              <Sparkles size={9} />
              {s.autoCount(autoCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
