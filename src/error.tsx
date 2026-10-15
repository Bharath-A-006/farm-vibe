import React from 'react';

// Catches any render crash and offers a safe recovery instead of a white page.
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { bad: boolean }> {
  constructor(p: any) { super(p); this.state = { bad: false }; }
  static getDerivedStateFromError() { return { bad: true }; }
  componentDidCatch() { /* stay silent: recovery UI below */ }
  render() {
    if (!this.state.bad) return this.props.children;
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', padding: 28, background: '#fff', borderRadius: 20, textAlign: 'center', fontFamily: 'Inter,system-ui' }}>
        <h2>Something glitched</h2>
        <p style={{ color: '#5c6f66' }}>Your bookings are safe. Reload a fresh copy of the app:</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button style={{ background: '#0d6b4f', color: '#fff', border: 0, borderRadius: 999, padding: '12px 22px', fontWeight: 700, cursor: 'pointer' }} onClick={() => window.location.reload()}>Reload app</button>
          <button style={{ background: '#fff', color: '#0d6b4f', border: '1.5px solid #0d6b4f', borderRadius: 999, padding: '12px 22px', fontWeight: 700, cursor: 'pointer' }} onClick={() => { try { localStorage.removeItem('farmvibe_db_v1'); } catch {} window.location.reload(); }}>Reset saved data</button>
        </div>
      </div>
    );
  }
}
