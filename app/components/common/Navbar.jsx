"use client"
import Link from 'next/link'
import React, { useState } from 'react'
import { NavLinks } from './Helper'
import { Setting } from './Icons'


const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <section className='fixed z-50 bottom-0 left-0 right-0 bg-[#f0f2f5] md:static md:max-w-[64px] w-full md:h-dvh h-[60px] border-r border-gray-200 py-[10px] md:py-6 flex flex-row md:flex-col justify-around md:justify-between items-center px-4 md:px-0'>
      <div className='flex flex-row md:flex-col gap-6 md:gap-8 items-center w-full md:w-auto justify-around md:justify-start'>
        <Link href="/" className='hidden md:flex w-10 h-10 bg-primary justify-center items-center text-white font-bold text-xl rounded-xl hover:opacity-90 transition-opacity'>
          <p>Q</p>
        </Link>
        {NavLinks.map((items, index) => (
          <div 
            key={index} 
            onClick={() => setActiveTab(index)} 
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer duration-200 ${activeTab === index ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:bg-gray-200"} `}
            title={items.name || `Tab ${index + 1}`}
          >
            <div className="scale-110">
              {items.link}
            </div>
          </div>
        ))}
      </div>
      <div className='hidden md:block'>
        <button onClick={() => alert("Settings panel coming soon!")} className='w-12 h-12 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 transition-all hover:rotate-90 duration-300'>
          <Setting />
        </button>
      </div>
    </section>
  )
}

export default Navbar