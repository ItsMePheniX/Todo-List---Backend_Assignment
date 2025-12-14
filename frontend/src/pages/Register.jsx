import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    
    // Assuming signUp returns { error } object based on your logic
    const { error } = await signUp(email, password, fullName)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Auto redirect after 5 seconds
      setTimeout(() => {
        navigate('/login')
      }, 5000)
    }
  }

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* LEFT SIDE: Register Form */}
      <div className="flex w-full flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:w-1/2 lg:p-24">
        <div className="mx-auto w-full max-w-md">
          {/* Card Container with Shadow */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <h2 className="mb-2 text-3xl font-bold text-gray-900 font-serif">
              Create Account
            </h2>
            <p className="mb-8 text-gray-500">Sign up to get started!</p>

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 border-2 border-green-400 p-4">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-green-600 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 mb-2"> Registration Successful!</p>
                  <p className="text-sm text-green-800">
                    Please <span className="font-semibold">check your email</span> for a verification link to complete your registration. 
                    Check your spam folder if you don't see it.
                  </p>
                  <p className="text-xs text-green-700 mt-2">Redirecting to login in 5 seconds...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Input */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                {/* User Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-lg bg-gray-50 py-4 pl-12 pr-4 text-gray-900 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:bg-white transition-all placeholder:text-gray-400 hover:ring-gray-300"
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                {/* Envelope Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-lg bg-gray-50 py-4 pl-12 pr-4 text-gray-900 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:bg-white transition-all placeholder:text-gray-400 hover:ring-gray-300"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                {/* Lock Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg bg-gray-50 py-4 pl-12 pr-4 text-gray-900 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:bg-white transition-all placeholder:text-gray-400 hover:ring-gray-300"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                {/* Key Icon (Distinct from Lock) */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full rounded-lg bg-gray-50 py-4 pl-12 pr-4 text-gray-900 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:bg-white transition-all placeholder:text-gray-400 hover:ring-gray-300"
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-4 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-4"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
              {!loading && (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="ml-2 h-4 w-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
               </svg>
              )}
            </button>
          </form>
          </div>

          {/* Social Media Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Connect With Me</h3>
            </div>
            <div className="flex justify-center items-center gap-4">
              <a
                href="https://www.linkedin.com/in/vadityateja/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-600 hover:to-blue-700 border-2 border-blue-200 hover:border-blue-600 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
                <span className="text-xs font-semibold text-blue-700 group-hover:text-white transition-colors">LinkedIn</span>
              </a>
              <a
                href="https://github.com/ItsMePheniX"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-800 hover:to-gray-900 border-2 border-gray-300 hover:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-gray-700 group-hover:text-white transition-colors">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-white transition-colors">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Blue CTA Area (Updated text for Registration page) */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-blue-600 px-10 text-center text-white md:flex">
        <h2 className="mb-4 text-3xl font-bold font-serif">Already have an account?</h2>
        <p className="mb-8 max-w-sm text-blue-100">
          To keep connected with us please login with your personal info.
        </p>
        <Link 
          to="/login"
          className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-blue-600 shadow-md transition-transform hover:scale-105"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}