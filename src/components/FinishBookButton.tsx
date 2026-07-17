'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function FinishBookButton({ bookId }: { bookId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFinish = async () => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('books')
        .update({
          status: 'Kütüphanemde',
          is_read: true,
          read_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', bookId)

      if (error) throw error
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert('Hata oluştu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleFinish}
      disabled={loading}
      style={{
        width: '100%',
        marginTop: '0.5rem',
        padding: '0.5rem',
        background: 'var(--primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? 'İşleniyor...' : '🎉 Bitirdim'}
    </button>
  )
}
