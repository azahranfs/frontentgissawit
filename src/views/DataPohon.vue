<template>
  <div class="data-pohon-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Pohon</h2>
      <div>
        <button class="btn btn-success me-2" @click="addData">
          + Add Data
        </button>
        <button class="btn btn-primary" @click="exportCSV">
          Export CSV
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table id="pohonTable" class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Pohon</th>
            <th>Varietas</th>
            <th>Tanggal Tanam</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pohon, index) in dummyData" :key="index">
            <td>{{ pohon.id }}</td>
            <td>{{ pohon.nama }}</td>
            <td>{{ pohon.varietas }}</td>
            <td>{{ pohon.tanggal }}</td>
            <td>{{ pohon.status }}</td>
            <td>
              <button class="btn btn-sm btn-outline-secondary me-1" @click="editPohon(pohon)">
                ✎ Edit
              </button>
              <button class="btn btn-sm btn-danger" @click="deletePohon(pohon)">
                🗑 Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";

export default {
  data() {
    return {
      dummyData: [
        { id: 1, nama: "Pohon 1", varietas: "Varietas A", tanggal: "2022-01-01", status: "Aktif" },
        { id: 2, nama: "Pohon 2", varietas: "Varietas B", tanggal: "2022-03-15", status: "Nonaktif" },
        { id: 3, nama: "Pohon 3", varietas: "Varietas C", tanggal: "2023-07-10", status: "Aktif" },
        { id: 4, nama: "Pohon 4", varietas: "Varietas A", tanggal: "2021-11-20", status: "Aktif" },
        // Tambah lebih banyak data agar pagination muncul
      ]
    };
  },
  mounted() {
    this.$nextTick(() => {
      new DataTable("#pohonTable", {
        perPage: 5,
        perPageSelect: [5, 10, 20]
      });
    });
  },
  methods: {
    addData() {
      alert("Form tambah data belum dibuat 😁");
    },
    exportCSV() {
      // Export manual CSV
      let csv = "ID,Nama Pohon,Varietas,Tanggal Tanam,Status\n";
      this.dummyData.forEach((p) => {
        csv += `${p.id},${p.nama},${p.varietas},${p.tanggal},${p.status}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data_pohon.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    editPohon(pohon) {
      alert(`Edit pohon dengan ID ${pohon.id}`);
    },
    deletePohon(pohon) {
      const confirmDelete = confirm(`Yakin ingin menghapus pohon ID ${pohon.id}?`);
      if (confirmDelete) {
        this.dummyData = this.dummyData.filter((item) => item.id !== pohon.id);
      }
    }
  }
};
</script>

<style scoped>
.data-pohon-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>
