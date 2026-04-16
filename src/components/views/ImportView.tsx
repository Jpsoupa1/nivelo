import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Check, ChevronDown, Loader2 } from 'lucide-react'
import type { Transaction, Category, Language } from '../../types/finance'
import { parseCsv, csvRowToTransaction } from '../../services/csvParser'
import type { CsvRow } from '../../services/csvParser'
import { formatCurrency } from '../../utils/format'

interface ImportViewProps {
  categories: Category[]
  lang: Language
  onImport: (txs: Transaction[]) => Promise<void>
}

interface ReviewRow extends CsvRow {
  categoryKey: string
  selected: boolean
}

export function ImportView({ categories, lang, onImport }: ImportViewProps) {
  const [rows, setRows] = useState<ReviewRow[]>([])
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const isPT = lang === 'pt'

  function guessCategory(desc: string): string {
    const lower = desc.toLowerCase()
    const map: [string[], string][] = [
      [['uber','taxi','onibus','metro','combustivel','gasolina','gas station','fuel'], 'TRANSPORT'],
      [['mercado','supermercado','padaria','restaurante','ifood','delivery','pizza','lanche','almoço','jantar','cafe'], 'FOOD'],
      [['aluguel','condominio','iptu'], 'HOUSING'],
      [['farmacia','medico','hospital','clinica','plano de saude','gym','academia'], 'HEALTH'],
      [['netflix','spotify','amazon prime','disney','game','cinema','teatro'], 'ENTERTAINMENT'],
      [['energia','agua','internet','telefone','luz','gas encanado'], 'UTILITIES'],
      [['salario','pagamento','holerite','freelance'], 'SALARY'],
      [['dividendo','rendimento','juros','cdb','tesouro','acao','fundo'], 'INVESTMENT'],
    ]
    for (const [keywords, key] of map) {
      if (keywords.some((kw) => lower.includes(kw))) return key
    }
    return 'OTHER'
  }

  function processFile(file: File) {
    setDone(false)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const parsed = parseCsv(content)
      setRows(parsed.map((r) => ({
        ...r,
        categoryKey: guessCategory(r.description),
        selected: true,
      })))
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function toggleRow(i: number) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, selected: !r.selected } : r))
  }

  function setCat(i: number, key: string) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, categoryKey: key } : r))
  }

  async function handleImport() {
    const selected = rows.filter((r) => r.selected)
    if (selected.length === 0) return
    setIsImporting(true)
    const txs = selected.map((r) => csvRowToTransaction(r, r.categoryKey))
    await onImport(txs)
    setIsImporting(false)
    setDone(true)
    setRows([])
    setFileName('')
  }

  const selectedCount = rows.filter((r) => r.selected).length

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Upload size={16} className="text-accent" />
          {isPT ? 'Importar Extrato' : 'Import Statement'}
        </h2>
        <p className="text-xs text-muted mt-0.5">
          {isPT
            ? 'Importe um CSV do seu banco. Formato: data, descrição, valor'
            : 'Import a CSV from your bank. Format: date, description, amount'}
        </p>
      </div>

      {/* Success */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6"
          >
            <Check size={15} />
            {isPT ? 'Transações importadas com sucesso!' : 'Transactions imported successfully!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      {rows.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-16 cursor-pointer transition-colors ${
            isDragging
              ? 'border-accent/60 bg-accent/[0.06]'
              : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
          }`}
        >
          <FileText size={32} className="text-muted/40" />
          <div className="text-center">
            <p className="text-sm text-white/70">
              {isPT ? 'Arraste o CSV aqui ou clique para selecionar' : 'Drag CSV here or click to select'}
            </p>
            <p className="text-xs text-muted/50 mt-1">
              {isPT ? 'Exportado pelo seu banco (Nubank, Itaú, Bradesco…)' : 'Exported from your bank'}
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}

      {/* Review table */}
      {rows.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-4"
        >
          {/* File info + actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted">
              <FileText size={13} />
              <span>{fileName}</span>
              <span className="text-white/20">·</span>
              <span>{rows.length} {isPT ? 'linhas' : 'rows'}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRows([])}
                className="text-xs text-muted hover:text-white transition-colors px-3 py-1.5"
              >
                {isPT ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleImport}
                disabled={selectedCount === 0 || isImporting}
                className="flex items-center gap-1.5 text-xs font-medium bg-accent/15 hover:bg-accent/25 border border-accent/20 text-accent px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isImporting && <Loader2 size={12} className="animate-spin" />}
                {isPT ? `Importar ${selectedCount}` : `Import ${selectedCount}`}
              </button>
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-1.5">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  row.selected
                    ? 'bg-surface border-white/[0.06]'
                    : 'bg-white/[0.01] border-white/[0.03] opacity-40'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleRow(i)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    row.selected
                      ? 'bg-accent/20 border-accent/40'
                      : 'border-white/20'
                  }`}
                >
                  {row.selected && <Check size={10} className="text-accent" />}
                </button>

                {/* Date */}
                <span className="text-[11px] font-mono text-muted shrink-0 w-20">
                  {new Date(row.date).toLocaleDateString(isPT ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}
                </span>

                {/* Description */}
                <span className="flex-1 min-w-0 text-xs text-white/80 truncate">{row.description}</span>

                {/* Category selector */}
                <div className="relative shrink-0">
                  <select
                    value={row.categoryKey}
                    onChange={(e) => setCat(i, e.target.value)}
                    className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-lg pl-2 pr-6 py-1 text-[11px] text-white focus:outline-none focus:border-accent/40 transition-colors cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.key} className="bg-[#161B22]">{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>

                {/* Amount */}
                <span className={`font-mono text-xs font-semibold shrink-0 w-24 text-right ${
                  row.amount < 0 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {row.amount < 0 ? '−' : '+'}{formatCurrency(Math.abs(row.amount))}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
