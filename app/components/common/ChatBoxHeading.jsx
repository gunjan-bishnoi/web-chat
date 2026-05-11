"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Call, SearchHeader } from './Icons'
import { useAlert } from '../../context/AlertContext'

const ChatBoxHeading = ({ chatPerson, setChatPerson, setIsDirectoryOpen, isDirectoryOpen, isCalling, onStartCall, onEndCall, onClearChat, searchMessageQuery, setSearchMessageQuery, chatService }) => {
    const { showAlert } = useAlert();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [contactStatus, setContactStatus] = useState({ isOnline: false, isTyping: false, lastSeen: new Date() });

    // Get & update contact status
    useEffect(() => {
        if (!chatPerson || !chatService) return;
        setContactStatus(chatService.getContactStatus(chatPerson.name));
        const unsub = chatService.on('typing', ({ name, isTyping }) => {
            if (name === chatPerson.name) setContactStatus(prev => ({ ...prev, isTyping }));
        });
        return unsub;
    }, [chatPerson, chatService]);

    const getStatusText = () => {
        if (chatPerson?.isGroup) {
            const members = chatPerson.members || [];
            if (members.length === 0) return 'Group with no members';
            const text = members.join(', ');
            return text.length > 40 ? text.substring(0, 40) + '...' : text;
        }
        if (contactStatus.isTyping) return <span className="text-primary font-medium animate-pulse">typing...</span>;
        if (contactStatus.isOnline) return 'Online';
        if (contactStatus.lastSeen) {
            const d = new Date(contactStatus.lastSeen);
            const now = new Date();
            if (d.toDateString() === now.toDateString()) return `last seen today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            return `last seen ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return 'Offline';
    };

    return (
        <div className='w-full py-2 flex justify-between items-center font-[Inter]'>
            <div className='flex items-center flex-1 min-w-0'>
                <div onClick={() => setIsDirectoryOpen(!isDirectoryOpen)} className='flex items-center gap-3 cursor-pointer hover:bg-gray-200/50 p-1 -ml-1 rounded-xl transition-colors'>
                    <div className="relative shrink-0">
                        {chatPerson?.img ? (
                            <Image src={chatPerson.img} height={40} width={40} alt="person" className='rounded-full object-cover border border-gray-200 shadow-sm' />
                        ) : (
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex justify-center items-center text-lg font-semibold border border-primary/20">
                                {chatPerson?.name ? chatPerson.name.charAt(0).toUpperCase() : "?"}
                            </div>
                        )}
                        {contactStatus.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#f0f2f5] rounded-full"></div>}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className='font-semibold text-[15px] text-gray-900 leading-tight truncate'>{chatPerson?.name || "Select a chat"}</h3>
                        {chatPerson && <p className='text-[12px] text-gray-500 font-normal leading-tight'>{getStatusText()}</p>}
                    </div>
                </div>
                {isSearchOpen && (
                    <div className='flex-1 mx-4 max-w-md animate-in fade-in zoom-in-95 duration-200'>
                        <input autoFocus value={searchMessageQuery} onChange={(e) => setSearchMessageQuery(e.target.value)} placeholder="Search in chat..."
                            className='w-full bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm'
                            onBlur={() => !searchMessageQuery && setIsSearchOpen(false)} />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1 md:gap-2 relative shrink-0">
                <button onClick={() => { setIsSearchOpen(!isSearchOpen); if (isSearchOpen) setSearchMessageQuery(''); }} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"><SearchHeader /></button>
                <button type="button" onClick={() => chatPerson ? onStartCall() : showAlert('Select a chat first.', 'warning')} className='p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors'><Call /></button>
            </div>
        </div>
    )
}
export default ChatBoxHeading