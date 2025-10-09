<template>
  <l-layer-group layer-type="overlay" name="Irigasi">
    <LGeoJson
      v-if="irigasiGeojson"
      layer-type="overlay"
      :geojson="irigasiGeojson"
      :options-style="styleIrigasi"
      @add="onLayerAdd"
    />
  </l-layer-group>
</template>

<script setup>
import { ref, watch, nextTick } from "vue"
import { LGeoJson, LLayerGroup } from "@vue-leaflet/vue-leaflet"
import axios from "@/axios"

const props = defineProps({
  selectedDate: { type: String, required: true }
})

const irigasiGeojson = ref(null)
let geojsonLayerRef = null

const formatTanggal = (t) =>
  t
    ? new Date(t).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-"

const getColorByKondisi = (k) => {
  switch (k?.toLowerCase()) {
    case "normal": return "#2ecc71"
    case "perlu perhatian": return "#f1c40f"
    case "rusak": return "#e74c3c"
    default: return "#95a5a6"
  }
}

const styleIrigasi = (feature) => ({
  color: getColorByKondisi(feature?.properties?.kondisi),
  fillColor: getColorByKondisi(feature?.properties?.kondisi),
  fillOpacity: 1,
  weight: 2
})

const fetchIrigasi = async (tanggal) => {
  try {
    const res = await axios.get("/irigasi", {
      params: {
        tanggal: tanggal || "",
        _ts: Date.now() // anti-cache
      }
    })

    const data = Array.isArray(res.data) ? res.data : [res.data]

    irigasiGeojson.value = {
      type: "FeatureCollection",
      features: data
        .filter(item => item.lokasi_geojson)
        .map(item => {
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
              id_irigasi: item.id_irigasi,
              kondisi: item.kondisi,
              sumber: item.sumber,
              luas: item.luas,
              tanggal_upload: formatTanggal(item.upload_peta?.tanggal_upload)
            }
          }
        })
        .filter(Boolean)
    }

    await nextTick()
    bindEvents()
  } catch (err) {
    console.error("Gagal ambil data irigasi:", err)
  }
}

const onLayerAdd = (e) => {
  geojsonLayerRef = e?.mapObject || e?.target || e
  bindEvents()
}

const bindEvents = () => {
  if (!geojsonLayerRef || !geojsonLayerRef.eachLayer) return

  geojsonLayerRef.eachLayer((layer) => {
    const p = layer.feature?.properties
    if (!p) return

    layer.off() // hapus listener lama biar nggak dobel

    layer.bindPopup(`
      <div>
        <strong>ID Irigasi:</strong> ${p.id_irigasi}<br/>
        <strong>Kondisi:</strong> ${p.kondisi}<br/>
        <strong>Sumber:</strong> ${p.sumber}<br/>
        <strong>Luas:</strong> ${p.luas} Ha<br/>
        <strong>Tanggal Upload:</strong> ${p.tanggal_upload}
      </div>
    `)

    layer.on("mouseover", function () {
      this.setStyle({ weight: 3, color: "#63C8FF", fillColor: "#63C8FF", fillOpacity: 1 })
    })
    layer.on("mouseout", function () {
      geojsonLayerRef.resetStyle(layer)
    })
  })
}

watch(
  () => props.selectedDate,
  (newDate) => {
    if (newDate) fetchIrigasi(newDate)
  },
  { immediate: true }
)
</script>
