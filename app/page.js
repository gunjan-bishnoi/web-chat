"use client"
import React, { useState, useEffect } from 'react';
import Navbar from "./components/common/Navbar";
import Main from "./components/main/Main";
import Login from "./components/auth/Login";
import { getAuthService } from "./lib/AuthService";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthService();
    setIsLoggedIn(auth.isLoggedIn());
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab(0);
  };

  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#00a884] rounded-2xl flex items-center justify-center animate-pulse shadow-xl">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.16-1.34C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f0f2f5]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Main activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
    </div>
  );
}
