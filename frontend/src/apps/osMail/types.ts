export interface EmailData {
  id: number;
  from: string;
  subject: string;
  preview: string;
  time: string;
  body: string;
  headers?: EmailHeaders;
  isPhishing?: boolean;
  read?: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface EmailHeaders {
  from: string;
  'reply-to'?: string;
  'return-path'?: string;
  'received'?: string[];
  'x-originating-ip'?: string;
  spf: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NONE';
  dkim: 'PASS' | 'FAIL' | 'NONE';
  dmarc?: 'PASS' | 'FAIL' | 'NONE';
}

export interface ComposeData {
  to: string;
  subject: string;
  body: string;
  isReply: boolean;
  replyTo?: EmailData;
  isForward: boolean;
  forwardFrom?: EmailData;
}

export interface PhishingIndicator {
  type: 'domain_mismatch' | 'spf_fail' | 'dkim_fail' | 'urgent_deadline' | 'suspicious_attachment' | 'reply_to_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  checkFn: (email: EmailData) => boolean;
}
