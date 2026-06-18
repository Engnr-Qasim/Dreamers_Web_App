import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sendAuthNotification } from '@/lib/emailService';

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (name: string, email: string, password: string, phone?: string, location?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Send login notification (non-blocking)
    if (data.user) {
      const profileData = await fetchProfile(data.user.id);
      sendAuthNotification({
        from_name: profileData?.name || 'User',
        from_email: data.user.email || '',
        phone: profileData?.phone || undefined,
        action_type: 'Login',
        subject: `User Login: ${profileData?.name || 'User'}`,
        message: 'User logged in',
        location: profileData?.location || undefined,
      }).catch(console.error);
    }

    return { error: null };
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    location?: string
  ): Promise<{ error: string | null }> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          phone,
          location,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Update profile with additional info after signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name,
          phone: phone || null,
          location: location || null,
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      // Send signup notification (non-blocking)
      sendAuthNotification({
        from_name: name,
        from_email: email,
        phone,
        action_type: 'Signup',
        subject: `New User Signup: ${name}`,
        message: 'New user registered',
        location,
      }).catch(console.error);
    }

    return { error: null };
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    // Refresh profile data
    await refreshProfile();
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAuthenticated: !!session,
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
