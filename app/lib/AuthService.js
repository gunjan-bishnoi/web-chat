// Simple auth service using localStorage
class AuthService {
  getUser() {
    try { return JSON.parse(localStorage.getItem('chatwebUser')); }
    catch { return null; }
  }

  isLoggedIn() {
    return !!this.getUser();
  }

  login(name, avatar) {
    const user = {
      name: name.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      phone: '+91 ' + Math.floor(7000000000 + Math.random() * 2999999999),
      about: 'Hey there! I am using ChatWeb',
      joinedAt: Date.now(),
    };
    localStorage.setItem('chatwebUser', JSON.stringify(user));
    return user;
  }

  updateProfile(updates) {
    const user = this.getUser();
    if (!user) return null;
    const updated = { ...user, ...updates };
    localStorage.setItem('chatwebUser', JSON.stringify(updated));
    return updated;
  }

  logout() {
    localStorage.removeItem('chatwebUser');
  }
}

let _instance = null;
export function getAuthService() {
  if (!_instance) _instance = new AuthService();
  return _instance;
}
export default AuthService;
