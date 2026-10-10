import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const FavoritosContext = createContext(null)

function leerFavoritos() {
  try {
    const guardados = JSON.parse(localStorage.getItem('favoritos') || '[]')
    if (!Array.isArray(guardados)) return []

    return guardados.filter(
      (favorito) =>
        favorito &&
        typeof favorito.id === 'string' &&
        typeof favorito.nombre === 'string'
    )
  } catch (error) {
    console.error('No se pudieron recuperar los favoritos:', error)
    return []
  }
}

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState(leerFavoritos)

  const esFavorito = useCallback(
    (id) => favoritos.some((favorito) => favorito.id === id),
    [favoritos]
  )

  const guardarFavoritos = useCallback((nuevosFavoritos) => {
    try {
      localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos))
      setFavoritos(nuevosFavoritos)
    } catch (error) {
      console.error('No se pudieron guardar los favoritos:', error)
    }
  }, [])

  const toggleFavorito = useCallback(({ id, nombre }) => {
    const nuevosFavoritos = favoritos.some((favorito) => favorito.id === id)
      ? favoritos.filter((favorito) => favorito.id !== id)
      : [...favoritos, { id, nombre }]

    guardarFavoritos(nuevosFavoritos)
  }, [favoritos, guardarFavoritos])

  const limpiarFavoritos = useCallback(() => {
    guardarFavoritos([])
  }, [guardarFavoritos])

  const valor = useMemo(
    () => ({ favoritos, esFavorito, toggleFavorito, limpiarFavoritos }),
    [favoritos, esFavorito, toggleFavorito, limpiarFavoritos]
  )

  return (
    <FavoritosContext.Provider value={valor}>
      {children}
    </FavoritosContext.Provider>
  )
}

export function useFavoritos() {
  const contexto = useContext(FavoritosContext)
  if (!contexto) {
    throw new Error('useFavoritos debe usarse dentro de FavoritosProvider.')
  }
  return contexto
}
