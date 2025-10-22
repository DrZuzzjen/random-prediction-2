import { login } from './actions'
import LoginForm from '@/app/components/AuthForms/LoginForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="card" style={{ padding: 32 }}>
      <LoginForm loginAction={login} />
    </div>
  )
}