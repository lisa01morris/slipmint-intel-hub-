import supabase from '../../lib/supabaseClient';
import Link from 'next/link';

export default function IntelligenceDashboard({ reports }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Intelligence Directory</h1>
      <div style={styles.listContainer}>
        {reports && reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} style={styles.reportCard}>
              {/* Fallback to location if location_name isn't populated */}
              <h2 style={styles.reportTitle}>{report.location_name || report.location}</h2>
              {report.year && <p style={styles.reportMeta}>Year: {report.year}</p>}
              
              {/* Dynamic slug route pointing to [slug].jsx preview */}
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

// FIXED: Switched from getServerSideProps to getStaticProps to support revalidate natively
export async function getStaticProps() {
  try {
    const { data: reports, error } = await supabase
      .from('market_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      props: { reports: reports || [] },
      revalidate: 60, // Next.js will regenerate the page at most once every 60 seconds
    };
  } catch (err) {
    console.error('Error fetching reports:', err);
    return {
      props: { reports: [] },
      revalidate: 10, // Fast fallback tracking retry rule if connection drops
    };
  }
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '30px',
    color: '#1a1a1a',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  reportCard: {
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  reportTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  reportMeta: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0066cc',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};
