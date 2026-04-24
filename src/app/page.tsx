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
        <span className="badge">v1.0 API Live</span>
        <h1 className="title">fixjson API</h1>
        <p className="subtitle">Automatically fix and reconstruct malformed JSON objects.</p>
      </header>

      {/* --- INTERACTIVE DEMO SECTION --- */}
      <section className="card" style={{ border: '1px solid var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }}>
        <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>Try the Demo</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Paste your broken JSON below to see the deterministic repair engine in action. No API key required for demo usage.
        </p>
        
        <textarea
          className="textarea"
          placeholder="{ name: 'John', age: 30, }"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ height: '150px' }}
        />
        
        {error && <div className="error-text">{error}</div>}

        <button 
          className="button"
          onClick={handleFix}
          disabled={loading || !input.trim()}
          style={{ marginBottom: output ? '2rem' : '0' }}
        >
          {loading ? 'Fixing...' : 'Fix JSON'}
        </button>

        {output && (
          <div style={{ marginTop: '1rem', animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Repaired Output</h3>
              <button className="copy-button" onClick={copyToClipboard}>Copy JSON</button>
            </div>
            
            <pre className="code-block" style={{ maxHeight: '300px' }}>
              <code>{JSON.stringify(output.repaired_json, null, 2)}</code>
            </pre>

            <div className="flex-row" style={{ marginTop: '1.5rem' }}>
              {output.changes.length > 0 && (
                <div className="flex-col" style={{ minWidth: '200px' }}>
                  <h3 style={{ fontSize: '0.9rem' }}>Changes Applied</h3>
                  <ul style={{ listStyleType: 'disc' }}>
                    {output.changes.map((change: string, i: number) => (
                      <li key={i} className="list-item">{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {output.errors.length > 0 && (
                <div className="flex-col" style={{ minWidth: '200px' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#ff7b72' }}>Diagnostics</h3>
                  <ul style={{ listStyleType: 'circle' }}>
                    {output.errors.map((err: string, i: number) => (
                      <li key={i} className="list-item" style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* --- ORIGINAL DOCUMENTATION SECTIONS --- */}
      <section className="card">
        <h2>Overview</h2>
        <p>
          Send us your broken JSON (trailing commas, missing quotes, single quotes), and we'll return a valid JSON object. 
          The API is entirely deterministic and does not use LLMs, ensuring lightning-fast and predictable results.
        </p>
        <p style={{ marginTop: '1rem' }}>
          <strong>Base URL:</strong> <code>https://fixjson-api.vercel.app</code>
        </p>
      </section>

      <section className="card">
        <h2>Authentication</h2>
        <p>
          Requests must include an <code>x-api-key</code> header. Usage is tracked and rate-limited.
        </p>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Need a key? Generate one instantly:
        </p>
        <pre className="code-block">
          <code>
<span className="code-comment"># Generate your own API key</span><br/>
curl -X POST https://fixjson-api.vercel.app/api/v1/create-key
          </code>
        </pre>
      </section>

      <div className="flex-row">
        <section className="card flex-col">
          <h2>Request Format</h2>
          <p>Send a POST request with the following structure:</p>
          <pre className="code-block">
            <code>
&#123;<br/>
  <span className="code-key">"json"</span>: <span className="code-string">"&#123; unquoted_key: 'value', &#125;"</span><br/>
&#125;
            </code>
          </pre>
        </section>

        <section className="card flex-col">
          <h2>Response Format</h2>
          <p>A successful repair returns:</p>
          <pre className="code-block">
            <code>
&#123;<br/>
  <span className="code-key">"success"</span>: <span className="code-boolean">true</span>,<br/>
  <span className="code-key">"repaired_json"</span>: &#123;<br/>
    <span className="code-key">"unquoted_key"</span>: <span className="code-string">"value"</span><br/>
  &#125;,<br/>
  <span className="code-key">"normalized_json"</span>: <span className="code-string">"&#123;\n  \"unquoted_key\": \"value\"\n&#125;"</span>,<br/>
  <span className="code-key">"errors"</span>: [...],<br/>
  <span className="code-key">"changes"</span>: [...],<br/>
  <span className="code-key">"plan"</span>: <span className="code-string">"free"</span>,<br/>
  <span className="code-key">"remaining_requests"</span>: 99<br/>
&#125;
            </code>
          </pre>
        </section>
      </div>

      <section className="card" style={{ textAlign: 'center' }}>
        <h2>Pricing</h2>
        <div className="flex-row">
          <div className="flex-col">
            <h3 style={{ color: 'var(--accent)' }}>Free Plan</h3>
            <ul style={{ listStylePosition: 'inside', color: 'var(--text-secondary)' }}>
              <li>100 requests per API key</li>
              <li>Deterministic JSON repair</li>
              <li>Syntax diagnostics</li>
            </ul>
          </div>
          <div className="flex-col">
            <h3 style={{ color: '#8b949e' }}>Pro Plan (Coming Soon)</h3>
            <ul style={{ listStylePosition: 'inside', color: 'var(--text-secondary)' }}>
              <li>Higher usage limits</li>
              <li>Priority processing</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
