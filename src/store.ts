import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"

interface IMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface IStore {
  markers: IMarker[]
  addMarker: (marker: { name: string; latitude: number; longitude: number }) => void
  removeMarker: (id: string) => void
  getMarker: (id: string) => IMarker | undefined
}

export const useStore = create(
  persist<IStore>(
    (set, get) => ({
      markers: [],
      addMarker: (marker) => {
        set(state => ({
          markers: [...state.markers, { ...marker, id: nanoid() }]
        }))
      },
      removeMarker: (id) => {
        set(state => ({
          markers: state.markers.filter(marker => marker.id !== id)
        }))
      },
      getMarker: (id) => {
        const marker = get().markers.find(marker => marker.id === id)
        return marker
      }
    }),
    {
      name: "marks"
    }
  )
)
