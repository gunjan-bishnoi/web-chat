// Mock Chat Engine - No backend needed
const REPLIES = {
  greeting: ["Hey! How's it going? 😊","Hi there! What's up? 👋","Hello! Nice to hear from you!","Hey! How are you? 🙂"],
  question: ["That's a great question! 🤔","Hmm, I'd say yes!","I'm not sure, let me think...","Good question! I think so","Yeah, definitely!"],
  farewell: ["Bye! Talk later! 👋","See you! Take care! 😊","Good night! 🌙","Catch you later! ✌️"],
  thanks: ["You're welcome! 😊","No problem!","Anytime! 👍","Happy to help! 🙂"],
  laugh: ["😂😂","Haha right?!","So funny! 😆","🤣🤣🤣"],
  short: ["👍","Got it!","Sure!","Ok 😊","Alright!","Cool"],
  image: ["Nice pic! 📸","Wow, looks great! 😍","Love this! ❤️","Cool photo!","Awesome! 🔥"],
  general: [
    "That's interesting! Tell me more 😊","I totally agree!","Yeah, I was thinking the same!",
    "Oh really? That's cool!","Sounds good! 👍","I'll check and let you know",
    "That makes sense","You're right about that","Haha, nice one! 😄",
    "No way! 😮","Absolutely! 💯","I hear you!","For real though 😄",
    "That's a good point","Interesting perspective 🤔","Yeah for sure!",
  ]
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateReply(text, hasImage, hasAudio) {
  if (hasAudio) return pick(["Nice voice! 🎤", "Got your voice message!", "Sounds good! 😊", "I'll listen to this in a bit"]);
  if (hasImage) return pick(REPLIES.image);
  const msg = (text || '').toLowerCase().trim();
  if (/^(hi|hello|hey|hii+|yo|sup)\b/.test(msg)) return pick(REPLIES.greeting);
  if (/^(bye|goodbye|good night|gn|ttyl|cya)\b/.test(msg)) return pick(REPLIES.farewell);
  if (/\?\s*$/.test(msg)) return pick(REPLIES.question);
  if (/^(thanks|thank you|thx|ty)\b/.test(msg)) return pick(REPLIES.thanks);
  if (/^(lol|haha|😂|🤣)/.test(msg)) return pick(REPLIES.laugh);
  if (msg.length < 5) return pick(REPLIES.short);
  return pick(REPLIES.general);
}

class ChatService {
  constructor() {
    this._listeners = {};
    this._typingTimers = {};
    this._readTimers = {};
    this._contactStatus = new Map();
  }

  // --- Event System ---
  on(event, fn) {
    (this._listeners[event] = this._listeners[event] || []).push(fn);
    return () => { this._listeners[event] = (this._listeners[event] || []).filter(f => f !== fn); };
  }
  _emit(event, data) { (this._listeners[event] || []).forEach(fn => fn(data)); }

  // --- ID & Time ---
  _id() { return `m_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
  _time() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  // --- Contact Status ---
  initContactStatus(name) {
    if (!this._contactStatus.has(name)) {
      this._contactStatus.set(name, {
        isOnline: true,
        isTyping: false,
        lastSeen: new Date(),
      });
    }
  }

  getContactStatus(name) {
    this.initContactStatus(name);
    return this._contactStatus.get(name);
  }

  // --- Chat List CRUD ---
  getChats() {
    try { 
      const stored = localStorage.getItem('chatList');
      if (!stored) return [];
      const chats = JSON.parse(stored);
      // Auto-assign IDs to legacy groups if missing
      let changed = false;
      chats.forEach(c => {
        if (c.isGroup && !c.id) {
          c.id = `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          changed = true;
        }
      });
      if (changed) localStorage.setItem('chatList', JSON.stringify(chats));
      return chats;
    }
    catch { return []; }
  }

  _saveChats(chats) {
    localStorage.setItem('chatList', JSON.stringify(chats));
    this._emit('chats-updated', chats);
  }

  addChat(contact) {
    const chats = this.getChats();
    if (chats.find(c => c.name === contact.name)) return chats;
    chats.unshift({ ...contact, unread: 0 });
    this._saveChats(chats);
    this.initContactStatus(contact.name);
    return chats;
  }

  deleteChat(name) {
    localStorage.removeItem(`chat_${name}`);
    this._saveChats(this.getChats().filter(c => c.name !== name));
    this._emit('chat-deleted', { name });
  }

  clearChat(name) {
    localStorage.removeItem(`chat_${name}`);
    this._updatePreview(name, 'Chat cleared', '', 0);
    this._emit('chat-cleared', { name });
  }

  _updatePreview(name, content, time, unreadDelta) {
    const chats = this.getChats();
    const idx = chats.findIndex(c => c.name === name);
    if (idx === -1) return;
    chats[idx].content = content;
    if (time) chats[idx].time = time;
    if (typeof unreadDelta === 'number') {
      chats[idx].unread = Math.max(0, (chats[idx].unread || 0) + unreadDelta);
    }
    // Move to top
    const [chat] = chats.splice(idx, 1);
    chats.unshift(chat);
    this._saveChats(chats);
  }

  markChatRead(name) {
    const chats = this.getChats();
    const idx = chats.findIndex(c => c.name === name);
    if (idx !== -1 && chats[idx].unread > 0) {
      chats[idx].unread = 0;
      this._saveChats(chats);
    }
  }

  // --- Call History ---
  getCalls() {
    try { return JSON.parse(localStorage.getItem('callHistory')) || []; }
    catch { return []; }
  }

  _saveCalls(calls) {
    localStorage.setItem('callHistory', JSON.stringify(calls));
    this._emit('calls-updated', calls);
  }

  addCall(name, img, type = 'outgoing') {
    const calls = this.getCalls();
    const newCall = {
      id: this._id(),
      name,
      img,
      type, // 'incoming' or 'outgoing'
      time: this._time(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: Date.now()
    };
    calls.unshift(newCall);
    const updated = calls.slice(0, 50);
    this._saveCalls(updated);
    return updated;
  }

  clearCalls() {
    this._saveCalls([]);
    this._emit('calls-cleared');
  }

  // --- Scheduled Calls ---
  getScheduledCalls() {
    try { return JSON.parse(localStorage.getItem('scheduledCalls')) || []; }
    catch { return []; }
  }

  _saveScheduledCalls(calls) {
    localStorage.setItem('scheduledCalls', JSON.stringify(calls));
    this._emit('scheduled-calls-updated', calls);
  }

  scheduleCall(name, img, date, time, subject) {
    const calls = this.getScheduledCalls();
    const newCall = { id: `sc_${Date.now()}`, name, img, date, time, subject, timestamp: new Date(`${date} ${time}`).getTime() };
    calls.push(newCall);
    calls.sort((a,b) => a.timestamp - b.timestamp);
    this._saveScheduledCalls(calls);
    return calls;
  }

  deleteScheduledCall(id) {
    const calls = this.getScheduledCalls().filter(c => c.id !== id);
    this._saveScheduledCalls(calls);
    return calls;
  }

  // --- Contacts ---
  getContacts() {
    return [
      { name: "John Doe", img: "https://i.pravatar.cc/150?u=john", job: "Product Designer" },
      { name: "Jane Smith", img: "https://i.pravatar.cc/150?u=jane", job: "Software Engineer" },
      { name: "Mike Johnson", img: "https://i.pravatar.cc/150?u=mike", job: "Marketing Lead" },
      { name: "Sarah Williams", img: "https://i.pravatar.cc/150?u=sarah", job: "UX Researcher" },
      { name: "Alex Brown", img: "https://i.pravatar.cc/150?u=alex", job: "Data Scientist" },
      { name: "Emily Davis", img: "https://i.pravatar.cc/150?u=emily", job: "CTO" }
    ];
  }

  // --- Group Creation ---
  createGroup(groupName, memberNames, groupImg = "") {
    const chats = this.getChats();
    const groupChat = {
      id: `g_${Date.now()}`,
      name: groupName,
      img: groupImg || "https://cdn-icons-png.flaticon.com/512/166/166258.png",
      time: this._time(),
      content: `You created the group "${groupName}"`,
      tags: ["Group"],
      unread: 0,
      isGroup: true,
      members: memberNames
    };
    chats.unshift(groupChat);
    this._saveChats(chats);
    
    // Initial system message
    const msgs = [];
    msgs.push({
      id: this._id(),
      text: `Welcome to ${groupName}!`,
      sender: "system",
      time: this._time(),
      timestamp: Date.now()
    });
    this._saveMessages(groupName, msgs);
    
    return groupChat;
  }

  updateGroup(oldName, newName, newImg, id = null) {
    const chats = this.getChats();
    // Try to find by ID first, then by name
    let idx = -1;
    if (id) idx = chats.findIndex(c => c.id === id);
    if (idx === -1) idx = chats.findIndex(c => c.name === oldName);

    if (idx !== -1) {
      if (newName) chats[idx].name = newName;
      if (newImg) chats[idx].img = newImg;
      this._saveChats(chats);
      this._emit('group-updated', { ...chats[idx], members: [...(chats[idx].members || [])] });
    }
    return chats[idx];
  }

  addGroupMember(groupName, memberName, id = null) {
    const chats = this.getChats();
    let idx = -1;
    if (id) idx = chats.findIndex(c => c.id === id);
    if (idx === -1) idx = chats.findIndex(c => c.name === groupName);

    if (idx !== -1 && chats[idx].isGroup) {
      if (!chats[idx].members.includes(memberName)) {
        chats[idx].members.push(memberName);
        this._saveChats(chats);
        this._emit('group-updated', { ...chats[idx], members: [...(chats[idx].members || [])] });
      }
    }
    return chats[idx];
  }

  removeGroupMember(groupName, memberName, id = null) {
    const chats = this.getChats();
    let idx = -1;
    if (id) idx = chats.findIndex(c => c.id === id);
    if (idx === -1) idx = chats.findIndex(c => c.name === groupName);

    if (idx !== -1 && chats[idx].isGroup) {
      chats[idx].members = chats[idx].members.filter(m => m !== memberName);
      this._saveChats(chats);
      this._emit('group-updated', { ...chats[idx], members: [...(chats[idx].members || [])] });
    }
    return chats[idx];
  }

  // --- Messages CRUD ---
  getMessages(name) {
    try { return JSON.parse(localStorage.getItem(`chat_${name}`)) || []; }
    catch { return []; }
  }

  _saveMessages(name, msgs) {
    localStorage.setItem(`chat_${name}`, JSON.stringify(msgs));
  }

  sendMessage(name, text, image = null, audio = null, replyTo = null) {
    const msg = {
      id: this._id(), text: text || '', image, audio, sender: 'me',
      time: this._time(), timestamp: Date.now(),
      status: 'sent', isEdited: false, replyTo, reactions: [],
    };
    const msgs = this.getMessages(name);
    msgs.push(msg);
    this._saveMessages(name, msgs);
    let preview = text;
    if (image) preview = '📷 Photo';
    if (audio) preview = '🎤 Voice message';
    this._updatePreview(name, preview, msg.time, 0);
    this._emit('message-sent', { name, message: msg });

    // Delivery after 500-1500ms
    setTimeout(() => {
      this._setMsgStatus(name, msg.id, 'delivered');
    }, 500 + Math.random() * 1000);

    // Auto reply
    this._simulateReply(name, text, image, audio);
    return msg;
  }

  editMessage(name, msgId, newText) {
    const msgs = this.getMessages(name);
    const m = msgs.find(x => x.id === msgId);
    if (m) { m.text = newText; m.isEdited = true; }
    this._saveMessages(name, msgs);
    this._emit('message-edited', { name, msgId });
    return msgs;
  }

  addReaction(name, msgId, emoji) {
    console.log('addReaction called:', { name, msgId, emoji });
    const msgs = this.getMessages(name);
    const m = msgs.find(x => x.id === msgId);
    if (m) {
      if (!m.reactions) m.reactions = [];
      const existing = m.reactions.find(r => r.emoji === emoji);
      if (existing) {
        // If I already reacted with this emoji, remove it? (Toggle behavior)
        // For simplicity, let's just add it or increment count if multiple people (mock)
        // In a real app, we'd track WHO reacted.
        m.reactions = m.reactions.filter(r => r.emoji !== emoji);
      } else {
        m.reactions.push({ emoji, count: 1 });
      }
      this._saveMessages(name, msgs);
      this._emit('message-reacted', { name, msgId, reactions: m.reactions });
    }
    return msgs;
  }

  deleteMessage(name, msgId) {
    const msgs = this.getMessages(name).filter(m => m.id !== msgId);
    this._saveMessages(name, msgs);
    const last = msgs[msgs.length - 1];
    let preview = 'No messages yet';
    if (last) {
      preview = last.text;
      if (last.image) preview = '📷 Photo';
      if (last.audio) preview = '🎤 Voice message';
    }
    this._updatePreview(name, preview, last?.time || '', 0);
    this._emit('message-deleted', { name, msgId });
    return msgs;
  }

  _setMsgStatus(name, msgId, status) {
    const msgs = this.getMessages(name);
    const m = msgs.find(x => x.id === msgId);
    if (m && m.sender === 'me') { m.status = status; this._saveMessages(name, msgs); }
    this._emit('status-changed', { name, msgId, status });
  }

  _markAllRead(name) {
    const msgs = this.getMessages(name);
    let changed = false;
    msgs.forEach(m => { if (m.sender === 'me' && m.status !== 'read') { m.status = 'read'; changed = true; } });
    if (changed) { this._saveMessages(name, msgs); this._emit('status-changed', { name }); }
  }

  // --- Auto Reply Engine ---
  _simulateReply(name, userText, userImage, userAudio) {
    clearTimeout(this._typingTimers[name]);
    clearTimeout(this._readTimers[name]);

    const status = this.getContactStatus(name);
    if (!status.isOnline) return;

    const startDelay = 500 + Math.random() * 1000;
    const typeDuration = 1000 + Math.random() * 1500;

    this._typingTimers[name] = setTimeout(() => {
      // Mark user messages as read
      this._markAllRead(name);

      // Start typing
      status.isTyping = true;
      this._emit('typing', { name, isTyping: true });

      this._readTimers[name] = setTimeout(() => {
        status.isTyping = false;
        this._emit('typing', { name, isTyping: false });

        const reply = {
          id: this._id(), text: generateReply(userText, !!userImage, !!userAudio),
          image: null, audio: null, sender: name, time: this._time(),
          timestamp: Date.now(), status: 'read', isEdited: false, replyTo: null,
        };
        const msgs = this.getMessages(name);
        msgs.push(reply);
        this._saveMessages(name, msgs);
        this._updatePreview(name, reply.text, reply.time, 1);
        this._emit('message-received', { name, message: reply });
      }, typeDuration);
    }, startDelay);
  }

  destroy() {
    Object.values(this._typingTimers).forEach(clearTimeout);
    Object.values(this._readTimers).forEach(clearTimeout);
  }
}

// Singleton Instance
export const chatService = new ChatService();
export const getChatService = () => chatService;
export default chatService;
