"use client"
import React, { useState } from 'react';
import Navbar from "./components/common/Navbar";
import Directory from "./components/home/Directory";
import Main from "./components/main/Main";

export default function Home() {
  const [activeTab, setActiveTab] = useState(1); // Default to Messages tab

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f0f2f5]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Main activeTab={activeTab} />
    </div>
  );
}
