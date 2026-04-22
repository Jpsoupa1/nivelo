import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ChatMessage } from '../../types/finance'

interface ChatBubbleProps {
  message: ChatMessage
}

/**
 * Lightweight inline markdown renderer.
 * Supports **bold**, *italic*, \n line breaks, and `code`.
 */
function renderMarkdown(text: string): (string | React.ReactNode)[] {
  const parts: (string | React.ReactNode)[] = []
  let key = 0

  // Split by newlines first
  const lines = text.split('\n')

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      parts.push(<br key={`br-${key++}`} />)
    }

    // Process inline markdown within each line
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      // Push text before match
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }

      if (match[2]) {
        // **bold**
        parts.push(<strong key={`b-${key++}`} className="font-semibold text-white">{match[2]}</strong>)
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={`i-${key++}`} className="italic">{match[3]}</em>)
      } else if (match[4]) {
        // `code`
        parts.push(
          <code key={`c-${key++}`} className="text-[11px] font-mono px-1 py-0.5 rounded bg-white/[0.08] text-accent">
            {match[4]}
          </code>
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Push remaining text
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }
  })

  return parts
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const rendered = useMemo(() => renderMarkdown(message.content), [message.content])

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
            Nivelo AI
          </span>
        )}
        {isUser ? message.content : rendered}
      </div>
    </motion.div>
  )
}
