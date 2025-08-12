<template>
  <l-geo-json
    v-if="lahanGeojson"
    layer-type="overlay"
    name="Batas Kebun"
    :geojson="lahanGeojson"
    :options-style="styleLahan"
    @add="onLahanLayerAdd"
  />
</template>

<script setup>
import { ref, onMounted } from "vue"
import { LGeoJson } from "@vue-leaflet/vue-leaflet"
import axios from "@/axios"

const lahanGeojson = ref(null)

const formatTanggal = (t) => {
  if (!t) return "-"
  return new Date(t).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

const styleLahan = () => ({
  color: "#006400",
  fill: false,
  weight: 4,
  opacity: 1
})

onMounted(async () => {
  const response = await axios.get("/lahan")
  const data = response.data
  lahanGeojson.value = {
    type: "FeatureCollection",
    features: (Array.isArray(data) ? data : [data]).map(item => {
      if (!item.batas_geojson) return null
      return {
        type: "Feature",
        geometry: JSON.parse(item.batas_geojson),
        properties: {
          id_lahan: item.id_lahan,
          penggunaan_sebelumnya: item.penggunaan_sebelumnya,
          tahun_perubahan: item.tahun_perubahan,
          tahun_jadi_sawit: item.tahun_jadi_sawit,
          luas: item.luas
        }
      }
    }).filter(Boolean)
  }
})

const onLahanLayerAdd = (e) => {
  const geojsonLayer = e.target
  geojsonLayer.eachLayer((layer) => {
    const props = layer.feature?.properties
    if (!props) return

    const popupContent = `
      <div>
        <strong>ID Lahan:</strong> ${props.id_lahan}<br/>
        <strong>Penggunaan Sebelumnya:</strong> ${props.penggunaan_sebelumnya}<br/>
        <strong>Tahun Perubahan:</strong> ${props.tahun_perubahan}<br/>
        <strong>Tahun Jadi Sawit:</strong> ${props.tahun_jadi_sawit}<br/>
        <strong>Luas:</strong> ${props.luas} Ha
      </div>
    `

    layer.on("click", () => {
      layer.bindPopup(popupContent).openPopup()
    })

    layer.on("mouseover", () => {
      layer.setStyle({ color: "#B6F500", weight: 5 })
    })

    layer.on("mouseout", () => {
      layer.setStyle({ color: "#006400", weight: 4 })
    })
  })
}
</script>
