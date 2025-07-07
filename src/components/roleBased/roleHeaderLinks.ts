import AdminHeaderLink from './AdminHeaderLink';
import UserHeaderLink from './UserHeaderLink';

export const roleHeaderLinks: Record<string, React.FC> = {
  'Director': AdminHeaderLink, //cambiar el string o clave del record por el nombre del rol que quieras usar
  'Subdirector': UserHeaderLink,
  'Jefe' : UserHeaderLink,
  'Coordinador' : UserHeaderLink,
  'Profesional 3' : UserHeaderLink,
  'Profesional 2' : UserHeaderLink,
  'Profesional 1' : UserHeaderLink,
  'Tecnico' : UserHeaderLink
  // Agrega más roles aquí si es necesario
};