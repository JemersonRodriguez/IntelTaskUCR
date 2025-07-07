// Utilidad para leer el token de la cookie
export default function getTokenFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}