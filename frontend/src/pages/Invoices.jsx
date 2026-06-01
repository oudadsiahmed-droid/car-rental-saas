import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import { getContracts } from '../api'

function Invoices() {
  const { t } = useLang()
  const [contracts, setContracts] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    getContracts().then(r => setContracts(r.data)).catch(() => {})
  }, [])

  const calcDays = (start, end) => {
    if (!start || !end) return 0
    return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
  }

  const handlePrint = (contract) => {
    const days = calcDays(contract.startDate, contract.endDate)
    const total = days * contract.pricePerDay
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; }
          .page { width: 210mm; margin: 0 auto; padding: 15mm; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px; }
          .title { text-align: center; margin: 20px 0; }
          .title h1 { font-size: 24px; color: #1e3a8a; font-weight: bold; }
          .badge { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 20px; display: inline-block; margin-top: 10px; font-weight: bold; color: #1e3a8a; }
          .section { margin: 15px 0; }
          .section-title { background: #1e3a8a; color: white; padding: 8px 15px; border-radius: 6px; font-size: 14px; font-weight: bold; margin-bottom: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .field { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; background: #f9fafb; }
          .field label { font-size: 11px; color: #6b7280; display: block; }
          .field span { font-size: 13px; font-weight: 600; }
          .total { background: #1e3a8a; color: white; border-radius: 10px; padding: 15px 20px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; }
          .total-amount { font-size: 32px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div>
              <div style="font-size:24px;font-weight:bold;color:#1e3a8a">CarRental Pro</div>
              <div style="font-size:12px;color:#6b7280">نظام كراء السيارات</div>
            </div>
            <div style="text-align:left;font-size:12px;color:#6b7280">
              <div>📞 0661234567</div>
              <div>✉️ info@carrental.ma</div>
            </div>
          </div>
          <div class="title">
            <h1>🧾 فاتورة</h1>
            <div class="badge">رقم: FAC-${contract._id?.slice(-6).toUpperCase()}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:5px">تاريخ: ${new Date().toLocaleDateString('ar-MA')}</div>
          </div>
          <div class="section">
            <div class="section-title">👤 معلومات الزبون</div>
            <div class="grid">
              <div class="field"><label>الاسم</label><span>${contract.clientName}</span></div>
              <div class="field"><label>CIN</label><span>${contract.clientCin}</span></div>
              <div class="field"><label>الهاتف</label><span>${contract.clientPhone}</span></div>
              <div class="field"><label>المدينة</label><span>${contract.clientCity}</span></div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">🚗 تفاصيل الكراء</div>
            <div class="grid">
              <div class="field"><label>السيارة</label><span>${contract.carName}</span></div>
              <div class="field"><label>اللوحة</label><span>${contract.carPlate}</span></div>
              <div class="field"><label>من</label><span>${contract.startDate}</span></div>
              <div class="field"><label>إلى</label><span>${contract.endDate}</span></div>
              <div class="field"><label>عدد الأيام</label><span>${days} يوم</span></div>
              <div class="field"><label>السعر اليومي</label><span>${contract.pricePerDay} MAD</span></div>
            </div>
          </div>
          <div class="total">
            <div>
              <div style="font-size:13px;opacity:0.8">المبلغ الإجمالي</div>
              <div style="font-size:12px;opacity:0.6">${days} يوم × ${contract.pricePerDay} MAD</div>
            </div>
            <div class="total-amount">${total} MAD</div>
          </div>
          <div class="footer">شكراً لثقتكم | CarRental Pro © 2026</div>
        </div>
      </body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div dir={t.dir}>
      <h3 className="text-lg font-bold text-gray-800 mb-6">🧾 {t.invoices}</h3>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 border-b">
              <th className="text-right px-4 py-3">N°</th>
              <th className="text-right px-4 py-3">{t.client}</th>
              <th className="text-right px-4 py-3">{t.vehicle}</th>
              <th className="text-right px-4 py-3">{t.days}</th>
              <th className="text-right px-4 py-3">{t.amount}</th>
              <th className="text-right px-4 py-3">{t.date}</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">لا توجد فواتير بعد</td></tr>
            ) : contracts.map((c) => {
              const days = calcDays(c.startDate, c.endDate)
              const total = days * c.pricePerDay
              return (
                <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-blue-600 font-bold">
                    FAC-{c._id?.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 font-medium">{c.clientName}</td>
                  <td className="px-4 py-3 text-gray-500">{c.carName}</td>
                  <td className="px-4 py-3">{days} {t.days}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{total} MAD</td>
                  <td className="px-4 py-3 text-gray-400">{c.startDate}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handlePrint(c)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700">
                      {t.print}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Invoices