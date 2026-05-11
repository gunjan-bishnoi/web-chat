"use client"
import React, { useState } from 'react'
import { Clipboard, Downoad, Gallery, Paste, Share } from '../common/Icons'
import { Files, TeamMember } from '../common/Helper'
import Image from 'next/image'
import Link from 'next/link'
import { getChatService } from '../../lib/ChatService'
import { useAlert } from '../../context/AlertContext'

const Directory = ({ selectedMember, onSelectMember = () => {}, setIsDirectoryOpen, isFullView, chatPerson, onClearChat = () => {} }) => {
  const chatService = React.useRef(getChatService()).current;
  const { showAlert, showConfirm } = useAlert();
  const [filterApplied, setFilterApplied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  React.useEffect(() => {
    if (chatPerson?.isGroup) {
      setEditName(chatPerson.name);
    }
    setIsEditing(false);
  }, [chatPerson]);

  const handleUpdateGroup = async (newName, newImg) => {
    const updated = chatService.updateGroup(chatPerson.name, newName, newImg, chatPerson.id);
    setIsEditing(false);
  };

  const onImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateGroup(null, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getBgColour = (name) => {
    const text = name.toLowerCase();
    if (text.includes("pdf")) return "bg-red-100";
    if (text.includes("png")) return "bg-green-100";
    if (text.includes("docx")) return "bg-blue-100";
    return "bg-purple-100";
  }

  const availableContacts = chatService.getContacts().filter(c => !chatPerson?.members?.includes(c.name));

  return (
    <section className={`w-full ${isFullView ? 'h-full' : 'h-screen'} font-[Inter] bg-white relative overflow-hidden`}>
      <div className='flex justify-between px-6 py-6.25 border-b border-b-divider'>
        <h3 className=' text-xl font-semibold leading-[150%]'>
          Directory
        </h3>
      </div>
      <div className='h-[calc(100vh-105px)]  overflow-y-auto px-4 custom-scrollbar'>
        {chatPerson && (
          <div className='flex flex-col items-center py-8 border-b border-gray-100 bg-gray-50/30 rounded-2xl mb-4 mt-2'>
            <div className="relative mb-4 group">
              <div className="relative">
                {chatPerson.img ? (
                  <Image src={chatPerson.img} height={120} width={120} alt="profile" className="rounded-full shadow-lg object-cover ring-4 ring-white group-hover:ring-primary/10 transition-all duration-300" />
                ) : (
                  <div className="w-[120px] h-[120px] bg-primary/10 text-primary rounded-full flex justify-center items-center text-4xl font-bold shadow-lg ring-4 ring-white">
                    {chatPerson.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {chatPerson.isGroup && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <input type="file" className="hidden" accept="image/*" onChange={onImageChange} />
                  </label>
                )}
              </div>
              {!chatPerson.isGroup && <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>}
            </div>

            {isEditing ? (
              <div className="flex flex-col items-center gap-2 w-full px-4 animate-in fade-in zoom-in-95">
                <input 
                  autoFocus
                  type="text" 
                  className="w-full text-center font-bold text-xl bg-white border border-primary/20 rounded-xl px-2 py-1 outline-none shadow-inner"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateGroup(editName);
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                />
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1">Cancel</button>
                  <button onClick={() => handleUpdateGroup(editName)} className="text-xs font-bold text-primary hover:text-primary/80 px-3 py-1">Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/name">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{chatPerson.name}</h2>
                {chatPerson.isGroup && (
                  <button onClick={() => { setIsEditing(true); setEditName(chatPerson.name); }} className="opacity-0 group-hover/name:opacity-100 p-1 text-gray-400 hover:text-primary transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
              </div>
            )}

            <p className="text-gray-500 text-sm font-medium px-6 text-center leading-relaxed">
              {chatPerson.isGroup ? (chatPerson.members?.join(', ') || 'Group chat') : 'Online'}
            </p>

            {chatPerson.isGroup && (
              <div className="w-full mt-6 px-4">
                <div className="flex justify-between items-center mb-3 px-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Members</h4>
                  <button 
                    onClick={() => {
                      if (availableContacts.length === 0) return showAlert('All contacts are already in this group', 'info');
                      setShowAddModal(true);
                    }}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    + Add Member
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {chatPerson.members?.map(m => (
                    <div key={m} className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-50 shadow-sm group/m">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">
                          {m.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{m}</span>
                      </div>
                      <button 
                        onClick={() => {
                          showConfirm(`Remove ${m} from group?`, () => chatService.removeGroupMember(chatPerson.name, m, chatPerson.id));
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="w-full mt-8 grid grid-cols-3 gap-3 px-4">
              <button 
                className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white transition-colors"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-50 group-hover:bg-primary group-hover:text-white group-hover:shadow-md transition-all">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.27 11.4 11.4 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A15 15 0 0 1 3 6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.58 1 1 0 0 1-.27 1.02l-2.18 2.19z"/></svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-500 group-hover:text-primary transition-colors uppercase tracking-wider">Audio</span>
              </button>
              <button 
                className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white transition-colors"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-50 group-hover:bg-primary group-hover:text-white group-hover:shadow-md transition-all">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15 8l4.58-4.59A1 1 0 0 1 21 4.12v15.76a1 1 0 0 1-1.42.9l-4.58-4.59V8zM5 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-500 group-hover:text-primary transition-colors uppercase tracking-wider">Video</span>
              </button>
               <button 
                className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white transition-colors"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white group-hover:shadow-md transition-all">
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

        {/* Custom Add Member Modal */}
        {showAddModal && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[150] flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-gray-900">Add Member</h4>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar pr-1">
              {availableContacts.map(contact => (
                <div 
                  key={contact.name}
                  onClick={() => {
                    chatService.addGroupMember(chatPerson.name, contact.name, chatPerson.id);
                    setShowAddModal(false);
                    showAlert(`${contact.name} added to group`, 'success');
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 cursor-pointer transition-all group"
                >
                  <Image src={contact.img} width={40} height={40} className="rounded-full" alt={contact.name} />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.job}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    <span>Add</span>
                  </div>
                </div>
              ))}
            </div>
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
              <div key={index} onClick={() => onSelectMember(items)} className={`max-w-82.5 w-full pl-3 py-3 flex gap-4 border rounded-xl duration-300 cursor-pointer ${selectedMember?.name === items.name ? 'bg-primary/10 border-primary text-primary' : 'border-transparent hover:bg-[rgba(97,94,240,0.06)] hover:border-[rgba(0,0,0,0.1)] text-gray-900'}`} >
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
                <div key={index} className='  flex  py-3 gap-4 justify-center cursor-pointer'>
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
                    <Link href="#" download>
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