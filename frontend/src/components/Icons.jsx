import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  User,
  UserPlus,
  CreditCard,
  Zap,
  AlertTriangle,
  Award,
  GraduationCap,
  Handshake,
  FileText,
  AlertCircle,
  Scale,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Menu,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  Megaphone,
  ToggleRight,
  CheckSquare,
  Pencil,
  Trash2,
  Bell,
  Upload,
  Globe,
  X,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Info,
  Shield,
  Clock,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';

export const Icon = ({ name, size = 18, className = '', color = 'currentColor', ...props }) => {
  const iconProps = { size, color, className, ...props };

  switch (name) {
    case 'dashboard':
    case 'speedometer':
    case 'gauge':
      return <LayoutDashboard {...iconProps} />;
    case 'groups':
    case 'users':
      return <Users {...iconProps} />;
    case 'members':
    case 'user-check':
      return <UserCheck {...iconProps} />;
    case 'user':
      return <User {...iconProps} />;
    case 'user-plus':
      return <UserPlus {...iconProps} />;
    case 'payments':
    case 'money':
    case 'credit-card':
      return <CreditCard {...iconProps} />;
    case 'advance':
    case 'zap':
      return <Zap {...iconProps} />;
    case 'emergency':
    case 'alert-triangle':
      return <AlertTriangle {...iconProps} />;
    case 'certificates':
    case 'award':
      return <Award {...iconProps} />;
    case 'graduation-cap':
      return <GraduationCap {...iconProps} />;
    case 'handshake':
      return <Handshake {...iconProps} />;
    case 'reports':
    case 'file-text':
      return <FileText {...iconProps} />;
    case 'disputes':
    case 'alert-circle':
      return <AlertCircle {...iconProps} />;
    case 'scale':
      return <Scale {...iconProps} />;
    case 'settings':
    case 'gear':
      return <Settings {...iconProps} />;
    case 'help':
    case 'help-circle':
      return <HelpCircle {...iconProps} />;
    case 'logout':
      return <LogOut {...iconProps} />;
    case 'search':
      return <Search {...iconProps} />;
    case 'menu':
      return <Menu {...iconProps} />;
    case 'mail':
      return <Mail {...iconProps} />;
    case 'lock':
      return <Lock {...iconProps} />;
    case 'eye':
      return <Eye {...iconProps} />;
    case 'eye-off':
      return <EyeOff {...iconProps} />;
    case 'phone':
      return <Phone {...iconProps} />;
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'megaphone':
      return <Megaphone {...iconProps} />;
    case 'toggle':
      return <ToggleRight {...iconProps} />;
    case 'check-square':
      return <CheckSquare {...iconProps} />;
    case 'edit':
    case 'pencil':
      return <Pencil {...iconProps} />;
    case 'trash':
      return <Trash2 {...iconProps} />;
    case 'bell':
      return <Bell {...iconProps} />;
    case 'upload':
      return <Upload {...iconProps} />;
    case 'globe':
      return <Globe {...iconProps} />;
    case 'close':
    case 'x':
      return <X {...iconProps} />;
    case 'plus':
      return <Plus {...iconProps} />;
    case 'minus':
      return <Minus {...iconProps} />;
    case 'check':
      return <Check {...iconProps} />;
    case 'chevron-down':
      return <ChevronDown {...iconProps} />;
    case 'chevron-up':
      return <ChevronUp {...iconProps} />;
    case 'chevron-right':
      return <ChevronRight {...iconProps} />;
    case 'chevron-left':
      return <ChevronLeft {...iconProps} />;
    case 'info':
      return <Info {...iconProps} />;
    case 'shield':
      return <Shield {...iconProps} />;
    case 'clock':
      return <Clock {...iconProps} />;
    case 'refresh':
      return <RefreshCw {...iconProps} />;
    case 'filter':
      return <Filter {...iconProps} />;
    case 'download':
      return <Download {...iconProps} />;
    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
