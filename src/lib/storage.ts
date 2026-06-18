// Supabase-based storage utilities
import { supabase } from '@/integrations/supabase/client';

export interface Report {
  id: string;
  user_id: string;
  issue_type: string;
  location: string;
  photo_url: string | null;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  status: 'pending' | 'in-progress' | 'resolved';
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  participants: number;
  category: 'environment' | 'community' | 'awareness';
}

// Theme functions (still using localStorage as it's non-sensitive UI preference)
const THEME_KEY = 'dreamers_theme';

export const saveTheme = (theme: 'light' | 'dark'): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getTheme = (): 'light' | 'dark' => {
  const theme = localStorage.getItem(THEME_KEY);
  return (theme as 'light' | 'dark') || 'light';
};

// Report functions using Supabase
export const saveReport = async (report: Omit<Report, 'id' | 'created_at' | 'status'>): Promise<Report | null> => {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: report.user_id,
      issue_type: report.issue_type,
      location: report.location,
      photo_url: report.photo_url,
      description: report.description,
      priority: report.priority,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving report:', error);
    return null;
  }

  return data as Report;
};

export const getReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return data as Report[];
};

export const getUserReports = async (userId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }

  return data as Report[];
};

// Campaign membership functions using Supabase
export const joinCampaign = async (userId: string, campaignId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('campaign_memberships')
    .insert({
      user_id: userId,
      campaign_id: campaignId,
    });

  if (error) {
    // Ignore duplicate key error (user already joined)
    if (error.code === '23505') {
      return true;
    }
    console.error('Error joining campaign:', error);
    return false;
  }

  return true;
};

export const leaveCampaign = async (userId: string, campaignId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('campaign_memberships')
    .delete()
    .eq('user_id', userId)
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('Error leaving campaign:', error);
    return false;
  }

  return true;
};

export const getUserCampaigns = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('campaign_memberships')
    .select('campaign_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user campaigns:', error);
    return [];
  }

  return data.map(item => item.campaign_id);
};

export const isJoinedCampaign = async (userId: string, campaignId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('campaign_memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
};

// Generate unique ID (for client-side use only)
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Legacy User type for backwards compatibility during migration
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  joinedCampaigns: string[];
  submittedReports: number;
  createdAt: string;
}
