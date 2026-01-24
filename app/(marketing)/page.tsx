// app/page.tsx
import LandingPage from '@/components/LandingPage';
import MagicPageEnhancer from '@/components/MagicPageEnhancer'; // 👈 Importez-le

export default function Home() {
  return (
    <main>
      {/* 👈 Utilisez-le ici pour envelopper votre page */}
      <MagicPageEnhancer> 
        <LandingPage />
      </MagicPageEnhancer>
    </main>
  );
}