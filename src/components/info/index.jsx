import './style.css'

function Info() {
  return (
    <main className="c-info">
      <h1>CriptoApp</h1>
      <p>
        CriptoApp te permite explorar criptomonedas, consultar sus detalles y
        guardar tus monedas favoritas.
      </p>

      <h2>API utilizada</h2>
      <p>
        Los datos de criptomonedas se consultan desde{' '}
        <a href="https://www.coingecko.com/en/api" target="_blank" rel="noreferrer">
          CoinGecko API
        </a>.
      </p>

      <h2>Funciones</h2>
      <ul>
        <li>Lista de criptomonedas</li>
        <li>Buscador por nombre</li>
        <li>Filtro por letra inicial y favoritos</li>
        <li>Detalle de cada moneda</li>
        <li>Gestión de monedas favoritas</li>
        <li>Monedas en tendencias</li>
        <li>Compartir el detalle de una moneda</li>
      </ul>

      <p><strong>Versión:</strong> 1.0.0</p>
      <p><strong>Autor:</strong> Nicolas, Universidad Agustiniana</p>
    </main>
  )
}

export default Info