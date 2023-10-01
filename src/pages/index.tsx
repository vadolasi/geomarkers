import { Link } from "react-router-dom"
import { useStore } from "../store"

export default () => {
  const { markers } = useStore()

  return (
    <div className="p-10 w-full md:w-1/3 lg:w-1/4 m-auto">
      {markers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 text-center mt-5">Nenhum marcador criado</p>
        </div>
      ) : (
        <ul className="list-none">
          {markers.map(marker => (
            <li key={marker.id} className="mb-5">
              <Link to={`/marker/${marker.id}`} className="btn btn-ghost btn-block">
                {marker.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/new" className="btn btn-primary btn-block mt-10">Criar marcador</Link>
    </div>
  )
}
