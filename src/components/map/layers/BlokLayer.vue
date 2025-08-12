<template>
  <l-geo-json
    v-if="blokGeojson"
    layer-type="overlay"
    name="Blok Kebun"
    :geojson="blokGeojson"
    :options-style="styleBlok"
    @add="onLayerAdd"
  />
</template>

<script setup>
import { ref, onMounted } from "vue"
import { LGeoJson } from "@vue-leaflet/vue-leaflet"
import axios from "@/axios"

const blokGeojson = ref(null)

const formatTanggal = (tanggal) => {
  if (!tanggal) return null
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

const getWarnaDariUmur = (umur) => {
  if (umur === null || umur === undefined) return "#CCCCCC" // default abu
  if (umur < 4) return "#CBE2B5"            // Hijau muda - Muda
  if (umur <= 18) return "#86AB89"          // Hijau - Produktif
  return "#A28B55"                          // Coklat - Tua
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

onMounted(async () => {
  try {
    const response = await axios.get("/blok")
    const data = response.data

    blokGeojson.value = {
      type: "FeatureCollection",
      features: (Array.isArray(data) ? data : [data])
        .map((item) => {
          if (!item.lokasi_geojson?.coordinates) return null

          return {
            type: "Feature",
            geometry: item.lokasi_geojson,
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
  } catch (err) {
    console.error("Gagal ambil data blok:", err)
  }
})

const onLayerAdd = (e) => {
  const geojsonLayer = e.target
  geojsonLayer.eachLayer((layer) => {
    const props = layer.feature?.properties
    if (!props) return

    const popupContent = `
      <div>
        <strong>ID Blok:</strong> ${props.id_blok}<br/>
        <strong>Nama Blok:</strong> ${props.nama_blok}<br/>
        <strong>Waktu Tanam:</strong> ${props.waktu_tanam}<br/>
        <strong>Waktu Panen:</strong> ${props.waktu_panen}<br/>
        <strong>Tanggal Upload:</strong> ${props.tanggal_upload}<br/>
        <strong>Umur Pohon:</strong> ${props.umur ?? "Tidak diketahui"} tahun<br/>
        <strong>Kategori Usia:</strong> ${props.kategori_umur}
      </div>
    `
    layer.bindPopup(popupContent)

    // Hover effect
    layer.on("mouseover", function () {
      this.setStyle({
        weight: 2,
        fillColor: "#E7FBE6",
        fillOpacity: 1
      })
    })
    layer.on("mouseout", function () {
      geojsonLayer.resetStyle(layer)
    })
  })
}
</script>
