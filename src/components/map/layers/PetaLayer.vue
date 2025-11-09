<template>
  <div></div>
</template>

<script setup>
import { onMounted, watch, ref } from "vue"
import L from "leaflet"
import axios from "@/axios"

// 🧩 Tambahkan proj4 di awal supaya tersedia di global scope sebelum library lain
import proj4 from "proj4"
import "proj4leaflet"
window.proj4 = proj4

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

    // 🧹 Hapus layer lama dari map dan control
    currentLayers.forEach(layer => {
      props.map.removeLayer(layer)
      props.layerControl.removeLayer(layer)
    })
    currentLayers = []

    if (!petaList.value?.length) {
      console.warn("⚠ No layer found for date:", tanggal)
      return
    }

    for (const peta of petaList.value) {
      const url = peta.link_peta
      const format = peta.format_file?.toLowerCase()
      console.log("🔗 URL to fetch:", url)

      if (!url) {
        console.error("❌ link_peta missing:", peta)
        continue
      }

      const result = await fetch(url, { cache: "no-store" })
      console.log("📥 fetch result:", result)

      if (!result.ok) {
        console.error("❌ TIFF failed to load:", result.status)
        continue
      }

      let layer = null

      if (format === "tif" || format === "tiff") {
  const buf = await result.arrayBuffer()
  const parseGeoraster = (await import("georaster")).default
  const GeoRasterLayerModule = await import("georaster-layer-for-leaflet")

  console.log("🧩 GeoRasterLayerModule:", GeoRasterLayerModule)

  const GeoRasterLayer =
    GeoRasterLayerModule.default?.GeoRasterLayer ||
    GeoRasterLayerModule.GeoRasterLayer ||
    GeoRasterLayerModule.default

  const georaster = await parseGeoraster(buf)

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
