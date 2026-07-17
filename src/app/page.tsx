import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import styles from './page.module.css'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch read books this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const { data: readBooks } = await supabase
    .from('books')
    .select('read_date')
    .eq('user_id', user.id)
    .eq('is_read', true)
    .not('read_date', 'is', null)

  const thisMonthReadCount = readBooks?.filter((b: any) => {
    if (!b.read_date) return false
    const date = new Date(b.read_date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length || 0

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

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      <header className={styles.header}>
        <h1>Kütüphanem</h1>
        <p>Hoş geldiniz, {user.email?.split('@')[0]}</p>
      </header>

      <main className={styles.main}>
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
        </div>
      </main>
    </div>
  )
}
