import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { FaUpload, FaSpinner, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string, file: File) => void;
  currentImage?: string;
  className?: string;
  label?: string;
}

const ImageUploader = ({ 
  onImageUploaded, 
  currentImage, 
  className = '', 
  label = 'Télécharger une image' 
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effet pour appeler onImageUploaded avec l'URL en base64 une fois qu'elle est prête
  useEffect(() => {
    if (selectedFile && previewUrl) {
      onImageUploaded(previewUrl, selectedFile);
    }
  }, [previewUrl, selectedFile, onImageUploaded]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.match('image.*')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    // Vérification de la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Stocker le fichier sélectionné
    setSelectedFile(file);
    setIsUploading(true);
    
    // Créer une URL pour la prévisualisation en base64
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const base64String = fileReader.result as string;
      setPreviewUrl(base64String);
      setIsUploading(false);
    };
    fileReader.onerror = () => {
      toast.error('Erreur lors du chargement de l\'image');
      setIsUploading(false);
    };
    fileReader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-300">
          <img 
            src={previewUrl} 
            alt="Aperçu" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={handleRemoveImage}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={handleButtonClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
        >
          {isUploading ? (
            <FaSpinner className="animate-spin text-primary text-3xl mb-2" />
          ) : (
            <FaUpload className="text-gray-400 text-3xl mb-2" />
          )}
          <p className="text-sm text-gray-500">
            {isUploading ? 'Téléchargement en cours...' : 'Cliquez pour télécharger une image'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF jusqu'à 5MB
          </p>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
