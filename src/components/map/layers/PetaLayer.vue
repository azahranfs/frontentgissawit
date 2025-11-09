<template>
  <div></div>
</template>

<script setup>
import { onMounted, watch, ref } from "vue"
import L from "leaflet"
import axios from "@/axios"

// 🧩 Pastikan proj4 tersedia di global scope sebelum library georaster dipanggil
import proj4 from "proj4"
import "proj4leaflet"
window.proj4 = proj4

// 🧠 Import statis — bukan dynamic import (fix untuk Netlify build)
import parseGeoraster from "georaster"
import GeoRasterLayer from "georaster-layer-for-leaflet"

const props = defineProps({
  map: { type: Object, required: true },
  layerControl: { type: Object, required: true },
  date: { type: String, required: true }
})

let currentLayers = []
const petaList = ref([])

const fetchPeta = async (tanggal) => {
  console.log("▶ fetchPeta RUN", tanggal)

  try {
    const res = await axios.get(`/upload_peta/by-date?tanggal=${tanggal}`, {
      headers: { "Cache-Control": "no-cache" }
    })

    petaList.value = res.data
    console.log("✅ API result:", petaList.value)

    // 🧹 Bersihkan layer lama
    currentLayers.forEach(layer => {
      try {
        props.map.removeLayer(layer)
        props.layerControl.removeLayer(layer)
      } catch (e) {
        console.warn("⚠️ Gagal hapus layer lama:", e)
      }
    })
    currentLayers = []

    if (!petaList.value?.length) {
      console.warn("⚠ Tidak ada layer untuk tanggal:", tanggal)
      return
    }

    for (const peta of petaList.value) {
      const url = peta.link_peta
      const format = peta.format_file?.toLowerCase()

      console.log("🔗 URL to fetch:", url)
      if (!url) continue

      const result = await fetch(url, { cache: "no-store" })
      if (!result.ok) {
        console.error("❌ Gagal fetch file:", result.status)
        continue
      }

      let layer = null

      if (format === "tif" || format === "tiff") {
        const buf = await result.arrayBuffer()
        const georaster = await parseGeoraster(buf)

        console.log("🌍 GeoRaster parsed:", georaster)

        // 💡 FIX utama — pastikan GeoRasterLayer dikonstruksi langsung
        layer = new GeoRasterLayer({
          georaster,
          opacity: 0.85,
          resolution: 128,
          resampleMethod: "bilinear"
        })
      }

      if (layer) {
        layer.addTo(props.map)
        props.layerControl.addOverlay(layer, peta.nama_peta || "Upload Peta")
        currentLayers.push(layer)
      }
    }
  } catch (err) {
    console.error("🔥 fetchPeta ERROR:", err)
  }
}

onMounted(() => {
  console.log("✅ Mounted, date =", props.date)
  fetchPeta(props.date)
})

watch(() => props.date, (newDate) => {
  console.log("🔄 props.date changed →", newDate)
  fetchPeta(newDate)
})
</script>
