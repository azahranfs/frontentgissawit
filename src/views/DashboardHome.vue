<template>
  <div class="dashboard-home">
    <!-- Kotak statistik -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="stat-box bg-success text-white">
          <h4>Jumlah Pohon</h4>
          <p>{{ jumlahPohon }}</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-box bg-primary text-white">
          <h4>Luas Lahan</h4>
          <p>{{ luasLahan }} Ha</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-box bg-warning text-dark">
          <h4>Jumlah Pekerja</h4>
          <p>{{ jumlahPekerja }}</p>
        </div>
      </div>
    </div>

    <!-- Gambar peta dengan tombol di tengah -->
    <div class="map-container position-relative text-center">
      <img src="@/assets/image/peta.png" alt="Peta" class="img-fluid rounded shadow" />
      <button class="map-button btn btn-outline-light position-absolute top-50 start-50 translate-middle">
        Click Here ⤵
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      jumlahPohon: 1280,
      luasLahan: 45.3,
      jumlahPekerja: 23
    }
  }
}
</script>

<style scoped>
.stat-box {
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.map-container {
  position: relative;
  margin-top: 30px;
}

.map-button {
  padding: 10px 20px;
  font-weight: bold;
  font-size: 16px;
  border-radius: 30px;
  background-color: rgba(0, 46, 36, 0.8);
  color: #fff;
  border: none;
  transition: background-color 0.3s ease;
}

.map-button:hover {
  background-color: rgba(0, 46, 36, 1);
}
</style>
