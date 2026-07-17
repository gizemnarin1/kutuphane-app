import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import FinishBookButton from '@/components/FinishBookButton'
import styles from './page.module.css'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch currently reading books
  const { data: currentlyReading } = await supabase
    .from('books')
    .select('id, title, cover_url')
    .eq('user_id', user.id)
    .eq('status', 'Şu an Okuyorum')

  // Fetch read books this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const { data: readBooks } = await supabase
    .from('books')
    .select('id, title, cover_url, read_date')
    .eq('user_id', user.id)
    .eq('is_read', true)
    .not('read_date', 'is', null)

  const thisMonthBooks = readBooks?.filter((b: any) => {
    if (!b.read_date) return false
    const date = new Date(b.read_date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }) || []

  const thisMonthReadCount = thisMonthBooks.length

  // Fetch yearly goal
  const { data: goalData } = await supabase
    .from('reading_goals')
    .select('yearly_goal')
    .eq('user_id', user.id)
    .eq('year', currentYear)
    .single()

  const yearlyGoal = goalData?.yearly_goal || "Belirlenmedi"
  
  // Total read this year
  const thisYearReadCount = readBooks?.filter((b: any) => {
    if (!b.read_date) return false
    return new Date(b.read_date).getFullYear() === currentYear
  }).length || 0

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0]

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      <header className={styles.header}>
        <h1>Kütüphanem</h1>
        <p>Hoş geldin, {fullName}</p>
      </header>

      <main className={styles.main}>
        {currentlyReading && currentlyReading.length > 0 && (
          <div className={`glass ${styles.statsCard}`} style={{ borderColor: 'var(--primary)', marginBottom: '1.5rem' }}>
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
          </div>
        )}

        <div className={`glass ${styles.statsCard}`}>
          <h2>{currentYear} Okuma Hedefi</h2>
          <p>{thisYearReadCount} / {yearlyGoal}</p>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Yıllık hedefinizi veritabanından güncelleyebilirsiniz.
          </div>
        </div>

        <div className={`glass ${styles.statsCard}`}>
          <h2>Bu Ay Okunanlar</h2>
          <p>{thisMonthReadCount} Kitap</p>

          {thisMonthBooks.length > 0 && (
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
          )}
        </div>
      </main>
    </div>
  )
}
