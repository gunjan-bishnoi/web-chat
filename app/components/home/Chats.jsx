import React, { useEffect, useState } from 'react'
import { SearchSmall, DeleteIcon } from '../common/Icons'
import Image from 'next/image'

const Chats = ({ setChatPerson, messageFilter, chatList, onDeleteChat, chatService }) => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState(chatList);
  const [typingContacts, setTypingContacts] = useState(new Set());

  useEffect(() => {
    let filtered = chatList;
    if (messageFilter === "Unread") filtered = filtered.filter(e => (e.unread || 0) > 0);
    else if (messageFilter === "Archived") filtered = filtered.filter(e => e.tags?.includes("Follow up") || e.tags?.includes("Some content"));
    if (search.length > 0) filtered = filtered.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
    setData(filtered);
  }, [search, messageFilter, chatList]);

  // Subscribe to typing events
  useEffect(() => {
    if (!chatService) return;
    const unsub = chatService.on('typing', ({ name, isTyping }) => {
      setTypingContacts(prev => {
        const next = new Set(prev);
        if (isTyping) next.add(name); else next.delete(name);
        return next;
      });
    });
    return unsub;
  }, [chatService]);

  return (
    <section className='font-[Inter] flex flex-col h-full min-h-0 bg-[var(--bg-sidebar)]'>
      <div className='px-4 py-2 w-full flex shrink-0'>
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><SearchSmall /></span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search or start new chat" className='outline-none text-sm w-full bg-[var(--bg-app)] py-2 pl-10 pr-4 rounded-lg focus:ring-1 focus:ring-primary transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]' />
        </div>
      </div>
      <div className='flex flex-col flex-1 overflow-y-auto custom-scrollbar'>
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8"><p className="text-[var(--text-secondary)] text-sm">No chats found</p></div>
        ) : data.map((item, index) => {
          const isTypingNow = typingContacts.has(item.name);
          const status = chatService?.getContactStatus(item.name);
          return (
            <div key={item.name || index} onClick={() => setChatPerson(item)}
              className="w-full flex items-center px-4 py-3 hover:bg-[var(--bg-app)] transition-colors duration-200 gap-3 cursor-pointer border-b border-divider last:border-0 relative group">
              <div className="shrink-0 relative">
                {item.img ? (
                  <Image src={item.img} width={48} height={48} alt={item.name} className="rounded-full object-cover ring-2 ring-divider" />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex justify-center items-center text-lg font-semibold">{item.name.charAt(0).toUpperCase()}</div>
                )}
                {status?.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--bg-sidebar)] rounded-full"></div>}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-baseline mb-0.5'>
                  <h3 className='text-[15px] font-medium text-[var(--text-primary)] truncate pr-2'>{item.name}</h3>
                  <span className={`text-[11px] font-normal shrink-0 ${(item.unread || 0) > 0 ? 'text-primary font-semibold' : 'text-[var(--text-secondary)]'}`}>{item.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  {isTypingNow ? (
                    <p className='text-[13px] text-primary font-medium truncate leading-tight italic'>typing...</p>
                  ) : (
                    <p className='text-[13px] text-[var(--text-secondary)] truncate leading-tight'>{item.content}</p>
                  )}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {(item.unread || 0) > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{item.unread}</span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onDeleteChat(item.name); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"><DeleteIcon /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  )
}
export default Chats