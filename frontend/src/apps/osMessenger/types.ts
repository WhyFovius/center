export interface Message {
  id: number;
  text: string;
  fromMe: boolean;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  file?: string;
  type?: 'text' | 'voice' | 'file' | 'system';
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastMsg: string;
  time: string;
  isAI: boolean;
  isVerified?: boolean;
  verifiedChannel?: 'phone' | 'video' | 'telegram';
  systemPrompt: string;
  personality: string;
  messages: Message[];
  taskIds?: string[];
  isCompromised?: boolean;
  isDeepfake?: boolean;
  urgencyLevel?: 'normal' | 'high' | 'critical';
}

export interface SocialEngineeringIndicator {
  type: 'urgency' | 'authority' | 'fear' | 'trust_exploitation' | 'help_request' | 'money_request' | 'otp_request';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  redFlag: string;
}

export interface VerificationRequest {
  type: 'call' | 'video' | 'alt_channel';
  reason: string;
  suggestedScript: string;
}
