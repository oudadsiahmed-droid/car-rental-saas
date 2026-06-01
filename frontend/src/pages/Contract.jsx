import { useRef, useState } from 'react'
import { useLang } from '../context/LangContext'

function Contract({ contract, company, onClose }) {
  const { t } = useLang()
  const printRef = useRef()
  const canvasClientRef = useRef(null)
  const canvasCompanyRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureClient, setSignatureClient] = useState(null)
  const [signatureCompany, setSignatureCompany] = useState(null)
  const [activeSign, setActiveSign] = useState(null)
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)

  const getCanvas = () => activeSign === 'client' ? canvasClientRef.current : canvasCompanyRef.current

  const startDraw = (e) => {
    setIsDrawing(true)
    const canvas = getCanvas()
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = getCanvas()
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1e3a8a'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDraw = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = getCanvas()
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (activeSign === 'client') setSignatureClient(null)
    else setSignatureCompany(null)
  }

  const saveSign = () => {
    const canvas = getCanvas()
    const data = canvas.toDataURL()
    if (activeSign === 'client') setSignatureClient(data)
    else setSignatureCompany(data)
    setActiveSign(null)
  }

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>${t.contracts}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}}</style></head><body>${content}</body></html>`)
    win.document.close()
    win.print()
  }

  const handleSendEmail = () => {
    if (!email) return alert('!')
    setTimeout(() => { setEmailSent(true); setTimeout(() => { setEmailSent(false); setShowEmail(false); setEmail('') }, 2000) }, 1500)
  }

  const shareLink = `${window.location.origin}/sign/${contract.id}`
  const days = Math.ceil((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24))
  const total = days * contract.pricePerDay

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen overflow-auto">

        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10" dir={t.dir}>
          <h2 className="text-lg font-bold text-gray-800">{t.contracts}</h2>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActiveSign('client')} className={`px-4 py-2 rounded-lg text-sm ${signatureClient ? 'bg-green-600' : 'bg-gray-500'} text-white hover:opacity-90`}>
              ✍️ {t.client} {signatureClient ? '✅' : ''}
            </button>
            <button onClick={() => setActiveSign('company')} className={`px-4 py-2 rounded-lg text-sm ${signatureCompany ? 'bg-green-600' : 'bg-gray-500'} text-white hover:opacity-90`}>
              🏢 {t.companyName} {signatureCompany ? '✅' : ''}
            </button>
            <button onClick={() => setShowLinkModal(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600">🔗 Link</button>
            <button onClick={() => setShowEmail(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">📧 {t.email}</button>
            <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">{t.print}</button>
            <button onClick={onClose} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">✕</button>
          </div>
        </div>

        <div ref={printRef} style={{padding:'15mm', fontFamily:'Arial, sans-serif', direction:'rtl'}}>

          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'3px solid #1e3a8a', paddingBottom:'15px', marginBottom:'20px'}}>
            <div>
              <div style={{fontSize:'24px', fontWeight:'bold', color:'#1e3a8a'}}>{company.name || 'CarRental Pro'}</div>
              <div style={{fontSize:'12px', color:'#6b7280', marginTop:'4px'}}>{company.address}</div>
            </div>
            <div style={{textAlign:'left', fontSize:'12px', color:'#6b7280'}}>
              <div>📞 {company.phone}</div>
              <div>✉️ {company.email}</div>
            </div>
          </div>

          <div style={{textAlign:'center', margin:'20px 0'}}>
            <h1 style={{fontSize:'22px', color:'#1e3a8a', fontWeight:'bold', letterSpacing:'2px'}}>{t.contracts}</h1>
            <p style={{color:'#6b7280', fontSize:'12px', marginTop:'5px'}}>Contrat de Location de Véhicule</p>
            <div style={{background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'8px', padding:'8px 20px', display:'inline-block', marginTop:'10px', fontWeight:'bold', color:'#1e3a8a'}}>
              N°: {contract.id}
            </div>
          </div>

          <div style={{margin:'15px 0'}}>
            <div style={{background:'#1e3a8a', color:'white', padding:'8px 15px', borderRadius:'6px', fontSize:'14px', fontWeight:'bold', marginBottom:'10px'}}>👤 {t.client}</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              {[
                {label: t.fullName, value:contract.clientName},
                {label: t.cinNumber, value:contract.clientCin},
                {label: t.phone, value:contract.clientPhone},
                {label: t.city, value:contract.clientCity},
              ].map((f,i) => (
                <div key={i} style={{border:'1px solid #e5e7eb', borderRadius:'6px', padding:'8px 12px', background:'#f9fafb'}}>
                  <div style={{fontSize:'11px', color:'#6b7280'}}>{f.label}</div>
                  <div style={{fontSize:'13px', fontWeight:'600'}}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{margin:'15px 0'}}>
            <div style={{background:'#1e3a8a', color:'white', padding:'8px 15px', borderRadius:'6px', fontSize:'14px', fontWeight:'bold', marginBottom:'10px'}}>🚗 {t.vehicle}</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              {[
                {label: t.vehicleName, value:contract.carName},
                {label: t.plateNumber, value:contract.carPlate},
                {label: t.date+' 1', value:contract.startDate},
                {label: t.date+' 2', value:contract.endDate},
                {label: t.days, value:`${days} ${t.days}`},
                {label: t.dailyPrice, value:`${contract.pricePerDay} MAD`},
                {label: 'Km départ', value:`${contract.kmStart||'-'} km`},
                {label: 'Km retour', value:`${contract.kmEnd||'...'} km`},
              ].map((f,i) => (
                <div key={i} style={{border:'1px solid #e5e7eb', borderRadius:'6px', padding:'8px 12px', background:'#f9fafb'}}>
                  <div style={{fontSize:'11px', color:'#6b7280'}}>{f.label}</div>
                  <div style={{fontSize:'13px', fontWeight:'600'}}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:'#1e3a8a', color:'white', borderRadius:'10px', padding:'15px 20px', margin:'20px 0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontSize:'13px', opacity:'0.8'}}>{t.amount}</div>
              <div style={{fontSize:'12px', opacity:'0.6'}}>{days} {t.days} × {contract.pricePerDay} MAD</div>
            </div>
            <div style={{fontSize:'32px', fontWeight:'bold'}}>{total} MAD</div>
          </div>

          <div style={{background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'15px', margin:'15px 0'}}>
            <h3 style={{color:'#1e3a8a', marginBottom:'10px', fontSize:'14px', fontWeight:'bold'}}>📋 Conditions</h3>
            <ul style={{listStyle:'none', padding:'0'}}>
              {(t.conditions || []).map((c,i) => (
                <li key={i} style={{padding:'5px 0', fontSize:'12px', color:'#374151', borderBottom:'1px solid #f3f4f6'}}>✓ {c}</li>
              ))}
            </ul>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', marginTop:'30px'}}>
            <div style={{border:'2px dashed #d1d5db', borderRadius:'8px', padding:'20px', textAlign:'center', minHeight:'120px'}}>
              <p style={{color:'#6b7280', fontSize:'12px', marginBottom:'10px'}}>{t.client}</p>
              {signatureClient
                ? <img src={signatureClient} style={{height:'60px', margin:'0 auto', display:'block'}} alt="signature" />
                : <p style={{color:'#9ca3af', fontSize:'12px', marginTop:'20px'}}>...</p>
              }
              <div style={{marginTop:'15px', borderTop:'1px solid #e5e7eb', paddingTop:'8px', fontSize:'11px', color:'#9ca3af'}}>
                {contract.clientName} | {contract.startDate}
              </div>
            </div>
            <div style={{border:'2px dashed #d1d5db', borderRadius:'8px', padding:'20px', textAlign:'center', minHeight:'120px'}}>
              <p style={{color:'#6b7280', fontSize:'12px', marginBottom:'10px'}}>{t.companyName}</p>
              {signatureCompany
                ? <img src={signatureCompany} style={{height:'60px', margin:'0 auto', display:'block'}} alt="signature" />
                : <div style={{width:'80px', height:'80px', border:'3px solid #1e3a8a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', color:'#1e3a8a', fontSize:'11px', fontWeight:'bold'}}>
                    {company.name}
                  </div>
              }
              <div style={{marginTop:'15px', borderTop:'1px solid #e5e7eb', paddingTop:'8px', fontSize:'11px', color:'#9ca3af'}}>
                {company.name} | {contract.startDate}
              </div>
            </div>
          </div>

          <div style={{textAlign:'center', marginTop:'20px', paddingTop:'15px', borderTop:'1px solid #e5e7eb', fontSize:'11px', color:'#9ca3af'}}>
            {t.appName} © 2026
          </div>

        </div>
      </div>

      {activeSign && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" dir={t.dir}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              ✍️ {activeSign === 'client' ? `${t.client} - ${contract.clientName}` : t.companyName}
            </h3>
            <p className="text-sm text-gray-500 mb-3">✍️</p>
            <canvas
              ref={activeSign === 'client' ? canvasClientRef : canvasCompanyRef}
              width={400} height={160}
              className="border-2 border-dashed border-blue-300 rounded-lg w-full cursor-crosshair bg-blue-50"
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={saveSign} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">✅ {t.save}</button>
              <button onClick={clearCanvas} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">🗑️</button>
              <button onClick={() => setActiveSign(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" dir={t.dir}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">🔗 Link</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 break-all mb-4">{shareLink}</div>
            <div className="flex gap-3">
              <button onClick={() => { navigator.clipboard.writeText(shareLink); alert('✅') }} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">📋</button>
              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareLink)}`, '_blank')} className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">💬 WhatsApp</button>
              <button onClick={() => setShowLinkModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg">{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {showEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" dir={t.dir}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">📧 {t.email}</h3>
            {emailSent ? (
              <div className="text-center py-4"><p className="text-4xl mb-2">✅</p></div>
            ) : (
              <>
                <label className="text-sm text-gray-600 block mb-1">{t.email}</label>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  placeholder="client@email.com" type="email" />
                <div className="flex gap-3">
                  <button onClick={handleSendEmail} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">{t.send}</button>
                  <button onClick={() => setShowEmail(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg">{t.cancel}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Contract