<template>
  <l-geo-json
    v-if="blokGeojson"
    layer-type="overlay"
    name="Pekerja"
    :geojson="blokGeojson"
    :options-style="styleByCount"
    @add="onLayerAdd"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { LGeoJson } from '@vue-leaflet/vue-leaflet'
import axios from '@/axios'

const blokGeojson = ref(null)

// Gradasi warna dari merah pudar ke merah tua
function getColor(count) {
  if (count > 15) return '#8B0000'   
  if (count >= 11) return '#B22222' 
  if (count >= 7)  return '#CD5C5C'  
  if (count >= 1)  return '#F08080'  
  return '#FFE5E5'                   
}

const styleByCount = (feature) => {
  const cnt = feature.properties.pekerja.length
  return {
    color: '#555',
    weight: 1,
    fillColor: getColor(cnt),
    fillOpacity: 1
  }
}

onMounted(async () => {
  try {
    const res = await axios.get('/blok')
    const data = Array.isArray(res.data) ? res.data : [res.data]

    blokGeojson.value = {
      type: 'FeatureCollection',
      features: data.map(item => ({
        type: 'Feature',
        geometry: item.lokasi_geojson,
        properties: {
          id_blok: item.id_blok,
          nama_blok: item.nama_blok,
          pekerja: (item.pekerja || []).map(p => ({
            nama: p.nama,
            umur: p.umur,
            jenis_kelamin: p.jenis_kelamin,
            pekerjaan: p.pekerjaan
          }))
        }
      }))
    }
  } catch (err) {
    console.error('Gagal fetch blok untuk layer pekerja:', err)
  }
})

const onLayerAdd = (e) => {
  const layerGroup = e.target
  layerGroup.eachLayer(layer => {
    const props = layer.feature.properties
    const cnt = props.pekerja.length

    const listPekerja = props.pekerja.map(p =>
      `<li>${p.nama} — ${p.jenis_kelamin}, ${p.umur} thn (${p.pekerjaan})</li>`
    ).join('')

    const popupContent = `
      <div>
        <strong>${props.nama_blok}</strong><br/>
        Total Pekerja: ${cnt}
        <ul style="margin:0; padding-left:1em;">
          ${listPekerja}
        </ul>
      </div>
    `
    layer.bindPopup(popupContent)

    const originalStyle = {
      fillColor: getColor(cnt),
      fillOpacity: 1,
      color: '#555',
      weight: 1
    }

    layer.on('mouseover', () => {
      layer.setStyle({
        fillColor: '#ffffff',
        fillOpacity: 1,
        color: '#333',
        weight: 2
      })
    })

    layer.on('mouseout', () => {
      layer.setStyle(originalStyle)
    })
  })
}
</script>
