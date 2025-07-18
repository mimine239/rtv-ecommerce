// Script pour réinitialiser les bannières dans le localStorage

// Fonction pour réinitialiser les bannières
function resetBanners() {
  try {
    // Supprimer les bannières du localStorage
    localStorage.removeItem('mockBanners');
    console.log('✅ Bannières réinitialisées avec succès!');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation des bannières:', error);
    return false;
  }
}

// Exporter la fonction pour pouvoir l'utiliser ailleurs
export default resetBanners;
