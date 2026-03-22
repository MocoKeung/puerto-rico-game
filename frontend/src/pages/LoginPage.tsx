import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LanguageToggle from '../components/ui/LanguageToggle';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/lobby');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ocean-pattern flex flex-col">

      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(201,135,12,0.2)' }}
      >
        <h1 className="font-cinzel font-black text-[#f0a830] text-lg tracking-widest uppercase">
          Puerto Rico
        </h1>
        <LanguageToggle variant="dark" />
      </header>

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
          style={{ background: '#f5e6c8', border: '2px solid rgba(201,135,12,0.4)' }}
        >
          {/* Inner gold border */}
          <div className="absolute inset-[6px] rounded-[18px] pointer-events-none z-10"
            style={{ border: '1px solid rgba(201,135,12,0.2)' }} />

          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-[#2d6a4f] via-[#c9870c] to-[#1e3a5f]" />

          <div className="relative z-20 px-8 py-8">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                style={{ background: 'rgba(201,135,12,0.15)', border: '1px solid rgba(201,135,12,0.3)' }}
              >
                <LogIn size={22} className="text-[#c9870c]" strokeWidth={1.5} />
              </div>
              <h2 className="font-cinzel font-black text-[#3d1f0a] text-2xl tracking-wide">
                Sign In
              </h2>
              <div className="h-px w-20 mx-auto bg-gradient-to-r from-transparent via-[#c9870c] to-transparent mt-3" />
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-crimson"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#b91c1c' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                icon={<Mail size={14} className="text-[#5a2e10]/50" strokeWidth={2} />}
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />
              <InputField
                icon={<Lock size={14} className="text-[#5a2e10]/50" strokeWidth={2} />}
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-cinzel font-bold text-white text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 shadow-lg mt-2"
                style={{
                  background: 'linear-gradient(135deg, #b8760a 0%, #f0a830 50%, #b8760a 100%)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="mt-5 text-center font-crimson text-sm text-[#5a2e10]/60">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#c9870c] hover:text-[#f0a830] transition-colors">
                Register
              </Link>
            </p>
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-[#1e3a5f] via-[#c9870c] to-[#2d6a4f]" />
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon, label, type, value, onChange, autoComplete,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block font-cinzel text-[10px] text-[#5a2e10]/60 uppercase tracking-[0.18em] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className="w-full pl-9 pr-4 py-3 rounded-xl font-crimson text-sm text-[#3d1f0a] transition-all focus:outline-none"
          style={{
            background: 'rgba(61,31,10,0.06)',
            border: '1px solid rgba(61,31,10,0.15)',
          }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(201,135,12,0.6)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(61,31,10,0.15)'; }}
        />
      </div>
    </div>
  );
}
