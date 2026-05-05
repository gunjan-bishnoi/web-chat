import React, { useEffect, useRef, useState } from 'react'
import { DoubleCheck, EmojiIcon, GalleryIcon, MicIcon, Sent, EditIcon, DeleteIcon } from '../common/Icons'

const ChatBox = ({ chatPerson, socket, searchMessageQuery }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([])
    const messageEnd = useRef(null)
    const [editingIndex, setEditingIndex] = useState(null)
    const [editText, setEditText] = useState("")

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data) => {
            setMessages((prev) => {
                // Determine if this message should be displayed in the current chat
                const senderName = data.sender || "Anonymous";
                
                // Always store in localStorage for persistence
                const storageKey = `chat_${senderName}`;
                const stored = JSON.parse(localStorage.getItem(storageKey)) || [];
                
                // Avoid duplicates if the message was already added (e.g. from me)
                const isDuplicate = stored.some(msg => msg.text === data.text && msg.time === data.time && msg.sender === data.sender);
                
                if (!isDuplicate) {
                    const incomingMsg = { 
                        text: data.text, 
                        sender: senderName,
                        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    localStorage.setItem(storageKey, JSON.stringify([...stored, incomingMsg]));
                    
                    if (chatPerson && senderName === chatPerson.name) {
                        return [...prev, incomingMsg];
                    }
                }
                return prev;
            });
        };

        socket.on("receive-message", handleReceiveMessage);

        return () => {
            socket.off("receive-message", handleReceiveMessage);
        }
    }, [socket, chatPerson])

    const sendMessage = () => {
        if (message.trim() === "" || !chatPerson) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const newMsg = { 
            text: message, 
            sender: "me",
            time: timeStr
        };
        
        const currentStored = JSON.parse(localStorage.getItem(`chat_${chatPerson.name}`)) || [];
        localStorage.setItem(`chat_${chatPerson.name}`, JSON.stringify([...currentStored, newMsg]));
        setMessages(prev => [...prev, newMsg]);
        
        if (socket && socket.connected) {
            socket.emit("send-message", { 
                text: message, 
                sender: "Me", 
                receiver: chatPerson.name,
                time: timeStr
            });
        }
        setMessage("");
    };

    const handleDeleteMessage = (index) => {
        if (!chatPerson) return;
        const confirmDelete = window.confirm("Are you sure you want to delete this message?");
        if (!confirmDelete) return;

        const updatedMessages = messages.filter((_, i) => i !== index);
        setMessages(updatedMessages);
        localStorage.setItem(`chat_${chatPerson.name}`, JSON.stringify(updatedMessages));
    };

    const handleEditMessage = (index) => {
        setEditingIndex(index);
        setEditText(messages[index].text);
    };

    const saveEdit = (index) => {
        if (!chatPerson || editText.trim() === "") return;
        
        const updatedMessages = [...messages];
        updatedMessages[index] = { ...updatedMessages[index], text: editText, isEdited: true };
        setMessages(updatedMessages);
        localStorage.setItem(`chat_${chatPerson.name}`, JSON.stringify(updatedMessages));
        setEditingIndex(null);
        setEditText("");
    };

    useEffect(() => {
        messageEnd.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])
    

    useEffect(() => {
        if (!chatPerson) {
            setMessages([]);
            return;
        }
        const storedChats = JSON.parse(localStorage.getItem(`chat_${chatPerson.name}`)) || [];
        setMessages(storedChats)
    }, [chatPerson])


    return (
        <section className='flex flex-col flex-1 min-h-0 justify-between font-[Inter] w-full bg-[#efeae2] relative overflow-hidden'>
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: `url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-dark-pattern-whatsapp-background-characters.jpg')`, backgroundSize: '400px' }}></div>

            <div className='flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar z-10'>
                {messages.length > 0 ? (
                    messages.map((msg, index) => {
                        if (searchMessageQuery && !msg.text.toLowerCase().includes(searchMessageQuery.toLowerCase())) {
                            return null;
                        }
                        return (
                            <div key={index} className={`flex w-full mb-2 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] py-1.5 px-2.5 rounded-lg text-[14.2px] shadow-sm relative group transition-all duration-200 hover:shadow-md ${msg.sender === "me" ? "bg-[#d9fdd3] text-[#111b21]" : "bg-white text-[#111b21]"}`}>
                                {editingIndex === index ? (
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <textarea 
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full bg-white/50 p-2 rounded border border-primary/20 outline-none text-sm resize-none"
                                            rows={2}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingIndex(null)} className="text-[11px] text-gray-500 hover:text-gray-700">Cancel</button>
                                            <button onClick={() => saveEdit(index)} className="text-[11px] text-primary font-bold">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="leading-relaxed whitespace-pre-wrap break-words pr-6">{msg.text}</p>
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button onClick={() => handleEditMessage(index)} className="p-1 text-gray-400 hover:text-primary transition-colors">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => handleDeleteMessage(index)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            {msg.isEdited && <span className="text-[10px] text-gray-400 italic mr-1">edited</span>}
                                            <span className="text-[11px] text-gray-500">{msg.time || "12:00 PM"}</span>
                                            {msg.sender === "me" && <DoubleCheck className="text-[#53bdeb]" />}
                                        </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="h-full flex flex-col justify-center items-center opacity-50">
                        <p className="text-[#667781] text-sm italic">
                            {searchMessageQuery ? "No messages found matching your search." : "No messages yet. Say hi!"}
                        </p>
                    </div>
                )}
                <div ref={messageEnd} ></div>
            </div>

            <div className='w-full shrink-0 flex items-center py-2 px-4 gap-3 bg-[#f0f2f5] z-20 border-t border-gray-200'>
                <div className="flex items-center gap-1 md:gap-3">
                    <button onClick={() => alert("Emoji picker coming soon!")} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                        <EmojiIcon />
                    </button>
                    <div className="relative">
                        <label htmlFor="form" className='p-2 text-gray-500 hover:bg-gray-200 rounded-full cursor-pointer flex items-center justify-center transition-colors'>
                            <GalleryIcon />
                        </label>
                        <input type="file" id='form' className='hidden' onChange={(e) => {
                            if(e.target.files?.[0]) {
                                alert(`Selected file: ${e.target.files[0].name}. File upload functionality will be fully integrated soon.`);
                            }
                        }} />
                    </div>
                </div>
                
                <div className='flex-1 flex bg-white px-4 py-2 rounded-lg items-center shadow-sm border border-transparent focus-within:border-primary/20 transition-all'>
                    <input 
                        value={message} 
                        disabled={!chatPerson}
                        onChange={(e) => setMessage(e.target.value)} 
                        type="text" 
                        placeholder={chatPerson ? 'Type a message' : 'Select a person to chat'} 
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
                        className='w-full outline-none bg-transparent text-[15px] text-gray-800 placeholder:text-gray-400 disabled:cursor-not-allowed' 
                    />
                </div>

                <div className="shrink-0 flex items-center justify-center">
                    {message.trim() ? (
                        <button onClick={sendMessage} className='p-2.5 bg-primary text-white rounded-full hover:opacity-90 transition-all active:scale-90 shadow-md flex items-center justify-center'>
                           <Sent className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={() => alert("Voice messaging coming soon!")} className="p-2.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center">
                             <MicIcon />
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}

export default ChatBox