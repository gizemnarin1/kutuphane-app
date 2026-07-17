'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './login.module.css'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        })
        if (error) throw error
        alert('Kayıt başarılı! Lütfen giriş yapın.')
        setIsLogin(true)
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      
      {!isLogin && (
        <div className={styles.inputGroup}>
          <label htmlFor="fullName">Ad Soyad</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required={!isLogin}
            className={styles.input}
            placeholder="Adınız Soyadınız"
          />
        </div>
      )}

      <div className={styles.inputGroup}>
        <label htmlFor="email">E-posta</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
          placeholder="ornek@email.com"
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password">Şifre</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? 'Bekleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
      </button>

      <div className={styles.toggleText}>
        {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className={styles.toggleButton}
        >
          {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>
      </div>
    </form>
  )
}
