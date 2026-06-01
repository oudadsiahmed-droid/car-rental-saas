import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GPSMap from '../components/GPSMap'
import Contracts from './Contracts'
import Invoices from './Invoices'
import BookingsPage from './BookingsPage'
import { useLang } from '../context/LangContext'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getClients, createClient, updateClient, deleteClient, getContracts } from '../api'
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

function Dashboard() {
  const navigate = useNavigate()
  const { t, lang, setLang } = useLang()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [clients, setClients] = useState([])
  const [logo, setLogo] = useState(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [clientForm, setClientForm] = useState({ name: '', cin: '', phone: '', city: '', cinFront: null, cinBack: null, permis: null })
  const [viewClient, setViewClient] = useState(null)
  const [form, setForm] = useState({ name: '', plate: '', price: '', status: 'مكتراة', image: null })
  const [contracts, setContracts] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    getContracts().then(r => setContracts(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user._id || user.id
    if (!userId) return
    const socket = io('http://localhost:5000')
    socket.emit('join', userId)
    socket.on('new_booking', (data) => {
      setNotifications(prev => [data, ...prev])
      try {
        const ctx = new AudioContext()
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g)
        g.connect(ctx.destination)
        o.frequency.setValueAtTime(800, ctx.currentTime)
        o.frequency.setValueAtTime(600, ctx.currentTime + 0.1)
        o.frequency.setValueAtTime(800, ctx.currentTime + 0.2)
        g.gain.setValueAtTime(0.3, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        o.start(ctx.currentTime)
        o.stop(ctx.currentTime + 0.5)
      } catch(e) {}
      if (Notification.permission === 'granted') {
        new Notification('🔔 حجز جديد!', {
          body: `${data.clientName} - ${data.vehicle} - ${data.totalPrice} MAD`,
          icon: '/favicon.svg'
        })
      } else {
        Notification.requestPermission()
      }
    })
    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    getVehicles().then(r => setVehicles(r.data)).catch(() => {})
    getClients().then(r => setClients(r.data)).catch(() => {})
  }, [])

  const openAddClient = () => { setEditingClient(null); setClientForm({ name: '', cin: '', phone: '', city: '', cinFront: null, cinBack: null, permis: null }); setShowClientModal(true) }
  const openEditClient = (client) => { setEditingClient(client._id); setClientForm({ name: client.name, cin: client.cin, phone: client.phone, city: client.city, cinFront: client.cinFront||null, cinBack: client.cinBack||null, permis: client.permis||null }); setShowClientModal(true) }
  const handleDeleteClient = async (id) => {
    if (confirm(t.delete + '?')) {
      await deleteClient(id)
      setClients(clients.filter(c => c._id !== id))
    }
  }
  const handleSaveClient = async () => {
    if (!clientForm.name || !clientForm.cin || !clientForm.phone) return alert('!')
    if (editingClient) {
      const { data } = await updateClient(editingClient, clientForm)
      setClients(clients.map(c => c._id === editingClient ? data : c))
    } else {
      const { data } = await createClient(clientForm)
      setClients([...clients, data])
    }
    setShowClientModal(false)
  }

  const today = new Date()
  const alerts = []
  vehicles.forEach(v => {
    const visiteDays = Math.ceil((new Date(v.visite) - today) / (1000 * 60 * 60 * 24))
    const assuranceDays = Math.ceil((new Date(v.assurance) - today) / (1000 * 60 * 60 * 24))
    if (visiteDays <= 30) alerts.push({ car: v.name, plate: v.plate, type: 'Visite Technique', days: visiteDays, color: visiteDays <= 7 ? 'red' : visiteDays <= 15 ? 'orange' : 'yellow' })
    if (assuranceDays <= 30) alerts.push({ car: v.name, plate: v.plate, type: 'Assurance', days: assuranceDays, color: assuranceDays <= 7 ? 'red' : assuranceDays <= 15 ? 'orange' : 'yellow' })
  })

  const statusMap = {
    'مكتراة': t.rented,
    'متاحة': t.available,
    'صيانة': t.maintenance,
  }
  const statusColor = {
    'مكتراة': 'bg-green-100 text-green-700',
    'متاحة': 'bg-blue-100 text-blue-700',
    'صيانة': 'bg-red-100 text-red-700',
  }

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: t.dashboard },
    { id: 'vehicles', icon: '🚗', label: t.vehicles },
    { id: 'clients', icon: '👥', label: t.clients },
    { id: 'contracts', icon: '📄', label: t.contracts },
    { id: 'invoices', icon: '🧾', label: t.invoices },
{ id: 'bookings', icon: '📅', label: lang === 'ar' ? 'الحجوزات' : lang === 'fr' ? 'Réservations' : 'Bookings' },
    { id: 'gps', icon: '📡', label: t.gps },
    { id: 'minisite', icon: '🌐', label: lang === 'ar' ? 'موقع الحجز' : lang === 'fr' ? 'Site de réservation' : 'Booking Site' },
{ id: 'settings', icon: '⚙️', label: t.settings },
  ]

  const openAdd = () => { setEditingVehicle(null); setForm({ name: '', plate: '', price: '', status: 'متاحة', image: null }); setShowVehicleModal(true) }
  const openEdit = (car) => { setEditingVehicle(car._id); setForm({ name: car.name, plate: car.plate, price: car.price, status: car.status, image: car.image }); setShowVehicleModal(true) }
  const handleDelete = async (id) => {
    if (confirm(t.delete + '?')) {
      await deleteVehicle(id)
      setVehicles(vehicles.filter(v => v._id !== id))
    }
  }
  const handleSave = async () => {
    if (!form.name || !form.plate || !form.price) return alert('!')
    if (editingVehicle) {
      const { data } = await updateVehicle(editingVehicle, form)
      setVehicles(vehicles.map(v => v._id === editingVehicle ? data : v))
    } else {
      const { data } = await createVehicle(form)
      setVehicles([...vehicles, data])
    }
    setShowVehicleModal(false)
  }
  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) { const reader = new FileReader(); reader.onload = () => setForm({ ...form, image: reader.result }); reader.readAsDataURL(file) }
  }

  return (
    <div className="flex h-screen bg-gray-100" dir={t.dir}>
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-700">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden shadow-lg" onClick={() => document.getElementById('logoInput').click()}>
              {logo ? <img src={logo} className="w-full h-full object-contain p-1" /> : <span className="text-5xl">🚗</span>}
              <input id="logoInput" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if(f){ const r = new FileReader(); r.onload = () => setLogo(r.result); r.readAsDataURL(f) }}} />
            </div>
            <div className="text-center">
              <h1 className="font-bold text-lg">{JSON.parse(localStorage.getItem('user') || '{}').company || t.appName}</h1>
              <p className="text-blue-300 text-xs">{t.appSubtitle}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${activeMenu === item.id ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-800'}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-700 space-y-2 bg-blue-900">
          <div className="flex gap-1 justify-center">
            {['ar', 'fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${lang === l ? 'bg-white text-blue-900' : 'text-blue-300 hover:bg-blue-800'}`}>
                {l === 'ar' ? '🇲🇦 ع' : l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
              </button>
            ))}
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login') }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-blue-800 mt-auto">
            <span>🚪</span><span className="text-white">{t.logout}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {activeMenu === 'alerts' ? `🔔 ${t.alerts}` : menuItems.find(m => m.id === activeMenu)?.label}
          </h2>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <div className="relative cursor-pointer" onClick={() => setActiveMenu('bookings')}>
                <span className="text-2xl animate-bounce">🟢</span>
                <span className="absolute -top-1 -left-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{notifications.length}</span>
              </div>
            )}
            {alerts.length > 0 && (
              <div className="relative cursor-pointer" onClick={() => setActiveMenu('alerts')}>
                <span className="text-2xl">🔔</span>
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{alerts.length}</span>
              </div>
            )}
            <div className="flex gap-1">
              {['ar', 'fr', 'en'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`w-9 h-9 rounded-full text-xs font-bold transition ${lang === l ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {l === 'ar' ? 'ع' : l === 'fr' ? 'FR' : 'EN'}
                </button>
              ))}
            </div>
            <span className="text-gray-500 text-sm">{JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin'}</span>
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {(JSON.parse(localStorage.getItem('user') || '{}').name || 'A')[0].toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">

          {activeMenu === 'dashboard' && (
            <div>
              {alerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 cursor-pointer" onClick={() => setActiveMenu('alerts')}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔔</span>
                    <div>
                      <p className="font-bold text-red-700">{alerts.length} {t.alertsNeedAttention}</p>
                      <p className="text-sm text-red-500">{t.clickForDetails}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: t.totalVehicles, value: vehicles.length, icon: '🚗', color: 'bg-blue-500' },
                  { label: t.rentedVehicles, value: vehicles.filter(v => v.status === 'مكتراة').length, icon: '🔑', color: 'bg-green-500' },
                  { label: t.availableVehicles, value: vehicles.filter(v => v.status === 'متاحة').length, icon: '✅', color: 'bg-yellow-500' },
                  { label: t.monthRevenue, value: `${contracts.filter(c => { const d = new Date(c.startDate); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).reduce((sum, c) => sum + (Math.ceil((new Date(c.endDate) - new Date(c.startDate)) / (1000*60*60*24)) * c.pricePerDay), 0).toLocaleString()} MAD`, icon: '💰', color: 'bg-purple-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-5">
                    <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3`}>{stat.icon}</div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-4">{t.lastContracts}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b">
                      <th className="text-right pb-3">{t.client}</th>
                      <th className="text-right pb-3">{t.vehicle}</th>
                      <th className="text-right pb-3">{t.date}</th>
                      <th className="text-right pb-3">{t.amount}</th>
                      <th className="text-right pb-3">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.slice(0, 5).map((row, i) => {
                      const days = Math.ceil((new Date(row.endDate) - new Date(row.startDate)) / (1000 * 60 * 60 * 24))
                      const total = days * row.pricePerDay
                      return (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3">{row.clientName}</td>
                        <td className="py-3">{row.carName}</td>
                        <td className="py-3">{row.startDate}</td>
                        <td className="py-3 font-medium">{total} MAD</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{row.status === 'نشط' ? t.active : t.expired}</span>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'alerts' && (
            <div>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <p className="text-4xl mb-2">✅</p>
                    <p className="text-gray-500">{t.noAlerts}</p>
                  </div>
                ) : alerts.map((alert, i) => (
                  <div key={i} className={`bg-white rounded-xl shadow-sm p-5 border-r-4 flex justify-between items-center ${alert.color === 'red' ? 'border-red-500' : alert.color === 'orange' ? 'border-orange-500' : 'border-yellow-500'}`}>
                    <div>
                      <p className="font-bold text-gray-800 text-base">{alert.car}</p>
                      <p className="text-gray-400 text-sm">{alert.plate}</p>
                      <p className="text-sm mt-1 font-medium text-gray-600">⚠️ {alert.type}</p>
                    </div>
                    <div className={`text-center px-5 py-3 rounded-xl ${alert.color === 'red' ? 'bg-red-100 text-red-700' : alert.color === 'orange' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {alert.days <= 0
                        ? <p className="font-bold text-sm">{t.expired_label}</p>
                        : <><p className="font-bold text-2xl">{alert.days}</p><p className="text-xs">{t.days}</p></>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'vehicles' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">{t.vehicles} ({vehicles.length})</h3>
                <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">{t.addVehicle}</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {vehicles.map((car) => {
                  const visiteDays = Math.ceil((new Date(car.visite) - today) / (1000 * 60 * 60 * 24))
                  const assuranceDays = Math.ceil((new Date(car.assurance) - today) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={car.id} className="bg-white rounded-xl shadow-sm p-5">
                      {car.image ? <img src={car.image} className="h-20 mx-auto object-contain rounded mb-3" /> : <div className="text-5xl text-center mb-3">🚗</div>}
                      <h4 className="font-bold text-gray-800 text-center">{car.name}</h4>
                      <p className="text-gray-400 text-sm text-center mb-2">{car.plate}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-blue-600">{car.price} {t.perDay}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColor[car.status]}`}>{statusMap[car.status]}</span>
                      </div>
                      <div className="text-xs space-y-1 border-t pt-2">
                        <div className={`flex justify-between ${visiteDays <= 15 ? 'text-red-500' : 'text-gray-400'}`}>
                          <span>🔧 Visite</span>
                          <span>{visiteDays <= 0 ? t.expired_label : `${visiteDays} ${t.days}`}</span>
                        </div>
                        <div className={`flex justify-between ${assuranceDays <= 15 ? 'text-red-500' : 'text-gray-400'}`}>
                          <span>🛡️ Assurance</span>
                          <span>{assuranceDays <= 0 ? t.expired_label : `${assuranceDays} ${t.days}`}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => openEdit(car)} className="flex-1 border border-gray-200 text-gray-600 py-1 rounded-lg text-xs hover:bg-gray-50">{t.edit}</button>
                        <button onClick={() => handleDelete(car.id)} className="flex-1 border border-red-200 text-red-500 py-1 rounded-lg text-xs hover:bg-red-50">{t.delete}</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeMenu === 'clients' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">{t.clients} ({clients.length})</h3>
                <button onClick={openAddClient} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">{t.addClient}</button>
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 border-b">
                      <th className="text-right px-4 py-3">{t.fullName}</th>
                      <th className="text-right px-4 py-3">{t.cinNumber}</th>
                      <th className="text-right px-4 py-3">{t.phone}</th>
                      <th className="text-right px-4 py-3">{t.city}</th>
                      <th className="text-right px-4 py-3">{t.rentals}</th>
                      <th className="text-right px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{client.name}</td>
                        <td className="px-4 py-3 text-gray-500">{client.cin}</td>
                        <td className="px-4 py-3">{client.phone}</td>
                        <td className="px-4 py-3">{client.city}</td>
                        <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{client.rentals} {t.rentals}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setViewClient(client)} className="border border-blue-200 text-blue-600 px-3 py-1 rounded-lg text-xs hover:bg-blue-50">📋 {t.clientFile}</button>
                            <button onClick={() => openEditClient(client)} className="border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs hover:bg-gray-50">{t.edit}</button>
                            <button onClick={() => handleDeleteClient(client.id)} className="border border-red-200 text-red-500 px-3 py-1 rounded-lg text-xs hover:bg-red-50">{t.delete}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'contracts' && <Contracts vehicles={vehicles} clients={clients} />}
          {activeMenu === 'bookings' && <BookingsPage />}
          {activeMenu === 'minisite' && (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="text-6xl mb-4">🌐</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {lang === 'ar' ? 'موقع الحجز الخاص بك' : lang === 'fr' ? 'Votre site de réservation' : 'Your Booking Website'}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {lang === 'ar' ? 'شارك هذا الرابط مع زبنائك باش يحجزو أونلاين' : lang === 'fr' ? 'Partagez ce lien avec vos clients' : 'Share this link with your customers'}
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                  <p className="text-blue-600 font-mono text-sm break-all">
                    {window.location.origin}/booking/{JSON.parse(localStorage.getItem('user') || '{}').company?.toLowerCase().replace(/\s+/g, '-') || 'your-company'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => {
                    const url = `${window.location.origin}/booking/${JSON.parse(localStorage.getItem('user') || '{}').company?.toLowerCase().replace(/\s+/g, '-')}`
                    navigator.clipboard.writeText(url)
                    alert(lang === 'ar' ? '✅ تم نسخ الرابط!' : '✅ Copied!')
                  }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700">
                    📋 {lang === 'ar' ? 'نسخ الرابط' : lang === 'fr' ? 'Copier le lien' : 'Copy Link'}
                  </button>
                  <button onClick={() => {
                    const url = `${window.location.origin}/booking/${JSON.parse(localStorage.getItem('user') || '{}').company?.toLowerCase().replace(/\s+/g, '-')}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank')
                  }} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700">
                    💬 {lang === 'ar' ? 'مشاركة واتساب' : lang === 'fr' ? 'Partager WhatsApp' : 'Share WhatsApp'}
                  </button>
                </div>
                <button onClick={() => {
                  const url = `${window.location.origin}/booking/${JSON.parse(localStorage.getItem('user') || '{}').company?.toLowerCase().replace(/\s+/g, '-')}`
                  window.open(url, '_blank')
                }} className="w-full mt-3 border border-blue-200 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50">
                  🔗 {lang === 'ar' ? 'فتح الموقع' : lang === 'fr' ? 'Ouvrir le site' : 'Open Website'}
                </button>
              </div>
            </div>
          )}
{activeMenu === 'invoices' && <Invoices />}
          {activeMenu === 'gps' && <GPSMap vehicles={vehicles} statusColor={statusColor} />}

          {activeMenu === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">{t.companyInfo}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-600 block mb-1">{t.companyName}</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="CarRental Pro" /></div>
                  <div><label className="text-sm text-gray-600 block mb-1">{t.phone}</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="0661234567" /></div>
                  <div><label className="text-sm text-gray-600 block mb-1">{t.email}</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="info@carrental.ma" /></div>
                  <div><label className="text-sm text-gray-600 block mb-1">{t.city}</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="الرباط" /></div>
                  <div className="col-span-2"><label className="text-sm text-gray-600 block mb-1">{t.address}</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="شارع محمد الخامس، الرباط" /></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">{t.gpsSettings}</h3>
                <div className="flex items-center justify-between mb-4">
                  <div><p className="font-medium text-gray-700">{t.enableTracking}</p></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-600 block mb-1">Server IP</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="196.x.x.x" /></div>
                  <div><label className="text-sm text-gray-600 block mb-1">Port</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5000" /></div>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">{t.saveChanges}</button>
            </div>
          )}

          {activeMenu !== 'dashboard' && activeMenu !== 'alerts' && activeMenu !== 'vehicles' && activeMenu !== 'clients' && activeMenu !== 'contracts' && activeMenu !== 'gps' && activeMenu !== 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-6xl mb-4">{menuItems.find(m => m.id === activeMenu)?.icon}</p>
              <p className="text-gray-500">{menuItems.find(m => m.id === activeMenu)?.label}</p>
            </div>
          )}

        </div>
      </div>

      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto" dir={t.dir}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingVehicle ? t.edit : t.addVehicle}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">📷</label>
                <div onClick={() => document.getElementById('carImage').click()} className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400">
                  {form.image ? <img src={form.image} className="h-24 mx-auto object-contain rounded" /> : <div className="text-gray-400"><p className="text-3xl">📷</p><p className="text-xs mt-1">{t.clickToUpload}</p></div>}
                  <input id="carImage" type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </div>
              </div>
              <div><label className="text-sm text-gray-600 block mb-1">{t.vehicleName}</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">{t.plateNumber}</label><input value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">{t.dailyPrice}</label><input value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">{t.status}</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="متاحة">{t.available}</option><option value="مكتراة">{t.rented}</option><option value="صيانة">{t.maintenance}</option></select></div>
              <div><label className="text-sm text-gray-600 block mb-1">🔧 Visite Technique</label><input type="date" value={form.visite||''} onChange={e => setForm({...form, visite: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">🛡️ Assurance</label><input type="date" value={form.assurance||''} onChange={e => setForm({...form, assurance: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{t.save}</button>
              <button onClick={() => setShowVehicleModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {viewClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-auto" dir={t.dir}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">📋 {t.clientFile}</h3>
              <button onClick={() => setViewClient(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                {[{label:t.fullName, value:viewClient.name},{label:t.cinNumber, value:viewClient.cin},{label:t.phone, value:viewClient.phone},{label:t.city, value:viewClient.city}].map((f,i) => (
                  <div key={i}><p className="text-xs text-gray-500">{f.label}</p><p className="font-bold text-gray-800">{f.value}</p></div>
                ))}
              </div>
            </div>
            <h4 className="font-bold text-gray-700 mb-3">📎 {t.documents}</h4>
            <div className="grid grid-cols-1 gap-4">
              {[{label:`🪪 ${t.cinFront}`, img:viewClient.cinFront},{label:`🪪 ${t.cinBack}`, img:viewClient.cinBack},{label:`🚗 ${t.permis}`, img:viewClient.permis}].map((doc,i) => (
                <div key={i}>
                  <p className="text-sm text-gray-600 mb-2">{doc.label}</p>
                  {doc.img ? <img src={doc.img} className="w-full rounded-xl border border-gray-200 object-contain max-h-48" /> : <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">{t.notUploaded}</div>}
                </div>
              ))}
            </div>
            <button onClick={() => setViewClient(null)} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{t.close}</button>
          </div>
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-auto" dir={t.dir}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingClient ? t.edit : t.addClient}</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-600 block mb-1">{t.fullName}</label><input value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">{t.cinNumber}</label><input value={clientForm.cin} onChange={e => setClientForm({...clientForm, cin: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">{t.phone}</label><input value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">{t.city}</label><input value={clientForm.city} onChange={e => setClientForm({...clientForm, city: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="font-medium text-blue-600 border-b pb-2 mt-2">📎 {t.documents}</div>
              {[{label:`🪪 ${t.cinFront}`, key:'cinFront'},{label:`🪪 ${t.cinBack}`, key:'cinBack'},{label:`🚗 ${t.permis}`, key:'permis'}].map((doc) => (
                <div key={doc.key}>
                  <label className="text-sm text-gray-600 block mb-1">{doc.label}</label>
                  <div onClick={() => document.getElementById(doc.key).click()} className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400">
                    {clientForm[doc.key] ? <img src={clientForm[doc.key]} className="h-20 mx-auto object-contain rounded" /> : <div className="text-gray-400"><p className="text-2xl">📷</p><p className="text-xs mt-1">{t.clickToUpload}</p></div>}
                    <input id={doc.key} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files[0]; if(f){const r=new FileReader();r.onload=()=>setClientForm({...clientForm,[doc.key]:r.result});r.readAsDataURL(f)}}} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSaveClient} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{t.save}</button>
              <button onClick={() => setShowClientModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard