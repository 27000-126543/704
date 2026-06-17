import { create } from 'zustand';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../utils/mockData';

interface UserState {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: MOCK_USERS[1],
  users: MOCK_USERS,
  setCurrentUser: (user) => set({ currentUser: user }),
  getUserById: (id) => get().users.find((u) => u.id === id),
  getUsersByRole: (role) => get().users.filter((u) => u.role === role),
}));
