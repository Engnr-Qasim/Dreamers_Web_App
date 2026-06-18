import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// All credentials stored server-side as secrets
const RECIPIENT_EMAIL = "info.qasimusman.cse@gmail.com";
const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY');
const EMAILJS_SERVICE_ID = 'service_zp7hxud';
const EMAILJS_TEMPLATE_ID = 'template_9r2yb0h';

// Input validation schema
const notificationSchema = z.object({
  type: z.enum(['report', 'campaign', 'auth']),
  from_name: z.string().min(1).max(100),
  from_email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  action_type: z.string().max(50).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().max(2000).optional(),
  report_type: z.string().max(100).optional(),
  location: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  campaign_name: z.string().max(200).optional(),
  // Limit photo to ~5MB base64 (roughly 6.6MB after encoding)
  photo_base64: z.string().max(7000000).optional(),
});

type NotificationRequest = z.infer<typeof notificationSchema>;

const getCurrentDateTime = (): string => {
  return new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatReportMessage = (params: NotificationRequest): string => {
  return `
Action: Report Submitted
User: ${params.from_name}
Email: ${params.from_email || 'Not provided'}
Phone: ${params.phone || 'Not provided'}
Report Type: ${params.report_type || ''}
Location: ${params.location || ''}
Priority: ${params.priority || ''}
Date & Time: ${getCurrentDateTime()}

Description:
${params.message || ''}
${params.photo_base64 ? '\n[Photo attached]' : ''}
  `.trim();
};

const formatCampaignMessage = (params: NotificationRequest): string => {
  return `
Action: Campaign Joined
User: ${params.from_name}
Email: ${params.from_email || 'Not provided'}
Phone: ${params.phone || 'Not provided'}
Campaign: ${params.campaign_name || ''}
Location: ${params.location || 'Not provided'}
Date & Time: ${getCurrentDateTime()}
  `.trim();
};

const formatAuthMessage = (params: NotificationRequest): string => {
  return `
Action: ${params.action_type || 'Auth'}
User: ${params.from_name}
Email: ${params.from_email || 'Not provided'}
Phone: ${params.phone || 'Not provided'}
Location: ${params.location || 'Not provided'}
Date & Time: ${getCurrentDateTime()}
  `.trim();
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input with Zod
    const parseResult = notificationSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parseResult.error.errors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const params = parseResult.data;
    console.log("Received notification request:", { type: params.type, from_name: params.from_name });

    let formattedMessage: string;
    switch (params.type) {
      case 'report':
        formattedMessage = formatReportMessage(params);
        break;
      case 'campaign':
        formattedMessage = formatCampaignMessage(params);
        break;
      case 'auth':
        formattedMessage = formatAuthMessage(params);
        break;
      default:
        formattedMessage = params.message || '';
    }

    // Check if EmailJS public key is configured
    if (!EMAILJS_PUBLIC_KEY) {
      console.warn("EMAILJS_PUBLIC_KEY not configured - email will not be sent");
      return new Response(
        JSON.stringify({ success: true, warning: "Email service not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email directly from server via EmailJS API
    const emailPayload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: RECIPIENT_EMAIL,
        from_name: params.from_name,
        from_email: params.from_email || 'anonymous@dreamers.app',
        phone: params.phone || 'Not provided',
        action_type: params.action_type || params.type,
        subject: params.subject,
        message: formattedMessage,
        report_type: params.report_type || '',
        location: params.location || '',
        priority: params.priority || '',
        campaign_name: params.campaign_name || '',
        date_time: getCurrentDateTime(),
      },
    };

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("EmailJS error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully for:", params.from_name);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-notification function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
