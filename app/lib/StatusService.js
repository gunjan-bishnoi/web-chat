// Status service using localStorage
class StatusService {
  constructor() {
    this._listeners = {};
  }

  on(event, fn) {
    (this._listeners[event] = this._listeners[event] || []).push(fn);
    return () => { this._listeners[event] = (this._listeners[event] || []).filter(f => f !== fn); };
  }
  _emit(event, data) { (this._listeners[event] || []).forEach(fn => fn(data)); }

  // Get my statuses
  getMyStatuses() {
    try { return JSON.parse(localStorage.getItem('myStatuses')) || []; }
    catch { return []; }
  }

  // Add a new status
  addStatus(text, image = null, bgColor = '#075e54') {
    const status = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      text: text || '',
      image,
      bgColor,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      views: [],
      seenBy: [],
    };
    const statuses = this.getMyStatuses();
    statuses.unshift(status);
    localStorage.setItem('myStatuses', JSON.stringify(statuses));
    this._emit('status-added', status);
    return status;
  }

  // Delete a status
  deleteStatus(id) {
    const statuses = this.getMyStatuses().filter(s => s.id !== id);
    localStorage.setItem('myStatuses', JSON.stringify(statuses));
    this._emit('status-deleted', id);
    return statuses;
  }

  // Get mock contact statuses
  getContactStatuses() {
    try {
      const stored = JSON.parse(localStorage.getItem('contactStatuses'));
      if (stored && stored.length > 0) return stored;
    } catch {}
    // Generate mock statuses
    const mockStatuses = [
      { name: "Elmer Laverty", img: "https://xsgames.co/randomusers/assets/avatars/male/1.jpg", statuses: [
        { id: 'cs1', text: "Just finished a great workout! 💪", bgColor: '#128c7e', timestamp: Date.now() - 3600000, time: this._timeAgo(3600000) },
        { id: 'cs1b', text: "Weekend vibes 🌊", bgColor: '#25d366', timestamp: Date.now() - 7200000, time: this._timeAgo(7200000) },
      ]},
      { name: "Florencio Dorrance", img: "https://xsgames.co/randomusers/assets/avatars/female/2.jpg", statuses: [
        { id: 'cs2', text: "New project launching soon! 🚀", bgColor: '#075e54', timestamp: Date.now() - 5400000, time: this._timeAgo(5400000) },
      ]},
      { name: "Lavern Laboy", img: "https://xsgames.co/randomusers/assets/avatars/male/3.jpg", statuses: [
        { id: 'cs3', text: "Coding all night 🌙💻", bgColor: '#34b7f1', timestamp: Date.now() - 1800000, time: this._timeAgo(1800000) },
      ]},
      { name: "Titus Kitamura", img: "https://xsgames.co/randomusers/assets/avatars/female/4.jpg", statuses: [
        { id: 'cs4', text: "Coffee is life ☕", bgColor: '#e44d26', timestamp: Date.now() - 9000000, time: this._timeAgo(9000000) },
      ]},
    ];
    localStorage.setItem('contactStatuses', JSON.stringify(mockStatuses));
    return mockStatuses;
  }

  _timeAgo(ms) {
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  // Mark a contact status as viewed
  markViewed(contactName) {
    const all = this.getContactStatuses();
    const contact = all.find(c => c.name === contactName);
    if (contact) {
      contact.viewed = true;
      localStorage.setItem('contactStatuses', JSON.stringify(all));
    }
  }
}

let _instance = null;
export function getStatusService() {
  if (!_instance) _instance = new StatusService();
  return _instance;
}
export default StatusService;
