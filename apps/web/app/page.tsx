export default function HomePage() {
  return (
    <main style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--salvia)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Gobierno Autónomo Municipal
        </span>
        <h1 style={{ color: 'var(--bosque-profundo)', fontSize: '2.25rem', marginTop: '0.25rem' }}>
          Defensoría de la Niñez y Adolescencia (DNA)
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, fontSize: '1.125rem', marginTop: '0.5rem' }}>
          Sistema de Gestión y Acompañamiento de Casos
        </p>
      </header>

      <section style={{ backgroundColor: 'var(--card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h2 style={{ color: 'var(--bosque-profundo)', fontSize: '1.25rem', marginBottom: '1rem' }}>
          Principio Rector del Sistema
        </h2>
        <blockquote style={{ borderLeft: '4px solid var(--tierra-calida)', paddingLeft: '1rem', fontStyle: 'italic', color: 'var(--grafito)' }}>
          "El caso es del NNA. Los profesionales y las oficinas son temporales dentro del caso."
        </blockquote>
      </section>

      <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.6, textAlign: 'center' }}>
        Plataforma DNA · Versión 1.0 (Fase 1A Base)
      </footer>
    </main>
  );
}
