// Service de mock pour l'authentification Firebase
// À utiliser uniquement en développement quand l'API Firebase n'est pas disponible

// Le type User est importé uniquement pour la documentation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// Import des types nécessaires

// Définition du type UserProfile pour éviter l'importation qui cause des erreurs
interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'buyer' | 'vendor' | 'admin';
  createdAt: Date;
  phone?: string;
  address?: string;
  [key: string]: any;
}

// Types pour le mock
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface MockAuthState {
  currentUser: MockUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
}

// État initial du mock
const mockAuthState: MockAuthState = {
  currentUser: null,
  userProfile: null,
  isLoading: false
};

// Stockage local des utilisateurs (simulant Firestore)
const mockUsers: Record<string, UserProfile> = {};

// Fonction pour générer un ID unique
const generateUid = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// API de mock
export const mockAuth = {
  // État actuel
  state: mockAuthState,
  
  // Inscription
  register: async (email: string, password: string, userData: { name: string; role: 'buyer' | 'vendor' | 'admin' }) => {
    // password est utilisé pour simuler une authentification réelle mais n'est pas stocké pour des raisons de sécurité
    void password; // Marquer comme utilisé pour éviter l'avertissement
    mockAuthState.isLoading = true;
    
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Vérifier si l'utilisateur existe déjà
      const userExists = Object.values(mockUsers).some(user => user.email === email);
      if (userExists) {
        throw new Error('auth/email-already-in-use');
      }
      
      // Créer un nouvel utilisateur
      const uid = generateUid();
      const newUser: MockUser = {
        uid,
        email,
        displayName: userData.name,
        photoURL: null
      };
      
      // Créer le profil utilisateur
      const userProfile: UserProfile = {
        uid,
        email,
        displayName: userData.name,
        photoURL: null,
        role: userData.role || 'buyer',
        createdAt: new Date()
      };
      
      // Stocker l'utilisateur
      mockUsers[uid] = userProfile;
      
      // Mettre à jour l'état
      mockAuthState.currentUser = newUser;
      mockAuthState.userProfile = userProfile;
      
      // Stocker dans localStorage pour simuler la persistance
      localStorage.setItem('mockCurrentUser', JSON.stringify(newUser));
      localStorage.setItem('mockUserProfile', JSON.stringify(userProfile));
      
      return { user: newUser };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    } finally {
      mockAuthState.isLoading = false;
    }
  },
  
  // Connexion
  login: async (email: string, password: string) => {
    // password est utilisé pour simuler une authentification réelle mais n'est pas stocké pour des raisons de sécurité
    void password; // Marquer comme utilisé pour éviter l'avertissement
    mockAuthState.isLoading = true;
    
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Rechercher l'utilisateur
      const userProfile = Object.values(mockUsers).find(user => user.email === email);
      
      if (!userProfile) {
        // Lancer une erreur spécifique pour indiquer que l'utilisateur n'existe pas
        throw new Error('auth/user-not-found');
        
        // Code commenté ci-dessous: ancienne logique qui créait automatiquement un utilisateur
        /*
        const uid = generateUid();
        const mockUser: MockUser = {
          uid,
          email,
          displayName: email.split('@')[0],
          photoURL: null
        };
        
        const newUserProfile: UserProfile = {
          uid,
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          role: 'vendor' as 'buyer' | 'vendor' | 'admin', // Par défaut, on donne le rôle vendeur pour faciliter les tests
          createdAt: new Date()
        };
        
        mockUsers[uid] = newUserProfile;
        mockAuthState.currentUser = mockUser;
        mockAuthState.userProfile = newUserProfile;
        
        localStorage.setItem('mockCurrentUser', JSON.stringify(mockUser));
        localStorage.setItem('mockUserProfile', JSON.stringify(newUserProfile));
        
        return { user: mockUser };
        */
      }
      
      // Créer l'objet utilisateur à partir du profil
      const mockUser: MockUser = {
        uid: userProfile.uid,
        email: userProfile.email,
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL
      };
      
      // Mettre à jour l'état
      mockAuthState.currentUser = mockUser;
      mockAuthState.userProfile = userProfile;
      
      // Stocker dans localStorage
      localStorage.setItem('mockCurrentUser', JSON.stringify(mockUser));
      localStorage.setItem('mockUserProfile', JSON.stringify(userProfile));
      
      return { user: mockUser };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      mockAuthState.isLoading = false;
    }
  },
  
  // Déconnexion
  logout: async () => {
    mockAuthState.isLoading = true;
    
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Réinitialiser l'état
      mockAuthState.currentUser = null;
      mockAuthState.userProfile = null;
      
      // Supprimer du localStorage
      localStorage.removeItem('mockCurrentUser');
      localStorage.removeItem('mockUserProfile');
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    } finally {
      mockAuthState.isLoading = false;
    }
  },
  
  // Initialisation - Vérifier si un utilisateur est déjà connecté
  // Mise à jour du profil utilisateur
  updateProfile: async (userData: { name?: string; phone?: string; address?: string; [key: string]: any }) => {
    mockAuthState.isLoading = true;
    
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!mockAuthState.currentUser || !mockAuthState.userProfile) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      const uid = mockAuthState.currentUser.uid;
      
      // Mettre à jour le profil utilisateur
      const updatedProfile = {
        ...mockAuthState.userProfile,
        ...userData,
        displayName: userData.name || mockAuthState.userProfile.displayName
      };
      
      // Mettre à jour l'utilisateur
      const updatedUser = {
        ...mockAuthState.currentUser,
        displayName: userData.name || mockAuthState.currentUser.displayName
      };
      
      // Mettre à jour le stockage
      mockUsers[uid] = updatedProfile;
      mockAuthState.currentUser = updatedUser;
      mockAuthState.userProfile = updatedProfile;
      
      // Mettre à jour localStorage
      localStorage.setItem('mockCurrentUser', JSON.stringify(updatedUser));
      localStorage.setItem('mockUserProfile', JSON.stringify(updatedProfile));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    } finally {
      mockAuthState.isLoading = false;
    }
  },
  
  // Mise à jour du mot de passe
  updatePassword: async (currentPassword: string, newPassword: string) => {
    mockAuthState.isLoading = true;
    
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!mockAuthState.currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      // Dans un mock, nous ne vérifions pas vraiment le mot de passe actuel
      // mais nous simulons le processus
      if (currentPassword === '') {
        throw new Error('Le mot de passe actuel est requis');
      }
      
      if (newPassword.length < 6) {
        throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      }
      
      // Dans un environnement réel, nous mettrions à jour le mot de passe dans Firebase
      // Ici, nous simulons simplement une réussite
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    } finally {
      mockAuthState.isLoading = false;
    }
  },
  
  init: () => {
    try {
      const storedUser = localStorage.getItem('mockCurrentUser');
      const storedProfile = localStorage.getItem('mockUserProfile');
      
      if (storedUser && storedProfile) {
        mockAuthState.currentUser = JSON.parse(storedUser);
        mockAuthState.userProfile = JSON.parse(storedProfile);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du mock auth:', error);
    }
  }
};

// Initialiser au chargement
mockAuth.init();
