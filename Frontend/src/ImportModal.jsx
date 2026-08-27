import React, { useState } from 'react'
import UploadDropzone from './UploadDropzone'
import ReviewModal from './ReviewModal'

export default function ImportModal({ open, onClose, onImported, apiBase }){
  const [parsed, setParsed] = useState(null)

  if (!open) return null

  const handleParsed = (events) => {
    setParsed(events)
  }

  const handleImportConfirm = (selected) => {
    // selected: array of edited events
    onImported(selected)
    setParsed(null)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Import Schedule</h3>
          <button className="btn" onClick={onClose}>✕</button>
        </div>

        {!parsed && (
          <UploadDropzone apiBase={apiBase} onParsed={handleParsed} />
        )}

        {parsed && (
          <ReviewModal events={parsed} onCancel={()=>setParsed(null)} onConfirm={handleImportConfirm} />
        )}

        <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
