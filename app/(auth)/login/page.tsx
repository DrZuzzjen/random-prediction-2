import { login } from './actions'
import LoginForm from '@/app/components/AuthForms/LoginForm'

export default function LoginPage() {
  return (
    <div className="card" style={{ padding: 32 }}>
      <LoginForm loginAction={login} />
    </div>
  )
}