<template>
  <div class="mapview-page">
    <div class="mapview-header">
      <h2>Halaman MapView</h2>
    </div>
    <BaseMap />
  </div>
</template>

<script setup>
import BaseMap from '@/components/map/BaseMap.vue'
</script>

<style scoped>
.mapview-page {
  padding: 20px;
  background-color: #002e24; /* hijau tua gelap */
  min-height: 100vh;
}

.mapview-header {
  margin-bottom: 20px;
  text-align: center;
}

.mapview-header h2 {
  color: #ffffff;
  background-color: #005542;
  display: inline-block;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
