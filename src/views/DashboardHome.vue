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
          <p>{{ luasLahan }} m2</p>
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
      <router-link to="/peta">
        <button
          class="map-button btn btn-outline-light position-absolute top-50 start-50 translate-middle"
        >
          Lihat Peta ⤵
        </button>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  data() {
    return {
      jumlahPohon: 0,
      luasLahan: 0,
      jumlahPekerja: 0,
    };
  },

  async mounted() {
    try {
      const pohonCountRes = await axios.get('/pohon/count');
      this.jumlahPohon = pohonCountRes.data?.total_pohon ?? 0;
      const lahanRes = await axios.get('/lahan');
      this.luasLahan = lahanRes.data[0]?.luas || 0;
      const pekerjaRes = await axios.get('/pekerja');
      this.jumlahPekerja = pekerjaRes.data.length;

    } catch (error) {
      console.error("Gagal memuat data dashboard:", error);
    }
  },
};
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
  text-align: center;
}

.map-container img {
  max-width: 100%;
  max-height: 400px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
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
