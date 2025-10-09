<template>
  <l-layer-group layer-type="overlay" name="Blok Kebun">
    <LGeoJson
      v-if="blokGeojson"
      :geojson="blokGeojson"
      :options-style="styleBlok"
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

const blokGeojson = ref(null)
let geojsonLayerRef = null

const formatTanggal = (tanggal) => {
  if (!tanggal) return null
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

const getWarnaDariUmur = (umur) => {
  if (umur === null || umur === undefined) return "#CCCCCC"
  if (umur < 4) return "#CBE2B5"
  if (umur <= 18) return "#86AB89"
  return "#A28B55"
}

const styleBlok = (feature) => {
  const umur = feature?.properties?.umur
  const fillColor = getWarnaDariUmur(umur)

  return {
    color: "black",
    fillColor,
    fillOpacity: 1,
    weight: 2
  }
}

const fetchBlok = async (tanggal) => {
  try {
    const response = await axios.get(`/blok/by-date?tanggal=${tanggal}`)
    const data = Array.isArray(response.data) ? response.data : [response.data]

    blokGeojson.value = {
      type: "FeatureCollection",
      features: data
        .map((item) => {
          if (!item.lokasi_geojson) return null
          let geometry = null
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
              id_blok: item.id_blok,
              nama_blok: item.nama_blok,
              waktu_tanam: formatTanggal(item.waktu_tanam),
              waktu_panen: formatTanggal(item.waktu_panen),
              tanggal_upload: formatTanggal(item.upload_peta?.tanggal_upload),
              umur: item.umur,
              kategori_umur: item.kategori_umur
            }
          }
        })
        .filter(Boolean)
    }

    await nextTick()
    bindEvents()
  } catch (err) {
    console.error("Gagal ambil data blok:", err)
  }
}

watch(
  () => props.selectedDate,
  (newDate) => {
    if (newDate) fetchBlok(newDate)
  },
  { immediate: true }
)

const onGeoJsonReady = (geojsonLayer) => {
  geojsonLayerRef = geojsonLayer
  bindEvents()
}

const bindEvents = () => {
  if (!geojsonLayerRef) return
  geojsonLayerRef.eachLayer((layer) => {
    const props = layer.feature?.properties
    if (!props) return

    layer.off()

    layer.bindPopup(`
      <div>
        <strong>ID Blok:</strong> ${props.id_blok}<br/>
        <strong>Nama Blok:</strong> ${props.nama_blok}<br/>
        <strong>Waktu Tanam:</strong> ${props.waktu_tanam}<br/>
        <strong>Waktu Panen:</strong> ${props.waktu_panen}<br/>
        <strong>Tanggal Upload:</strong> ${props.tanggal_upload}<br/>
        <strong>Umur Pohon:</strong> ${props.umur ?? "Tidak diketahui"} tahun<br/>
        <strong>Kategori Usia:</strong> ${props.kategori_umur}
      </div>
    `)

    layer.on("mouseover", function () {
      this.setStyle({ weight: 2, fillColor: "#E7FBE6", fillOpacity: 1 })
    })
    layer.on("mouseout", function () {
      geojsonLayerRef.resetStyle(layer)
    })
  })
}
</script>
