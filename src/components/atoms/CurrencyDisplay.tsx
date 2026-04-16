import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { useEffect } from 'react'
import { formatCurrency } from '../../utils/format'

interface CurrencyDisplayProps {
  value: number
  className?: string
  prefix?: string
  animate?: boolean
}

export function CurrencyDisplay({
  value,
  className = '',
  animate = true,
}: CurrencyDisplayProps) {
  const motionValue = useMotionValue(value)
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, (v) => formatCurrency(v))

  useEffect(() => {
    if (animate) {
      motionValue.set(value)
    }
  }, [value, motionValue, animate])

  if (!animate) {
    return (
      <span className={`font-mono ${className}`}>
        {formatCurrency(value)}
      </span>
    )
  }

  return (
    <motion.span className={`font-mono ${className}`}>
      {display}
    </motion.span>
  )
}
