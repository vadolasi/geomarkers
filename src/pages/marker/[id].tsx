import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import { useCallback, useState } from "preact/hooks"
import { useParams } from "react-router"
import { useStore } from "../../store"

export default () => {
  const params = useParams()
  const id = params.id!

  const { markers, getMarker } = useStore()

  const { latitude, longitude } = getMarker(id)!

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

  return (
    <div className="w-screen h-screen relative flex justify-center items-center">
      {isLoaded && (
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
            minZoom: 6
          }}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {markers.map(marker => (
            <Marker
              key={marker.id}
              label={{
                text: marker.name,
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#fff",
                className: "bg-[#d1413d] rounded-full p-2"
              }}
              position={{
                lat: marker.latitude,
                lng: marker.longitude
              }}
            />
          ))}
        </GoogleMap>
      )}
    </div>
  )
}
