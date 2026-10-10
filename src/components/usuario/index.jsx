import './style.css'
import { useFavoritos } from '../../context/FavoritosContext.jsx'

function Usuario() {
  const { favoritos, limpiarFavoritos } = useFavoritos()

  return (
    <main className="c-usuario">
      <h1>Usuario</h1>
      <p>Tienes {favoritos.length} monedas favoritas.</p>
      <button type="button" onClick={limpiarFavoritos} disabled={favoritos.length === 0}>
        Limpiar favoritos
      </button>
    </main>
  )
}

export default Usuario