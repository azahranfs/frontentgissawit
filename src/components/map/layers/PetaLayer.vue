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

    // clear current layers
    currentLayers.forEach(layer => {
      props.map.removeLayer(layer)
      props.layerControl.removeLayer(layer)
    })
    currentLayers = []

    if (!petaList.value?.length) {
      console.warn("⚠ No layer found")
      return
    }

    for (const peta of petaList.value) {
      let url = peta.link_peta
      const format = peta.format_file?.toLowerCase()

      console.log("🔗 URL to fetch:", url)

      if (!url) {
        console.error("❌ link_peta missing:", peta)
        continue
      }

      let layer = null

      // ✅ FORCED FETCH —> supaya muncul di Network
      const result = await fetch(url, { cache: "no-store" })
      console.log("📥 fetch result:", result)

      if (!result.ok) {
        console.error("❌ TIFF failed to load:", result.status)
        continue
      }

      if (format === "tif" || format === "tiff") {
      const buf = await result.arrayBuffer()
      const { default: proj4 } = await import("proj4")
      window.proj4 = proj4
      
      await import("proj4leaflet")
      const { default: parseGeoraster } = await import("georaster")
      const { default: GeoRasterLayer } = await import("georaster-layer-for-leaflet")

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
  console.log("✅ Mounted, date = ", props.date)
  fetchPeta(props.date)
})

watch(() => props.date, (newDate) => {
  console.log("🔄 props.date changed →", newDate)
  fetchPeta(newDate)
})
</script>
