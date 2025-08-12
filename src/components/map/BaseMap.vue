<template>
  <div style="position: relative;">
    <l-map
      ref="leafletMap"
      v-model:zoom="zoom"
      v-model:center="center"
      style="height: 500px; width: 100%;"
      @ready="onMapReady"
    >
      <l-control-layers :collapsed="false" />

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

      <!-- Layer terpisah -->
      <BlokLayer />
      <PekerjaLayer />
      <IrigasiLayer />
      <JalanLayer />
      <LahanLayer />
    </l-map>s

    <!-- Legenda Scrollable -->
    <div id="legend" class="leaflet-top leaflet-right">
      <div class="info legend scrollable-legend">
        <strong>Legenda Peta</strong><br /><br />

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

import BlokLayer from './layers/BlokLayer.vue'
import PekerjaLayer from './layers/PekerjaLayer.vue'
import IrigasiLayer from './layers/IrigasiLayer.vue'
import JalanLayer from './layers/JalanLayer.vue'
import LahanLayer from './layers/LahanLayer.vue'

const zoom = ref(14)
const center = ref([-4.024096, 105.044538])
const attribution = '&copy; <a href="https://maps.google.com">Google Maps</a>'
const subdomains = ['mt0', 'mt1', 'mt2', 'mt3']
const streetUrl = "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
const satelliteUrl = "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"

const map = ref(null)
function onMapReady(m) {
  map.value = m
}
</script>

<style scoped>
#legend {
  position: absolute;
  top: 250px;
  right: 10px;
  z-index: 1000;
  pointer-events: auto; /* Tambahkan ini agar scroll bisa nyangkut ke kontainer, bukan ke map */
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
  pointer-events: auto; /* Ini penting juga */
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
