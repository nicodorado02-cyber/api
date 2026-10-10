import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './style.css'

function Moneda() {
  const { id } = useParams()
  const [moneda, setMoneda] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [favoritos, setFavoritos] = useState(() => {
    try {
      // Se recuperan los favoritos guardados en el navegador.
      const guardados = JSON.parse(localStorage.getItem('favoritos') || '[]')
      return Array.isArray(guardados) ? guardados : []
    } catch {
      return []
    }
  })

  const esFavorito = moneda ? favoritos.some((favorito) => favorito.id === moneda.id) : false

  useEffect(() => {
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

  const toggleFavorito = () => {
    // Se agrega o quita la moneda y se actualiza el almacenamiento local.
    const nuevosFavoritos = esFavorito
      ? favoritos.filter((favorito) => favorito.id !== moneda.id)
      : [...favoritos, { id: moneda.id, nombre: moneda.name }]

    try {
      localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos))
      setFavoritos(nuevosFavoritos)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (cargando) return <p>Cargando...</p>
  if (error) return <p>{error}</p>
  if (!moneda) return <p>No se encontró la moneda.</p>

  const precio = moneda.market_data?.current_price?.usd

  return (
    <main className="c-detalle-moneda">
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
      <button type="button" onClick={toggleFavorito} aria-label="Cambiar favorito">
        {esFavorito ? '❤️' : '🤍'}
      </button>
    </main>
  )
}

export default Moneda