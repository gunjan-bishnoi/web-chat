"use client"
import React from 'react'
import Image from 'next/image'
import { getChatService } from '../../lib/ChatService'
import { useAlert } from '../../context/AlertContext'

const Calls = ({ setChatPerson, onStartCall, setActiveTab }) => {
    const chatService = React.useRef(getChatService()).current;
    const { showAlert, showConfirm } = useAlert();
    const [callHistory, setCallHistory] = React.useState([]);
    const [scheduledCalls, setScheduledCalls] = React.useState([]);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [activeView, setActiveView] = React.useState('all'); // 'all' | 'scheduled'
    const [showScheduleModal, setShowScheduleModal] = React.useState(false);

    // Form state for scheduling
    const [scheduleForm, setScheduleForm] = React.useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        subject: ''
    });

    React.useEffect(() => {
        setCallHistory(chatService.getCalls());
        setScheduledCalls(chatService.getScheduledCalls());

        const unsubs = [
            chatService.on('calls-updated', (calls) => setCallHistory(calls)),
            chatService.on('scheduled-calls-updated', (calls) => setScheduledCalls(calls)),
            chatService.on('calls-cleared', () => setCallHistory([]))
        ];
        return () => unsubs.forEach(unsub => unsub());
    }, [chatService]);

    const handleCallAgain = (call) => {
        const contact = { name: call.name, img: call.img, time: "Just now", content: "Start a conversation", tags: ["New"], unread: 0 };
        chatService.addChat(contact);
        setChatPerson(contact);
        onStartCall(contact);
    };

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        if (!scheduleForm.name || !scheduleForm.date || !scheduleForm.time) {
            showAlert('Please fill in all required fields', 'warning');
            return;
        }
        chatService.scheduleCall(
            scheduleForm.name,
            "", // default empty img
            scheduleForm.date,
            scheduleForm.time,
            scheduleForm.subject || 'Voice Call'
        );
        setShowScheduleModal(false);
        setScheduleForm({ name: '', date: new Date().toISOString().split('T')[0], time: '10:00', subject: '' });
        showAlert('Call scheduled successfully!', 'success');
        setActiveView('scheduled');
    };

    const handleDeleteScheduled = (id) => {
        showConfirm('Cancel this scheduled call?', () => {
            chatService.deleteScheduledCall(id);
        });
    };

    return (
        <div className="flex flex-col h-full bg-white font-[Inter] relative overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Calls</h2>
                    <div className="relative">
                        <button
                            className={`p-2.5 rounded-full transition-all active:scale-90 shadow-sm ${isAddOpen ? 'bg-primary text-white rotate-45' : 'bg-primary/5 text-primary hover:bg-primary hover:text-white'}`}
                            onClick={() => setIsAddOpen(!isAddOpen)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>

                        {isAddOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className='absolute top-12 right-0 bg-white border border-gray-100 shadow-2xl rounded-2xl py-2 z-[100] w-56 animate-in fade-in zoom-in-95 duration-200 origin-top-right'
                            >
                                <button
                                    onClick={() => { setIsAddOpen(false); setShowScheduleModal(true); }}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group'
                                >
                                    <div className='w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all'>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span className='text-[15px] font-medium text-gray-700'>Schedule Call</span>
                                </button>

                                <button
                                    onClick={() => { setIsAddOpen(false); setActiveTab(4); }}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group'
                                >
                                    <div className='w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-gray-600 group-hover:text-white transition-all'>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <span className='text-[15px] font-medium text-gray-700'>Settings</span>
                                </button>

                                <div className='h-[1px] bg-gray-100 my-1 mx-4'></div>

                                <button
                                    onClick={() => { setIsAddOpen(false); showConfirm('Clear all call logs?', () => chatService.clearCalls()); }}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left group'
                                >
                                    <div className='w-9 h-9 bg-red-50 rounded-full flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all'>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </div>
                                    <span className='text-[15px] font-medium text-red-600'>Clear Call Logs</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveView('all')}
                        className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeView === 'all' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setActiveView('scheduled')}
                        className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeView === 'scheduled' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Scheduled {scheduledCalls.length > 0 && <span className="ml-1 bg-primary/10 px-1.5 py-0.5 rounded-full text-[10px]">{scheduledCalls.length}</span>}
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeView === 'all' ? (
                    callHistory.length > 0 ? (
                        callHistory.map((call, index) => (
                            <div key={call.id || index} className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-all border-b border-gray-50 group">
                                <div className="relative shrink-0">
                                    {call.img ? (
                                        <Image src={call.img} alt={call.name} width={48} height={48} className="rounded-full object-cover shadow-sm" />
                                    ) : (
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex justify-center items-center text-lg font-bold">
                                            {call.name?.charAt(0) || "?"}
                                        </div>
                                    )}
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${call.type === 'outgoing' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{call.name}</h3>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <span className={call.type === 'incoming' ? 'text-green-500' : 'text-primary'}>
                                            {call.type === 'incoming' ? (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 17l-4 4m0 0l-4-4m4 4V3" /></svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7l4-4m0 0l4 4m-4-4v18" /></svg>
                                            )}
                                        </span>
                                        <span className="capitalize">{call.type}</span>
                                        <span className="mx-0.5 opacity-30">•</span>
                                        <span>{call.date}, {call.time}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleCallAgain(call)} className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-all opacity-0 group-hover:opacity-100 active:scale-90">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-60">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">No calls yet</h3>
                            <p className="text-gray-500 max-w-xs mt-1">Recent calls will show up here.</p>
                        </div>
                    )
                ) : (
                    scheduledCalls.length > 0 ? (
                        scheduledCalls.map((call) => (
                            <div key={call.id} className="p-4 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-4 transition-all group">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex justify-center items-center text-lg font-bold shrink-0">
                                    {call.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{call.name}</h3>
                                    <p className="text-sm text-gray-500 truncate">{call.subject}</p>
                                    <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/5 w-fit px-2 py-0.5 rounded-md">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(call.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} @ {call.time}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteScheduled(call.id)}
                                    className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-60">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4 text-orange-200">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">No scheduled calls</h3>
                            <p className="text-gray-500 max-w-xs mt-1">Plan your future conversations. They will appear here.</p>
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="mt-6 px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
                            >
                                Schedule Now
                            </button>
                        </div>
                    )
                )}
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-primary p-6 text-white">
                            <h3 className="text-xl font-bold">Schedule a Call</h3>
                            <p className="text-white/70 text-sm">Plan your next voice conversation</p>
                        </div>
                        <form onSubmit={handleScheduleSubmit} className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Contact Name</label>
                                <input
                                    type="text" required
                                    placeholder="Who are you calling?"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary/30 focus:bg-white transition-all text-sm"
                                    value={scheduleForm.name}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date</label>
                                    <input
                                        type="date" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary/30 focus:bg-white transition-all text-sm"
                                        value={scheduleForm.date}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Time</label>
                                    <input
                                        type="time" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary/30 focus:bg-white transition-all text-sm"
                                        value={scheduleForm.time}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Subject (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="What is the call about?"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary/30 focus:bg-white transition-all text-sm"
                                    value={scheduleForm.subject}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowScheduleModal(false)}
                                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
                                >
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calls;
