import { UserProfile } from '../types/game';

export function getAllStoredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  const users: UserProfile[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('kollywood_user_')) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          users.push(JSON.parse(raw) as UserProfile);
        }
      } catch {
        // ignore
      }
    }
  }

  // Also include current guest if not in list
  const currentGuest = localStorage.getItem('kollywood_current_guest');
  if (currentGuest) {
    try {
      const guest = JSON.parse(currentGuest);
      if (!users.some(u => u.uid === guest.uid)) {
        users.push({
          uid: guest.uid,
          displayName: guest.displayName,
          photoURL: guest.photoURL,
          totalGamesPlayed: 0,
          totalScore: 0,
          bestStreak: 0,
          soloHighScore: 0,
          wins: 0,
          isGuest: true
        });
      }
    } catch {
      // ignore
    }
  }

  // Sort by score descending
  return users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
}

export function deleteStoredUser(uid: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`kollywood_user_${uid}`);
  const currentGuest = localStorage.getItem('kollywood_current_guest');
  if (currentGuest) {
    try {
      const guest = JSON.parse(currentGuest);
      if (guest.uid === uid) {
        localStorage.removeItem('kollywood_current_guest');
      }
    } catch {
      // ignore
    }
  }
}

export function resetUserStats(uid: string): void {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(`kollywood_user_${uid}`);
  if (raw) {
    try {
      const user = JSON.parse(raw) as UserProfile;
      user.totalScore = 0;
      user.totalGamesPlayed = 0;
      user.bestStreak = 0;
      user.wins = 0;
      localStorage.setItem(`kollywood_user_${uid}`, JSON.stringify(user));
    } catch {
      // ignore
    }
  }
}
