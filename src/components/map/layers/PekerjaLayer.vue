<template>
  <l-layer-group layer-type="overlay" name="Pekerja">
    <LGeoJson
      v-if="blokGeojson"
      :geojson="blokGeojson"
      :options-style="styleByCount"
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

function getColor(count) {
  if (count > 15) return "#8B0000"
  if (count >= 11) return "#B22222"
  if (count >= 7) return "#CD5C5C"
  if (count >= 1) return "#F08080"
  return "#FFE5E5"
}

const styleByCount = (feature) => {
  const cnt = feature.properties.pekerja.length
  return {
    color: "#555",
    weight: 1,
    fillColor: getColor(cnt),
    fillOpacity: 1
  }
}

const fetchData = async (tanggal) => {
  try {
    const res = await axios.get(`/blok/by-date?tanggal=${tanggal}`)
    const data = Array.isArray(res.data) ? res.data : [res.data]

    blokGeojson.value = {
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
              pekerja: (item.pekerja || []).map((p) => ({
                nama: p.nama,
                umur: p.umur,
                jenis_kelamin: p.jenis_kelamin,
                pekerjaan: p.pekerjaan
              }))
            }
          }
        })
        .filter(Boolean)
    }

    await nextTick()
    bindEvents()
  } catch (err) {
    console.error("Gagal fetch blok untuk layer pekerja:", err)
  }
}

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

    const cnt = props.pekerja.length
    const listPekerja = props.pekerja
      .map(
        (p) =>
          `<li>${p.nama} — ${p.jenis_kelamin}, ${p.umur} thn (${p.pekerjaan})</li>`
      )
      .join("")

    layer.bindPopup(`
      <div>
        <strong>${props.nama_blok}</strong><br/>
        Total Pekerja: ${cnt}
        <ul style="margin:0; padding-left:1em;">
          ${listPekerja}
        </ul>
      </div>
    `)

    layer.on("mouseover", function () {
      this.setStyle({
        fillColor: "#ffffff",
        fillOpacity: 1,
        color: "#333",
        weight: 2
      })
    })

    layer.on("mouseout", function () {
      geojsonLayerRef.resetStyle(layer)
    })
  })
}

watch(
  () => props.selectedDate,
  (newDate) => {
    if (newDate) fetchData(newDate)
  },
  { immediate: true }
)
</script>
