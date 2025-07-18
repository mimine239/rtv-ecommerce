/// <reference types="vite/client" />

// Déclarations pour Tailwind CSS
interface CSSRule {
  selectorText: string;
  style: CSSStyleDeclaration;
}

interface CSSStyleSheet {
  cssRules: CSSRule[];
}

// Déclarations pour les directives CSS personnalisées
declare namespace CSS {
  interface Rule {
    '@tailwind': string;
    '@apply': string;
  }
}
