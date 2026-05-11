"use client"
import React, { useState, useEffect } from 'react'
import { getAuthService } from '../../lib/AuthService'
import { getChatService } from '../../lib/ChatService'
import { useAlert } from '../../context/AlertContext'

const Settings = ({ onLogout }) => {
    const auth = getAuthService();
    const { showAlert, showConfirm } = useAlert();
    const [user, setUser] = useState(auth.getUser());
    const [editingAbout, setEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState(user?.about || '');
    const [editingName, setEditingName] = useState(false);
    const [nameText, setNameText] = useState(user?.name || '');

    const handleSaveAbout = () => {
        if (!aboutText.trim()) return;
        const updated = auth.updateProfile({ about: aboutText.trim() });
        setUser(updated);
        setEditingAbout(false);
        showAlert('About updated!', 'success');
    };

    const handleSaveName = () => {
        if (!nameText.trim() || nameText.trim().length < 2) { showAlert('Name must be at least 2 characters', 'warning'); return; }
        const updated = auth.updateProfile({ name: nameText.trim() });
        setUser(updated);
        setEditingName(false);
        showAlert('Name updated!', 'success');
    };

    const handleClearAllData = () => {
        showConfirm('This will delete ALL your data including chats, statuses, and settings. Continue?', () => {
            localStorage.clear();
            window.location.reload();
        });
    };

    const handleLogout = () => {
        showConfirm('Are you sure you want to logout?', () => {
            auth.logout();
            if (onLogout) onLogout();
            else window.location.reload();
        });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showAlert('Please select a valid image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            const updated = auth.updateProfile({ avatar: base64 });
            setUser(updated);
            showAlert('Profile picture updated!', 'success');
        };
        reader.readAsDataURL(file);
    };

    const [selectedSection, setSelectedSection] = useState(null);
    const [theme, setTheme] = useState(typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light');
    const [wallpaper, setWallpaper] = useState(typeof window !== 'undefined' ? localStorage.getItem('chatWallpaper') || 'default' : 'default');
    const chatService = React.useRef(getChatService()).current;

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', theme);
        chatService._emit('theme-updated', theme);
    }, [theme]);

    const handleSaveWallpaper = (w) => {
        setWallpaper(w);
        localStorage.setItem('chatWallpaper', w);
        chatService._emit('wallpaper-updated', w);
        showAlert('Wallpaper updated!', 'success');
    };

    const renderChatsSettings = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-3 px-2">Display</p>
                <div className="bg-[var(--bg-sidebar)] rounded-2xl p-4 flex justify-between items-center border border-divider">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🌓</span>
                        <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">Dark Theme</p>
                            <p className="text-xs text-[var(--text-secondary)]">Reduce glare and eye strain</p>
                        </div>
                    </div>
                    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`w-11 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>

            <div>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-3 px-2">Wallpaper</p>
                <div className="grid grid-cols-3 gap-3">
                    {['default', 'blue', 'green', 'rose', 'slate', 'amber'].map(w => (
                        <button key={w} onClick={() => handleSaveWallpaper(w)} className={`h-20 rounded-xl border-2 transition-all ${wallpaper === w ? 'border-primary shadow-md' : 'border-transparent'}`} style={{ backgroundColor: w === 'default' ? '#efeae2' : w }}>
                            <span className="text-[10px] font-bold uppercase text-gray-500/50">{w}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-3 px-2">Chat History</p>
                <button onClick={() => showConfirm('Clear all call logs?', () => { localStorage.removeItem('callHistory'); window.location.reload(); })} className="w-full text-left bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl text-red-600 text-sm font-medium hover:bg-red-100 transition-colors">Clear Call Log</button>
            </div>
        </div>
    );

    return (
        <section className='w-full h-full font-[Inter] bg-[var(--bg-app)] flex flex-col overflow-hidden'>
            <div className='flex items-center px-4 py-5 border-b border-divider bg-[var(--bg-app)] z-10'>
                {selectedSection && (
                    <button onClick={() => setSelectedSection(null)} className="p-2 -ml-2 mr-2 text-primary hover:bg-[var(--bg-sidebar)] rounded-full transition-colors">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                )}
                <h3 className='text-xl font-semibold text-[var(--text-primary)]'>{selectedSection ? selectedSection : 'Settings'}</h3>
            </div>
            
            <div className='flex-1 overflow-y-auto custom-scrollbar px-4 py-4'>
                {!selectedSection ? (
                    <>
                        {/* Profile card */}
                        <div className="bg-[var(--bg-sidebar)] rounded-3xl p-6 mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative group/avatar">
                                    <label className="cursor-pointer">
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[var(--bg-app)] shadow-lg relative">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="" className="w-full h-full object-cover transition-opacity group-hover/avatar:opacity-75" />
                                            ) : (
                                                <div className="w-full h-full bg-primary text-white flex items-center justify-center text-2xl font-bold">{user?.name?.charAt(0) || '?'}</div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                                <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/></svg>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#00a884] border-3 border-[var(--bg-app)] rounded-full flex items-center justify-center shadow-sm">
                                            <svg viewBox="0 0 24 24" width="12" height="12" fill="white"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/></svg>
                                        </div>
                                    </label>
                                </div>
                                <div className="flex-1 min-w-0">
                                    {editingName ? (
                                        <div className="flex gap-2">
                                            <input value={nameText} onChange={e => setNameText(e.target.value)} className="flex-1 bg-[var(--bg-app)] px-3 py-1.5 rounded-lg border border-divider text-[var(--text-primary)] text-sm outline-none focus:ring-1 focus:ring-primary" maxLength={30} autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
                                            <button onClick={handleSaveName} className="text-[#00a884] font-semibold text-sm">Save</button>
                                            <button onClick={() => setEditingName(false)} className="text-gray-400 text-sm">✕</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">{user?.name || 'User'}</h2>
                                            <button onClick={() => { setNameText(user?.name || ''); setEditingName(true); }} className="text-gray-400 hover:text-primary"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/></svg></button>
                                        </div>
                                    )}
                                    <p className="text-sm text-[var(--text-secondary)]">{user?.phone || ''}</p>
                                </div>
                            </div>
                            {/* About */}
                            <div className="bg-[var(--bg-app)] rounded-2xl p-4 shadow-sm border border-divider">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold">About</p>
                                    <button onClick={() => { setAboutText(user?.about || ''); setEditingAbout(!editingAbout); }} className="text-gray-400 hover:text-primary">
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/></svg>
                                    </button>
                                </div>
                                {editingAbout ? (
                                    <div className="flex gap-2 mt-1">
                                        <input value={aboutText} onChange={e => setAboutText(e.target.value)} className="flex-1 bg-[var(--bg-sidebar)] px-3 py-1.5 rounded-lg border border-divider text-[var(--text-primary)] text-sm outline-none focus:ring-1 focus:ring-primary" maxLength={100} autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveAbout()} />
                                        <button onClick={handleSaveAbout} className="text-[#00a884] font-semibold text-sm whitespace-nowrap">Save</button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--text-primary)]">{user?.about || 'Hey there!'}</p>
                                )}
                            </div>
                        </div>

                        {/* Settings Items */}
                        <div className="space-y-1">
                            {[
                                { icon: '🔔', label: 'Notifications', desc: 'Messages, groups & calls', action: () => showAlert('Notifications enabled', 'success') },
                                { icon: '🔒', label: 'Privacy', desc: 'Block contacts, disappearing messages', action: () => showAlert('Your chats are end-to-end encrypted', 'info') },
                                { icon: '💬', label: 'Chats', desc: 'Theme, wallpapers, chat history', action: () => setSelectedSection('Chats') },
                                { icon: '🗄️', label: 'Storage and data', desc: 'Network usage, auto-download', action: () => showAlert('Storage usage: 2.4 MB', 'info') },
                                { icon: '❓', label: 'Help', desc: 'Help center, contact us, privacy policy', action: () => showAlert('ChatWeb v1.0.0 — Stable Build', 'info') },
                            ].map((item, i) => (
                                <button key={i} onClick={item.action} className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-sidebar)] rounded-2xl transition-colors text-left group">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-medium text-[var(--text-primary)]">{item.label}</p>
                                        <p className="text-[12px] text-[var(--text-secondary)] truncate">{item.desc}</p>
                                    </div>
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-gray-300"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                                </button>
                            ))}
                        </div>

                        {/* Danger zone */}
                        <div className="space-y-3 mt-6 mb-4">
                            <button onClick={handleClearAllData} className="w-full py-4 px-6 bg-amber-50 text-amber-600 rounded-2xl font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-2 text-[13px] uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                Reset Application
                            </button>
                            <button onClick={handleLogout} className="w-full py-4 px-6 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 text-[13px] uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                                Log out
                            </button>
                        </div>
                    </>
                ) : selectedSection === 'Chats' ? renderChatsSettings() : null}
            </div>
        </section>
    )
}
export default Settings
