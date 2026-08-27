import React, { useState } from 'react'

export default function ReviewModal({ events = [], onCancel, onConfirm }){
  const [items, setItems] = useState(events.map((e,i)=>({ _id: i, title: e.title||`Item ${i+1}`, type: e.type||'assessment', date: e.date||'', start_time: e.start_time||'', end_time: e.end_time||'', source_text: e.source_text||'', selected: true })))

  const toggleSelect = (id) => {
    setItems(prev => prev.map(it => it._id === id ? { ...it, selected: !it.selected } : it))
  }

  const updateField = (id, field, value) => {
    setItems(prev => prev.map(it => it._id === id ? { ...it, [field]: value } : it))
  }

  const confirm = () => {
    const selected = items.filter(i => i.selected).map(i => ({ title: i.title, type: i.type, date: i.date, start_time: i.start_time, end_time: i.end_time, source_text: i.source_text }))
    onConfirm(selected)
  }

  return (
    <div>
      <div style={{marginBottom:8}}>Review parsed items — edit fields and choose which to import.</div>
      <div style={{maxHeight:320,overflow:'auto',paddingRight:8}}>
        {items.map(it => (
          <div key={it._id} style={{border:'1px solid #eee',padding:8,borderRadius:6,marginBottom:8,background:'#fafafa'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <label style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={it.selected} onChange={()=>toggleSelect(it._id)} />
                <input value={it.title} onChange={e=>updateField(it._id,'title',e.target.value)} style={{fontWeight:700,border:'none',background:'transparent'}} />
              </label>
              <select value={it.type} onChange={e=>updateField(it._id,'type',e.target.value)}>
                <option value="quiz">quiz</option>
                <option value="test">test</option>
                <option value="homework">homework</option>
                <option value="project">project</option>
                <option value="lab">lab</option>
                <option value="assessment">assessment</option>
              </select>
            </div>
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <input type="date" value={it.date} onChange={e=>updateField(it._id,'date',e.target.value)} />
              <input type="time" value={it.start_time} onChange={e=>updateField(it._id,'start_time',e.target.value)} />
              <input type="time" value={it.end_time} onChange={e=>updateField(it._id,'end_time',e.target.value)} />
            </div>
            <div style={{marginTop:8,fontSize:13,color:'#444'}}>
              <details>
                <summary style={{cursor:'pointer'}}>Source text</summary>
                <div style={{whiteSpace:'pre-wrap',marginTop:6}}>{it.source_text}</div>
              </details>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
        <button onClick={onCancel}>Back</button>
        <button onClick={confirm}>Import Selected</button>
      </div>
    </div>
  )
}
