import type { FinancialState, Category } from '../../types/finance'
import { AICommandBar } from '../organisms/AICommandBar'
import { buildTransaction } from '../../services/nlpParser'

interface ChatViewProps {
  state: FinancialState
  onTransaction: (tx: ReturnType<typeof buildTransaction>) => void
  onProcessing: (v: boolean) => void
  onAutoCreateCategory: (cat: Category) => void
}

export function ChatView({
  state,
  onTransaction,
  onProcessing,
  onAutoCreateCategory,
}: ChatViewProps) {
  return (
    <div className="flex-1 p-4 min-h-0 flex flex-col">
      <AICommandBar
        state={state}
        onTransaction={onTransaction}
        onProcessing={onProcessing}
        onAutoCreateCategory={onAutoCreateCategory}
        fullPage
      />
    </div>
  )
}
