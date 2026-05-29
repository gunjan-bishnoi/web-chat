import React, { useEffect, useRef, useState, useCallback } from 'react'
import { DoubleCheck, EmojiIcon, GalleryIcon, Sent, EditIcon, DeleteIcon, ReplyIcon } from '../common/Icons'
import { useAlert } from '../../context/AlertContext'
import { chatService } from '../../lib/ChatService'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

// Status icon component
const MessageStatus = ({ status }) => {
    if (status === 'sent') return (
        <svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor" className="text-gray-400"><path d="M11.003 1.45l-6.75 6.675-2.75-2.75-.777.777 3.527 3.527 7.527-7.527z" /></svg>
    );
    if (status === 'delivered') return <DoubleCheck className="text-gray-400" />;
    return <DoubleCheck className="text-[#53bdeb]" />; // read
};

// Date separator
const DateSeparator = ({ date }) => (
    <div className="flex justify-center my-4"><span className="bg-white/90 backdrop-blur-sm text-[11px] text-gray-500 font-medium px-4 py-1.5 rounded-lg shadow-sm border border-gray-100">{date}</span></div>
);

function getDateLabel(ts) {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

const ChatBox = ({ chatPerson, searchMessageQuery }) => {
    const { showAlert, showConfirm } = useAlert();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [reactionPickerId, setReactionPickerId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const messageEnd = useRef(null);
    const inputRef = useRef(null);
    const pickerRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);

    // Load messages
    useEffect(() => {
        if (!chatPerson) { setMessages([]); return; }
        setMessages(chatService.getMessages(chatPerson.name));
        chatService.markChatRead(chatPerson.name);
    }, [chatPerson, chatService]);

    const [wallpaper, setWallpaper] = useState(typeof window !== 'undefined' ? localStorage.getItem('chatWallpaper') || 'default' : 'default');

    // Subscribe to events
    useEffect(() => {
        if (!chatPerson) return;
        const name = chatPerson.name;
        const unsubs = [
            chatService.on('message-received', (d) => { if (d.name === name) { setMessages(chatService.getMessages(name)); chatService.markChatRead(name); } }),
            chatService.on('message-sent', (d) => { if (d.name === name) setMessages(chatService.getMessages(name)); }),
            chatService.on('status-changed', (d) => { if (d.name === name) setMessages(chatService.getMessages(name)); }),
            chatService.on('typing', (d) => { if (d.name === name) setIsTyping(d.isTyping); }),
            chatService.on('chat-cleared', (d) => { if (d.name === name) setMessages([]); }),
            chatService.on('message-reacted', (d) => { if (d.name === name) setMessages(chatService.getMessages(name)); }),
            chatService.on('wallpaper-updated', (w) => setWallpaper(w)),
        ];
        return () => unsubs.forEach(fn => fn());
    }, [chatPerson, chatService]);

    // Auto-scroll
    useEffect(() => { messageEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

    // Highlight search
    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.split(regex).map((part, i) =>
            regex.test(part) ? <span key={i} className="bg-yellow-200 text-gray-900 font-medium">{part}</span> : part
        );
    };

    // Emoji picker outside click
    useEffect(() => {
        const handler = (e) => {
            if (showEmojiPicker && pickerRef.current && !pickerRef.current.contains(e.target) && emojiButtonRef.current && !emojiButtonRef.current.contains(e.target))
                setShowEmojiPicker(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showEmojiPicker]);

    const handleEmojiSelect = (emojiData) => {
        const native = emojiData.native;
        if (!native) return;
        const start = Math.min(cursorPosition, message.length);
        setMessage(`${message.slice(0, start)}${native}${message.slice(start)}`);
        setShowEmojiPicker(false);
        requestAnimationFrame(() => { inputRef.current?.focus(); const next = start + native.length; inputRef.current?.setSelectionRange(next, next); setCursorPosition(next); });
    };

    const readFileAsDataURL = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!file.type.startsWith('image/')) { showAlert('Select a valid image.', 'warning'); e.target.value = ''; return; }
        if (selectedImage?.url) URL.revokeObjectURL(selectedImage.url);
        setSelectedImage({ file, url: URL.createObjectURL(file) }); setShowEmojiPicker(false); e.target.value = '';
    };

    const removeSelectedImage = () => { if (selectedImage?.url) URL.revokeObjectURL(selectedImage.url); setSelectedImage(null); };

    const sendMessage = async () => {
        if ((!message.trim() && !selectedImage) || !chatPerson) return;
        let imageData = null;
        if (selectedImage) imageData = await readFileAsDataURL(selectedImage.file);
        chatService.sendMessage(chatPerson.name, message.trim(), imageData, null, replyingTo);
        if (selectedImage?.url) URL.revokeObjectURL(selectedImage.url);
        setSelectedImage(null); 
        setMessage("");
        setReplyingTo(null);
    };

    const startRecording = async () => {
        try {
            // Show UI immediately
            setIsRecording(true);
            setRecordingTime(0);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Check supported types
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
                ? 'audio/webm' 
                : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
            
            const options = mimeType ? { mimeType } : {};
            const mediaRecorder = new NewMediaRecorder(stream, options);
            
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                if (audioChunksRef.current.length > 0) {
                    const blobType = mimeType || 'audio/webm';
                    const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
                    const audioData = await readFileAsDataURL(audioBlob);
                    chatService.sendMessage(chatPerson.name, "", null, audioData);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(100); // Collect data every 100ms
            
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Recording error:", err);
            setIsRecording(false);
            showAlert("Microphone access denied or error occurred.", "error");
        }
    };

    // Helper to handle MediaRecorder constructor safely
    function NewMediaRecorder(stream, options) {
        try { return new MediaRecorder(stream, options); }
        catch (e) { return new MediaRecorder(stream); }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
            const tracks = mediaRecorderRef.current.stream.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDelete = (id) => { showConfirm("Delete this message?", () => { chatService.deleteMessage(chatPerson.name, id); setMessages(chatService.getMessages(chatPerson.name)); }); };
    const handleEdit = (msg) => { setEditingId(msg.id); setEditText(msg.text); };
    const handleReply = (msg) => { setReplyingTo(msg); inputRef.current?.focus(); };
    const handleReaction = (msgId, emoji) => { chatService.addReaction(chatPerson.name, msgId, emoji); setReactionPickerId(null); };
    const saveEdit = () => { if (!editText.trim()) return; chatService.editMessage(chatPerson.name, editingId, editText.trim()); setMessages(chatService.getMessages(chatPerson.name)); setEditingId(null); };

    // Group messages by date
    let lastDateLabel = '';

    return (
        <section className={`flex flex-col flex-1 min-h-0 justify-between font-[Inter] w-full relative overflow-hidden transition-all duration-500 wallpaper-${wallpaper}`}>
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: `url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-dark-pattern-whatsapp-background-characters.jpg')`, backgroundSize: '400px' }}></div>

            <div className='flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar z-10'>
                {messages.length > 0 ? (
                    messages.map((msg) => {
                        const msgText = msg.text || "";
                        if (searchMessageQuery && !msgText.toLowerCase().includes(searchMessageQuery.toLowerCase()) && !msg.image) return null;

                        // Date separator
                        let dateSep = null;
                        const dateLabel = getDateLabel(msg.timestamp || Date.now());
                        if (dateLabel !== lastDateLabel) { dateSep = <DateSeparator key={`date_${msg.id}`} date={dateLabel} />; lastDateLabel = dateLabel; }

                        return (
                            <React.Fragment key={msg.id}>
                                {dateSep}
                                <div id={`msg_${msg.id}`} className={`flex w-full mb-1.5 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] md:max-w-[65%] min-w-[85px] py-1.5 px-2.5 rounded-lg text-[14.2px] shadow-sm relative group transition-all duration-200 hover:shadow-md ${msg.sender === "me" ? "bg-[var(--bg-bubble-me)] text-[var(--text-primary)] rounded-tr-none" : "bg-[var(--bg-bubble-other)] text-[var(--text-primary)] rounded-tl-none"}`}>
                                        {msg.replyTo && (
                                            <div 
                                                onClick={() => {
                                                    const el = document.getElementById(`msg_${msg.replyTo.id}`);
                                                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    el?.classList.add('highlight-msg');
                                                    setTimeout(() => el?.classList.remove('highlight-msg'), 2000);
                                                }}
                                                className="mb-1.5 p-2 rounded bg-black/5 border-l-4 border-primary/40 cursor-pointer hover:bg-black/10 transition-colors"
                                            >
                                                <p className="text-[11px] font-bold text-primary truncate">
                                                    {msg.replyTo.sender === 'me' ? 'You' : msg.replyTo.sender}
                                                </p>
                                                <p className="text-[12px] text-gray-500 truncate">
                                                    {msg.replyTo.text || (msg.replyTo.image ? '📷 Photo' : msg.replyTo.audio ? '🎤 Voice' : '')}
                                                </p>
                                            </div>
                                        )}
                                        {editingId === msg.id ? (
                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-white/50 p-2 rounded border border-primary/20 outline-none text-sm resize-none" rows={2} autoFocus onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } }} />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingId(null)} className="text-[11px] text-gray-500 hover:text-gray-700 px-2 py-1">Cancel</button>
                                                    <button onClick={saveEdit} className="text-[11px] text-primary font-bold px-2 py-1">Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {msg.image && <div className="mb-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50"><img src={msg.image} alt="Sent" className="w-full h-auto object-cover max-h-[280px]" /></div>}
                                                {msg.audio && (
                                                    <div className="mb-2 min-w-[240px] bg-black/5 p-2 rounded-lg flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                                                            </div>
                                                            <span className="text-[11px] text-gray-500 font-medium">Voice Message</span>
                                                        </div>
                                                        <audio src={msg.audio} controls className="h-8 w-full block" />
                                                    </div>
                                                )}
                                                {msgText && <p className="leading-relaxed whitespace-pre-wrap break-words pr-2 pb-5">{searchMessageQuery ? highlightText(msgText, searchMessageQuery) : msgText}</p>}
                                                {/* Message Actions Toolbar */}
                                                <div className={`absolute -top-7 ${msg.sender === 'me' ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1 z-30 translate-y-2 group-hover:translate-y-0`}>
                                                    <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl rounded-full px-1.5 py-1">
                                                        <button onClick={() => handleReply(msg)} title="Reply" className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all active:scale-90"><ReplyIcon className="w-4 h-4" /></button>
                                                        <button onClick={() => setReactionPickerId(reactionPickerId === msg.id ? null : msg.id)} title="React" className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all active:scale-90"><EmojiIcon className="w-4 h-4" /></button>
                                                        {msg.sender === 'me' && (
                                                            <button onClick={() => handleEdit(msg)} title="Edit" className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all active:scale-90"><EditIcon className="w-4 h-4" /></button>
                                                        )}
                                                        <button onClick={() => handleDelete(msg.id)} title="Delete" className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"><DeleteIcon className="w-4 h-4" /></button>
                                                    </div>
                                                </div>

                                                {/* Quick Reaction Picker */}
                                                {reactionPickerId === msg.id && (
                                                    <div className={`absolute bottom-full mb-3 ${msg.sender === 'me' ? 'right-0' : 'left-0'} bg-white shadow-2xl rounded-2xl px-2 py-1.5 flex gap-1 z-50 border border-gray-100 animate-in zoom-in-95 fade-in duration-200 origin-bottom`}>
                                                        {['❤️', '👍', '😂', '😮', '😢', '🔥'].map(emoji => (
                                                            <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className="hover:scale-125 hover:bg-gray-50 transition-all p-2 rounded-xl text-xl active:scale-95">
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Reactions Display */}
                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div className={`absolute -bottom-4 ${msg.sender === 'me' ? 'right-1' : 'left-1'} flex flex-wrap gap-1 z-20`}>
                                                        {msg.reactions.map((r, i) => (
                                                            <div key={i} onClick={() => handleReaction(msg.id, r.emoji)} className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm rounded-full px-2 py-0.5 text-[12px] flex items-center gap-1 cursor-pointer hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 transition-all">
                                                                <span>{r.emoji}</span>
                                                                {r.count > 1 && <span className="font-bold text-gray-500 text-[10px]">{r.count}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-inherit rounded-md pl-1">
                                                    {msg.isEdited && <span className="text-[9px] text-gray-400 italic">edited</span>}
                                                    <span className="text-[10px] text-gray-500 font-medium">{msg.time}</span>
                                                    {msg.sender === "me" && <MessageStatus status={msg.status} />}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col justify-center items-center opacity-50">
                        <p className="text-[#667781] text-sm italic">{searchMessageQuery ? "No results found" : "No messages yet. Say hi! 👋"}</p>
                    </div>
                )}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex w-full mb-2 justify-start">
                        <div className="bg-white py-3 px-4 rounded-lg rounded-tl-none shadow-sm">
                            <div className="flex gap-1 items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messageEnd}></div>
            </div>

            {/* Reply Preview */}
            {replyingTo && (
                <div className="px-4 md:px-6 pb-2 z-10">
                    <div className="relative max-w-2xl mx-auto w-full bg-white/80 backdrop-blur-md rounded-xl border-l-4 border-primary shadow-sm p-3 flex justify-between items-center animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-primary mb-0.5">Replying to {replyingTo.sender === 'me' ? 'yourself' : replyingTo.sender}</p>
                            <p className="text-[13px] text-gray-600 truncate">{replyingTo.text || (replyingTo.image ? '📷 Photo' : replyingTo.audio ? '🎤 Voice' : '')}</p>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="ml-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Image preview */}
            {selectedImage && (
                <div className="px-4 md:px-6 pb-3 z-10">
                    <div className="relative max-w-md mx-auto w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                        <img src={selectedImage.url} alt="Preview" className="w-full h-48 object-cover" />
                        <button type="button" onClick={removeSelectedImage} className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-slate-600 shadow hover:text-slate-900">✕</button>
                        <div className="p-3 flex items-center justify-between">
                            <div className="min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">{selectedImage.file.name}</p><p className="text-xs text-slate-500">{(selectedImage.file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Image</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Input bar */}
            <div className='w-full shrink-0 flex items-center py-2 px-4 gap-3 bg-[#f0f2f5] z-20 border-t border-gray-200'>
                <div className="flex items-center gap-1 md:gap-2 relative">
                    <div className="relative" ref={emojiButtonRef}>
                        <button onClick={() => setShowEmojiPicker(p => !p)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"><EmojiIcon /></button>
                        {showEmojiPicker && (
                            <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 z-50">
                                <Picker
                                    data={data}
                                    onEmojiSelect={handleEmojiSelect}
                                    theme="light"
                                    set="native"
                                    previewPosition="none"
                                    skinTonePosition="search"
                                    maxFrequentRows={2}
                                    perLine={8}
                                    emojiSize={28}
                                    emojiButtonSize={36}
                                />
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <label htmlFor="chatImageUpload" className='p-2 text-gray-500 hover:bg-gray-200 rounded-full cursor-pointer flex items-center justify-center transition-colors'><GalleryIcon /></label>
                        <input type="file" id='chatImageUpload' accept='image/*' className='hidden' onChange={handleImageChange} />
                    </div>
                </div>
                {isRecording ? (
                    <div className='flex-1 flex bg-red-50 px-4 py-2 rounded-full items-center shadow-sm border border-red-200'>
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full mr-3 animate-pulse-red"></div>
                        <span className="text-[15px] font-medium text-red-700 mr-auto tracking-wide">Recording {formatTime(recordingTime)}</span>
                        <button onClick={cancelRecording} className="text-[12px] text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded-full transition-all uppercase tracking-wider">Cancel</button>
                    </div>
                ) : (
                    <div className='flex-1 flex bg-white px-4 py-2 rounded-lg items-center shadow-sm border border-transparent focus-within:border-primary/20 transition-all'>
                        <input ref={inputRef} value={message} disabled={!chatPerson} onChange={(e) => setMessage(e.target.value)}
                            onClick={(e) => setCursorPosition(e.target.selectionStart || 0)} onKeyUp={(e) => setCursorPosition(e.target.selectionStart || 0)} onSelect={(e) => setCursorPosition(e.target.selectionStart || 0)}
                            type="text" placeholder={chatPerson ? 'Type a message' : 'Select a person to chat'}
                            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                            className='w-full outline-none bg-transparent text-[15px] text-gray-800 placeholder:text-gray-400 disabled:cursor-not-allowed' />
                    </div>
                )}
                <div className="shrink-0 flex items-center justify-center">
                    {(message.trim() || selectedImage) ? (
                        <button onClick={sendMessage} className='p-2.5 bg-primary text-white rounded-full hover:opacity-90 transition-all active:scale-90 shadow-md flex items-center justify-center'><Sent className="w-5 h-5" /></button>
                    ) : isRecording ? (
                        <button onClick={stopRecording} className='p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all active:scale-95 shadow-md flex items-center justify-center'>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                        </button>
                    ) : (
                        <button onClick={startRecording} className='p-2.5 text-gray-400 rounded-full hover:bg-gray-200 transition-all flex items-center justify-center'>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.468 2.349 8.468 4.35v7.061c0 2.001 1.53 3.531 3.531 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.238 6.002s-6.238-2.471-6.238-6.003H4.25c0 4.002 3.178 7.297 7.061 7.885v3.884h1.376v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-1.511z" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}
export default ChatBox