import { signInWithGoogle } from '@/lib/auth/actions'
import { MapPin } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#011F5B] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#990000]/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto space-y-8">
        {/* Logo */}
        <div className="inline-flex p-4 bg-white/10 rounded-full backdrop-blur-sm mb-4 ring-1 ring-white/20 shadow-2xl">
          <MapPin className="h-10 w-10 text-[#990000]" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">
            Pottruck<span className="text-[#990000]">King</span>
          </h1>
          <p className="text-blue-100 text-lg font-medium">University of Pennsylvania</p>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-lg leading-relaxed">
          The official ELO tracker for Pottruck courts. Join lobbies, track stats, and find out who
          runs the gym.
        </p>

        {/* Sign in button */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-white text-[#011F5B] hover:bg-blue-50 px-4 py-3 text-sm font-bold shadow-sm transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Penn Google
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
