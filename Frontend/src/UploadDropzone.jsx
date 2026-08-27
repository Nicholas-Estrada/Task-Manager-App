import React, { useState, useRef } from 'react'

export default function UploadDropzone({ apiBase, onParsed }){
  const [status, setStatus] = useState('')
  const inputRef = useRef(null)

  const handleFiles = async (file) => {
    setStatus('Uploading...')
    const fd = new FormData();
    fd.append('file', file)

    try{
      const res = await fetch(`${apiBase}/api/imports/upload`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.details || json.error || 'The document could not be processed')
      }
      const events = json.events || json.Events || []
      if (!events.length) {
        setStatus('No items detected in document')
        onParsed([])
        return
      }
      setStatus(`Detected ${events.length} item${events.length>1?'s':''}`)
      onParsed(events)
    }catch(err){
      console.error(err)
      setStatus('Upload failed: ' + (err.message||'network error'))
      onParsed([])
    }
  }

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFiles(f);
  }

  const onPick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFiles(f);
  }

  return (
    <div>
      <div className="dropzone" onDragOver={(e)=>{e.preventDefault();}} onDrop={onDrop} onClick={()=>inputRef.current.click()}>
        <div>Drag & drop PDF or image here, or click to choose</div>
        <div style={{fontSize:12,color:'#666',marginTop:6}}>Accepted: PDF, PNG, JPG</div>
      </div>
      <input ref={inputRef} type="file" accept="application/pdf,image/*" style={{display:'none'}} onChange={onPick} />
      <div style={{marginTop:8,fontSize:13,color:'#333'}}>{status}</div>
    </div>
  )
}
