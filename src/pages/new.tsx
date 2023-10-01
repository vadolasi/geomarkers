import { GoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { useCallback, useEffect, useRef, useState } from "preact/hooks"
import { useGeolocated } from "react-geolocated"
import clsx from "clsx"
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import { OutputFormat, setDefaults, fromLatLng, fromAddress } from "react-geocode"
import AsyncSelect from "react-select/async"
import { useStore } from "../store";
import { useNavigate } from "react-router"

export default () => {
  const navigate = useNavigate()

  const [longitude, setLongitude] = useState(0)
  const [latitude, setLatitude] = useState(0)
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [locationText, setLocationText] = useState("")
  const [loadingLocationText, setLoadingLocationText] = useState(false)
  const [name, setName] = useState("")

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback((map: google.maps.Map) => {
    setMap(null)
  }, [])

  const { coords, isGeolocationAvailable, isGeolocationEnabled, positionError } = useGeolocated()

  const isKeyboardOpen = useDetectKeyboardOpen()

  useEffect(() => {
    setDefaults({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
      language: "pt",
      region: "br",
      outputFormat: OutputFormat.JSON
    })
  }, [])

  useEffect(() => {
    if (!isGeolocationAvailable || positionError) {
      fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${import.meta.env.VITE_IP_GEOLOCATION_API_KEY}`)
        .then(res => res.json())
        .then(({ longitude, latitude }) => {
          setLongitude(parseFloat(longitude))
          setLatitude(parseFloat(latitude))
          setLoadingLocation(false)
        })
    }
  }, [isGeolocationAvailable, positionError])

  useEffect(() => {
    if (coords) {
      setLongitude(coords.longitude)
      setLatitude(coords.latitude)
      setLoadingLocation(false)
    }
  }, [coords])

  const changeCenter = () => {
    if (map) {
      const center = map?.getCenter()!
      setLongitude(center.lng())
      setLatitude(center.lat())
    }

    setLoadingLocationText(true)
    fromLatLng(latitude, longitude)
      .then(({ results }) => {
        const location = results[0]
        setLocationText(location.formatted_address)
        setLoadingLocationText(false)
      })
      .catch(() => {
        setLoadingLocationText(false)
      })
  }

  const inputRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (!isKeyboardOpen && inputRef.current) {
      inputRef.current.blur()
    }
  }, [isKeyboardOpen])

  const loadOptions = (inputValue: string) => {
    return new Promise((resolve, reject) => {
      fromAddress(inputValue)
        .then(({ results }: any) => {
          const options = results.map(({ formatted_address, geometry: { location } }: any) => ({ label: formatted_address, value: JSON.stringify(location) }))
          resolve(options)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  const { addMarker } = useStore()

  const saveMarker = () => {
    addMarker({ name, latitude, longitude })
    ;(document.getElementById("my_modal") as any)?.close()
    navigate("/")
  }

  return (
    <div className="w-screen h-screen relative flex justify-center items-center">
      <dialog id="my_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Nome do marcador</span>
            </label>
            <input type="text" className="input input-bordered w-full" value={name} onChange={e => setName(e.currentTarget.value)} />
          </div>
          <button className="btn btn-primary w-full mt-5" onClick={saveMarker}>Salvar</button>
        </div>
      </dialog>
      <div className="absolute top-0 z-50 h-min w-full md:w-1/2 lg:w-1/3 flex m-5 md:m-10">
        <AsyncSelect
          ref={inputRef}
          placeholder="Buscar localidade"
          defaultOptions={true}
          loadOptions={loadOptions}
          noOptionsMessage={() => "Nenhum resultado encontrado"}
          onChange={(option: any) => {
            const { lat, lng } = JSON.parse(option.value)
            if (map) {
              map.panTo({ lat, lng })
              setLatitude(lat)
              setLongitude(lng)
              setLocationText(option.label)
            }
          }}
          classNames={{
            container: () => "mx-5 md:mx-0 w-full",
            indicatorSeparator: () => "hidden",
            control: () => "p-2"
          }}
        />
      </div>
      <div className="absolute z-50 flex flex-col justify-center items-center">
        <div className={clsx("absolute i-mdi-location text-5xl", loadingLocation && "hidden", dragging && "mb-5")} style={{ transform: "translateY(-40%)" }}></div>
        <div className={clsx("w-2 h-2 bg-red-500 rounded-full hidden", dragging && "flex")}></div>
      </div>
      <div className="w-full h-full">
        {isGeolocationAvailable && !isGeolocationEnabled && loadingLocation ? (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-2xl font-bold text-gray-600">Por favor ative seu GPS</span>
          </div>
        ) : loadingLocation && (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-2xl font-bold text-gray-600">Carregando localização...</span>
          </div>
        )}
        {isLoaded && !loadingLocation && (
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "100%"
            }}
            center={{
              lat: latitude,
              lng: longitude
            }}
            zoom={15}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              clickableIcons: false,
              zoomControl: false,
              disableDefaultUI: true,
              gestureHandling: "greedy",
              minZoom: 6,
              draggable: !isKeyboardOpen
            }}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onDragStart={() => setDragging(true)}
            onDragEnd={() => {
              setDragging(false)
              changeCenter()
            }}
            onZoomChanged={() => changeCenter()}
          >
          </GoogleMap>
        )}
      </div>
      <div className="fixed bg-white bottom-0 left-0 right-0 z-50 flex justify-center items-center py-2 pl-3 divide-x-2 h-20 md:px-10 lg:px-30">
        {loadingLocationText ? (
          <div className="flex items-center justify-center w-full">
            <span className="font-bold text-gray-600">Carregando localização...</span>
          </div>
        ) :
          <p className="w-full text-sm leading-5 pr-3 overflow-ellipsis">{locationText}</p>
        }
        <div className="flex flex-grow justify-center">
          <button className="btn btn-ghost btn-sm" onClick={() => (document.getElementById("my_modal") as any)?.showModal()}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}
