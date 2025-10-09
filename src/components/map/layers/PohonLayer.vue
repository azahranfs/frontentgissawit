<template>
  <l-geo-json
    v-if="pohonGeojson"
    layer-type="overlay"
    name="Pohon"
    :geojson="pohonGeojson"
    :options="{
      pointToLayer: pointToLayer
    }"
    @add="onPohonLayerAdd"
  />
</template>

<script setup>
import { ref, onMounted } from "vue"
import { LGeoJson } from "@vue-leaflet/vue-leaflet"
import axios from "@/axios"

const pohonGeojson = ref(null)

// fungsi buat bikin titik merah 🔴
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

// ambil data dari API dan ubah ke GeoJSON
onMounted(async () => {
  const response = await axios.get("/pohon")
  const data = response.data
  pohonGeojson.value = {
    type: "FeatureCollection",
    features: (Array.isArray(data) ? data : [data]).map(item => {
      if (!item.latitude || !item.longitude) return null
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            parseFloat(item.longitude),
            parseFloat(item.latitude)
          ]
        },
        properties: {
          id_pohon: item.id_pohon,
          varietas: item.varietas
        }
      }
    }).filter(Boolean)
  }
})

// pop-up & interaksi
const onPohonLayerAdd = (e) => {
  const geojsonLayer = e.target
  geojsonLayer.eachLayer((layer) => {
    const props = layer.feature?.properties
    if (!props) return

    const popupContent = `
      <div>
        <strong>ID Pohon:</strong> ${props.id_pohon}<br/>
        <strong>Varietas:</strong> ${props.varietas ?? "-"}
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
