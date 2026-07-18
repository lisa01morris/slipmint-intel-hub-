import { useEffect, useState } from 'react';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';

export default function IntelligenceDashboard({ reports }) {
  const [user, setUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

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

  // Handle chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiMessage = { role: 'ai', text: data.response };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
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

      {/* GEMINI COPILOT FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          ...styles.floatingButton,
          ...(isChatOpen ? styles.floatingButtonActive : {})
        }}
        title="Open Gemini Copilot"
      >
        ✨ Open Gemini Copilot
      </button>

      {/* CHAT DRAWER */}
      {isChatOpen && (
        <div style={styles.chatDrawer}>
          <div style={styles.chatHeader}>
            <h2 style={styles.chatTitle}>✨ Gemini Market Copilot</h2>
            <button
              onClick={() => setIsChatOpen(false)}
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>

          {/* MESSAGES CONTAINER */}
          <div style={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div style={styles.emptyState}>
                <p>Ask me about Nigerian markets, business opportunities, or real estate insights!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.message,
                    ...(msg.role === 'user' ? styles.userMessage : styles.aiMessage)
                  }}
                >
                  {msg.text}
                </div>
              ))
            )}
            {loading && (
              <div style={styles.loadingMessage}>
                <span style={styles.spinner}>...</span>
              </div>
            )}
          </div>

          {/* CHAT INPUT FORM */}
          <form onSubmit={handleChatSubmit} style={styles.chatForm}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about Nigerian business markets..."
              style={styles.chatInput}
              disabled={loading}
            />
            <button
              type="submit"
              style={{...styles.sendButton, opacity: loading ? 0.6 : 1}}
              disabled={loading}
            >
              Send
            </button>
          </form>
        </div>
      )}
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
  },

  // GEMINI COPILOT STYLES
  floatingButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    backgroundColor: '#9c27b0',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)',
    transition: 'all 0.3s ease',
    zIndex: 999,
  },
  floatingButtonActive: {
    backgroundColor: '#7b1fa2',
    boxShadow: '0 6px 16px rgba(156, 39, 176, 0.6)',
  },
  chatDrawer: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '360px',
    maxHeight: '500px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 5px 40px rgba(0, 0, 0, 0.16)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 998,
    border: '1px solid #e0e0e0',
  },
  chatHeader: {
    padding: '16px',
    backgroundColor: '#9c27b0',
    color: '#fff',
    borderRadius: '12px 12px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0',
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#fafafa',
  },
  message: {
    padding: '10px 14px',
    borderRadius: '8px',
    wordWrap: 'break-word',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  userMessage: {
    backgroundColor: '#0066cc',
    color: '#fff',
    alignSelf: 'flex-end',
    maxWidth: '80%',
    textAlign: 'right',
  },
  aiMessage: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    alignSelf: 'flex-start',
    maxWidth: '80%',
    borderLeft: '3px solid #9c27b0',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
    fontSize: '13px',
    textAlign: 'center',
    padding: '20px',
  },
  loadingMessage: {
    alignSelf: 'flex-start',
    fontSize: '20px',
    color: '#9c27b0',
    fontWeight: 'bold',
  },
  spinner: {
    animation: 'blink 1.4s infinite',
  },
  chatForm: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    borderRadius: '0 0 12px 12px',
  },
  chatInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  sendButton: {
    padding: '10px 16px',
    backgroundColor: '#9c27b0',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};
