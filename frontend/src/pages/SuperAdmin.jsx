import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:5000/api'

function SuperAdmin() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${API}/superadmin/companies`, { headers })
      .then(r => setCompanies(r.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [])

  const activate = async (id) => {
    const { data } = await axios.put(`${API}/superadmin/companies/${id}/activate`, {}, { headers })
    setCompanies(companies.map(c => c._id === id ? data : c))
  }

  const deactivate = async (id) => {
    const { data } = await axios.put(`${API}/superadmin/companies/${id}/deactivate`, {}, { headers })
    setCompanies(companies.map(c => c._id === id ? data : c))
  }

  const changePlan = async (id, plan) => {
    const { data } = await axios.put(`${API}/superadmin/companies/${id}/plan`, { plan }, { headers })
    setCompanies(companies.map(c => c._id === id ? data : c))
  }

  const deleteCompany = async (id) => {
    if (!confirm('واش بغيتي تحذف هاد الشركة؟')) return
    await axios.delete(`${API}/superadmin/companies/${id}`, { headers })
    setCompanies(companies.filter(c => c._id !== id))
  }

  const statusColor = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    trial: 'bg-yellow-100 text-yellow-700',
  }

  const statusLabel = {
    active: '✅ نشط',
    inactive: '🔴 موقف',
    trial: '⏳ تجريبي',
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">جاري التحميل...</div>

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <h1 className="font-bold text-lg">Super Admin</h1>
            <p className="text-blue-300 text-xs">CarRental Pro - لوحة التحكم الرئيسية</p>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login') }}
          className="text-blue-300 hover:text-white text-sm">
          🚪 خروج
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'إجمالي الشركات', value: companies.length, icon: '🏢' },
            { label: 'نشطة', value: companies.filter(c => c.subscriptionStatus === 'active').length, icon: '✅' },
            { label: 'تجريبية', value: companies.filter(c => c.subscriptionStatus === 'trial').length, icon: '⏳' },
            { label: 'موقفة', value: companies.filter(c => c.subscriptionStatus === 'inactive').length, icon: '🔴' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-3xl mb-2">{s.icon}</p>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-bold text-gray-800">قائمة الشركات ({companies.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b">
                <th className="text-right px-4 py-3">الشركة</th>
                <th className="text-right px-4 py-3">الإيميل</th>
                <th className="text-right px-4 py-3">الخطة</th>
                <th className="text-right px-4 py-3">الحالة</th>
                <th className="text-right px-4 py-3">انتهاء الاشتراك</th>
                <th className="text-right px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">لا توجد شركات بعد</td></tr>
              ) : companies.map((c) => (
                <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.company}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="px-4 py-3">
                    <select value={c.subscriptionPlan} onChange={e => changePlan(c._id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none">
                      <option value="starter">Starter - 30</option>
                      <option value="pro">Pro - 100</option>
                      <option value="enterprise">Enterprise - ∞</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColor[c.subscriptionStatus]}`}>
                      {statusLabel[c.subscriptionStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.subscriptionEnd ? new Date(c.subscriptionEnd).toLocaleDateString('ar-MA') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.subscriptionStatus !== 'active' ? (
                        <button onClick={() => activate(c._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600">
                          ✅ تفعيل
                        </button>
                      ) : (
                        <button onClick={() => deactivate(c._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600">
                          🔴 إيقاف
                        </button>
                      )}
                      <button onClick={() => deleteCompany(c._id)}
                        className="border border-red-200 text-red-500 px-3 py-1 rounded-lg text-xs hover:bg-red-50">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SuperAdmin