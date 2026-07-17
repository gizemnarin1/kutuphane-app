import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const fullName = user.user_metadata?.full_name || 'Kullanıcı'
  const email = user.email || ''

  return <ProfileClient fullName={fullName} email={email} />
}
