import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFavoritos } from '../../context/FavoritosContext.jsx'
import './style.css'

function Inicio() {
  const [monedas, setMonedas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [busquedaFiltrada, setBusquedaFiltrada] = useState('')
  const [letraInicial, setLetraInicial] = useState('')
  const [soloFavoritos, setSoloFavoritos] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [imagenes, setImagenes] = useState({})
  const [errorImagenes, setErrorImagenes] = useState('')
  const imagenesSolicitadas = useRef(new Set())
  const navigate = useNavigate()
  const { favoritos, esFavorito, toggleFavorito } = useFavoritos()

  useEffect(() => {
    // Se actualiza la búsqueda cuando el usuario deja de escribir medio segundo.
    const temporizador = setTimeout(() => setBusquedaFiltrada(busqueda), 500)
    return () => clearTimeout(temporizador)
  }, [busqueda])

  useEffect(() => {
    const cargarMonedas = async () => {
      // Primero se intenta recuperar el catálogo guardado en esta sesión.
      try {
        const monedasGuardadas = sessionStorage.getItem('monedas')
        if (monedasGuardadas) {
          const listaGuardada = JSON.parse(monedasGuardadas)
          if (Array.isArray(listaGuardada)) {
            setMonedas(listaGuardada)
            setCargando(false)
            return
          }
        }
      } catch (error) {
        console.error('Error:', error)
      }

      // Si no hay caché válido, se descarga la lista y se guarda en la sesión.
      try {
        const respuesta = await fetch('https://api.coingecko.com/api/v3/coins/list')
        if (respuesta.status === 429) {
          throw new Error('Demasiadas peticiones a CoinGecko, espera un minuto y recarga')
        }
        if (!respuesta.ok) {
          throw new Error(`Error al cargar las monedas (código ${respuesta.status}).`)
        }

        const datos = await respuesta.json()
        const listaMonedas = Array.isArray(datos) ? datos : []
        setMonedas(listaMonedas)

        try {
          sessionStorage.setItem('monedas', JSON.stringify(listaMonedas))
        } catch (error) {
          console.error('Error:', error)
        }
      } catch (error) {
        console.error('Error:', error)
        setError(error.message || 'No se pudieron obtener las monedas.')
      } finally {
        setCargando(false)
      }
    }

    cargarMonedas()
  }, [])

  // Se combinan la búsqueda y los filtros antes de limitar los resultados.
  const textoBusqueda = busquedaFiltrada.trim().toLowerCase()
  const monedasFiltradas = (textoBusqueda.length >= 3
    ? monedas.filter((moneda) => moneda.name.toLowerCase().includes(textoBusqueda))
    : monedas
  ).filter((moneda) => (
    (!letraInicial || moneda.name.toUpperCase().startsWith(letraInicial)) &&
    (!soloFavoritos || favoritos.some((favorito) => favorito.id === moneda.id))
  ))
  const monedasVisibles = monedasFiltradas.slice(0, 50)
  const idsMonedasVisibles = monedasVisibles.map((moneda) => moneda.id).join(',')

  useEffect(() => {
    const idsFaltantes = monedasVisibles
      .map((moneda) => moneda.id)
      .filter((id) => !Object.hasOwn(imagenes, id) && !imagenesSolicitadas.current.has(id))

    if (idsFaltantes.length === 0) return

    const cargarImagenes = async () => {
      idsFaltantes.forEach((id) => imagenesSolicitadas.current.add(id))

      try {
        // Se piden en una sola consulta los logos que faltan.
        const respuesta = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsFaltantes.join(',')}`
        )
        if (respuesta.status === 429) {
          throw new Error('Demasiadas peticiones a CoinGecko, espera un minuto y recarga')
        }
        if (!respuesta.ok) {
          throw new Error(`Error al cargar imágenes (código ${respuesta.status}).`)
        }

        const datos = await respuesta.json()
        const imagenesRecibidas = Object.fromEntries(
          (Array.isArray(datos) ? datos : []).map((moneda) => [moneda.id, moneda.image || null])
        )
        const imagenesNuevas = Object.fromEntries(
          idsFaltantes.map((id) => [id, imagenesRecibidas[id] || null])
        )

        setImagenes((imagenesActuales) => ({ ...imagenesActuales, ...imagenesNuevas }))
        setErrorImagenes('')
      } catch (error) {
        console.error('Error:', error)
        setErrorImagenes(error.message || 'No se pudieron cargar las imágenes de las monedas.')
      } finally {
        idsFaltantes.forEach((id) => imagenesSolicitadas.current.delete(id))
      }
    }

    cargarImagenes()
  }, [idsMonedasVisibles, imagenes])

  if (cargando) return <p>Cargando...</p>
  if (error) return <p>{error}</p>

  return (
    <>
      <input
        type="text"
        placeholder="Buscar moneda por nombre (mínimo 3 letras)"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="c-buscador"
      />

      <div className="c-filtros">
        <label>
          Letra inicial
          <select value={letraInicial} onChange={(evento) => setLetraInicial(evento.target.value)}>
            <option value="">Todas</option>
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letra) => (
              <option key={letra} value={letra}>{letra}</option>
            ))}
          </select>
        </label>
        <label className="c-filtro-favoritos">
          <input
            type="checkbox"
            checked={soloFavoritos}
            onChange={(evento) => setSoloFavoritos(evento.target.checked)}
          />
          Solo favoritos
        </label>
      </div>

      {errorImagenes && <p className="c-error-imagenes">{errorImagenes}</p>}

      {monedasVisibles.length === 0 ? (
        <p>No se encontraron monedas.</p>
      ) : (
        <div className="c-lista">
          {monedasVisibles.map((moneda) => (
            <div
              key={moneda.id}
              className="c-lista-moneda"
              onClick={() => navigate(`/moneda/${moneda.id}`)}
            >
              <p>{moneda.id}</p>
              <p>Símbolo: {moneda.symbol}</p>
              <button
                type="button"
                aria-label={esFavorito(moneda.id) ? `Quitar ${moneda.name} de favoritos` : `Agregar ${moneda.name} a favoritos`}
                onClick={(evento) => {
                  evento.stopPropagation()
                  toggleFavorito({ id: moneda.id, nombre: moneda.name })
                }}
              >
                {esFavorito(moneda.id) ? '❤️' : '🤍'}
              </button>
              {imagenes[moneda.id] ? (
                <img
                  src={imagenes[moneda.id]}
                  alt={moneda.name}
                  height="40"
                  loading="lazy"
                  onError={() => setImagenes((imagenesActuales) => ({
                    ...imagenesActuales,
                    [moneda.id]: null
                  }))}
                />
              ) : (
                <div className="c-imagen-reemplazo" aria-label={`Imagen no disponible para ${moneda.name}`} />
              )}
              <p>{moneda.name}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Inicio