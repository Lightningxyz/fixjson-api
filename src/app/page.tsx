import React from 'react';

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <span className="badge">v1.0 API Live</span>
        <h1 className="title">fixjson API</h1>
        <p className="subtitle">Automatically fix and reconstruct malformed JSON objects.</p>
      </header>

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
        <pre className="code-block">
          <code>
<span className="code-comment"># Try it (copy & run)</span><br/>
curl -X POST https://fixjson-api.vercel.app/api/v1/fixjson \<br/>
  -H <span className="code-string">"Content-Type: application/json"</span> \<br/>
  -H <span className="code-string">"x-api-key: your_api_key_here"</span> \<br/>
  -d <span className="code-string">'&#123;"json": "&#123; name: \"John\", age: 30, &#125;"&#125;'</span>
          </code>
        </pre>
      </section>

      <section className="card">
        <h2>Pricing</h2>
        <div className="flex-row">
          <div className="flex-col">
            <h3 style={{ color: 'var(--accent)' }}>Free Plan</h3>
            <ul style={{ listStylePosition: 'inside', color: 'var(--text-secondary)' }}>
              <li>Limited requests per API key</li>
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
  <span className="code-key">"errors"</span>: [<br/>
    <span className="code-string">"Original JSON parsing failed: Unexpected token u in JSON at position 2"</span><br/>
  ],<br/>
  <span className="code-key">"changes"</span>: [<br/>
    <span className="code-string">"Successfully repaired JSON syntax (e.g., quotes, trailing commas, missing brackets)."</span><br/>
  ],<br/>
  <span className="code-key">"plan"</span>: <span className="code-string">"free"</span>,<br/>
  <span className="code-key">"remaining_requests"</span>: 99<br/>
&#125;
            </code>
          </pre>
        </section>
      </div>
    </main>
  );
}
