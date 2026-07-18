import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This forces the browser to instantly load the dashboard smoothly
    router.replace('/intelligence');
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#000', color: '#fff' }}>
      <p>Loading Real Estate Intelligence Hub...</p>
    </div>
  );
}
