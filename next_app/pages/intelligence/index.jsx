import { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';

export default function IntelligenceDashboard({ reports }) {
  const [user, setUser] = useState(null);

  // Track authentication status on load
  useEffect(() => {
    // 1. Check current session status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Listen for real-time auth changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Vercel handles the dynamic window mapping, or routes back to this path
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/intelligence' : undefined,
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error logging in with Google:', err.message);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={styles.container}>
      {/* AUTHENTICATION BAR */}
      <div style={styles.authBar}>
        {user ? (
          <div style={styles.userProfile}>
            <span style={styles.userText}>Logged in as: <strong>{user.email}</strong></span>
            <button onClick={handleLogout} style={styles.logoutButton}>Sign Out</button>
          </div>
        ) : (
          <button onClick={handleGoogleLogin} style={styles.loginButton}>
            🌐 Sign In with Google
          </button>
        )}
      </div>

      <h1 style={styles.title}>Intelligence Directory</h1>
      
      <div style={styles.listContainer}>
        {reports && reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} style={styles.reportCard}>
              <h2 style={styles.reportTitle}>{report.location_name || report.location}</h2>
              {report.year && <p style={styles.reportMeta}>Year: {report.year}</p>}
              
              <Link href={`/intelligence/${report.slug}`}>
                <button style={styles.button}>Read Free Sample</button>
              </Link>
            </div>
          ))
        ) : (
          <p>No reports available yet.</p>
        )}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const { data: reports, error } = await supabase
      .schema('intel_hub') 
      .from('reports') 
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      props: { reports: reports || [] },
      revalidate: 60,
    };
  } catch (err) {
    console.error('Error fetching reports:', err);
    return {
      props: { reports: [] },
      revalidate: 10,
    };
  }
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' },
  title: { fontSize: '32px', fontWeight: '700', marginBottom: '30px', color: '#1a1a1a' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  reportCard: { padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' },
  reportTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#333' },
  reportMeta: { fontSize: '14px', color: '#666', marginBottom: '15px' },
  button: { padding: '10px 20px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  
  // NEW STYLES FOR THE AUTHENTICATION BUTTON GENERATORS
  authBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee'
  },
  userProfile: { display: 'flex', alignItems: 'center', gap: '15px' },
  userText: { fontSize: '14px', color: '#444' },
  loginButton: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  logoutButton: {
    padding: '6px 12px',
    backgroundColor: '#ff4a4a',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  }
};
