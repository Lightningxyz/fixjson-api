'use client';

import React, { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFix = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const response = await fetch(`/api/v1/demo-fixjson?json=${encodeURIComponent(input)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fix JSON');
      } else {
        setOutput(data);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (output?.repaired_json) {
      navigator.clipboard.writeText(JSON.stringify(output.repaired_json, null, 2));
      alert('JSON copied to clipboard!');
    }
  };

  return (
    <main className="container">
      <header className="header">
        <span className="badge">v1.0 Demo</span>
        <h1 className="title">Fix Broken JSON Instantly</h1>
        <p className="subtitle">Deterministic JSON repair (no AI)</p>
      </header>

      <section className="card">
        <textarea
          className="textarea"
          placeholder="{ name: 'John', age: 30, }"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
        
        {error && <div className="error-text">{error}</div>}

        <button 
          className="button"
          onClick={handleFix}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Fixing...' : 'Fix JSON'}
        </button>

        {output && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Repaired Output</h2>
              <button className="copy-button" onClick={copyToClipboard}>Copy JSON</button>
            </div>
            
            <pre className="code-block" style={{ maxHeight: '400px' }}>
              <code>{JSON.stringify(output.repaired_json, null, 2)}</code>
            </pre>

            {output.changes.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem' }}>Changes Applied</h3>
                <ul style={{ listStyleType: 'disc' }}>
                  {output.changes.map((change: string, i: number) => (
                    <li key={i} className="list-item">{change}</li>
                  ))}
                </ul>
              </div>
            )}

            {output.errors.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#ff7b72' }}>Diagnostics</h3>
                <ul style={{ listStyleType: 'circle' }}>
                  {output.errors.map((err: string, i: number) => (
                    <li key={i} className="list-item" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Get API Key</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Need programmatic access? Generate a key via POST request.
        </p>
        <code className="code-block" style={{ display: 'inline-block', padding: '0.5rem 1rem' }}>
          POST /api/v1/create-key
        </code>
        <p style={{ fontSize: '0.7rem', color: '#8b949e', marginTop: '1rem' }}>
          Rate limited to 3 keys per IP per hour.
        </p>
      </footer>
    </main>
  );
}
