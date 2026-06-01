import { useState, useEffect } from 'react'
import axios from 'axios'
import { useLang } from '../context/LangContext'

const API = 'http://localhost:5000/api'

function BookingsPage() {
  const { t } = useLang()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const lang = t.lang || 'ar'

  const TX = {
    ar: { title: 'الحجوزات', client: 'الزبون', vehicle: 'السيارة', from: 'من', to: 'إلى', amount: 'المبلغ', payment: 'الدفع', status: 'الحالة', confirm: '✅ قبول', reject: '❌ رفض', whatsapp: '💬 واتساب', pending: '⏳ في الانتظار', confirmed: '✅ مؤكد', cancelled: '❌ ملغي', online: '💳 أونلاين', cash: '💵 نقداً', empty: 'لا توجد حجوزات بعد', share: 'شارك رابط الحجز مع زبنائك!', loading: 'جاري التحميل...' },
    fr: { title: 'Réservations', client: 'Client', vehicle: 'Véhicule', from: 'Début', to: 'Fin', amount: 'Montant', payment: 'Paiement', status: 'Statut', confirm: '✅ Confirmer', reject: '❌ Refuser', whatsapp: '💬 WhatsApp', pending: '⏳ En attente', confirmed: '✅ Confirmé', cancelled: '❌ Annulé', online: '💳 En ligne', cash: '💵 Espèces', empty: 'Aucune réservation', share: 'Partagez votre lien de réservation!', loading: 'Chargement...' },
    en: { title: 'Bookings', client: 'Client', vehicle: 'Vehicle', from: 'From', to: 'To', amount: 'Amount', payment: 'Payment', status: 'Status', confirm: '✅ Confirm', reject: '❌ Reject', whatsapp: '💬 WhatsApp', pending: '⏳ Pending', confirmed: '✅ Confirmed', cancelled: '❌ Cancelled', online: '💳 Online', cash: '💵 Cash', empty: 'No bookings yet', share: 'Share your booking link!', loading: 'Loading...' },
  }
  const tx = TX[lang] || TX.ar

  useEffect(() => {
    axios.get(`${API}/bookings`, { headers })
      .then(r => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const confirmBooking = async (id) => {
    const { data } = await axios.put(`${API}/bookings/${id}/confirm`, {}, { headers })
    setBookings(bookings.map(b => b._id === id ? data : b))
  }

  const cancelBooking = async (id) => {
    const { data } = await axios.put(`${API}/bookings/${id}/cancel`, {}, { headers })
    setBookings(bookings.map(b => b._id === id ? data : b))
  }

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  if (loading) return <div className="text-center py-8 text-gray-400">{tx.loading}</div>

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h3 className="text-lg font-bold text-gray-800 mb-6">📅 {tx.title} ({bookings.length})</h3>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400">
          <p className="text-4xl mb-2">📅</p>
          <p>{tx.empty}</p>
          <p className="text-sm mt-2">{tx.share}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b">
                <th className="text-right px-4 py-3">{tx.client}</th>
                <th className="text-right px-4 py-3">{tx.vehicle}</th>
                <th className="text-right px-4 py-3">{tx.from}</th>
                <th className="text-right px-4 py-3">{tx.to}</th>
                <th className="text-right px-4 py-3">{tx.amount}</th>
                <th className="text-right px-4 py-3">{tx.payment}</th>
                <th className="text-right px-4 py-3">{tx.status}</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.clientName}</p>
                    <p className="text-gray-400 text-xs">{b.clientPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{b.vehicle?.name || '-'}</td>
                  <td className="px-4 py-3">{b.startDate}</td>
                  <td className="px-4 py-3">{b.endDate}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{b.totalPrice} MAD</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${b.paymentMethod === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {b.paymentMethod === 'online' ? tx.online : tx.cash}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColor[b.status]}`}>
                      {b.status === 'pending' ? tx.pending : b.status === 'confirmed' ? tx.confirmed : tx.cancelled}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => confirmBooking(b._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600">
                            {tx.confirm}
                          </button>
                          <button onClick={() => cancelBooking(b._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600">
                            {tx.reject}
                          </button>
                        </>
                      )}
                      <button onClick={() => {
                        const days = Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24))
                        const msg = `🚗 *${tx.title}!*\n\n👤 ${b.clientName}\n📞 ${b.clientPhone}\n🚘 ${b.vehicle?.name}\n📅 ${b.startDate} → ${b.endDate}\n⏱️ ${days} ${lang === 'ar' ? 'يوم' : 'days'}\n💰 ${b.totalPrice} MAD`
                        window.open(`https://wa.me/${b.clientPhone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
                      }}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700">
                        {tx.whatsapp}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default BookingsPage