import netlifyIdentity from 'netlify-identity-widget';

// Inicializar Netlify Identity
netlifyIdentity.init();

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export const auth = {
  login: () => {
    return new Promise<User>((resolve, reject) => {
      netlifyIdentity.open('login');
      netlifyIdentity.on('login', (user) => {
        netlifyIdentity.close();
        resolve(user as User);
      });
      netlifyIdentity.on('error', (err) => reject(err));
    });
  },

  logout: () => {
    return new Promise<void>((resolve) => {
      netlifyIdentity.logout();
      netlifyIdentity.on('logout', () => {
        resolve();
      });
    });
  },

  getCurrentUser: () => {
    const user = netlifyIdentity.currentUser();
    return user as User | null;
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    netlifyIdentity.on('login', (user) => callback(user as User));
    netlifyIdentity.on('logout', () => callback(null));
    // Retorna función para limpiar los listeners
    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }
}; 