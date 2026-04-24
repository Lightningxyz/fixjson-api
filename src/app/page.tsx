'use client';

import React, { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);

  const handleCreateKey = async () => {
    setKeyLoading(true);
    try {
      const response = await fetch('/api/v1/create-key', { method: 'POST' });
      const data = await response.json();
      if (data.api_key) {
        setGeneratedKey(data.api_key);
      } else {
        alert(data.error || 'Failed to generate key');
      }
    } catch (err) {
      alert('Error generating key');
    } finally {
      setKeyLoading(false);
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span className="badge" style={{ margin: 0, height: '28px', display: 'flex', alignItems: 'center' }}>
            v1.0 API Live
          </span>
          <a 
            href="https://github.com/Lightningxyz/fixjson-api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="copy-button"
            style={{ 
              textDecoration: 'none', 
              padding: '0 0.75rem', 
              borderRadius: '9999px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              height: '28px',
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid rgba(88, 166, 255, 0.2)',
              background: 'rgba(88, 166, 255, 0.05)'
            }}
          >
            <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            GitHub
          </a>
        </div>
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
        
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(88, 166, 255, 0.05)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Need a key?</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Generate a free API key instantly (Limit: 2 keys per person).
          </p>
          
          {!generatedKey ? (
            <button 
              className="copy-button" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              onClick={handleCreateKey}
              disabled={keyLoading}
            >
              {keyLoading ? 'Generating...' : 'Generate API Key'}
            </button>
          ) : (
            <div style={{ animation: 'fadeInDown 0.4s ease-out' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Your API Key (save this)
              </p>
              <code className="code-block" style={{ display: 'block', wordBreak: 'break-all', margin: '0 0 1rem 0' }}>
                {generatedKey}
              </code>
              <button 
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedKey);
                  alert('Key copied!');
                }}
              >
                Copy Key
              </button>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.5rem' }}>Try it immediately</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Copy and run this in your terminal
                </p>
                <pre className="code-block" style={{ margin: '0 0 1rem 0', padding: '1rem', fontSize: '0.8rem' }}>
                  <code>
                    curl -X POST https://fixjson-api.vercel.app/api/v1/fixjson \<br/>
                    &nbsp;&nbsp;-H <span className="code-string">"Content-Type: application/json"</span> \<br/>
                    &nbsp;&nbsp;-H <span className="code-string">"x-api-key: {generatedKey}"</span> \<br/>
                    &nbsp;&nbsp;-d <span className="code-string">'&#123;"json": "&#123; name: \"John\", age: 30, &#125;"&#125;'</span>
                  </code>
                </pre>
                <button 
                  className="copy-button"
                  onClick={() => {
                    const cmd = `curl -X POST https://fixjson-api.vercel.app/api/v1/fixjson -H "Content-Type: application/json" -H "x-api-key: ${generatedKey}" -d '{"json": "{ name: \\"John\\", age: 30, }"}'`;
                    navigator.clipboard.writeText(cmd);
                    alert('Command copied!');
                  }}
                >
                  Copy Command
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Or use the terminal:
        </p>
        <pre className="code-block">
          <code>
<span className="code-comment"># Generate via CLI</span><br/>
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
