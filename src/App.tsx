import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Toaster } from 'react-hot-toast';

// Layouts
import { MainLayout } from './layouts';

// Composant de nettoyage des données d'exemple
import CleanupService from './components/CleanupService';

// Pages
import {
  HomePage,
  VendeurPage,
  BoutiquePage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  ProductPage,
  NotFoundPage,
  AddProductPage,
  EditProductPage,
  VendorProductsPage,
  MessagesPage,
  // FixBannersPage supprimée
} from './pages';

function App() {
  return (
    <Router>
      {/* Composant qui nettoie les données d'exemple au démarrage */}
      <CleanupService />
      
      {/* Gestionnaire de notifications toast */}
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="vendeurs" element={<VendeurPage />} />
          <Route path="boutique" element={<BoutiquePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="vendor/products" element={<VendorProductsPage />} />
          <Route path="vendor/products/add" element={<AddProductPage />} />
          <Route path="vendor/products/edit/:productId" element={<EditProductPage />} />
          {/* Route vers FixBannersPage supprimée */}
          <Route path="messages" element={<MessagesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
