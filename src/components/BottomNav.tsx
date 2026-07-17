'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Library, PlusCircle, Settings } from 'lucide-react'
import styles from './nav.module.css'

export default function BottomNav() {
  const pathname = usePathname()

  // Hide nav on login page
  if (pathname === '/login') return null

  return (
    <nav className={`glass ${styles.bottomNav}`}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <Home size={24} />
        <span>Ana Sayfa</span>
      </Link>
      <Link href="/library" className={`${styles.navItem} ${pathname === '/library' ? styles.active : ''}`}>
        <Library size={24} />
        <span>Kütüphanem</span>
      </Link>
      <Link href="/add" className={`${styles.navItem} ${pathname === '/add' ? styles.active : ''}`}>
        <PlusCircle size={24} />
        <span>Ekle</span>
      </Link>
    </nav>
  )
}
