"use client"
import React, { useState } from 'react'
import { Clipboard, Dots, Downoad, Gallery, Paste, Share } from '../common/Icons'
import { Files, TeamMember } from '../common/Helper'
import Image from 'next/image'
import Link from 'next/link'

const Directory = ({ setIsDirectoryOpen, isFullView, chatPerson, onClearChat }) => {
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const [filterApplied, setFilterApplied] = React.useState(false);

  const handleExportDirectory = () => {
    // Implement export functionality here
    console.log("Exporting directory...");
    // For example, you could download a JSON file with the directory data
    const data = { teamMembers: TeamMember, files: Files };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'directory.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDirectorySettings = () => {
    // Implement directory settings functionality here
    console.log("Opening directory settings...");
    // For example, you could open a settings modal or navigate to a settings page
    // Since there's no modal in the current code, we'll just log for now
  };

  const handleFilterFiles = () => {
    // Implement filter files functionality here
    console.log("Filtering files...");
    setFilterApplied(!filterApplied);
  };

  const getBgColour = (name) => {
    const text = name.toLowerCase();
    if (text.includes("pdf")) return "bg-red-100";
    if (text.includes("png")) return "bg-green-100";
    if (text.includes("docx")) return "bg-blue-100";
    return "bg-purple-100";
  }
  return (
    <section className={`w-full ${isFullView ? 'h-full' : 'h-screen'} font-[Inter] bg-white`}>
      <div className='flex justify-between px-6 py-6.25 border-b border-b-divider relative'>
        <h3 className=' text-xl font-semibold leading-[150%]'>
          Directory
        </h3>
        <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsMoreOpen(!isMoreOpen); }} className=' max-w-[33.3px] w-full h-[33.33px] bg-primary/5 text-primary rounded-[50%] flex justify-center items-center cursor-pointer  transition-transform duration-300 hover:scale-110'>
                <Dots />
            </button>
            <button onClick={() => setIsDirectoryOpen(false)} className=' max-w-[33.3px] w-full h-[33.33px] bg-red-50 text-red-500 rounded-[50%] flex justify-center items-center cursor-pointer transition-transform duration-300 hover:scale-110 hover:bg-red-100'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {isMoreOpen && (
            <div className='absolute top-16 right-6 bg-white border border-gray-100 shadow-xl rounded-2xl p-2 z-[70] w-48 animate-in fade-in zoom-in-95 duration-200'>
                <button onClick={(e) => { e.stopPropagation(); handleExportDirectory(); setIsMoreOpen(false); }} className='w-full text-left text-[14px] px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer font-medium text-gray-700 transition-colors'>
                    Export Directory
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDirectorySettings(); setIsMoreOpen(false); }} className='w-full text-left text-[14px] px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer font-medium text-gray-700 transition-colors'>
                    Directory Settings
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleFilterFiles(); setIsMoreOpen(false); }} className='w-full text-left text-[14px] px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer font-medium text-gray-700 transition-colors border-t border-gray-50 mt-1'>
                    Filter Files
                </button>
            </div>
        )}
      </div>
      <div className='h-[calc(100vh-105px)]  overflow-y-auto px-4'>
        {chatPerson && (
          <div className='flex flex-col items-center py-8 border-b border-gray-100 bg-gray-50/30 rounded-2xl mb-4 mt-2'>
            <div className="relative mb-4 group">
              {chatPerson.img ? (
                <Image src={chatPerson.img} height={120} width={120} alt="profile" className="rounded-full shadow-lg object-cover ring-4 ring-white group-hover:ring-primary/10 transition-all duration-300" />
              ) : (
                <div className="w-[120px] h-[120px] bg-primary/10 text-primary rounded-full flex justify-center items-center text-4xl font-bold shadow-lg ring-4 ring-white">
                  {chatPerson.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{chatPerson.name}</h2>
            <p className="text-gray-500 text-sm font-medium">Online</p>
            
            <div className="w-full mt-8 grid grid-cols-3 gap-3 px-4">
              <button 
                onClick={() => alert("Starting audio call...")}
                className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white transition-colors"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-50 group-hover:bg-primary group-hover:text-white group-hover:shadow-md transition-all">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.27 11.4 11.4 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A15 15 0 0 1 3 6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.58 1 1 0 0 1-.27 1.02l-2.18 2.19z"/></svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-500 group-hover:text-primary transition-colors uppercase tracking-wider">Audio</span>
              </button>
              <button 
                onClick={() => alert("Starting video call...")}
                className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white transition-colors"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-50 group-hover:bg-primary group-hover:text-white group-hover:shadow-md transition-all">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15 8l4.58-4.59A1 1 0 0 1 21 4.12v15.76a1 1 0 0 1-1.42.9l-4.58-4.59V8zM5 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-500 group-hover:text-primary transition-colors uppercase tracking-wider">Video</span>
              </button>
               <button 
                onClick={() => alert("Opening search...")}
                className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white transition-colors"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-50 group-hover:bg-primary group-hover:text-white group-hover:shadow-md transition-all">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-500 group-hover:text-primary transition-colors uppercase tracking-wider">Search</span>
              </button>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); onClearChat(); }}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all font-semibold text-sm border border-red-100 shadow-sm active:scale-95"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Clear Chat
            </button>
          </div>
        )}
        <div className='my-[24.5px] '>
          <div className=' max-w-34.25  w-full  flex justify-between ml-4 mb-[8.5px]' >
            <p className=' text-sm font-semibold leading-[150%]'>
              Team Members
            </p>
            <div className='max-w-6 h-5.5 w-full text-xs font-semibold bg-gray-200 flex justify-center items-center rounded-[60%] '>
              {TeamMember.length}
            </div>
          </div>
          <div className=' flex flex-col gap-2 mx-4 '>
            {TeamMember.map((items, index) => (
              <div key={index} onClick={() => alert(`Viewing profile: ${items.name}`)} className={`max-w-82.5 w-full pl-3 py-3 flex gap-4 hover:bg-[rgba(97,94,240,0.06)] border border-transparent hover:border-[rgba(0,0,0,1)] rounded-xl hover:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] duration-300 cursor-pointer `} >
                <div>
                  <Image src={items.img} height={48} width={48} alt='image' />
                </div>
                <div >
                  <h4 className='text-sm font-semibold leading-[150%]'>
                    {items.name}
                  </h4>
                  <p className=' text-xs font-semibold leading-[150%] text-secondary'>
                    {items.job}
                  </p>
                </div>
              </div>))}
          </div>
        </div>
        <div className='py-[24.5px] border-t border-t-divider'>
          <div className=' max-w-19.25  w-full  flex justify-between ml-4 mb-2 ' >
            <p className=' text-sm font-semibold leading-[150%] '>
              Files
            </p>
            <div className='max-w-9.25 h-5.5 w-full text-xs font-semibold bg-gray-200 flex justify-center items-center rounded-[60%] '>
              {filterApplied ? Files.filter(item => item.heading.toLowerCase().includes('png')).length : Files.length}
            </div>
          </div>
          <div>
            {
              (filterApplied ? Files.filter(item => item.heading.toLowerCase().includes('png')) : Files).map((items, index) => (
                <div key={index} onClick={() => alert(`Opening file: ${items.heading}`)} className='  flex  py-3 gap-4 justify-center cursor-pointer'>
                  <div className={`max-w-12 w-full rounded-xl p-3  h-12 flex justify-center items-center ${getBgColour(items.heading)}`}  >
                    {items.heading.toLowerCase().includes("pdf") ? (<Paste />) : items.heading.toLowerCase().includes("png") ? (<Gallery />) : items.heading.toLowerCase().includes("docx") ? (<Share />) : (<Clipboard />)}
                  </div>
                  <div className='max-w-60.5 w-full gap-4 flex  items-center  '>
                    <div className='max-w-50.5 w-full' >
                      <h4 className=' text-sm font-semibold leading-[150%] '>
                        {items.heading}
                      </h4>
                      <div className='flex gap-2.5 text-xs text-secondary font-semibold leading-[150%]'>
                        <p>{items.type}</p> <p>{items.size}</p>
                      </div>
                    </div>
                    <Link href="#" onClick={(e) => { e.preventDefault(); alert("File download started..."); }} download>
                      <Downoad />
                    </Link>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </section>
  )
}

export default Directory