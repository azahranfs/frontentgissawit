<template>
  <div></div>
</template>

<script setup>
import { onMounted, watch, ref } from "vue"
import L from "leaflet"
import axios from "@/axios"

const props = defineProps({
  map: { type: Object, required: true },
  layerControl: { type: Object, required: true },
  date: { type: String, required: true }
})

let currentLayers = [] // simpan semua layer aktif
const petaList = ref([])

const fetchPeta = async (tanggal) => {
  try {
    console.log("🔎 Fetch peta untuk tanggal:", tanggal)

    const res = await axios.get(`/upload_peta/by-date?tanggal=${tanggal}`)
    petaList.value = res.data
    console.log("✅ Data dari API:", petaList.value)

    // hapus semua layer lama
    if (currentLayers.length > 0 && props.map) {
      currentLayers.forEach(layer => {
        props.map.removeLayer(layer)
        props.layerControl.removeLayer(layer)
      })
      currentLayers = []
    }

    if (!petaList.value || petaList.value.length === 0) {
      console.warn("⚠ Tidak ada peta di tanggal ini")
      return
    }

    for (const peta of petaList.value) {
      let url = peta.link_peta
      if (url) {
        console.log("URL asli:", peta.link_peta)
        url = peta.link_peta.replace("/storage/peta/", "/peta/")
        console.log("URL setelah replace:", url)
      }

      const format = peta.format_file?.toLowerCase()

      if (!url) {
        console.error("❌ Tidak ada link_peta di respons untuk:", peta)
        continue
      }

      console.log("🔗 link_peta:", url, "📂 Format:", format)

      let layer = null

      if (format === "tif" || format === "tiff") {
        // ✅ Load sebagai ArrayBuffer supaya TIDAK ada HEAD ke *.ovr
        const { default: parseGeoraster } = await import("georaster")
        const { default: GeoRasterLayer } = await import("georaster-layer-for-leaflet")

        const resp = await fetch(url, { cache: "no-store" })
        const arrayBuffer = await resp.arrayBuffer()
        const georaster = await parseGeoraster(arrayBuffer)

        layer = new GeoRasterLayer({
          georaster,
          opacity: 0.85,
          resampleMethod: "bilinear",
          resolution: 128
        })
      } else if (format === "geojson" || url.endsWith(".json")) {
        const geoRes = await fetch(url)
        const geojson = await geoRes.json()
        layer = L.geoJSON(geojson, {
          style: {
            color: "blue",
            weight: 2,
            fillOpacity: 0.3
          }
        })
      } else {
        console.warn("⚠ Format file belum didukung:", format)
        continue
      }

      if (layer) {
        layer.addTo(props.map)
        props.layerControl.addOverlay(layer, peta.nama_peta || "Upload Peta")
        currentLayers.push(layer)
        console.log("🎉 Layer berhasil ditambahkan:", peta.nama_peta)
      }
    }
  } catch (err) {
    console.error("❌ Gagal fetch peta:", err)
  }
}

onMounted(() => {
  if (props.date) {
    setTimeout(() => {
      fetchPeta(props.date)
    }, 7000)
  }
})
watch(() => props.date, (newDate) => {
  if (newDate) fetchPeta(newDate)
})
</script>
