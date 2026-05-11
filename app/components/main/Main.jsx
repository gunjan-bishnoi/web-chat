"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Msg, NavLinks } from '../common/Helper'
import Messages from '../common/Messages'
import Chats from '../home/Chats'
import ChatBoxHeading from '../common/ChatBoxHeading'
import ChatBox from '../home/ChatBox'
import Directory from '../home/Directory'
import Status from '../home/Status'
import Calls from '../home/Calls'
import Settings from '../home/Settings'
import Image from 'next/image'
import { useAlert } from '../../context/AlertContext'
import { getChatService } from '../../lib/ChatService'
import { Call } from '../common/Icons'

const Main = ({ activeTab, setActiveTab, onLogout }) => {
    const chatService = useRef(getChatService()).current;
    const [chatPerson, setChatPerson] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [messageFilter, setMessageFilter] = useState("All Messages");
    const [searchMessageQuery, setSearchMessageQuery] = useState("");
    const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
    const [selectedDirectoryMember, setSelectedDirectoryMember] = useState(null);
    const [isCalling, setIsCalling] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { showConfirm, showAlert } = useAlert();

    // Initialize chat list
    useEffect(() => {
        const stored = chatService.getChats();
        if (stored.length === 0) {
            // First load: seed from default data
            const seeded = Msg.map(m => ({ ...m, unread: Math.floor(Math.random() * 3) }));
            localStorage.setItem('chatList', JSON.stringify(seeded));
            setChatList(seeded);
            seeded.forEach(c => chatService.initContactStatus(c.name));
        } else {
            setChatList(stored);
            stored.forEach(c => chatService.initContactStatus(c.name));
        }
    }, [chatService]);

    // Subscribe to chat list updates
    useEffect(() => {
        const unsubs = [
            chatService.on('chats-updated', (chats) => setChatList(chats)),
            chatService.on('group-updated', (updatedGroup) => {
                setChatPerson(prev => {
                    if (!prev) return null;
                    // Find the latest version of this chat in the master list
                    const latest = chatService.getChats().find(c => 
                        (c.id && prev.id && c.id === prev.id) || (c.name === prev.name)
                    );
                    return latest || prev;
                });
            })
        ];
        return () => unsubs.forEach(fn => fn());
    }, [chatService]);

    // Clear chat selection when switching tabs
    useEffect(() => {
        if (activeTab !== 0) setChatPerson(null);
    }, [activeTab]);

    // Mark chat as read when opening
    useEffect(() => {
        if (chatPerson) chatService.markChatRead(chatPerson.name);
    }, [chatPerson, chatService]);

    const handleStartCall = (person = null) => {
        const target = person || chatPerson;
        if (target) {
            chatService.addCall(target.name, target.img, 'outgoing');
        }
        setIsCalling(true);
    };
    const handleEndCall = () => { setIsCalling(false); showAlert('Call ended', 'success'); };

    const handleClearChat = (name) => {
        showConfirm(`Clear all messages with ${name}?`, () => {
            chatService.clearChat(name);
            setRefreshKey(k => k + 1);
        });
    };

    const handleDeleteChat = (name) => {
        showConfirm(`Delete chat with ${name}?`, () => {
            chatService.deleteChat(name);
            if (chatPerson?.name === name) setChatPerson(null);
        });
    };

    const handleAddChat = (nameOrNumber) => {
        // Check if this is an existing chat/group first
        const existing = chatService.getChats().find(c => c.name === nameOrNumber);
        if (existing) {
            setChatPerson(existing);
            return;
        }
        
        const contact = { name: nameOrNumber, img: "", time: "Just now", content: "Start a conversation", tags: ["New"], unread: 0 };
        chatService.addChat(contact);
        setChatPerson(contact);
    };

    const handleStartChatFromDirectory = (member) => {
        const contact = { name: member.name, img: member.img, time: "Just now", content: "Start a conversation", tags: ["New"], unread: 0 };
        chatService.addChat(contact);
        setChatPerson(contact);
        setActiveTab(0);
    };

    const getTabName = (i) => NavLinks?.[i]?.name || "Tab";

    return (
        <div className='flex w-full h-full pb-[60px] md:pb-0 overflow-hidden relative shadow-2xl'>
            {/* Sidebar */}
            <div className={`h-full w-full md:max-w-[400px] flex-col ${chatPerson ? 'hidden md:flex' : 'flex'} border-r border-divider shrink-0 overflow-hidden bg-[var(--bg-sidebar)] shadow-sm z-20`}>
                {activeTab === 0 ? (
                    <>
                        <Messages messageFilter={messageFilter} setMessageFilter={setMessageFilter} onAddChat={handleAddChat} chatCount={chatList.length} setActiveTab={setActiveTab} />
                        <Chats setChatPerson={setChatPerson} messageFilter={messageFilter} chatList={chatList} onDeleteChat={handleDeleteChat} chatService={chatService} />
                    </>
                ) : activeTab === 1 ? <Status />
                  : activeTab === 2 ? <Calls setChatPerson={setChatPerson} onStartCall={handleStartCall} setActiveTab={setActiveTab} />
                  : activeTab === 3 ? <Directory selectedMember={selectedDirectoryMember} onSelectMember={setSelectedDirectoryMember} setIsDirectoryOpen={() => {}} isFullView={true} />
                  : activeTab === 4 ? <Settings onLogout={onLogout} />
                  : <div className="flex-1 flex items-center justify-center text-gray-400">Coming soon!</div>
                }
            </div>

            {/* Main Content */}
            <div className={`flex flex-col flex-1 h-full ${activeTab !== 0 ? 'flex' : (!chatPerson ? 'hidden md:flex' : 'flex')} overflow-hidden bg-[var(--bg-chat)] relative`}>
                {activeTab === 3 ? (
                    <>
                        <div className='border-b border-divider px-4 md:px-6 w-full flex items-center shrink-0 min-h-[64px] bg-[var(--bg-sidebar)] z-10'>
                            <h2 className='text-xl font-semibold text-[var(--text-primary)]'>Directory Details</h2>
                        </div>
                        <div className='flex flex-1 overflow-hidden relative bg-[var(--bg-app)]'>
                            {selectedDirectoryMember ? (
                                <div className='flex-1 overflow-y-auto p-6'>
                                    <div className='max-w-2xl mx-auto bg-gray-50 rounded-[40px] p-8 shadow-inner border border-gray-100'>
                                        <div className='flex flex-col items-center gap-6'>
                                            <div className="relative">
                                                <Image src={selectedDirectoryMember.img} height={160} width={160} alt={selectedDirectoryMember.name} className='rounded-full object-cover shadow-2xl border-8 border-[var(--bg-app)]' />
                                                <div className="absolute bottom-3 right-3 w-6 h-6 bg-green-500 border-4 border-[var(--bg-app)] rounded-full"></div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className='text-3xl font-bold text-[var(--text-primary)]'>{selectedDirectoryMember.name}</h3>
                                                <p className='text-lg font-medium text-primary mt-1'>{selectedDirectoryMember.job}</p>
                                            </div>
                                        </div>
                                        <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                                                <p className='text-xs text-gray-400 uppercase tracking-widest font-bold mb-2'>Status</p>
                                                <p className="text-gray-700 font-medium flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Available</p>
                                            </div>
                                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                                                <p className='text-xs text-gray-400 uppercase tracking-widest font-bold mb-2'>Department</p>
                                                <p className="text-gray-700 font-medium">Business Dev</p>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex gap-4">
                                            <button onClick={() => handleStartChatFromDirectory(selectedDirectoryMember)} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-95">Send Message</button>
                                            <button onClick={() => {
                                                const contact = { name: selectedDirectoryMember.name, img: selectedDirectoryMember.img, time: "Just now", content: "Start a conversation", tags: ["New"], unread: 0 };
                                                chatService.addChat(contact);
                                                setChatPerson(contact);
                                                handleStartCall(contact);
                                            }} className="p-4 bg-white text-gray-700 border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='flex-1 flex items-center justify-center p-8 text-center bg-[#f0f2f5]'>
                                    <div className="max-w-md">
                                        <div className="w-40 h-40 mx-auto mb-6 bg-white/50 rounded-full flex items-center justify-center border-4 border-white">
                                            <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <p className='text-2xl font-bold text-gray-700'>Directory</p>
                                        <p className='mt-2 text-gray-500'>Select a team member to view their profile.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : activeTab !== 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] p-12 text-center">
                        <div className="w-40 h-40 mb-6 bg-white rounded-full flex items-center justify-center shadow-inner">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-20 h-20 text-primary opacity-20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M12 6v6l4 2" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">{getTabName(activeTab)}</h2>
                        <p className="text-gray-500 max-w-sm">Select an item from the sidebar to view details.</p>
                    </div>
                ) : chatPerson ? (
                    <>
                        <div className='border-b border-divider px-4 md:px-6 w-full flex items-center shrink-0 min-h-[64px] bg-[var(--bg-sidebar)] z-10'>
                            <button onClick={() => setChatPerson(null)} className="md:hidden p-2 -ml-2 mr-2 text-primary hover:bg-gray-200 rounded-full flex-shrink-0 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <div className="flex-1 w-full min-w-0">
                                <ChatBoxHeading chatPerson={chatPerson} setChatPerson={setChatPerson} setIsDirectoryOpen={setIsDirectoryOpen} isDirectoryOpen={isDirectoryOpen} isCalling={isCalling} onStartCall={handleStartCall} onEndCall={handleEndCall} onClearChat={() => handleClearChat(chatPerson.name)} searchMessageQuery={searchMessageQuery} setSearchMessageQuery={setSearchMessageQuery} chatService={chatService} />
                            </div>
                        </div>
                        <div className="flex flex-1 overflow-hidden relative">
                            <ChatBox key={`${chatPerson.name}_${refreshKey}`} chatPerson={chatPerson} chatService={chatService} searchMessageQuery={searchMessageQuery} />
                            {isDirectoryOpen && (
                                <div className="absolute lg:relative top-0 right-0 bottom-0 z-[100] lg:z-10 flex animate-in slide-in-from-right duration-300">
                                    <div onClick={() => setIsDirectoryOpen(false)} className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm"></div>
                                    <div className="relative w-[300px] sm:w-[350px] lg:w-[350px] h-full bg-white border-l border-gray-200 shadow-2xl lg:shadow-none shrink-0 overflow-hidden flex flex-col">
                                        <Directory 
                                            key={chatPerson ? `${chatPerson.id || chatPerson.name}_${chatPerson.members?.length || 0}` : 'empty'}
                                            setIsDirectoryOpen={setIsDirectoryOpen} 
                                            chatPerson={chatPerson} 
                                            onClearChat={() => handleClearChat(chatPerson.name)} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-[#f0f2f5] border-l border-gray-200 text-center p-12">
                        <div className="w-56 h-56 mb-8 opacity-20"><svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-400"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12ZM13 7H11V13H17V11H13V7Z" /></svg></div>
                        <h2 className="text-3xl font-light text-gray-800 mb-2">ChatWeb</h2>
                        <p className="text-gray-500 max-w-sm">Select a conversation to get started.</p>
                        <div className="mt-auto pt-8 flex items-center gap-2 text-gray-400 text-sm font-medium tracking-wide">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" /></svg>
                            END-TO-END ENCRYPTED
                        </div>
                    </div>
                )}
            </div>
            {isCalling && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in" onClick={handleEndCall}>
                    <div className="bg-white shadow-2xl rounded-[40px] p-10 w-[320px] flex flex-col items-center gap-8 animate-slide-up relative" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-4 right-4">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150 opacity-20"></div>
                            {chatPerson?.img ? (
                                <Image src={chatPerson.img} height={120} width={120} alt="person" className="rounded-full shadow-2xl object-cover ring-4 ring-white relative z-10" />
                            ) : (
                                <div className="w-[120px] h-[120px] bg-primary text-white rounded-full flex justify-center items-center text-5xl font-bold shadow-2xl relative z-10">
                                    {chatPerson?.name?.charAt(0) || "?"}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-green-500 p-3 rounded-full border-4 border-white shadow-lg z-20 animate-bounce">
                                <Call className="text-white w-6 h-6" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">{chatPerson?.name}</h2>
                            <p className="text-primary font-semibold mt-2 tracking-wide animate-pulse">RINGING...</p>
                        </div>
                        <div className="w-full flex flex-col gap-3">
                            <button onClick={handleEndCall} className="bg-red-500 text-white w-full py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95 flex items-center justify-center gap-2">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="rotate-[135deg]"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                                End Call
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Main