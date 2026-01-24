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

// ✅ Format tanggal
const formatTanggal = (t) =>
  t
    ? new Date(t).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-"

// ✅ Warna berdasarkan kondisi
const getColorByKondisi = (k) => {
  switch (k?.toLowerCase()) {
    case "normal":
      return "#2ecc71"
    case "perlu perhatian":
      return "#f1c40f"
    case "rusak":
      return "#e74c3c"
    default:
      return "#95a5a6"
  }
}

const styleIrigasi = (feature) => ({
  color: getColorByKondisi(feature?.properties?.kondisi),
  fillColor: getColorByKondisi(feature?.properties?.kondisi),
  fillOpacity: 1,
  weight: 2,
})

// ✅ MAIN FETCH
const fetchIrigasi = async (tanggal) => {
  try {
    const res = await axios.get("/irigasi", {
      params: {
        tanggal: tanggal || "",
        _ts: Date.now(), // anti-cache
      },
    })

    const data = Array.isArray(res.data) ? res.data : [res.data]

    // ✅ Convert ke FeatureCollection
    irigasiGeojson.value = {
      type: "FeatureCollection",
      features: data
        .filter((item) => item.lokasi_geojson)
        .map((item) => {
          let geometry = null

          try {
            geometry =
              typeof item.lokasi_geojson === "string"
                ? JSON.parse(item.lokasi_geojson)
                : item.lokasi_geojson
          } catch (e) {
            console.error("❌ Gagal parsing GeoJSON:", e)
            return null
          }

          return {
            type: "Feature",
            geometry,
            properties: {
              id_irigasi: item.id_irigasi,
              kode_unik: item.kode_unik,
              kondisi: item.kondisi,
              sumber: item.sumber,
              luas: item.luas,
              tanggal_upload: formatTanggal(item.created_at), // ✅ FIX
            },
          }
        })
        .filter(Boolean),
    }

    await nextTick()
    bindEvents()
  } catch (err) {
    console.error("❌ Gagal ambil data irigasi:", err)
  }
}

// ✅ SAVE LAYER INSTANCE
const onLayerAdd = (e) => {
  geojsonLayerRef = e?.mapObject || e?.target || e
  bindEvents()
}

// ✅ BIND POPUP + HOVER
const bindEvents = () => {
  if (!geojsonLayerRef) return

  geojsonLayerRef.eachLayer((layer) => {
    const props = layer.feature?.properties
    if (!props) return

    layer.off() // clear old listeners

    layer.bindPopup(`
      <div>
        <strong>ID Irigasi:</strong> ${props.id_irigasi ?? "-"}<br/>
        <strong>Kode Unik:</strong> ${props.kode_unik ?? "-"}<br/>
        <strong>Kondisi:</strong> ${props.kondisi ?? "-"}<br/>
        <strong>Sumber:</strong> ${props.sumber ?? "-"}<br/>
        <strong>Luas:</strong> ${
          props.luas ? props.luas + " Ha" : "-"
        }<br/>
        <strong>Tanggal Upload:</strong> ${props.tanggal_upload ?? "-"}
      </div>
    `)

    layer.on("mouseover", function () {
      this.setStyle({ weight: 3, color: "#63C8FF", fillColor: "#63C8FF", fillOpacity: 1 })
    })

    layer.on("mouseout", function () {
      geojsonLayerRef.resetStyle(layer)
    })

    layer.on("click", function () {
      this.openPopup()
    })
  })
}

// ✅ Refresh saat tanggal berubah
watch(
  () => props.selectedDate,
  (newDate) => {
    if (newDate) fetchIrigasi(newDate)
  },
  { immediate: true }
)
</script>
