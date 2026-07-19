'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function ProfileClient({ initialUser }: { initialUser: any }) {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const fullName = initialUser?.user_metadata?.full_name || 'Kullanıcı'
  const email = initialUser?.email || ''

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (!mounted) return null

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      <header style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Image src="/logo.png" alt="Logo" width={40} height={40} style={{ borderRadius: '10px' }} />
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Profilim</h1>
      </header>

      <motion.main variants={containerVariants} initial="hidden" animate="show" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <motion.div variants={itemVariants} className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #a855f7)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ margin: 0 }}>{fullName}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{email}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass" style={{ padding: '1rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Uygulama Ayarları</h3>
          
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
        </motion.div>

        <motion.div variants={itemVariants}>
          <button 
            onClick={handleLogout} 
            style={{ width: '100%', padding: '1rem', background: 'var(--glass-bg)', color: '#ef4444', border: '1px solid #ef444455', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Çıkış Yap
          </button>
        </motion.div>
      </motion.main>
    </div>
  )
}
