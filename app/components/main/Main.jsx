"use client"
import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Msg } from '../common/Helper'
import Messages from '../common/Messages'
import Chats from '../home/Chats'
import ChatBoxHeading from '../common/ChatBoxHeading'
import ChatBox from '../home/ChatBox'
import Directory from '../home/Directory'

const Main = ({ activeTab }) => {
    const [socket, setSocket] = useState(null);
    const [chatPerson, setChatPerson] = useState(null);

    useEffect(() => {
        const newSocket = io("http://localhost:3001");
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, []);

    // Clear chat selection when switching away from messages tab
    useEffect(() => {
        if (activeTab !== 1) {
            setChatPerson(null);
        }
    }, [activeTab]);
    const [messageFilter, setMessageFilter] = useState("All Messages");
    const [searchMessageQuery, setSearchMessageQuery] = useState("");
    const [chatList, setChatList] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('chatList');
            return stored ? JSON.parse(stored) : Msg;
        }
        return Msg;
    });
    const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Save to localStorage when chatList changes
    useEffect(() => {
        localStorage.setItem('chatList', JSON.stringify(chatList));
    }, [chatList]);

    const handleClearChat = (name) => {
        const confirmClear = window.confirm(`Are you sure you want to clear all messages with ${name}? This cannot be undone.`);
        if (!confirmClear) return;
        
        localStorage.removeItem(`chat_${name}`);
        setRefreshKey(prev => prev + 1);
    };

    const handleDeleteChat = (name) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete the chat with ${name}? This will remove all messages.`);
        if (!confirmDelete) return;

        localStorage.removeItem(`chat_${name}`);
        setChatList(prev => prev.filter(c => c.name !== name));
        if (chatPerson && chatPerson.name === name) {
            setChatPerson(null);
        }
    };

    const handleAddChat = (number) => {
        const newChat = {
            name: number,
            img: "",
            time: "Just now",
            content: "Start typing...",
            tags: ["New"]
        };
        setChatList([newChat, ...chatList]);
        setChatPerson(newChat);
    };

    return (
        <div className='flex w-full h-full pb-[60px] md:pb-0 overflow-hidden relative shadow-2xl'>
            
            {/* Sidebar Flow */}
            <div className={`h-full w-full md:max-w-[400px] flex-col ${chatPerson ? 'hidden md:flex' : 'flex'} border-r border-gray-200 shrink-0 overflow-hidden bg-white`}>
                {activeTab === 1 ? (
                    <>
                        <Messages messageFilter={messageFilter} setMessageFilter={setMessageFilter} onAddChat={handleAddChat} />
                        <Chats setChatPerson={setChatPerson} messageFilter={messageFilter} chatList={chatList} onDeleteChat={handleDeleteChat} />
                    </>
                ) : activeTab === 2 ? (
                    <Directory setIsDirectoryOpen={() => {}} isFullView={true} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Tab {activeTab + 1} coming soon!
                    </div>
                )}
            </div>

            {/* Main Chat Flow */}
            <div className={`flex flex-col flex-1 h-full ${!chatPerson ? 'hidden md:flex' : 'flex'} overflow-hidden bg-[#efeae2] relative`}>
                {chatPerson ? (
                    <>
                        <div className='border-b border-gray-200 px-4 md:px-6 w-full flex items-center shrink-0 min-h-[64px] bg-[#f0f2f5] z-10'>
                            <button onClick={() => setChatPerson(null)} className="md:hidden p-2 -ml-2 mr-2 text-primary hover:bg-gray-200 rounded-full flex-shrink-0 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <div className="flex-1 w-full min-w-0">
                                <ChatBoxHeading 
                                    chatPerson={chatPerson} 
                                    setChatPerson={setChatPerson} 
                                    setIsDirectoryOpen={setIsDirectoryOpen}
                                    isDirectoryOpen={isDirectoryOpen}
                                    onClearChat={() => handleClearChat(chatPerson.name)}
                                    searchMessageQuery={searchMessageQuery}
                                    setSearchMessageQuery={setSearchMessageQuery}
                                />
                            </div>
                        </div>
                        <div className="flex flex-1 overflow-hidden relative">
                            <ChatBox 
                                key={`${chatPerson.name}_${refreshKey}`} 
                                chatPerson={chatPerson} 
                                socket={socket} 
                                searchMessageQuery={searchMessageQuery} 
                            />
                            {isDirectoryOpen && (
                                <div className="absolute lg:relative top-0 right-0 bottom-0 z-[100] lg:z-10 flex animate-in slide-in-from-right duration-300">
                                    {/* Backdrop for mobile */}
                                    <div 
                                        onClick={() => setIsDirectoryOpen(false)} 
                                        className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                                    ></div>
                                    
                                    {/* Sidebar Content */}
                                    <div className="relative w-[300px] sm:w-[350px] lg:w-[350px] h-full bg-white border-l border-gray-200 shadow-2xl lg:shadow-none shrink-0 overflow-hidden flex flex-col">
                                        <Directory setIsDirectoryOpen={setIsDirectoryOpen} chatPerson={chatPerson} onClearChat={() => handleClearChat(chatPerson.name)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-[#f0f2f5] border-l border-gray-200 text-center p-12">
                         <div className="w-64 h-64 mb-8 opacity-20">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-400">
                                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12ZM13 7H11V13H17V11H13V7Z" />
                            </svg>
                         </div>
                         <h2 className="text-2xl font-light text-gray-600 mb-2">WhatsApp for Web</h2>
                         <p className="text-gray-500 max-w-sm">Send and receive messages without keeping your phone online. Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
                         <div className="mt-auto pt-8 flex items-center gap-2 text-gray-400 text-sm">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" />
                            </svg>
                            End-to-end encrypted
                         </div>
                    </div>
                )}
            </div>

        </div>
    )
}

export default Main