
import { supabase } from '@/integrations/supabase/client';
import { ReaderProfile } from '@/types/ReaderProfile';
import { logger } from '@/utils/logger/logger';
import { LogSource } from '@/utils/logger/types';

export async function fetchUserProfile(userId: string): Promise<ReaderProfile | null> {
  try {
    logger.info(LogSource.AUTH, 'Fetching user profile', { userId });
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error(LogSource.AUTH, 'Error fetching user profile', error);
      return null;
    }
    
    // Transform database profile to ReaderProfile format
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      email: data.email,
      role: data.role,
      bio: data.bio || '',
      avatar: data.avatar_url || '',
      joinedDate: new Date(data.created_at),
      // Handle optional fields that might not exist in the database
      badges: [], // Default to empty array if not present
      readingStreak: 0, // Default to 0 if not present
      commentCount: 0, // Default to 0 if not present
      achievements: [] // Default to empty array if not present
    } as ReaderProfile;
  } catch (e) {
    logger.error(LogSource.AUTH, 'Exception fetching user profile', e);
    return null;
  }
}

export async function checkRoleAccess(
  userProfile: ReaderProfile | null, 
  allowedRoles: string[]
): Promise<boolean> {
  if (!userProfile) return false;
  return allowedRoles.includes(userProfile.role);
}

export async function loginWithEmailPassword(
  email: string, 
  password: string
): Promise<{ session: any; error: any }> {
  try {
    logger.info(LogSource.AUTH, 'Attempting to login with email/password');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { session: data.session, error };
  } catch (error) {
    logger.error(LogSource.AUTH, 'Exception during login', error);
    return { session: null, error };
  }
}

export async function logoutUser(): Promise<{ error: any }> {
  try {
    logger.info(LogSource.AUTH, 'Attempting to log out user');
    
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    logger.error(LogSource.AUTH, 'Exception during logout', error);
    return { error };
  }
}

export async function getCurrentSession() {
  try {
    return await supabase.auth.getSession();
  } catch (error) {
    logger.error(LogSource.AUTH, 'Exception getting session', error);
    return { data: { session: null } };
  }
}
