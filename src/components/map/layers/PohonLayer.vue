<template>
  <template v-for="zona in zonaList" :key="zona">
    <l-geo-json
      v-if="pohonGeojson[zona]"
      layer-type="overlay"
      :name="`Pohon ${zona}`"
      :visible="false"   
      :geojson="pohonGeojson[zona]"
      :options="{ pointToLayer }"
      @add="onPohonLayerAdd"
    />
  </template>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { LGeoJson } from "@vue-leaflet/vue-leaflet"
import axios from "@/axios"

const zonaList = ["zona 1", "zona 2", "zona 3", "zona 4", "zona 5", "zona 6", "zona 7"]
const pohonGeojson = ref({})

// Titik merah 🔴
const pointToLayer = (feature, latlng) => {
  return L.circleMarker(latlng, {
    radius: 6,
    fillColor: "red",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.9
  })
}

// Ambil data dari API
onMounted(async () => {
  for (const zona of zonaList) {
    try {
      const response = await axios.get(`/pohon?zona=${encodeURIComponent(zona)}`)
      const data = response.data

      if (!data || !Array.isArray(data) || data.length === 0) continue

      pohonGeojson.value[zona] = {
        type: "FeatureCollection",
        features: data
          .map(item => {
            if (!item.latitude || !item.longitude) return null
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)]
              },
              properties: {
                id_pohon: item.id_pohon,
                varietas: item.varietas,
                zona: item.zona
              }
            }
          })
          .filter(Boolean)
      }
    } catch (error) {
      console.error(`Gagal ambil data pohon untuk ${zona}:`, error)
    }
  }
})

// Popup dan interaksi
const onPohonLayerAdd = (e) => {
  const geojsonLayer = e.target
  geojsonLayer.eachLayer((layer) => {
    const props = layer.feature?.properties
    if (!props) return

    const popupContent = `
      <div>
        <strong>ID Pohon:</strong> ${props.id_pohon}<br/>
        <strong>Varietas:</strong> ${props.varietas ?? "-"}<br/>
        <strong>Zona:</strong> ${props.zona}
      </div>
    `

    layer.on("click", () => {
      layer.bindPopup(popupContent).openPopup()
    })

    layer.on("mouseover", () => {
      layer.setStyle({ fillColor: "#ff6666", radius: 8 })
    })

    layer.on("mouseout", () => {
      layer.setStyle({ fillColor: "red", radius: 6 })
    })
  })
}
</script>
