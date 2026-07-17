'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import FinishBookButton from '@/components/FinishBookButton'
import styles from './page.module.css'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [currentlyReading, setCurrentlyReading] = useState<any[]>([])
  const [thisMonthBooks, setThisMonthBooks] = useState<any[]>([])
  const [thisYearReadCount, setThisYearReadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: activeBooks } = await supabase
        .from('books')
        .select('id, title, cover_url')
        .eq('user_id', user.id)
        .eq('status', 'Şu an Okuyorum')

      setCurrentlyReading(activeBooks || [])

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const { data: readBooks } = await supabase
        .from('books')
        .select('id, title, cover_url, read_date')
        .eq('user_id', user.id)
        .eq('is_read', true)
        .not('read_date', 'is', null)

      const monthBooks = readBooks?.filter((b: any) => {
        if (!b.read_date) return false
        const date = new Date(b.read_date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      }) || []

      setThisMonthBooks(monthBooks)

      const yearBooksCount = readBooks?.filter((b: any) => {
        if (!b.read_date) return false
        return new Date(b.read_date).getFullYear() === currentYear
      }).length || 0

      setThisYearReadCount(yearBooksCount)
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  if (loading || !user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Yükleniyor...</div>

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0]
  const currentYear = new Date().getFullYear()
  const monthName = new Date().toLocaleString('tr-TR', { month: 'long' })

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      <header className={styles.header} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Image src="/logo.png" alt="Logo" width={50} height={50} style={{ borderRadius: '12px' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Kütüphanem</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Hoş geldin, {fullName}</p>
        </div>
      </header>

      <motion.main 
        className={styles.main}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {currentlyReading.length > 0 && (
          <motion.div variants={itemVariants} className={`glass ${styles.statsCard}`} style={{ borderColor: 'var(--primary)', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Şu an Okuyorum</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
              {currentlyReading.map((book: any) => (
                <div key={book.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {book.cover_url ? (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3' }}>
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        style={{ borderRadius: '8px', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: 'var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', textAlign: 'center', padding: '5px' }}>
                      {book.title}
                    </div>
                  )}
                  <FinishBookButton bookId={book.id} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className={`glass ${styles.statsCard}`}>
          <h2>{currentYear} Yılı Okunanları</h2>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.5rem 0' }}>{thisYearReadCount}</p>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Bu yıl okuduğunuz toplam kitap sayısı.
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={`glass ${styles.statsCard}`}>
          <h2>{monthName} Okunanları</h2>
          <p>{thisMonthBooks.length} Kitap</p>

          {thisMonthBooks.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', marginTop: '1rem' }}>
              {thisMonthBooks.map((book: any) => (
                <div key={book.id} style={{ flex: '0 0 auto', width: '80px' }}>
                  {book.cover_url ? (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      width={80}
                      height={120}
                      style={{ borderRadius: '8px', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }}
                    />
                  ) : (
                    <div style={{ width: '80px', height: '120px', backgroundColor: 'var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', textAlign: 'center', padding: '5px' }}>
                      Kapak Yok
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bu ay henüz kitap bitirmediniz.</div>
          )}
        </motion.div>
      </motion.main>
    </div>
  )
}
