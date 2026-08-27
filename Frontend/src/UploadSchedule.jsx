import React, { useState } from 'react';

export default function UploadSchedule() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const onFileChange = (e) => setFile(e.target.files[0]);

  const upload = async () => {
    if (!file) return setError('Please choose a file first');
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const resp = await fetch('/api/imports/upload', {
        method: 'POST',
        body: fd,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const data = await resp.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:20}}>
      <h3>Import Schedule (PDF / Image)</h3>
      <input type="file" accept="application/pdf,image/*" onChange={onFileChange} />
      <button onClick={upload} disabled={loading} style={{marginLeft:10}}>Upload</button>
      {loading && <div>Processing…</div>}
      {error && <div style={{color:'red'}}>{error}</div>}

      <div style={{marginTop:20}}>
        <h4>Extracted items</h4>
        {events.length === 0 && <div>No items found yet.</div>}
        <ul>
          {events.map((e, i) => (
            <li key={i} style={{marginBottom:10}}>
              <strong>{e.title}</strong> — {e.type} — {e.date || 'no date'} — confidence: {e.confidence}
              <div style={{fontSize:12, color:'#444'}}>{e.source_text}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
