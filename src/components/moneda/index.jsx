import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useFavoritos } from '../../context/FavoritosContext.jsx'
import './style.css'

function Moneda() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [moneda, setMoneda] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensajeCompartir, setMensajeCompartir] = useState('')
  const { esFavorito, toggleFavorito } = useFavoritos()
  const precio = moneda?.market_data?.current_price?.usd

  useEffect(() => {
    setCargando(true)
    setError('')
    setMoneda(null)
    setMensajeCompartir('')

    const cargarMoneda = async () => {
      try {
        // El id de la URL permite consultar el detalle de una moneda.
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}`)
        if (response.status === 429) {
          throw new Error('CoinGecko está recibiendo muchas solicitudes. Inténtalo de nuevo en unos minutos.')
        }
        if (!response.ok) throw new Error('No se pudo cargar el detalle de la moneda.')
        const responseData = await response.json()
        setMoneda(responseData)
      } catch (error) {
        console.error('Error:', error)
        setError(error.message || 'No se pudo cargar el detalle de la moneda.')
      } finally {
        setCargando(false)
      }
    }

    cargarMoneda()
  }, [id])

  const compartirMoneda = async () => {
    setMensajeCompartir('')
    const precioTexto = precio === undefined || precio === null
      ? 'No disponible'
      : precio.toLocaleString('es-CO', { style: 'currency', currency: 'USD' })
    const url = window.location.href

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: moneda.name,
          text: `${moneda.name}: precio actual en USD ${precioTexto}`,
          url
        })
        setMensajeCompartir('Moneda compartida.')
      } else if (typeof navigator.clipboard?.writeText === 'function') {
        await navigator.clipboard.writeText(url)
        setMensajeCompartir('Enlace copiado al portapapeles.')
      } else {
        throw new Error('Este navegador no permite compartir ni copiar el enlace.')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('No se pudo compartir la moneda:', error)
        setMensajeCompartir(error.message || 'No se pudo compartir la moneda.')
      }
    }
  }

  const botonVolver = (
    <button type="button" onClick={() => navigate(-1)}>Volver</button>
  )

  if (cargando) {
    return <main className="c-detalle-moneda">{botonVolver}<p>Cargando...</p></main>
  }
  if (error) {
    return <main className="c-detalle-moneda">{botonVolver}<p>{error}</p></main>
  }
  if (!moneda) {
    return <main className="c-detalle-moneda">{botonVolver}<p>No se encontró la moneda.</p></main>
  }

  const esFavoritoActual = esFavorito(moneda.id)

  return (
    <main className="c-detalle-moneda">
      {botonVolver}
      <h1>{moneda.name}</h1>
      <p>Símbolo: {moneda.symbol?.toUpperCase()}</p>
      {moneda.image?.large && (
        <img src={moneda.image.large} alt={`Imagen de ${moneda.name}`} width="160" />
      )}
      <p>
        Precio actual en USD: {precio === undefined || precio === null
          ? 'No disponible'
          : precio.toLocaleString('es-CO', { style: 'currency', currency: 'USD' })}
      </p>
      <button
        type="button"
        onClick={() => toggleFavorito({ id: moneda.id, nombre: moneda.name })}
        aria-label={esFavoritoActual ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {esFavoritoActual ? '❤️' : '🤍'}
      </button>
      <button type="button" onClick={compartirMoneda}>Compartir</button>
      {mensajeCompartir && <p role="status">{mensajeCompartir}</p>}
    </main>
  )
}

export default Moneda