import React, { useEffect, useState } from 'react'
import { StatusIcon, SearchSmall, DeleteIcon } from '../common/Icons'
import Image from 'next/image'

const Chats = ({ setChatPerson, messageFilter, chatList, onDeleteChat }) => {
  const [active, setActive] = useState("");
  const [data, setData] = useState(chatList)
  
  useEffect(() => {
    let filteredData = chatList;

    // Apply category filter mock logic
    if (messageFilter === "Unread") {
      filteredData = filteredData.filter(e => e.tags.includes("Question") || e.tags.includes("Bug") || e.tags.includes("Help wanted"));
    } else if (messageFilter === "Archived") {
      filteredData = filteredData.filter(e => e.tags.includes("Some content") || e.tags.includes("Follow up"));
    }

    const search = active.toLowerCase();
    if (search.length > 0) {
      filteredData = filteredData.filter((e) =>
        e.name.toLowerCase().includes(search)
      );
    }
    
    setData(filteredData);
  }, [active, messageFilter, chatList])
  return (
    <section className='font-[Inter] flex flex-col h-full min-h-0 bg-white'>
      <div className='px-4 py-3 flex shrink-0 items-center justify-between border-b border-gray-100'>
         <h1 className="text-xl font-bold text-gray-800">Chats</h1>
         <button onClick={() => alert("Status/Stories feature coming soon!")} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <StatusIcon />
         </button>
      </div>
      <div className='px-4 py-2 w-full flex shrink-0'>
        <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <SearchSmall />
            </span>
            <input 
                value={active} 
                onChange={(e) => setActive(e.target.value)} 
                type="text" 
                placeholder="Search or start new chat" 
                className='outline-none text-sm w-full bg-[#f0f2f5] py-2 pl-10 pr-4 rounded-lg focus:bg-white focus:ring-1 focus:ring-primary transition-all' 
            />
        </div>
      </div>
      <div className='flex flex-col flex-1 overflow-y-auto mt-1 custom-scrollbar'>
        {data.map((items, index) => (
          <div 
            key={index} 
            onClick={() => setChatPerson(items)} 
            className={`w-full flex items-center px-4 py-3 hover:bg-[#f5f6f6] transition-colors duration-200 gap-3 cursor-pointer border-b border-gray-50 last:border-0 relative group`}
          >
            <div className="shrink-0 relative">
              {items.img ? (
                <Image src={items.img} width={48} height={48} alt={items.name} className="rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex justify-center items-center text-lg font-semibold">
                  {items.name.charAt(0).toUpperCase()}
                </div>
              )}
              {index % 3 === 0 && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex justify-between items-baseline mb-0.5'>
                <h3 className='text-[15px] font-medium text-gray-900 truncate pr-2'>
                  {items.name}
                </h3>
                <span className='text-[11px] text-gray-500 font-normal'>
                  {items.time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className='text-[13px] text-gray-500 truncate leading-tight'>
                  {items.content}
                </p>
                <div className="flex items-center gap-2">
                    {index === 0 && <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">2</span>}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(items.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                        <DeleteIcon />
                    </button>
                </div>
              </div>
            </div>
          </div>))}
      </div>
    </section>
  )
}
export default Chats