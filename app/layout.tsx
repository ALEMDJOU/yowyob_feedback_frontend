// app/layout.tsx
import './globals.css';
import { Montserrat } from 'next/font/google';
import { I18nProvider } from '@/components/I18nProvider';
import MagicPageEnhancer from '@/components/MagicPageEnhancer';
import YowbotFAB from '@/components/YowbotFAB';
import { ToastProvider } from '@/components/ToastProvider';

// Configuration de la police Montserrat
const montserrat = Montserrat({
  weight: ['400', '600', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

// Métadonnées (pour le SEO)
export const metadata = {
  title: 'Yowyob Feedback - La plateforme ultime',
  description: 'La plateforme ultime pour émettre et consulter des feedbacks sur les stages et formations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={montserrat.className}>
        {/* MagicPageEnhancer enveloppe tout pour les particules et l'animation d'entrée globale */}
        <MagicPageEnhancer>
          <I18nProvider>
            <ToastProvider>
              {/* ToastProvider ajouté ici pour envelopper l'application */}
              {children}
            </ToastProvider>
          </I18nProvider>
        </MagicPageEnhancer>
        <YowbotFAB />
      </body>
    </html>
  );
}