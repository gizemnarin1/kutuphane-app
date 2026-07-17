'use client'

import { useTheme } from 'next-themes'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ProfileClient({ fullName, email }: { fullName: string, email: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!mounted) return null

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="glass" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #a855f7)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
          {fullName.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ marginBottom: '0.5rem' }}>{fullName}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{email}</p>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Tema Ayarları</h2>
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <button 
            onClick={() => setTheme('light')}
            style={{ padding: '1rem', background: theme === 'light' ? 'var(--primary)' : 'var(--background)', color: theme === 'light' ? '#fff' : 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Aydınlık Mod (Light)
          </button>
          <button 
            onClick={() => setTheme('dark')}
            style={{ padding: '1rem', background: theme === 'dark' ? 'var(--primary)' : 'var(--background)', color: theme === 'dark' ? '#fff' : 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Karanlık Mod (Dark)
          </button>
          <button 
            onClick={() => setTheme('system')}
            style={{ padding: '1rem', background: theme === 'system' ? 'var(--primary)' : 'var(--background)', color: theme === 'system' ? '#fff' : 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Sistem Teması
          </button>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        style={{ width: '100%', padding: '1rem', marginTop: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', fontWeight: 'bold' }}
      >
        Çıkış Yap
      </button>
    </div>
  )
}
