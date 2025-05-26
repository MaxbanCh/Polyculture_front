// Fonction pour obtenir le token d'authentification (priorité aux cookies)
export function getAuthToken(): string | null {
  // Chercher d'abord dans les cookies
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
  if (authCookie) {
    return authCookie.split('=')[1].trim();
  }
  
  // Fallback temporaire vers localStorage pour la compatibilité
  return localStorage.getItem('auth_token');
}

// Fonction pour définir le token d'authentification (dans un cookie)
export function setAuthToken(token: string): void {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // 7 jours
  
  document.cookie = `auth_token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
  
  // Compatibilité temporaire - à supprimer progressivement
  localStorage.setItem('auth_token', token);
}

// Fonction pour supprimer le token d'authentification
export function removeAuthToken(): void {
  document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure";
  localStorage.removeItem('auth_token');
}

// Fonction utile pour décoder le JWT et récupérer les informations
export function decodeToken(token: string | null): any {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Erreur lors du décodage du token JWT:', error);
    return null;
  }
}