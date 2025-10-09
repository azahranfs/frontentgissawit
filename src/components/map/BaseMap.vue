<template>
  <div style="position: relative;">
    <!-- Input tanggal di atas map -->
    <div 
      style="
        position: absolute;
        z-index: 1000;
        top: 10px; 
        left: 60px;
        background: white;
        padding: 5px;
        border-radius: 5px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      "
    >
      <label style="font-size: 12px; font-weight: bold;">Tanggal:</label><br />
      <input 
        type="date" 
        v-model="selectedDate" 
        style="padding: 2px; font-size: 12px;"
      />
    </div>

    <l-map
      ref="leafletMap"
      v-model:zoom="zoom"
      v-model:center="center"
      style="height: 500px; width: 100%;"
      @ready="onMapReady"
    >
      <!-- 🔹 Layer Control (tetap bawaan vue-leaflet) -->
      <l-control-layers ref="layerControlRef" :collapsed="false" />

      <!-- Basemap -->
      <l-tile-layer
        layer-type="base"
        name="Street"
        :url="streetUrl"
        :attribution="attribution"
        :subdomains="subdomains"
      />
      <l-tile-layer
        layer-type="base"
        name="Satellite"
        :url="satelliteUrl"
        :attribution="attribution"
        :subdomains="subdomains"
      />

      <!-- Layer terpisah (tidak diubah) -->
      <ZonaLayer :selected-date="selectedDate" />
      <BlokLayer :selected-date="selectedDate" />
      <PekerjaLayer :selected-date="selectedDate" />
      <IrigasiLayer :selected-date="selectedDate"/>
      <JalanLayer :selected-date="selectedDate" />
      <LahanLayer />
      <PohonLayer />

      <!-- 🔹 GeoTIFF Peta Layer dari API (pakai link_peta) -->
      <!-- map.value baru diisi setelah onMapReady jalan -->
      <PetaLayer 
        v-if="map && layerControlRef?.leafletObject" 
        :map="map" 
        :layerControl="layerControlRef.leafletObject" 
        :date="selectedDate"
      />
    </l-map>

    <!-- Legenda Scrollable -->
    <div id="legend" class="leaflet-top leaflet-right">
      <div class="info legend scrollable-legend">
        <strong>Legenda Peta</strong><br /><br />

        <div class="legend-section">
          <strong>Zona</strong><br />
          <i style="background: #123524;"></i> Padat (Jumlah Pohon >= 10.000)<br />
          <i style="background: #3E7B27;"></i> Sedang (Jumlah Pohon 7.000–9.999)<br />
          <i style="background: #85A947;"></i> Jarang (Jumlah Pohon 4.000–6.999)<br />
        </div>

        <div class="legend-section">
          <strong>Blok</strong><br />
          <i style="background: #CBE2B5;"></i> Muda (Umur Pohon <= 4 tahun)<br />
          <i style="background: #86AB89;"></i> Produktif (Umur Pohon 5-18 tahun)<br />
          <i style="background: #A28B55;"></i> Tua (Umur Pohon > 18 tahun)<br />
        </div>

        <div class="legend-section">
          <strong>Pekerja</strong><br />
          <i style="background: #8B0000;"></i> > 15 orang<br />
          <i style="background: #B22222;"></i> 11 - 14 orang<br />
          <i style="background: #CD5C5C;"></i> 7 - 10 orang<br />
          <i style="background: #F08080;"></i> 1 - 6 orang<br />
        </div>

        <div class="legend-section">
          <strong>Irigasi</strong><br />
          <i style="background: #2ecc71;"></i> Normal<br />
          <i style="background: #f1c40f;"></i> Perlu Perhatian<br />
          <i style="background: #e74c3c;"></i> Rusak<br />
        </div>

        <div class="legend-section">
          <strong>Jalan</strong><br />
          <i style="background: #AAAAAA;"></i> 1- 3 meter <br />
          <i style="background: #555555;"></i> 4-5 meter <br />
          <i style="background: #000000;"></i> > 6 meter <br />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import 'leaflet.control.layers.tree/L.Control.Layers.Tree.css'
import 'leaflet.control.layers.tree'
import {
  LMap,
  LTileLayer,
  LControlLayers
} from "@vue-leaflet/vue-leaflet"
import "leaflet/dist/leaflet.css"
import { ref } from "vue"

// Import semua layer (tidak diubah)
import ZonaLayer from './layers/ZonaLayer.vue'
import BlokLayer from './layers/BlokLayer.vue'
import PekerjaLayer from './layers/PekerjaLayer.vue'
import IrigasiLayer from './layers/IrigasiLayer.vue'
import JalanLayer from './layers/JalanLayer.vue'
import LahanLayer from './layers/LahanLayer.vue'
import PetaLayer from './layers/PetaLayer.vue'
import PohonLayer from './layers/PohonLayer.vue'   

const zoom = ref(14)
const center = ref([-4.024096, 105.044538])
const attribution = '&copy; <a href="https://maps.google.com">Google Maps</a>'
const subdomains = ['mt0', 'mt1', 'mt2', 'mt3']
const streetUrl = "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
const satelliteUrl = "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"

// Input tanggal default
const selectedDate = ref(new Date().toISOString().substring(0, 10))

const map = ref(null)
const layerControlRef = ref(null)

function onMapReady(m) {
  console.log("✅ Map sudah siap:", m)
  map.value = m

  // Tambahin log supaya keliatan objectnya
  setTimeout(() => {
    console.log("🔎 layerControlRef:", layerControlRef.value)
    console.log("🔎 leafletObject:", layerControlRef.value?.leafletObject)
  }, 1000)
}
</script>

<style scoped>
#legend {
  position: absolute;
  top: 250px;
  right: 10px;
  z-index: 1000;
  pointer-events: auto;
}

.info.legend {
  background: white;
  padding: 10px;
  font-size: 13px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  line-height: 20px;
  min-width: 160px;
  max-height: 220px;
  overflow-y: auto;
  pointer-events: auto;
}

.info.legend i {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  vertical-align: middle;
  opacity: 0.8;
}

.legend-section {
  margin-bottom: 12px;
}
</style>
