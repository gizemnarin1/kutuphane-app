import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'
import styles from './login.module.css'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className={styles.container}>
      <div className={`glass ${styles.card}`}>
        <h1 className={styles.title}>Kütüphanem</h1>
        <p className={styles.subtitle}>Kişisel kitaplığınıza giriş yapın</p>
        <LoginForm />
      </div>
    </div>
  )
}
