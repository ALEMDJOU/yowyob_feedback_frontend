'use client';

export default function NotFound() {
  return (
    <main style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
      <a href="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', backgroundColor: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
        Go back home
      </a>
    </main>
  );
}
