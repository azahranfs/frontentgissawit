<template>
  <div v-if="visibleLegends.length > 0" class="legend-container">
    <div class="legend-title">Legenda</div>
    <div class="legend-scroll">
      <div
        v-for="legend in visibleLegends"
        :key="legend.id"
        class="legend-item"
      >
        <div class="legend-label">{{ legend.name }}</div>
        <div v-for="item in legend.items" :key="item.label" class="legend-color-row">
          <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
          <div class="legend-text">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activeLayers: Array,
  },
  computed: {
    visibleLegends() {
      const allLegends = [
        {
          id: 'blok',
          name: 'Blok Kebun',
          items: [
            { label: 'TBM', color: '#A8E6CF' },
            { label: 'TM', color: '#DCEDC1' },
          ],
        },
        {
          id: 'irigasi',
          name: 'Irigasi',
          items: [
            { label: 'Primer', color: '#64b5f6' },
            { label: 'Sekunder', color: '#1976d2' },
          ],
        },
        {
          id: 'jalan',
          name: 'Jalan',
          items: [
            { label: 'Aspal', color: '#757575' },
            { label: 'Tanah', color: '#d7ccc8' },
          ],
        },
        {
          id: 'batas',
          name: 'Batas Kebun',
          items: [
            { label: 'Kebun 1', color: '#8d6e63' },
          ],
        },
        {
          id: 'pekerja',
          name: 'Pekerja',
          items: [
            { label: 'Aktif', color: '#fdd835' },
            { label: 'Cuti', color: '#ff7043' },
          ],
        },
      ];
      return allLegends.filter((l) => this.activeLayers.includes(l.id));
    },
  },
};
</script>

<style scoped>
.legend-container {
  position: absolute;
  top: 100px;
  right: 20px;
  z-index: 1000;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  max-height: 250px;
  overflow-y: auto;
  width: 200px;
  border-radius: 6px;
}
.legend-title {
  font-weight: bold;
  margin-bottom: 5px;
}
.legend-item {
  margin-bottom: 10px;
}
.legend-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}
.legend-color-row {
  display: flex;
  align-items: center;
  margin-bottom: 3px;
}
.legend-color {
  width: 15px;
  height: 15px;
  margin-right: 8px;
  border: 1px solid #999;
}
.legend-text {
  font-size: 13px;
}
</style>
