import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

function SignPage() {
  const { id } = useParams()
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signature, setSignature] = useState(null)
  const [signed, setSigned] = useState(false)

  const startDraw = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
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
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1e3a8a'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDraw = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature(null)
  }

  const handleConfirm = () => {
    const canvas = canvasRef.current
    setSignature(canvas.toDataURL())
    setSigned(true)
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <p className="text-6xl mb-4">✅</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">شكراً!</h2>
          <p className="text-gray-500 text-sm">تم التوقيع على العقد بنجاح</p>
          <p className="text-blue-600 font-bold mt-2">رقم العقد: {id}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">

        {/* Header */}
        <div className="bg-blue-900 text-white p-6 rounded-t-2xl text-center">
          <p className="text-3xl mb-2">🚗</p>
          <h1 className="text-xl font-bold">CarRental Pro</h1>
          <p className="text-blue-300 text-sm mt-1">توقيع عقد الكراء</p>
        </div>

        <div className="p-6">
          {/* Contract Info */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">رقم العقد</p>
            <p className="font-bold text-blue-600 text-lg">{id}</p>
          </div>

          {/* Instructions */}
          <p className="text-gray-600 text-sm mb-3 text-center">
            ✍️ وقع بإصبعك فالمربع أسفله للموافقة على شروط العقد
          </p>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={380}
            height={180}
            className="border-2 border-dashed border-blue-300 rounded-xl w-full cursor-crosshair bg-blue-50 touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />

          <p className="text-xs text-gray-400 text-center mt-2">
            بالتوقيع، أنت توافق على جميع شروط عقد الكراء
          </p>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button onClick={handleConfirm}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold">
              ✅ تأكيد التوقيع
            </button>
            <button onClick={clearCanvas}
              className="bg-gray-100 text-gray-600 px-4 py-3 rounded-xl hover:bg-gray-200">
              🗑️
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SignPage