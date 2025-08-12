<template>
  <l-geo-json
    v-if="jalanGeojson"
    :geojson="jalanGeojson"
    layer-type="overlay"
    name="Jalan"
    :options-style="() => ({})"
    @add="onJalanLayerAdd"
  />
</template>

<script setup>
import { ref, onMounted } from "vue"
import { LGeoJson } from "@vue-leaflet/vue-leaflet"
import L from "leaflet"
import axios from "@/axios"

const jalanGeojson = ref(null)

const formatTanggal = (t) => {
  if (!t) return "-"
  return new Date(t).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

onMounted(async () => {
  const response = await axios.get("/jalan")
  const data = response.data
  jalanGeojson.value = {
    type: "FeatureCollection",
    features: (Array.isArray(data) ? data : [data]).map(item => {
      if (!item.lokasi_geojson?.coordinates) return null
      return {
        type: "Feature",
        geometry: item.lokasi_geojson,
        properties: {
          id_jalan: item.id_jalan,
          kondisi: item.kondisi,
          lebar: item.lebar,
          tanggal_upload: formatTanggal(item.upload_peta?.tanggal_upload)
        }
      }
    }).filter(Boolean)
  }
})

const getMainlineColor = (lebar) => {
  if (lebar >= 6) return "#000000"  // hitam
  if (lebar >= 4) return "#555555"  // abu tua
  return "#AAAAAA"                  // abu muda
}

const onJalanLayerAdd = (e) => {
  const geojsonLayer = e.target
  geojsonLayer.clearLayers()

  jalanGeojson.value.features.forEach(feature => {
    if (!feature.geometry?.coordinates) return
    const props = feature.properties
    const popupContent = `
      <div>
        <strong>ID Jalan:</strong> ${props.id_jalan}<br/>
        <strong>Kondisi:</strong> ${props.kondisi}<br/>
        <strong>Lebar:</strong> ${props.lebar} m<br/>
        <strong>Tanggal Upload:</strong> ${props.tanggal_upload}
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
        layer.on("click", () => {
          layer.bindPopup(popupContent).openPopup()
        })

        // Highlight saat hover
        layer.on("mouseover", () => {
          layer.setStyle({
            weight: 5,
            color: "#ffffff"  // atau warna lain untuk efek highlight
          })
        })
        layer.on("mouseout", () => {
          layer.setStyle({
            weight: 3,
            color: getMainlineColor(props.lebar)
          })
        })
      }
    })

    L.layerGroup([outline, mainLine]).addTo(geojsonLayer)
  })
}
</script>
