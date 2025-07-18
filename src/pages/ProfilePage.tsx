import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { mockAuth } from '../firebase/mockAuth';

const ProfilePage = () => {
  const { currentUser, userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Initialiser avec les données réelles de l'utilisateur
  const [userData, setUserData] = useState({
    name: userProfile?.displayName || '',
    email: userProfile?.email || '',
    phone: (userProfile as any)?.phone || '',
    address: (userProfile as any)?.address || '',
  });

  const [formData, setFormData] = useState({ ...userData });
  
  // Mettre à jour les données utilisateur lorsque userProfile change
  useEffect(() => {
    if (userProfile) {
      const updatedUserData = {
        name: userProfile.displayName || '',
        email: userProfile.email || '',
        phone: (userProfile as any).phone || '',
        address: (userProfile as any).address || '',
      };
      setUserData(updatedUserData);
      setFormData(updatedUserData);
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mettre à jour les données utilisateur dans le mock ou Firebase
      if (currentUser) {
        // Dans un environnement réel, vous appelleriez une fonction pour mettre à jour le profil
        // Exemple: await updateUserProfile(currentUser.uid, formData);
        
        // Pour le mock, nous mettons simplement à jour l'état local
        await mockAuth.updateProfile(formData);
        
        setUserData({ ...formData });
        setIsEditing(false);
        toast.success('Profil mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier que les mots de passe correspondent
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    // Vérifier la longueur minimale du mot de passe
    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      if (currentUser) {
        // Dans un environnement réel avec Firebase
        // await updatePassword(currentUser, passwordData.newPassword);
        
        // Pour le mock
        await mockAuth.updatePassword(passwordData.currentPassword, passwordData.newPassword);
        
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Mot de passe mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      toast.error('Erreur lors de la mise à jour du mot de passe');
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Informations personnelles</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-primary hover:text-primary/80"
            >
              <FaEdit className="mr-1" /> Modifier
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="flex items-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/80"
              >
                <FaSave className="mr-2" /> Enregistrer
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="font-medium">{userData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="font-medium">{userData.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Adresse</p>
              <p className="font-medium">{userData.address}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Sécurité</h2>
          {isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          )}
        </div>
        
        {!isChangingPassword ? (
          <button 
            onClick={() => setIsChangingPassword(true)}
            className="flex items-center bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
          >
            <FaLock className="mr-2" /> Changer le mot de passe
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              className="flex items-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/80"
            >
              <FaSave className="mr-2" /> Enregistrer le nouveau mot de passe
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
