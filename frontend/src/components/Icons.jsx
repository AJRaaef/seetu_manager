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
    default:
      return null;
  }
};

export default Icon;
