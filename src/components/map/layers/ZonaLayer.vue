<template>
  <l-layer-group layer-type="overlay" name="Zona">
    <LGeoJson
      v-if="zonaGeojson"
      :geojson="zonaGeojson"
      :options-style="styleZona"
      @ready="onGeoJsonReady"
    />
  </l-layer-group>
</template>

<script setup>
import { ref, watch, nextTick } from "vue"
import { LGeoJson, LLayerGroup } from "@vue-leaflet/vue-leaflet"
import axios from "@/axios"

const props = defineProps({
  selectedDate: {
    type: String,
    required: true
  }
})

const zonaGeojson = ref(null)

// Styling zona
const styleZona = (feature) => {
  const jumlah = feature?.properties?.jumlah || 0
  let fillColor = "#CCCCCC"

  if (jumlah >= 10000) fillColor = "#123524"
  else if (jumlah >= 7000) fillColor = "#3E7B27"
  else if (jumlah >= 4000) fillColor = "#85A947"

  return {
    color: "#000000",
    fillColor,
    fillOpacity: 1,
    weight: 2
  }
}

const fetchZona = async (tanggal) => {
  try {
    const response = await axios.get(`/zona/by-date?tanggal=${tanggal}`)
    const data = response.data

    zonaGeojson.value = {
      type: "FeatureCollection",
      features: (Array.isArray(data) ? data : [data])
        .map((item) => {
          if (!item.lokasi_zona_geojson) return null
          let geometry
          try {
            geometry = JSON.parse(item.lokasi_zona_geojson)
          } catch (err) {
            console.error("Gagal parse geojson:", err)
            return null
          }
          return {
            type: "Feature",
            geometry,
            properties: {
              id_zona: item.id_zona,
              nama_zona: item.nama_zona,
              jumlah: item.jumlah
            }
          }
        })
        .filter(Boolean)
    }

    // Pastikan event hover & popup terpasang ulang setelah data baru masuk
    await nextTick()
    bindEvents()
  } catch (err) {
    console.error("Gagal ambil data zona:", err)
  }
}

watch(
  () => props.selectedDate,
  (newDate) => {
    if (newDate) fetchZona(newDate)
  },
  { immediate: true }
)

let geojsonLayerRef = null

const onGeoJsonReady = (geojsonLayer) => {
  geojsonLayerRef = geojsonLayer
  bindEvents()
}

const bindEvents = () => {
  if (!geojsonLayerRef) return
  geojsonLayerRef.eachLayer((layer) => {
    const props = layer.feature?.properties
    if (!props) return

    layer.bindPopup(`
      <div>
        <strong>ID Zona:</strong> ${props.id_zona}<br/>
        <strong>Nama Zona:</strong> ${props.nama_zona}<br/>
        <strong>Jumlah:</strong> ${props.jumlah}
      </div>
    `)

    layer.on("mouseover", function () {
      this.setStyle({ fillColor: "#EFE3C2", weight: 2, fillOpacity: 1 })
    })
    layer.on("mouseout", function () {
      geojsonLayerRef.resetStyle(layer)
    })
  })
}
</script>
