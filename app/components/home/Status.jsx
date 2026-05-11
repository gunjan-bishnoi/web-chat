"use client"
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getStatusService } from '../../lib/StatusService'
import { getAuthService } from '../../lib/AuthService'
import { useAlert } from '../../context/AlertContext'

const BG_COLORS = ['#075e54', '#128c7e', '#25d366', '#34b7f1', '#e44d26', '#7c3aed', '#2563eb', '#dc2626', '#ea580c', '#0891b2'];

const Status = () => {
  const statusService = useRef(getStatusService()).current;
  const authService = useRef(getAuthService()).current;
  const { showAlert, showConfirm } = useAlert();
  const user = authService.getUser();

  const [myStatuses, setMyStatuses] = useState([]);
  const [contactStatuses, setContactStatuses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingStatus, setViewingStatus] = useState(null); // { type: 'my'|'contact', data, index }
  const [newStatusText, setNewStatusText] = useState('');
  const [newStatusBg, setNewStatusBg] = useState(BG_COLORS[0]);
  const [newStatusImage, setNewStatusImage] = useState(null);
  const [statusType, setStatusType] = useState('text'); // 'text' | 'image'
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);

  useEffect(() => {
    setMyStatuses(statusService.getMyStatuses());
    setContactStatuses(statusService.getContactStatuses());
    const unsub1 = statusService.on('status-added', () => setMyStatuses(statusService.getMyStatuses()));
    const unsub2 = statusService.on('status-deleted', () => setMyStatuses(statusService.getMyStatuses()));
    return () => { unsub1(); unsub2(); };
  }, [statusService]);

  // Status viewer timer
  useEffect(() => {
    if (!viewingStatus) { setProgress(0); return; }
    setProgress(0);
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;
    progressRef.current = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        clearInterval(progressRef.current);
        handleNextStatus();
      }
    }, interval);
    return () => clearInterval(progressRef.current);
  }, [viewingStatus]);

  const handleNextStatus = () => {
    if (!viewingStatus) return;
    const { type, data, index } = viewingStatus;
    if (type === 'my') {
      if (index < myStatuses.length - 1) setViewingStatus({ type: 'my', data: myStatuses[index + 1], index: index + 1 });
      else setViewingStatus(null);
    } else {
      const contact = contactStatuses.find(c => c.name === data.name);
      if (contact && index < contact.statuses.length - 1) {
        setViewingStatus({ type: 'contact', data: { ...data, ...contact.statuses[index + 1] }, index: index + 1 });
      } else setViewingStatus(null);
    }
  };

  const handlePrevStatus = () => {
    if (!viewingStatus || viewingStatus.index <= 0) return;
    const { type, data, index } = viewingStatus;
    if (type === 'my') {
      setViewingStatus({ type: 'my', data: myStatuses[index - 1], index: index - 1 });
    } else {
      const contact = contactStatuses.find(c => c.name === data.name);
      if (contact) setViewingStatus({ type: 'contact', data: { ...data, ...contact.statuses[index - 1] }, index: index - 1 });
    }
  };

  const readFileAsDataURL = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });

  const handleAddStatus = async () => {
    if (statusType === 'text' && !newStatusText.trim()) { showAlert('Enter some text', 'warning'); return; }
    if (statusType === 'image' && !newStatusImage) { showAlert('Select an image', 'warning'); return; }
    let imageData = null;
    if (newStatusImage) imageData = await readFileAsDataURL(newStatusImage);
    statusService.addStatus(newStatusText.trim(), imageData, newStatusBg);
    setNewStatusText(''); setNewStatusImage(null); setShowAddModal(false); setStatusType('text');
    showAlert('Status posted!', 'success');
  };

  const handleDeleteMyStatus = (id) => {
    showConfirm('Delete this status?', () => {
      statusService.deleteStatus(id);
      if (viewingStatus?.data?.id === id) setViewingStatus(null);
    });
  };

  const openContactStatus = (contact) => {
    statusService.markViewed(contact.name);
    setContactStatuses(statusService.getContactStatuses());
    setViewingStatus({ type: 'contact', data: { name: contact.name, img: contact.img, ...contact.statuses[0] }, index: 0 });
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today, ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const recentContacts = contactStatuses.filter(c => !c.viewed);
  const viewedContacts = contactStatuses.filter(c => c.viewed);

  return (
    <section className='w-full h-full font-[Inter] bg-white flex flex-col'>
      {/* Header */}
      <div className='flex justify-between items-center px-6 py-5 border-b border-gray-100'>
        <h3 className='text-xl font-semibold'>Status</h3>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        {/* My Status */}
        <div className='px-4 py-4'>
          <div className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors' onClick={() => myStatuses.length > 0 ? setViewingStatus({ type: 'my', data: myStatuses[0], index: 0 }) : setShowAddModal(true)}>
            <div className="relative">
              <div className={`w-14 h-14 rounded-full overflow-hidden ${myStatuses.length > 0 ? 'ring-2 ring-[#00a884] ring-offset-2' : ''}`}>
                {user?.avatar ? <img src={user.avatar} alt="My" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">{user?.name?.charAt(0) || '?'}</div>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }} className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
              </button>
            </div>
            <div className='flex-1'>
              <h4 className='text-[15px] font-semibold text-gray-900'>My Status</h4>
              <p className='text-[12px] text-gray-500'>{myStatuses.length > 0 ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''} • ${formatTime(myStatuses[0].timestamp)}` : 'Tap to add status'}</p>
            </div>
          </div>
        </div>

        {/* Recent updates */}
        {recentContacts.length > 0 && (
          <div className='px-6 py-2'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Recent updates</p>
            {recentContacts.map((contact) => (
              <div key={contact.name} onClick={() => openContactStatus(contact)} className='flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors'>
                <div className='w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#00a884] ring-offset-2'>
                  <img src={contact.img} alt={contact.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className='text-[15px] font-medium text-gray-900'>{contact.name}</h4>
                  <p className='text-[12px] text-gray-500'>{contact.statuses[0]?.time || 'Just now'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Viewed updates */}
        {viewedContacts.length > 0 && (
          <div className='px-6 py-2'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Viewed updates</p>
            {viewedContacts.map((contact) => (
              <div key={contact.name} onClick={() => openContactStatus(contact)} className='flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors'>
                <div className='w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-300 ring-offset-2 opacity-70'>
                  <img src={contact.img} alt={contact.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className='text-[15px] font-medium text-gray-600'>{contact.name}</h4>
                  <p className='text-[12px] text-gray-400'>{contact.statuses[0]?.time || 'Just now'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB to add */}
      <div className="absolute bottom-20 right-6 md:bottom-6 flex flex-col items-center gap-3 z-30">
        {isAddOpen && (
          <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
            <button
              onClick={() => { setStatusType('text'); setShowAddModal(true); setIsAddOpen(false); }}
              className="w-12 h-12 bg-white text-[#00a884] rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90 border border-gray-100"
              title="Text Status"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41L18.37 3.29a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
            </button>
            <button
              onClick={() => { setStatusType('image'); setShowAddModal(true); setIsAddOpen(false); }}
              className="w-12 h-12 bg-white text-[#00a884] rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90 border border-gray-100"
              title="Photo Status"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
            </button>
          </div>
        )}
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-90 ${isAddOpen ? 'bg-gray-800 text-white rotate-45' : 'bg-[#00a884] text-white hover:bg-[#075e54]'}`}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
        </button>
      </div>

      {/* === ADD STATUS MODAL === */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Add Status</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">✕</button>
              </div>
              {/* Type toggle */}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setStatusType('text')} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${statusType === 'text' ? 'bg-[#00a884] text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>📝 Text</button>
                <button onClick={() => setStatusType('image')} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${statusType === 'image' ? 'bg-[#00a884] text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>📷 Photo</button>
              </div>
            </div>

            <div className="p-6">
              {statusType === 'text' ? (
                <>
                  {/* Preview */}
                  <div className="rounded-2xl p-6 mb-4 min-h-[140px] flex items-center justify-center" style={{ backgroundColor: newStatusBg }}>
                    <p className="text-white text-center text-lg font-medium whitespace-pre-wrap">{newStatusText || 'Type something...'}</p>
                  </div>
                  {/* Color picker */}
                  <div className="flex gap-2 mb-4 justify-center">
                    {BG_COLORS.map(c => (
                      <button key={c} onClick={() => setNewStatusBg(c)} className={`w-7 h-7 rounded-full transition-all ${newStatusBg === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <textarea value={newStatusText} onChange={e => setNewStatusText(e.target.value)} placeholder="Type your status..." maxLength={250}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00a884]/30 focus:border-[#00a884] resize-none transition-all" rows={3} autoFocus />
                  <p className="text-right text-xs text-gray-400 mt-1">{newStatusText.length}/250</p>
                </>
              ) : (
                <>
                  {newStatusImage ? (
                    <div className="relative rounded-2xl overflow-hidden mb-4">
                      <img src={URL.createObjectURL(newStatusImage)} alt="Preview" className="w-full h-48 object-cover" />
                      <button onClick={() => setNewStatusImage(null)} className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-gray-600 shadow">✕</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors mb-4">
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                      <p className="text-sm text-gray-400">Click to select image</p>
                      <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setNewStatusImage(e.target.files[0]); }} />
                    </label>
                  )}
                  <textarea value={newStatusText} onChange={e => setNewStatusText(e.target.value)} placeholder="Add a caption (optional)..." maxLength={250}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00a884]/30 resize-none transition-all" rows={2} />
                </>
              )}
            </div>

            <div className="px-6 pb-6">
              <button onClick={handleAddStatus} className="w-full py-3 bg-[#00a884] text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-[#00a884]/20">
                Post Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === STATUS VIEWER === */}
      {viewingStatus && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col animate-fade-in">
          {/* Progress bars */}
          <div className="flex gap-1 px-3 pt-3">
            {(viewingStatus.type === 'my' ? myStatuses : contactStatuses.find(c => c.name === viewingStatus.data.name)?.statuses || []).map((_, i) => (
              <div key={i} className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: i < viewingStatus.index ? '100%' : i === viewingStatus.index ? `${progress}%` : '0%' }} />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setViewingStatus(null)} className="text-white p-1">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {viewingStatus.type === 'my' ? (
                user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-bold">{user?.name?.charAt(0)}</div>
              ) : (
                <img src={viewingStatus.data.img} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{viewingStatus.type === 'my' ? 'My Status' : viewingStatus.data.name}</p>
              <p className="text-white/50 text-xs">{formatTime(viewingStatus.data.timestamp)}</p>
            </div>
            {viewingStatus.type === 'my' && (
              <button onClick={() => handleDeleteMyStatus(viewingStatus.data.id)} className="text-white/70 hover:text-white p-2">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center relative" onClick={(e) => { const x = e.nativeEvent.offsetX; const w = e.currentTarget.offsetWidth; if (x < w / 3) handlePrevStatus(); else handleNextStatus(); }}>
            {viewingStatus.data.image ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img src={viewingStatus.data.image} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: viewingStatus.data.bgColor || '#075e54' }}>
                <p className="text-white text-2xl md:text-3xl font-medium text-center leading-relaxed max-w-lg">{viewingStatus.data.text}</p>
              </div>
            )}
          </div>

          {/* Caption if image */}
          {viewingStatus.data.image && viewingStatus.data.text && (
            <div className="px-6 py-4 bg-black/50"><p className="text-white text-center text-sm">{viewingStatus.data.text}</p></div>
          )}
        </div>
      )}
    </section>
  )
}
export default Status
