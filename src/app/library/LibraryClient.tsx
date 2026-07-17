'use client'

import styles from './library.module.css'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LibraryClient({ books, initialTab }: { books: any[], initialTab: string }) {
  const [tab, setTab] = useState(initialTab)

  const filteredBooks = books?.filter(book => {
    if (tab === 'aktif') return book.status === 'Şu an Okuyorum'
    if (tab === 'istek') return book.status === 'İstek Listemde'
    if (tab === 'okunanlar') return book.status === 'Kütüphanemde' && book.is_read
    return book.status === 'Kütüphanemde' // Default kutuphane (All owned)
  }) || []

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Image src="/logo.png" alt="Logo" width={40} height={40} style={{ borderRadius: '10px' }} />
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Kütüphanem</h1>
        </div>
        
        <div className={styles.tabs}>
          <button onClick={() => setTab('kutuphane')} className={`${styles.tab} ${tab === 'kutuphane' ? styles.activeTab : ''}`}>Tümü</button>
          <button onClick={() => setTab('aktif')} className={`${styles.tab} ${tab === 'aktif' ? styles.activeTab : ''}`}>Şu an Okuyorum</button>
          <button onClick={() => setTab('okunanlar')} className={`${styles.tab} ${tab === 'okunanlar' ? styles.activeTab : ''}`}>Okuduklarım</button>
          <button onClick={() => setTab('istek')} className={`${styles.tab} ${tab === 'istek' ? styles.activeTab : ''}`}>İstek Listem</button>
        </div>
      </header>

      <main className={styles.grid}>
        {filteredBooks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Bu listede henüz kitap yok.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ display: 'contents' }}
          >
            <AnimatePresence>
              {filteredBooks.map(book => (
                <motion.div 
                  variants={itemVariants}
                  key={book.id} 
                  layout
                  className={`glass ${styles.bookCard}`}
                >
                  <div className={styles.coverWrapper}>
                    {book.cover_url ? (
                      <Image 
                        src={book.cover_url.replace('http:', 'https:')} 
                        alt={book.title} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        unoptimized 
                      />
                    ) : (
                      <div className={styles.noCover}>Kapak Yok</div>
                    )}
                  </div>
                  <div className={styles.bookInfo}>
                    <h3 className={styles.bookTitle}>{book.title}</h3>
                    <p className={styles.bookAuthor}>{book.author}</p>
                    <div className={styles.bookMeta}>
                      {book.is_read && <span className={styles.badgeRead}>Okundu</span>}
                      {book.rating && <span className={styles.badgeRating}>{book.rating}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  )
}
