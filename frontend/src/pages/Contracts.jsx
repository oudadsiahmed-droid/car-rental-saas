import { useState, useEffect } from 'react'
import Contract from './Contract'
import { useLang } from '../context/LangContext'
import { getContracts, createContract, updateContract } from '../api'

function Contracts({ vehicles, clients }) {
  const { t } = useLang()
  const [contracts, setContracts] = useState([])

  useEffect(() => {
    getContracts().then(r => setContracts(r.data)).catch(() => {})
  }, [])
  const [showModal, setShowModal] = useState(false)
  const [showContract, setShowContract] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)
  const [form, setForm] = useState({ clientName: '', clientCin: '', clientPhone: '', clientCity: '', carName: '', carPlate: '', startDate: '', endDate: '', pricePerDay: '', kmStart: '', kmEnd: '' })

  const company = { name: 'CarRental Pro', address: 'شارع محمد الخامس، الرباط', phone: '0661234567', email: 'info@carrental.ma' }

  const handleSave = async () => {
    if (!form.clientName || !form.carName || !form.startDate || !form.endDate) return alert('!')
    const { data } = await createContract({ ...form, status: 'نشط' })
    setContracts([...contracts, data])
    setShowModal(false)
    setForm({ clientName: '', clientCin: '', clientPhone: '', clientCity: '', carName: '', carPlate: '', startDate: '', endDate: '', pricePerDay: '', kmStart: '', kmEnd: '' })
  }

  const calcDays = (start, end) => {
    if (!start || !end) return 0
    return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
  }

  const handleReturn = async (id) => {
    const km = prompt('Km retour:')
    if (km) {
      const { data } = await updateContract(id, { kmEnd: km, status: 'منتهي' })
      setContracts(contracts.map(x => x._id === id ? data : x))
    }
  }

  return (
    <div dir={t.dir}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">{t.contracts} ({contracts.length})</h3>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">{t.newContract}</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 border-b">
              <th className="text-right px-4 py-3">N°</th>
              <th className="text-right px-4 py-3">{t.client}</th>
              <th className="text-right px-4 py-3">{t.vehicle}</th>
              <th className="text-right px-4 py-3">{t.days}</th>
              <th className="text-right px-4 py-3">Km</th>
              <th className="text-right px-4 py-3">{t.amount}</th>
              <th className="text-right px-4 py-3">{t.status}</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => {
              const days = calcDays(c.startDate, c.endDate)
              const total = days * c.pricePerDay
              const kmDiff = c.kmEnd && c.kmStart ? parseInt(c.kmEnd) - parseInt(c.kmStart) : null
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-blue-600 font-bold">{c._id?.slice(-6).toUpperCase() || c.id}</td>
                  <td className="px-4 py-3 font-medium">{c.clientName}</td>
                  <td className="px-4 py-3 text-gray-500">{c.carName}</td>
                  <td className="px-4 py-3">{days} {t.days}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.kmStart || '-'} → {c.kmEnd || '...'} km
                    {kmDiff && <span className="text-xs text-orange-500 mr-1">({kmDiff} km)</span>}
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600">{total} MAD</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.status === 'نشط' ? t.active : t.expired}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.status === 'نشط' && !c.kmEnd && (
                        <button onClick={() => handleReturn(c._id)} className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-orange-600">
                          🔑 Retour
                        </button>
                      )}
                      <button onClick={() => { setSelectedContract(c); setShowContract(true) }} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700">
                        {t.print}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-screen overflow-auto" dir={t.dir}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t.newContract}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 font-medium text-blue-600 border-b pb-2">{t.client}</div>
              {[
                { label: t.fullName, key: 'clientName' },
                { label: t.cinNumber, key: 'clientCin' },
                { label: t.phone, key: 'clientPhone' },
                { label: t.city, key: 'clientCity' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm text-gray-600 block mb-1">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}

              <div className="col-span-2 font-medium text-blue-600 border-b pb-2 mt-2">{t.vehicle}</div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t.vehicle}</label>
                <select value={form.carName} onChange={e => {
                  const parts = e.target.value.split('|')
                  setForm({...form, carName: parts[0], carPlate: parts[1] || '', pricePerDay: parts[2] || ''})
                }} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-</option>
                  {vehicles && vehicles.map(v => (
                    <option key={v.id} value={`${v.name}|${v.plate}|${v.price}`}>{v.name} - {v.plate}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t.dailyPrice}</label>
                <input type="number" value={form.pricePerDay} onChange={e => setForm({...form, pricePerDay: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t.date} début</label>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t.date} fin</label>
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="col-span-2 font-medium text-blue-600 border-b pb-2 mt-2">Kilométrage</div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Km départ</label>
                <input type="number" value={form.kmStart} onChange={e => setForm({...form, kmStart: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Km retour</label>
                <input type="number" value={form.kmEnd} onChange={e => setForm({...form, kmEnd: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {form.startDate && form.endDate && (
                <div className="col-span-2 bg-blue-50 rounded-lg p-3 text-center">
                  <span className="text-blue-600 font-bold">
                    {calcDays(form.startDate, form.endDate)} {t.days} × {form.pricePerDay} MAD = {calcDays(form.startDate, form.endDate) * form.pricePerDay} MAD
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{t.save}</button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {showContract && selectedContract && (
        <Contract contract={selectedContract} company={company} onClose={() => setShowContract(false)} />
      )}
    </div>
  )
}

export default Contracts