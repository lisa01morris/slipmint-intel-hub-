import supabase from '../../lib/supabaseClient';
import Link from 'next/link';

export default function ReportDetail({ report }) {
  if (!report) {
    return (
      <div style={styles.container}>
        <p>Report not found.</p>
        <Link href="/intelligence">
          <button style={styles.backButton}>← Back to Directory</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Link href="/intelligence">
        <button style={styles.backButton}>← Back to Directory</button>
      </Link>
      <div style={styles.reportContainer}>
        <h1 style={styles.title}>{report.location}</h1>
        <p style={styles.meta}>Year: {report.year}</p>
        <div style={styles.content}>
          {report.content}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { data: report, error } = await supabase
      .from('market_reports')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (error || !report) {
      return { notFound: true };
    }

    return {
      props: { report },
      revalidate: 60,
    };
  } catch (err) {
    console.error('Error fetching report:', err);
    return { notFound: true };
  }
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  backButton: {
    padding: '10px 16px',
    marginBottom: '30px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#333',
  },
  reportContainer: {
    backgroundColor: '#fff',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#1a1a1a',
  },
  meta: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px',
  },
  content: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
    whiteSpace: 'pre-wrap',
  },
};