import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AddForm from './AddForm'
import styles from './add.module.css'

export default async function AddPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      <header className={styles.header}>
        <h1>Kitap Ekle</h1>
      </header>

      <main>
        <AddForm userId={user.id} />
      </main>
    </div>
  )
}
