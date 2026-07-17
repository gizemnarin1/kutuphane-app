'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { useSwipeable } from 'react-swipeable'

const routes = ['/', '/library', '/add', '/profile']

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSwipe = (dir: 'Left' | 'Right') => {
    const currentIndex = routes.indexOf(pathname)
    if (currentIndex === -1) return

    if (dir === 'Left' && currentIndex < routes.length - 1) {
      router.push(routes[currentIndex + 1])
    } else if (dir === 'Right' && currentIndex > 0) {
      router.push(routes[currentIndex - 1])
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('Left'),
    onSwipedRight: () => handleSwipe('Right'),
    preventScrollOnSwipe: false,
    trackMouse: false
  })

  // Exclude login/register
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>
  }

  return (
    <div {...handlers} style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
