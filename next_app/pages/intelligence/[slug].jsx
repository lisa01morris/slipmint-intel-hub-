// next_app/pages/intelligence/[slug].jsx
import supabase from '../../lib/supabaseClient';

export default function MarketProfile({ report }) {
  if (!report) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1>{report.location_name || report.location}</h1>
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>📊 Market Infographic Prompt Concept</h3>
        <p>"{report.infographic_prompt}"</p>
      </div>
      
      <div style={{ background: '#fff5f5', border: '2px dashed #ff4a4a', padding: '30px', textAlign: 'center' }}>
        <h3 style={{ color: '#d32f2f' }}>🔒 Institutional Deep-Dive Gated Content</h3>
        <a href={report.whop_checkout_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '6px', marginTop: '10px' }}>
          Unlock Full Intelligence Report on Whop
        </a>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  try {
    const { data: reports, error } = await supabase
      .from('reports') // ✅ Table target updated to match system schema
      .select('slug');

    const paths = reports ? reports.map((report) => ({
      params: { slug: report.slug },
    })) : [];

    return { paths, fallback: 'blocking' };
  } catch (err) {
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    const { data: report, error } = await supabase
      .from('reports') // ✅ Table target updated to match system schema
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !report) return { notFound: true };

    return { props: { report }, revalidate: 60 };
  } catch (err) {
    return { notFound: true };
  }
}
