import { createClient } from '@/utils/supabase/server'
import styles from './library.module.css'
import Image from 'next/image'
import LibraryClient from './LibraryClient'

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

  return <LibraryClient books={books} initialTab={tab} />
}
