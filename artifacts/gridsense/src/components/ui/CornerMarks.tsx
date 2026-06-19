export function CornerMarks() {
  const cornerStyle = (pos: string): React.CSSProperties => {
    const base: React.CSSProperties = { position: 'absolute', width: 8, height: 8 }
    if (pos === 'tl') return { ...base, top: 0, left: 0, borderTop: '1.5px solid #C84B2F', borderLeft: '1.5px solid #C84B2F' }
    if (pos === 'tr') return { ...base, top: 0, right: 0, borderTop: '1.5px solid #C84B2F', borderRight: '1.5px solid #C84B2F' }
    if (pos === 'bl') return { ...base, bottom: 0, left: 0, borderBottom: '1.5px solid #C84B2F', borderLeft: '1.5px solid #C84B2F' }
    return { ...base, bottom: 0, right: 0, borderBottom: '1.5px solid #C84B2F', borderRight: '1.5px solid #C84B2F' }
  }
  return (
    <>
      <div style={cornerStyle('tl')} />
      <div style={cornerStyle('tr')} />
      <div style={cornerStyle('bl')} />
      <div style={cornerStyle('br')} />
    </>
  )
}
