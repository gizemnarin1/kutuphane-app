'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Search } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Image from 'next/image'
import styles from './add.module.css'

export default function AddForm({ userId }: { userId: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  
  // Modal state
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [status, setStatus] = useState('Kütüphanemde')
  const [isRead, setIsRead] = useState(false)
  const [rating, setRating] = useState('')
  const [readDate, setReadDate] = useState(() => new Date().toISOString().split('T')[0])
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 150 } },
        false
      )
      
      scanner.render((decodedText) => {
        scanner.clear()
        setScanning(false)
        setQuery(decodedText)
        searchGoogleBooks(decodedText)
      }, (error) => {
        console.warn(error)
      })

      return () => {
        scanner.clear().catch(console.error)
      }
    }
  }, [scanning])

  const searchGoogleBooks = async (searchQuery: string) => {
    if (!searchQuery) return
    setLoading(true)
    try {
      const cleanQuery = searchQuery.trim()
      const isISBN = /^[0-9-]+$/.test(cleanQuery)
      const qParam = isISBN 
        ? `isbn:${cleanQuery.replace(/-/g, '')}+OR+${encodeURIComponent(cleanQuery)}` 
        : encodeURIComponent(cleanQuery)

      let foundItems: any[] = []

      // 1. Önce Google Books API'yi dene
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${qParam}&maxResults=10`)
        if (res.ok) {
          const data = await res.json()
          foundItems = data.items || []
        }
      } catch (e) {
        console.warn('Google Books fetch error:', e)
      }

      // 2. Google Books sonuç bulamazsa veya Kota (429) dolduysa OpenLibrary'e geç
      if (foundItems.length === 0) {
        console.log('OpenLibrary Fallback kullanılıyor...')
        try {
          const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&limit=10`)
          if (olRes.ok) {
            const olData = await olRes.json()
            if (olData.docs && olData.docs.length > 0) {
              // OpenLibrary formatını Google Books formatına çevir (Arayüz bozulmasın diye)
              foundItems = olData.docs.map((doc: any) => ({
                id: doc.key || Math.random().toString(),
                volumeInfo: {
                  title: doc.title,
                  authors: doc.author_name,
                  industryIdentifiers: doc.isbn ? [{ type: 'ISBN_13', identifier: doc.isbn[0] }] : [],
                  imageLinks: doc.cover_i ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` } : null
                }
              }))
            }
          }
        } catch (e) {
          console.warn('OpenLibrary fetch error:', e)
        }
      }

      setResults(foundItems)

      if (foundItems.length === 0) {
        alert('Bu aramayla eşleşen kitap bulunamadı. Lütfen farklı kelimelerle veya yazar adıyla tekrar deneyin.')
      }
    } catch (err) {
      console.error('Genel Arama Hatası:', err)
      alert('Arama sırasında beklenmedik bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchGoogleBooks(query)
  }

  const openModal = (book: any) => {
    setSelectedBook(book)
    setStatus('Kütüphanemde')
    setIsRead(false)
    setRating('')
    setReadDate(new Date().toISOString().split('T')[0])
  }

  const handleAddBook = async () => {
    if (!selectedBook) return

    const volumeInfo = selectedBook.volumeInfo
    const coverUrl = volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null
    
    // Find ISBN 13 or 10
    const isbnObj = volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13') || 
                    volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')
    const isbn = isbnObj ? isbnObj.identifier : null

    try {
      const { error } = await supabase.from('books').insert({
        user_id: userId,
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Bilinmeyen Yazar',
        cover_url: coverUrl,
        isbn: isbn,
        status,
        is_read: status === 'Şu an Okuyorum' ? false : isRead,
        rating: rating || null,
        read_date: isRead ? readDate : null
      })

      if (error) throw error

      alert('Kitap başarıyla eklendi!')
      setSelectedBook(null)
      router.push('/library')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert('Kitap eklenirken hata: ' + err.message)
    }
  }

  return (
    <>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input 
          type="text" 
          placeholder="Kitap Adı, Yazar veya ISBN" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton} disabled={loading}>
          <Search size={20} />
        </button>
      </form>

      {!scanning ? (
        <button type="button" className={styles.scannerButton} onClick={() => setScanning(true)}>
          <Camera size={20} />
          <span>Kamera ile Barkod Okut</span>
        </button>
      ) : (
        <div className={styles.scannerContainer}>
          <div id="reader" style={{ width: '100%' }}></div>
          <button 
            type="button" 
            onClick={() => setScanning(false)}
            style={{ width: '100%', padding: '1rem', background: '#ef4444', color: 'white' }}
          >
            İptal
          </button>
        </div>
      )}

      {loading && <p style={{ textAlign: 'center' }}>Aranıyor...</p>}

      <div className={styles.resultsList}>
        {results.map((book) => {
          const info = book.volumeInfo
          const cover = info.imageLinks?.thumbnail
          
          return (
            <div key={book.id} className={styles.resultCard}>
              <div className={styles.resultCover}>
                {cover ? (
                  <Image src={cover.replace('http:', 'https:')} alt={info.title} fill style={{ objectFit: 'cover' }} unoptimized />
                ) : (
                  <span style={{ fontSize: '10px', padding: '5px' }}>Kapak Yok</span>
                )}
              </div>
              <div className={styles.resultInfo}>
                <h3 className={styles.resultTitle}>{info.title}</h3>
                <p className={styles.resultAuthor}>{info.authors?.join(', ')}</p>
                <button type="button" onClick={() => openModal(book)} className={styles.addButton}>
                  Seç
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedBook && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Kitap Durumu</h2>
            
            <div className={styles.formGroup}>
              <label>Kategori</label>
              <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Kütüphanemde">Kütüphanemde</option>
                <option value="İstek Listemde">İstek Listemde</option>
                <option value="Şu an Okuyorum">Şu an Okuyorum</option>
              </select>
            </div>

            {status === 'Kütüphanemde' && (
              <>
                <div className={styles.formGroup}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isRead} 
                      onChange={(e) => setIsRead(e.target.checked)} 
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    Bu kitabı okudum
                  </label>
                </div>

                {isRead && (
                  <div className={styles.formGroup}>
                    <label>Okuma Tarihi</label>
                    <input 
                      type="date" 
                      className={styles.input} 
                      value={readDate} 
                      onChange={(e) => setReadDate(e.target.value)} 
                    />
                  </div>
                )}
              </>
            )}

            {isRead && (
              <div className={styles.formGroup}>
                <label>Değerlendirme</label>
                <select className={styles.select} value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="">Seçiniz...</option>
                  <option value="İyi">İyi</option>
                  <option value="Orta">Orta</option>
                  <option value="Kötü">Kötü</option>
                </select>
              </div>
            )}

            <div className={styles.modalActions}>
              <button type="button" onClick={() => setSelectedBook(null)} className={styles.cancelButton}>
                İptal
              </button>
              <button type="button" onClick={handleAddBook} className={styles.saveButton}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
