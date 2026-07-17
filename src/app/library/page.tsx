import { createClient } from '@/utils/supabase/server'
import styles from './library.module.css'
import Image from 'next/image'

export default async function LibraryPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = await createClient()
  const tab = (await searchParams).tab || 'kutuphane'

  // Fetch books
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching books:', error)
  }

  const filteredBooks = books?.filter(book => {
    if (tab === 'aktif') return book.status === 'Şu an Okuyorum'
    if (tab === 'istek') return book.status === 'İstek Listemde'
    if (tab === 'okunanlar') return book.status === 'Kütüphanemde' && book.is_read
    return book.status === 'Kütüphanemde' // Default kutuphane (All owned)
  }) || []

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      <header className={styles.header}>
        <h1>Kütüphanem</h1>
        
        <div className={styles.tabs}>
          <a href="/library?tab=kutuphane" className={`${styles.tab} ${tab === 'kutuphane' ? styles.activeTab : ''}`}>Tümü</a>
          <a href="/library?tab=aktif" className={`${styles.tab} ${tab === 'aktif' ? styles.activeTab : ''}`}>Şu an Okuyorum</a>
          <a href="/library?tab=okunanlar" className={`${styles.tab} ${tab === 'okunanlar' ? styles.activeTab : ''}`}>Okuduklarım</a>
          <a href="/library?tab=istek" className={`${styles.tab} ${tab === 'istek' ? styles.activeTab : ''}`}>İstek Listem</a>
        </div>
      </header>

      <main className={styles.grid}>
        {filteredBooks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Bu listede henüz kitap yok.</p>
          </div>
        ) : (
          filteredBooks.map(book => (
            <div key={book.id} className={`glass ${styles.bookCard}`}>
              <div className={styles.coverWrapper}>
                {book.cover_url ? (
                  <Image 
                    src={book.cover_url.replace('http:', 'https:')} 
                    alt={book.title} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    unoptimized // To allow external images smoothly
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
            </div>
          ))
        )}
      </main>
    </div>
  )
}
