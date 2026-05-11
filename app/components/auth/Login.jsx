"use client"
import React, { useState } from 'react'
import { getAuthService } from '../../lib/AuthService'

const AVATARS = [
  "https://xsgames.co/randomusers/assets/avatars/male/7.jpg",
  "https://xsgames.co/randomusers/assets/avatars/male/10.jpg",
  "https://xsgames.co/randomusers/assets/avatars/female/10.jpg",
  "https://xsgames.co/randomusers/assets/avatars/male/15.jpg",
  "https://xsgames.co/randomusers/assets/avatars/female/15.jpg",
  "https://xsgames.co/randomusers/assets/avatars/male/20.jpg",
];

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    const auth = getAuthService();
    const user = auth.login(name.trim(), selectedAvatar);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00a884] via-[#075e54] to-[#128c7e] flex items-center justify-center p-4 font-[Inter]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-dark-pattern-whatsapp-background-characters.jpg')`, backgroundSize: '300px' }}></div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-black/20">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#075e54]" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.16-1.34C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.24c-.22.62-1.29 1.19-1.78 1.27-.49.07-1.1.1-1.78-.11-.41-.13-.94-.32-1.61-.62-2.83-1.27-4.67-4.13-4.81-4.33-.14-.19-1.13-1.5-1.13-2.87 0-1.37.72-2.04.97-2.32.25-.28.55-.35.73-.35h.53c.17 0 .4-.06.62.47.22.55.77 1.87.84 2.01.07.14.11.3.02.49-.09.19-.14.3-.28.47-.14.16-.29.36-.41.49-.14.14-.29.29-.12.57.17.28.74 1.22 1.59 1.97 1.1.97 2.02 1.27 2.31 1.41.28.14.45.12.62-.07.17-.19.71-.83.9-1.12.19-.28.38-.24.63-.14.25.09 1.59.75 1.87.89.28.14.47.21.53.32.07.12.07.68-.14 1.32z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">ChatWeb</h1>
          <p className="text-white/60 text-sm">Simple. Secure. Reliable messaging.</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your name to get started</p>

          {/* Avatar picker */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Choose your avatar</p>
            <div className="flex gap-3 justify-center">
              {AVATARS.map((av, i) => (
                <button key={i} onClick={() => setSelectedAvatar(av)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-3 transition-all duration-200 ${selectedAvatar === av ? 'border-[#00a884] ring-2 ring-[#00a884]/30 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={av} alt={`Avatar ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Your Name</label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Enter your name..."
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-[15px] outline-none focus:ring-2 focus:ring-[#00a884]/30 focus:border-[#00a884] transition-all"
              autoFocus maxLength={30} />
            {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          </div>

          {/* Login button */}
          <button onClick={handleLogin}
            className="w-full py-3.5 bg-gradient-to-r from-[#00a884] to-[#128c7e] text-white rounded-xl font-bold text-[15px] hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-[#00a884]/30 mt-2">
            Get Started
          </button>

          <p className="text-center text-gray-400 text-xs mt-6">Your data stays on this device only</p>
        </div>
      </div>
    </div>
  )
}
export default Login
