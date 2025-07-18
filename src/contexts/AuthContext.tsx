import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { mockAuth } from '../firebase/mockAuth';

// Flag pour utiliser le mock d'authentification en cas de problème avec Firebase
const USE_MOCK_AUTH = false; // Mettre à true pour développement, false pour production

type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'buyer' | 'vendor' | 'admin';
  createdAt: Date;
};

type UserData = {
  name: string;
  email: string;
  phone?: string;
  role?: 'buyer' | 'vendor' | 'admin';
  createdAt?: string;
  [key: string]: any;
};

type AuthContextType = {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  register: (email: string, password: string, userData: UserData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour créer un nouveau compte
  const register = async (email: string, password: string, userData: UserData) => {
    try {
      if (USE_MOCK_AUTH) {
        // Utiliser le mock d'authentification
        const result = await mockAuth.register(email, password, {
          name: userData.name,
          role: userData.role || 'buyer'
        });
        const user = result.user;
        
        // Le mock gère déjà la création du profil utilisateur
        setCurrentUser(user as unknown as User);
        setUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: userData.role || 'buyer',
          createdAt: new Date()
        });
        
        return;
      }
      
      // Utiliser Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Mettre à jour le profil avec le nom d'affichage
      await updateProfile(user, { displayName: userData.name });
      
      // Créer un document utilisateur dans Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: userData.name,
        photoURL: user.photoURL,
        role: userData.role || 'buyer', // Par défaut, tous les nouveaux utilisateurs sont des acheteurs
        createdAt: new Date(),
      };
      
      // Fusionner userProfile avec les données supplémentaires de l'utilisateur
      const userDataToSave = {
        ...userProfile,
        ...userData,
        uid: user.uid,
      };
      
      await setDoc(doc(db, 'users', user.uid), userDataToSave);
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  };

  // Fonction pour se connecter
  const login = async (email: string, password: string) => {
    try {
      if (USE_MOCK_AUTH) {
        // Utiliser le mock d'authentification
        const result = await mockAuth.login(email, password);
        const user = result.user;
        
        // Mettre à jour l'état avec l'utilisateur connecté
        setCurrentUser(user as unknown as User);
        
        // Le profil utilisateur est déjà géré par le mock
        const userProfile = mockAuth.state.userProfile;
        if (userProfile) {
          setUserProfile(userProfile);
        }
        
        return;
      }
      
      // Utiliser Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  // Fonction pour se déconnecter
  const logout = async () => {
    try {
      if (USE_MOCK_AUTH) {
        // Utiliser le mock d'authentification
        await mockAuth.logout();
        setCurrentUser(null);
        setUserProfile(null);
        return;
      }
      
      // Utiliser Firebase Auth
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  };

  // Observer les changements d'état d'authentification
  useEffect(() => {
    if (USE_MOCK_AUTH) {
      // Initialiser avec les données du mock
      const mockUser = mockAuth.state.currentUser;
      const mockProfile = mockAuth.state.userProfile;
      
      if (mockUser) {
        setCurrentUser(mockUser as unknown as User);
        setUserProfile(mockProfile);
      }
      
      setLoading(false);
      return () => {}; // Pas besoin de cleanup pour le mock
    }
    
    // Utiliser Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Récupérer les données du profil utilisateur depuis Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du profil:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
