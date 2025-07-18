// Déclaration des modules pour TypeScript
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Types pour les composants personnalisés
interface BannerData {
  id: number;
  image: string;
  title: string;
  description: string;
  link: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  category: string;
  keywords: string[];
  images: string[];
  seller: {
    id: number;
    name: string;
    phone: string;
    rating: number;
    memberSince: string;
  };
  publishedDate: string;
  characteristics?: Array<{
    name: string;
    value: string;
  }>;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  isVendor: boolean;
}
