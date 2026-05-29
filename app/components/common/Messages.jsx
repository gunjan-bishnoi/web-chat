import React, { useState, useEffect } from 'react'
import { Add, DropDown } from './Icons'
import { ChatFilters } from './Helper'
import { chatService } from '../../lib/ChatService'
import Image from 'next/image'

const Messages = ({ messageFilter, setMessageFilter, onAddChat, chatCount, setActiveTab }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Group creation state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupStep, setGroupStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    setContacts(chatService.getContacts());
  }, [chatService]);

  const toggleContact = (name) => {
    if (selectedContacts.includes(name)) {
      setSelectedContacts(selectedContacts.filter(c => c !== name));
    } else {
      setSelectedContacts([...selectedContacts, name]);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    const group = chatService.createGroup(groupName.trim(), selectedContacts);
    onAddChat(group.name); // This will set the active chat to the new group
    setShowGroupModal(false);
    resetGroupState();
  };

  const resetGroupState = () => {
    setGroupStep(1);
    setGroupName('');
    setSelectedContacts([]);
  };

  return (
    <div className='pt-6 pb-2 font-[Inter]'>
      <div className='w-full flex justify-between items-center px-4 md:px-6 mx-auto'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1.5 cursor-pointer relative group'>
            <h2 className='text-[22px] font-bold text-gray-900 tracking-tight'>
              Chats
            </h2>
          </div>
          <div className='px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full'>
            {chatCount || 0}
          </div>
        </div>
        <div className='relative'>
          <button 
            onClick={() => setIsAddOpen(!isAddOpen)} 
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 shadow-sm ${isAddOpen ? 'bg-primary text-white rotate-45' : 'bg-primary/5 text-primary hover:bg-primary hover:text-white'}`}
          >
            <Add />
          </button>
          
          {isAddOpen && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className='absolute top-12 right-0 bg-white border border-gray-100 shadow-2xl rounded-2xl py-2 z-[100] w-56 animate-in fade-in zoom-in-95 duration-200 origin-top-right'
              >
                  <button 
                    onClick={() => { setIsAddOpen(false); setShowGroupModal(true); }}
                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group'
                  >
                    <div className='w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all'>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <span className='text-[15px] font-medium text-gray-700'>New Group</span>
                  </button>

                  <button 
                    onClick={() => { setIsAddOpen(false); setActiveTab(3); }}
                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group'
                  >
                    <div className='w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all'>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                    <span className='text-[15px] font-medium text-gray-700'>New Community</span>
                  </button>

                  <button 
                    onClick={() => { setIsAddOpen(false); setActiveTab(3); }}
                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group'
                  >
                    <div className='w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all'>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    </div>
                    <span className='text-[15px] font-medium text-gray-700'>New Broadcast</span>
                  </button>

                  <div className='h-[1px] bg-gray-100 my-1 mx-4'></div>

                  <div className='p-4'>
                      <p className='text-[11px] font-bold text-gray-400 pb-2 uppercase tracking-wider'>Start Individual Chat</p>
                      <div className="relative">
                          <input 
                            autoFocus
                            type="text" 
                            placeholder="Name or number..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.target.value.trim()) {
                                    onAddChat(e.target.value.trim());
                                    setIsAddOpen(false);
                                }
                            }}
                          />
                          <button 
                             onClick={() => {
                                 const val = document.querySelector('input[placeholder="Name or number..."]')?.value;
                                 if (val) {
                                     onAddChat(val);
                                     setIsAddOpen(false);
                                 }
                             }}
                             className="absolute right-1 top-1 bottom-1 px-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all"
                          >
                            GO
                          </button>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* New Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[85vh]">
            <div className="bg-primary p-6 text-white shrink-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xl font-bold">New Group</h3>
                <button onClick={() => { setShowGroupModal(false); resetGroupState(); }} className="text-white/80 hover:text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-white/70 text-sm">
                {groupStep === 1 ? 'Add participants' : 'Create group'}
              </p>
            </div>

            {groupStep === 1 ? (
              <>
                <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-wrap gap-2 min-h-[56px]">
                  {selectedContacts.length > 0 ? (
                    selectedContacts.map(name => (
                      <div key={name} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold animate-in zoom-in-95">
                        {name}
                        <button onClick={() => toggleContact(name)}><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic ml-1">No participants selected</p>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {contacts.map(contact => (
                    <div 
                      key={contact.name} 
                      onClick={() => toggleContact(contact.name)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedContacts.includes(contact.name) ? 'bg-primary/5 border-primary/20' : 'hover:bg-gray-50 border-transparent'} border`}
                    >
                      <div className="relative">
                        <Image src={contact.img} width={44} height={44} className="rounded-full" alt={contact.name} />
                        {selectedContacts.includes(contact.name) && (
                          <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-white">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.job}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                  <button 
                    disabled={selectedContacts.length === 0}
                    onClick={() => setGroupStep(2)}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 flex flex-col gap-6 animate-in slide-in-from-right-8 duration-300">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div className="w-full">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Group Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Enter group name..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary/30 focus:bg-white transition-all text-[15px]"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Participants ({selectedContacts.length})</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedContacts.join(', ')}
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => setGroupStep(1)}
                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim()}
                    className="flex-2 py-3 px-8 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages