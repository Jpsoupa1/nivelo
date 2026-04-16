import { motion } from 'framer-motion'
import type { ChatMessage } from '../../types/finance'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <div
        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
          isUser
            ? 'bg-accent/15 border border-accent/20 text-white/90 rounded-br-sm'
            : 'bg-surface-2 border border-white/[0.06] text-white/70 rounded-bl-sm'
        }`}
      >
        {!isUser && (
          <span className="block text-[10px] font-medium text-accent/70 uppercase tracking-wider mb-1">
            AXIS AI
          </span>
        )}
        {message.content}
      </div>
    </motion.div>
  )
}
