// Email service - sends emails via server-side edge function
import { supabase } from "@/integrations/supabase/client";

interface EmailParams {
  from_name: string;
  from_email: string;
  phone?: string;
  action_type: 'Report' | 'Campaign' | 'Login' | 'Signup';
  subject: string;
  message: string;
  report_type?: string;
  location?: string;
  priority?: string;
  campaign_name?: string;
  photo_base64?: string;
}

const sendEmailViaEdgeFunction = async (
  type: 'report' | 'campaign' | 'auth',
  params: EmailParams
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        type,
        from_name: params.from_name,
        from_email: params.from_email || '',
        phone: params.phone,
        action_type: params.action_type,
        subject: params.subject,
        message: params.message,
        report_type: params.report_type,
        location: params.location,
        priority: params.priority,
        campaign_name: params.campaign_name,
        photo_base64: params.photo_base64,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      return false;
    }

    return data?.success === true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendReportEmail = async (params: EmailParams): Promise<boolean> => {
  return sendEmailViaEdgeFunction('report', params);
};

export const sendCampaignJoinNotification = async (params: EmailParams): Promise<boolean> => {
  return sendEmailViaEdgeFunction('campaign', params);
};

export const sendAuthNotification = async (params: EmailParams): Promise<boolean> => {
  return sendEmailViaEdgeFunction('auth', params);
};
