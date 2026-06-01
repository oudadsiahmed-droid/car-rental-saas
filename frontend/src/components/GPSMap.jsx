import { useEffect, useRef, useState } from 'react'
import { useLang } from '../context/LangContext'

function GPSMap({ vehicles, statusColor }) {
  const { t } = useLang()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [selectedCar, setSelectedCar] = useState(null)

  const carPositions = [
    { id: 1, lat: 34.020882, lng: -6.841650, speed: '45 km/h' },
    { id: 2, lat: 33.573109, lng: -7.589843, speed: '60 km/h' },
    { id: 3, lat: 31.630000, lng: -8.008890, speed: '0 km/h' },
    { id: 4, lat: 34.260000, lng: -4.000000, speed: '30 km/h' },
    { id: 5, lat: 35.760000, lng: -5.833000, speed: '55 km/h' },
    { id: 6, lat: 33.990000, lng: -6.850000, speed: '20 km/h' },
  ]

  useEffect(() => {
    if (mapInstanceRef.current) return

    const L = window.L
    if (!L) return

    const map = L.map(mapRef.current).setView([31.7917, -7.0926], 6)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    vehicles.forEach((car, i) => {
      const pos = carPositions[i]
      if (!pos) return

      const color = car.status === 'مكتراة' ? '#22c55e' : car.status === 'متاحة' ? '#3b82f6' : '#ef4444'

      const icon = L.divIcon({
        html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🚗</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        className: ''
      })

      const marker = L.marker([pos.lat, pos.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:150px;direction:rtl">
            <b>${car.name}</b><br/>
            <span style="color:#6b7280">${car.plate}</span><br/>
            <span>السرعة: ${pos.speed}</span><br/>
            <span style="color:${color}">${car.status}</span>
          </div>
        `)

      marker.on('click', () => setSelectedCar(car))
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">تتبع السيارات - GPS</h3>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">🟢 {t.connected}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {vehicles.map((car, i) => (
          <div key={car.id}
            onClick={() => {
              setSelectedCar(car)
              const pos = carPositions[i]
              if (pos && mapInstanceRef.current) {
                mapInstanceRef.current.setView([pos.lat, pos.lng], 12)
              }
            }}
            className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer border-2 transition ${
              selectedCar?.id === car.id ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
            }`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800 text-sm">{car.name}</p>
                <p className="text-gray-400 text-xs">{car.plate}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${statusColor[car.status]}`}>{t[car.status === 'مكتراة' ? 'rented' : car.status === 'متاحة' ? 'available' : 'maintenance']}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">⚡ {carPositions[i]?.speed}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '420px' }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  )
}

export default GPSMap