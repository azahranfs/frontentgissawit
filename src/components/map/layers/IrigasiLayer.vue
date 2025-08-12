<template>
  <l-geo-json
    v-if="irigasiGeojson"
    layer-type="overlay"
    name="Irigasi"
    :geojson="irigasiGeojson"
    :options-style="styleIrigasi"
    @add="onIrigasiLayerAdd"
  />
</template>

<script setup>
import { ref, onMounted } from "vue"
import { LGeoJson } from "@vue-leaflet/vue-leaflet"
import axios from "@/axios"

const irigasiGeojson = ref(null)

const formatTanggal = (t) => {
  if (!t) return "-"
  return new Date(t).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

// Pewarnaan berdasarkan kondisi
const getColorByKondisi = (kondisi) => {
  switch (kondisi?.toLowerCase()) {
    case "normal":
      return "#2ecc71" // hijau
    case "perlu perhatian":
      return "#f1c40f" // kuning
    case "rusak":
      return "#e74c3c" // merah
    default:
      return "#95a5a6" // abu-abu jika tidak diketahui
  }
}

const styleIrigasi = (feature) => ({
  color: getColorByKondisi(feature?.properties?.kondisi),
  fillColor: getColorByKondisi(feature?.properties?.kondisi),
  fillOpacity: 1,
  weight: 2
})

onMounted(async () => {
  const response = await axios.get("/irigasi")
  const data = response.data
  irigasiGeojson.value = {
    type: "FeatureCollection",
    features: (Array.isArray(data) ? data : [data]).map(item => {
      if (!item.lokasi_geojson?.coordinates) return null
      return {
        type: "Feature",
        geometry: item.lokasi_geojson,
        properties: {
          id_irigasi: item.id_irigasi,
          kondisi: item.kondisi,
          sumber: item.sumber,
          luas: item.luas,
          tanggal_upload: formatTanggal(item.upload_peta?.tanggal_upload)
        }
      }
    }).filter(Boolean)
  }
})

const onIrigasiLayerAdd = (e) => {
  const geojsonLayer = e.target
  geojsonLayer.eachLayer((layer) => {
    const props = layer.feature?.properties
    if (!props) return

    const popupContent = `
      <div>
        <strong>ID Irigasi:</strong> ${props.id_irigasi}<br/>
        <strong>Kondisi:</strong> ${props.kondisi}<br/>
        <strong>Sumber:</strong> ${props.sumber}<br/>
        <strong>Luas:</strong> ${props.luas} Ha<br/>
        <strong>Tanggal Upload:</strong> ${props.tanggal_upload}
      </div>
    `

    layer.on("click", () => {
      layer.bindPopup(popupContent).openPopup()
    })

    // Hover efek: highlight cream
    layer.on("mouseover", () => {
      layer.setStyle({
        weight: 3,
        color: "#63C8FF", // warna cream
        fillColor: "#63C8FF",
        fillOpacity: 1
      })
    })

    layer.on("mouseout", () => {
      const kondisi = props.kondisi
      layer.setStyle({
        color: getColorByKondisi(kondisi),
        fillColor: getColorByKondisi(kondisi),
        fillOpacity: 1,
        weight: 2
      })
    })
  })
}
</script>
