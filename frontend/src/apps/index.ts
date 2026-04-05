// osMail - Email client with SPF/DKIM analysis
export { MailApp } from './osMail';
export type { EmailData, EmailHeaders, PhishingIndicator } from './osMail/types';

// osBrowser - Browser with fake site simulation and infection system
export { BrowserApp } from './osBrowser';
export type { BrowserTab, BrowserState, InfectionLevel, InfectionEffect, UrlAnalysis } from './osBrowser/types';

// osMessenger - Chat client with social engineering detection
export { MessengerApp } from './osMessenger';
export type { Message, ChatContact, SocialEngineeringIndicator } from './osMessenger/types';

// osFiles - File manager with malware detection
export { FilesApp } from './osFiles';
export type { FileItem, MalwareIndicator, FileWarning } from './osFiles/types';
