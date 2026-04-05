export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  loading: boolean;
  error: string | null;
  isFakeSite?: boolean;
  showSecurityBadge?: boolean;
}

export interface FakeSiteData {
  name: string;
  logo: string;
  fakeDomain: string;
  realDomain: string;
  fakeFields: string[];
  phishingMessage: string;
}

export interface UrlAnalysis {
  isSecure: boolean;
  isFake: boolean;
  domain: string;
  tld: string;
  subdomain: string;
  issues: UrlIssue[];
  recommendation: string;
}

export interface UrlIssue {
  type: 'typosquatting' | 'extra_subdomain' | 'suspicious_tld' | 'ip_address' | 'http_used' | 'homograph';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export type InfectionLevel = 0 | 1 | 2 | 3 | 4;

export interface InfectionEffect {
  id: string;
  level: InfectionLevel;
  type: 'tab_open' | 'popup' | 'autofill' | 'autosubmit' | 'redirect' | 'glitch';
  title: string;
  message: string;
  delay: number;
  autoAction?: {
    type: 'click' | 'type' | 'submit';
    targetSelector?: string;
    value?: string;
  };
}

export interface BrowserState {
  isInfected: boolean;
  infectionLevel: InfectionLevel;
  infectionTime: number;
  activeEffects: string[];
  cursorLag: boolean;
  isGlitching: boolean;
}
