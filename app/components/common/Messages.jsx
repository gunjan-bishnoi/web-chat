import React, { useState } from 'react'
import { Add, DropDown } from './Icons'
import { ChatFilters } from './Helper'

const Messages = ({ messageFilter, setMessageFilter, onAddChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className='pt-6 pb-2 font-[Inter]'>
      <div className='w-full flex justify-between items-center px-4 md:px-6 mx-auto'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1.5 cursor-pointer relative group' onClick={() => setIsOpen(!isOpen)}>
            <h2 className='text-[22px] font-bold text-gray-900 tracking-tight'>
              Chats
            </h2>
            <div className={`transition-transform duration-300 text-gray-500 group-hover:text-primary ${isOpen ? 'rotate-180' : ''}`}>
              <DropDown />
            </div>

            {isOpen && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className='absolute top-10 left-0 bg-white border border-gray-100 shadow-xl rounded-2xl p-2 z-[60] w-48 animate-in fade-in zoom-in-95 duration-200'
              >
                  {ChatFilters.map((filter) => (
                    <p 
                      key={filter}
                      onClick={() => { setIsOpen(false); setMessageFilter(filter); }} 
                      className={`text-[14px] px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer font-medium transition-colors ${messageFilter === filter ? 'text-primary bg-primary/5' : 'text-gray-700'}`}
                    >
                      {filter}
                    </p>
                  ))}
              </div>
            )}
          </div>
          <div className='px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full'>
            12
          </div>
        </div>
        <div className='relative'>
          <button 
            onClick={() => setIsAddOpen(!isAddOpen)} 
            className='w-10 h-10 flex items-center justify-center bg-primary/5 text-primary rounded-full transition-all hover:bg-primary hover:text-white active:scale-90 shadow-sm'
          >
            <Add />
          </button>
          
          {isAddOpen && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className='absolute top-12 right-0 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 z-[60] w-72 animate-in fade-in zoom-in-95 duration-200'
              >
                  <p className='text-[10px] font-bold text-gray-400 pb-2 uppercase tracking-wider'>New Conversation</p>
                  <div className="relative mb-3">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Enter name or number..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                                onAddChat(e.target.value.trim());
                                setIsAddOpen(false);
                            }
                        }}
                      />
                  </div>
                  <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => { 
                            const val = document.querySelector('input[placeholder="Enter name or number..."]')?.value;
                            if (val) {
                                onAddChat(val);
                                setIsAddOpen(false);
                            }
                        }} 
                        className='w-full text-left text-[14px] px-3 py-2 hover:bg-primary/5 rounded-xl cursor-pointer font-semibold text-primary transition-colors flex items-center gap-3'
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Add className="w-4 h-4" />
                        </div>
                        Create Chat
                      </button>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages