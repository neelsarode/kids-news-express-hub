
import { ReaderProfile } from '@/types/ReaderProfile';
import { Session } from '@supabase/supabase-js';

export interface AuthContextType {
  currentUser: ReaderProfile | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<boolean>;
  isLoading: boolean;
  checkRoleAccess: (allowedRoles: string[]) => boolean;
  session: Session | null;
  user: { id: string } | null;
}
