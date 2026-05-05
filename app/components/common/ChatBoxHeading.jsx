import React, { useState } from 'react'
import Image from 'next/image'
import { Call, SearchHeader, MoreIcon } from './Icons'

const ChatBoxHeading = ({chatPerson, setChatPerson, setIsDirectoryOpen, isDirectoryOpen, onClearChat, searchMessageQuery, setSearchMessageQuery}) => {
    const [isCalling, setIsCalling] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className='w-full py-2 flex justify-between items-center font-[Inter]'>
            <div className='flex items-center flex-1 min-w-0'>
                <div 
                    onClick={() => setIsDirectoryOpen(!isDirectoryOpen)}
                    className='flex items-center gap-3 cursor-pointer hover:bg-gray-200/50 p-1 -ml-1 rounded-xl transition-colors'
                >
                    <div className="relative shrink-0">
                        {chatPerson && chatPerson.img ? (
                            <Image src={chatPerson.img} height={40} width={40} alt="person" className='rounded-full object-cover border border-gray-200 shadow-sm' />
                        ) : (
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex justify-center items-center text-lg font-semibold border border-primary/20">
                                {chatPerson?.name ? chatPerson.name.charAt(0).toUpperCase() : "?"}
                            </div>
                        )}
                        {chatPerson && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className='font-semibold text-[15px] text-gray-900 leading-tight truncate'>
                           {chatPerson?.name || "Select a chat"} 
                        </h3>
                        {chatPerson && (
                            <p className='text-[12px] text-gray-500 font-normal leading-tight'>
                                Online
                            </p>
                        )}
                    </div>
                </div>

                {isSearchOpen && (
                    <div className='flex-1 mx-4 max-w-md animate-in fade-in zoom-in-95 duration-200'>
                        <input 
                            autoFocus
                            value={searchMessageQuery}
                            onChange={(e) => setSearchMessageQuery(e.target.value)}
                            placeholder="Search in chat..."
                            className='w-full bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm'
                            onBlur={() => !searchMessageQuery && setIsSearchOpen(false)}
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 md:gap-2 relative shrink-0">
                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                    <SearchHeader />
                </button>
                <button onClick={() => chatPerson && setIsCalling(true)} className='p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors'>
                    <Call />
                </button>
                <button onClick={() => setIsMoreOpen(!isMoreOpen)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                    <MoreIcon />
                </button>

                {isMoreOpen && (
                    <div className='absolute top-12 right-0 bg-white border border-gray-100 shadow-xl rounded-2xl p-2 z-[70] w-48 animate-in fade-in zoom-in-95 duration-200'>
                        <button 
                            type="button"
                            onClick={(e) => { 
                                e.stopPropagation();
                                setIsDirectoryOpen(!isDirectoryOpen); 
                                setIsMoreOpen(false); 
                            }} 
                            className='w-full text-left text-[14px] px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer font-medium text-gray-700 transition-colors'
                        >
                            {isDirectoryOpen ? 'Hide Contact Info' : 'Contact Info'}
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert("Select Messages (Demo)"); setIsMoreOpen(false); }} 
                            className='w-full text-left text-[14px] px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer font-medium text-gray-700 transition-colors'
                        >
                            Select Messages
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => { 
                                e.stopPropagation();
                                setChatPerson(null); 
                                setIsMoreOpen(false); 
                            }} 
                            className='w-full text-left text-[14px] px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer font-medium text-gray-700 transition-colors'
                        >
                            Close Chat
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert("Mute Notifications (Demo)"); setIsMoreOpen(false); }} 
                            className='w-full text-left text-[14px] px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer font-medium text-gray-700 transition-colors'
                        >
                            Mute Notifications
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => { 
                                e.stopPropagation();
                                if(chatPerson) {
                                    onClearChat();
                                }
                                setIsMoreOpen(false); 
                            }} 
                            className='w-full text-left text-[14px] px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer font-medium text-gray-700 transition-colors border-t border-gray-50 mt-1'
                        >
                            Clear Chat
                        </button>
                    </div>
                )}
            </div>

            {isCalling && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white shadow-2xl rounded-3xl p-8 w-72 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
                        <div className="relative">
                            {chatPerson && chatPerson.img ? (
                                <Image src={chatPerson.img} height={96} width={96} alt="person" className="rounded-full shadow-xl object-cover ring-4 ring-primary/20" />
                            ) : (
                                <div className="w-24 h-24 bg-primary text-white rounded-full flex justify-center items-center text-4xl font-bold shadow-xl">
                                    {chatPerson?.name ? chatPerson.name.charAt(0).toUpperCase() : "?"}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-white animate-bounce">
                                <Call className="text-white w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900">{chatPerson?.name}</h2>
                            <p className="text-primary font-medium mt-1 animate-pulse">Ringing...</p>
                        </div>
                        <button onClick={() => setIsCalling(false)} className="bg-red-500 text-white w-full py-3 rounded-2xl font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95">
                            End Call
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatBoxHeading