export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified?: string;
  icon: string;
  children?: FileItem[];
  isHidden?: boolean;
  isMalicious?: boolean;
  realExtension?: string;
  displayedExtension?: string;
}

export interface MalwareIndicator {
  type: 'double_extension' | 'executable_instead_of_doc' | 'suspicious_name' | 'unusual_size' | 'no_icon_preview';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  file: FileItem;
}

export interface FileWarning {
  title: string;
  message: string;
  extension: string;
  realExtension: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
}
