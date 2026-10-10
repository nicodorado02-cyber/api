import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './style.css'

function Tendencias() {
  const [monedas, setMonedas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const cargarTendencias = async () => {
      try {
        const respuesta = await fetch('https://api.coingecko.com/api/v3/search/trending')
        if (respuesta.status === 429) {
          throw new Error('Demasiadas peticiones a CoinGecko, espera un minuto y recarga')
        }
        if (!respuesta.ok) {
          throw new Error(`Error al cargar las tendencias (código ${respuesta.status}).`)
        }

        const datos = await respuesta.json()
        const listaMonedas = Array.isArray(datos.coins)
          ? datos.coins
            .map((resultado) => resultado.item)
            .filter((moneda) => moneda && moneda.id)
          : []
        setMonedas(listaMonedas)
      } catch (error) {
        console.error('Error:', error)
        setError(error.message || 'No se pudieron obtener las tendencias.')
      } finally {
        setCargando(false)
      }
    }

    cargarTendencias()
  }, [])

  if (cargando) return <p>Cargando...</p>
  if (error) return <p>{error}</p>

  return (
    <main className="c-tendencias">
      <h1>Monedas en tendencia</h1>
      {monedas.length === 0 ? (
        <p>No se encontraron monedas en tendencia.</p>
      ) : (
        <div className="c-lista">
          {monedas.map((moneda) => (
            <div
              key={moneda.id}
              className="c-lista-moneda"
              onClick={() => navigate(`/moneda/${moneda.id}`)}
            >
              <img
                src={moneda.thumb || moneda.small}
                alt={`Imagen de ${moneda.name}`}
                loading="lazy"
              />
              <p>{moneda.name}</p>
              <p>Símbolo: {moneda.symbol}</p>
              <p>Ranking: {moneda.market_cap_rank ?? 'No disponible'}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default Tendencias
