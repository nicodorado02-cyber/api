import './style.css'
import { Link } from 'react-router-dom'
import { useFavoritos } from '../../context/FavoritosContext.jsx'

function Usuario() {
  const { favoritos, limpiarFavoritos } = useFavoritos()

  function confirmarLimpieza() {
    if (window.confirm('¿Quieres quitar todas las monedas de tus favoritos?')) {
      limpiarFavoritos()
    }
  }

  return (
    <main className="c-usuario">
      <header className="usuario-encabezado">
        <div>
          <p className="usuario-etiqueta">TU ESPACIO</p>
          <h1>Mi colección</h1>
          <p className="usuario-descripcion">Tus monedas guardadas, reunidas en un solo lugar.</p>
        </div>
        <div className="usuario-avatar" aria-label="Perfil de usuario">U</div>
      </header>

      <section className="usuario-resumen" aria-label="Resumen de colección">
        <div className="usuario-resumen-icono" aria-hidden="true">★</div>
        <div>
          <p className="usuario-resumen-etiqueta">MONEDAS FAVORITAS</p>
          <p className="usuario-total">{favoritos.length}</p>
        </div>
        <p className="usuario-resumen-nota">
          {favoritos.length === 1 ? 'moneda en tu colección' : 'monedas en tu colección'}
        </p>
      </section>

      <section className="usuario-coleccion" aria-labelledby="usuario-titulo-coleccion">
        <div className="usuario-coleccion-encabezado">
          <div>
            <h2 id="usuario-titulo-coleccion">Guardadas</h2>
            <p>Accede al detalle de cada moneda.</p>
          </div>
          {favoritos.length > 0 && (
            <button className="usuario-limpiar" type="button" onClick={confirmarLimpieza}>
              Vaciar lista
            </button>
          )}
        </div>

        {favoritos.length > 0 ? (
          <ul className="usuario-lista">
            {favoritos.map((moneda) => (
              <li key={moneda.id}>
                <Link className="usuario-moneda" to={`/moneda/${moneda.id}`}>
                  <span className="usuario-moneda-simbolo" aria-hidden="true">↗</span>
                  <span className="usuario-moneda-datos">
                    <span className="usuario-moneda-nombre">{moneda.nombre}</span>
                    <span className="usuario-moneda-id">{moneda.id}</span>
                  </span>
                  <span className="usuario-moneda-enlace">Ver detalle</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="usuario-vacio">
            <span className="usuario-vacio-icono" aria-hidden="true">☆</span>
            <h3>Aún no tienes favoritas</h3>
            <p>Guarda las monedas que quieras seguir y aparecerán aquí.</p>
            <Link className="usuario-explorar" to="/tendencias">Explorar monedas</Link>
          </div>
        )}
      </section>

      <p className="usuario-privacidad">Tu colección se guarda en este dispositivo.</p>
    </main>
  )
}

export default Usuario