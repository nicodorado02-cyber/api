import { useNavigate } from 'react-router-dom';
import { useFavoritos } from '../../context/FavoritosContext.jsx'
import './style.css'

function Favoritos() {
  const navigate = useNavigate();
  const { favoritos } = useFavoritos()

  return (
    <>
      <div className="c-lista">
        {favoritos.map((moneda) => (
          <div
            key={moneda.id}
            className="c-lista-moneda"
            onClick={() => navigate(`/moneda/${moneda.id}`)}
          >
            <p>{moneda.id}</p>
            <p>{moneda.nombre}</p>
          </div>
        ))}
        {favoritos.length === 0 && <p>No tienes monedas favoritas.</p>}
      </div>
    </>
  )
}

export default Favoritos
