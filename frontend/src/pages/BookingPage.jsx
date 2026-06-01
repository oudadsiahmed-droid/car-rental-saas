import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:5000/api'

const T = {
  en: { title: 'Find Your Perfect Car', sub: 'Choose from our premium fleet and book instantly', available: 'Available', bookNow: 'Book Now →', perDay: 'per day', rentalPeriod: '📅 Rental Period', yourInfo: '👤 Your Information', payment: '💳 Payment Method', payArrival: 'Pay on Arrival', cash: 'Cash', payOnline: 'Pay Online', secure: 'Secure payment', fullName: 'Full Name *', phone: 'Phone *', email: 'Email', pickup: 'Pick-up Date *', returnDate: 'Return Date *', requests: 'Special Requests', confirm: 'Confirm Booking', days: 'days', bookAnother: 'Book Another Car', confirmed: '🎉 Booking Confirmed!', thankyou: "We'll contact you shortly.", vehicle: 'Vehicle', duration: 'Duration', total: 'Total', back: '← Back', processing: 'Processing...', noCars: 'No cars available right now', checkLater: 'Please check back later', ref: 'Booking Reference', dir: 'ltr', service: 'Car Rental Service', carsAvailable: 'cars available' },
  fr: { title: 'Trouvez Votre Voiture Idéale', sub: 'Réservez instantanément depuis notre flotte premium', available: 'Disponible', bookNow: 'Réserver →', perDay: 'par jour', rentalPeriod: '📅 Période de location', yourInfo: '👤 Vos informations', payment: '💳 Mode de paiement', payArrival: "Payer à l'arrivée", cash: 'Espèces', payOnline: 'Payer en ligne', secure: 'Paiement sécurisé', fullName: 'Nom complet *', phone: 'Téléphone *', email: 'Email', pickup: 'Date de départ *', returnDate: 'Date de retour *', requests: 'Demandes spéciales', confirm: 'Confirmer', days: 'jours', bookAnother: 'Réserver une autre voiture', confirmed: '🎉 Réservation confirmée!', thankyou: 'Nous vous contacterons bientôt.', vehicle: 'Véhicule', duration: 'Durée', total: 'Total', back: '← Retour', processing: 'Traitement...', noCars: 'Aucune voiture disponible', checkLater: 'Revenez plus tard', ref: 'Référence', dir: 'ltr', service: 'Service de location', carsAvailable: 'voitures disponibles' },
  ar: { title: 'اختر سيارتك المثالية', sub: 'احجز من أسطولنا الممتاز فوراً', available: 'متاحة', bookNow: 'احجز الآن ←', perDay: 'في اليوم', rentalPeriod: '📅 مدة الكراء', yourInfo: '👤 معلوماتك', payment: '💳 طريقة الدفع', payArrival: 'دفع عند الاستلام', cash: 'نقداً', payOnline: 'دفع أونلاين', secure: 'دفع آمن', fullName: 'الاسم الكامل *', phone: 'الهاتف *', email: 'البريد الإلكتروني', pickup: 'تاريخ البداية *', returnDate: 'تاريخ النهاية *', requests: 'ملاحظات', confirm: 'تأكيد الحجز', days: 'يوم', bookAnother: 'حجز سيارة أخرى', confirmed: '🎉 تم الحجز بنجاح!', thankyou: 'سنتواصل معك قريباً.', vehicle: 'السيارة', duration: 'المدة', total: 'المبلغ', back: 'رجوع →', processing: 'جاري...', noCars: 'لا توجد سيارات متاحة', checkLater: 'تفقد لاحقاً', ref: 'رقم الحجز', dir: 'rtl', service: 'خدمة كراء السيارات', carsAvailable: 'سيارة متاحة' },
}

function BookingPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [lang, setLang] = useState('en')
  const [form, setForm] = useState({ clientName: '', clientPhone: '', clientEmail: '', startDate: '', endDate: '', paymentMethod: 'cash', notes: '' })
  const [booking, setBooking] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const tx = T[lang]

  useEffect(() => {
    axios.get(`${API}/public/company/${slug}/vehicles`)
      .then(r => { setCompany(r.data.company); setVehicles(r.data.vehicles) })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [slug])

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0
    const d = Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24))
    return d > 0 ? d : 0
  }

  const handleBook = async () => {
    if (!form.clientName || !form.clientPhone || !form.startDate || !form.endDate) return alert('!')
    if (calcDays() <= 0) return alert('!')
    setSubmitting(true)
    try {
      const { data } = await axios.post(`${API}/public/company/${slug}/book`, { vehicleId: selectedVehicle._id, ...form })
      setBooking(data)
      setStep(3)
      if (data.waUrl) {
        setTimeout(() => window.open(data.waUrl, '_blank'), 1000)
      }
    } catch { alert('Error!') }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-xl animate-pulse">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir={tx.dir}>

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">🚗</div>
            <div>
              <h1 className="font-bold text-lg">{company?.company}</h1>
              <p className="text-gray-400 text-xs">{tx.service}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
              {vehicles.length} {tx.carsAvailable}
            </div>
            <div className="flex gap-1">
              {['en', 'fr', 'ar'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white border border-gray-700'}`}>
                  {l === 'ar' ? '🇲🇦 ع' : l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      {step === 1 && (
        <div className="relative h-72 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=80" className="w-full h-full object-cover" alt="hero" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-gray-950"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">{tx.title}</h2>
            <p className="text-gray-200 text-lg drop-shadow">{tx.sub}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Step 1 */}
        {step === 1 && (
          <div>
            {vehicles.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-5xl mb-4">🚗</p>
                <p className="text-xl">{tx.noCars}</p>
                <p className="text-sm mt-2">{tx.checkLater}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(v => (
                  <div key={v._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500 transition-all duration-300 cursor-pointer group" onClick={() => { setSelectedVehicle(v); setStep(2) }}>
                    <div className="relative bg-gray-800 h-48 flex items-center justify-center">
                      {v.image ? <img src={v.image} className="h-full w-full object-cover" /> : <span className="text-7xl group-hover:scale-110 transition-transform duration-300">🚗</span>}
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">{tx.available}</div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-xl mb-1">{v.name}</h3>
                      <p className="text-gray-500 text-sm mb-4">{v.plate}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-blue-400">{v.price}</span>
                          <span className="text-gray-500 text-sm"> MAD/{tx.perDay}</span>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">{tx.bookNow}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && selectedVehicle && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">{tx.back}</button>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 flex gap-4 items-center">
              <div className="w-20 h-16 bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedVehicle.image ? <img src={selectedVehicle.image} className="w-full h-full object-cover" /> : <span className="text-3xl">🚗</span>}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedVehicle.name}</h3>
                <p className="text-gray-500 text-sm">{selectedVehicle.plate}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-400 font-bold text-xl">{selectedVehicle.price} MAD</p>
                <p className="text-gray-500 text-sm">{tx.perDay}</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-gray-300 mb-3">{tx.rentalPeriod}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{tx.pickup}</label>
                    <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{tx.returnDate}</label>
                    <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} min={form.startDate || new Date().toISOString().split('T')[0]} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                  </div>
                </div>
                {calcDays() > 0 && (
                  <div className="mt-3 bg-blue-900/30 border border-blue-800 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-400">{calcDays()} {tx.days} × {selectedVehicle.price} MAD</span>
                    <span className="text-blue-400 font-bold text-xl">{calcDays() * selectedVehicle.price} MAD</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-300 mb-3">{tx.yourInfo}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{tx.fullName}</label>
                    <input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" placeholder="..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{tx.phone}</label>
                      <input value={form.clientPhone} onChange={e => setForm({...form, clientPhone: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" placeholder="+212 6XX XXX XXX" type="tel" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{tx.email}</label>
                      <input value={form.clientEmail} onChange={e => setForm({...form, clientEmail: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" placeholder="..." type="email" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-300 mb-3">{tx.payment}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div onClick={() => setForm({...form, paymentMethod: 'cash'})} className={`border rounded-xl p-4 text-center cursor-pointer transition ${form.paymentMethod === 'cash' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
                    <p className="text-2xl mb-1">💵</p>
                    <p className="font-medium text-sm">{tx.payArrival}</p>
                    <p className="text-gray-500 text-xs mt-1">{tx.cash}</p>
                  </div>
                  <div onClick={() => setForm({...form, paymentMethod: 'online'})} className={`border rounded-xl p-4 text-center cursor-pointer transition ${form.paymentMethod === 'online' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
                    <p className="text-2xl mb-1">💳</p>
                    <p className="font-medium text-sm">{tx.payOnline}</p>
                    <p className="text-gray-500 text-xs mt-1">{tx.secure}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">{tx.requests}</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" rows="2" placeholder="..." />
              </div>

              <button onClick={handleBook} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition">
                {submitting ? tx.processing : `${tx.confirm}${calcDays() > 0 ? ` — ${calcDays() * selectedVehicle.price} MAD` : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && booking && (
          <div className="max-w-md mx-auto text-center py-8">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-2">{tx.confirmed}</h2>
            <p className="text-gray-400 mb-8">{tx.thankyou}</p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left space-y-4">
              {[
                { label: tx.vehicle, value: selectedVehicle?.name },
                { label: tx.pickup, value: form.startDate },
                { label: tx.returnDate, value: form.endDate },
                { label: tx.duration, value: `${calcDays()} ${tx.days}` },
                { label: tx.total, value: `${booking.totalPrice} MAD`, highlight: true },
                { label: tx.payment, value: form.paymentMethod === 'cash' ? `💵 ${tx.cash}` : `💳 ${tx.payOnline}` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-3 last:border-0">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={item.highlight ? 'text-blue-400 font-bold text-lg' : 'font-medium'}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-sm">{tx.ref}</p>
              <p className="font-mono font-bold text-blue-400 text-lg">{booking.booking?._id?.slice(-8).toUpperCase()}</p>
            </div>
            <button onClick={() => { setStep(1); setSelectedVehicle(null); setForm({clientName:'',clientPhone:'',clientEmail:'',startDate:'',endDate:'',paymentMethod:'cash',notes:''}) }} className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition">
              {tx.bookAnother}
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 mt-12 py-6 text-center text-gray-600 text-sm">
        © 2026 {company?.company} · Powered by CarRental Pro
      </div>
    </div>
  )
}

export default BookingPage