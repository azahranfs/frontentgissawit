<template>
  <l-layer-group layer-type="overlay" name="Jalan">
    <LGeoJson
      v-if="jalanGeojson"
      :geojson="jalanGeojson"
      :options-style="() => ({})"
      @ready="onGeoJsonReady"
    />
  </l-layer-group>
</template>

<script setup>
import { ref, watch, nextTick } from "vue"
import { LGeoJson, LLayerGroup } from "@vue-leaflet/vue-leaflet"
import L from "leaflet"
import axios from "@/axios"

const props = defineProps({
  selectedDate: { type: String, required: true }
})

const jalanGeojson = ref(null)
let geojsonLayerRef = null

const formatTanggal = (t) =>
  t
    ? new Date(t).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-"

const getMainlineColor = (lebar) => {
  if (lebar >= 6) return "#000000"  // hitam
  if (lebar >= 4) return "#555555"  // abu tua
  return "#AAAAAA"                  // abu muda
}

const fetchJalan = async (tanggal) => {
  try {
    const res = await axios.get(`/jalan/by-date?tanggal=${tanggal}`)
    const data = res.data

    jalanGeojson.value = {
      type: "FeatureCollection",
      features: (Array.isArray(data) ? data : [data])
        .map(item => {
          if (!item.lokasi_geojson) return null
          let geometry
          try {
            geometry = typeof item.lokasi_geojson === "string"
              ? JSON.parse(item.lokasi_geojson)
              : item.lokasi_geojson
          } catch (err) {
            console.error("Gagal parse lokasi_geojson:", err)
            return null
          }
          return {
            type: "Feature",
            geometry,
            properties: {
              id_jalan: item.id_jalan,
              kondisi: item.kondisi,
              lebar: item.lebar,
              created_at: formatTanggal(item.created_at)
            }
          }
        })
        .filter(Boolean)
    }

    await nextTick()
    bindEvents()
  } catch (err) {
    console.error("Gagal ambil data jalan:", err)
  }
}

watch(
  () => props.selectedDate,
  (newDate) => {
    if (newDate) fetchJalan(newDate)
  },
  { immediate: true }
)

const onGeoJsonReady = (geojsonLayer) => {
  geojsonLayerRef = geojsonLayer
  bindEvents()
}

const bindEvents = () => {
  if (!geojsonLayerRef) return
  geojsonLayerRef.clearLayers()

  jalanGeojson.value.features.forEach(feature => {
    const props = feature.properties
    const popupContent = `
      <div>
        <strong>ID Jalan:</strong> ${props.id_jalan}<br/>
        <strong>Kondisi:</strong> ${props.kondisi}<br/>
        <strong>Lebar:</strong> ${props.lebar} m<br/>
        <strong>Tanggal Upload:</strong> ${props.created_at}
      </div>
    `

    const outline = L.geoJSON(feature, {
      style: {
        color: "black",
        weight: 6,
        interactive: false
      }
    })

    const mainLine = L.geoJSON(feature, {
      style: {
        color: getMainlineColor(props.lebar),
        weight: 3
      },
      onEachFeature: (f, layer) => {
        layer.bindPopup(popupContent)

        layer.on("mouseover", function () {
          this.setStyle({ weight: 5, color: "#ffffff" })
        })
        layer.on("mouseout", function () {
          this.setStyle({ weight: 3, color: getMainlineColor(props.lebar) })
        })
      }
    })

    L.layerGroup([outline, mainLine]).addTo(geojsonLayerRef)
  })
}
</script>
