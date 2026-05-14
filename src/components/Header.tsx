

export function Header() {
  return (
    <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Wahala Sorter
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
        A drag-and-drop priority board for daily chaos.
      </p>
    </header>
  );
}
