<template>
  <div class="data-lahan-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Lahan</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">
          + Add Data
        </button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="lahanList"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: 5 }"
    >
      <template #table-row="props">
        <span v-if="props.column.field === 'aksi'">
          <button class="btn btn-sm btn-outline-secondary me-1" @click="editLahan(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteLahan(props.row)">🗑 Hapus</button>
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>

    <!-- MODAL TAMBAH -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">Tambah Data Lahan</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input v-model="form.penggunaan_sebelumnya" type="text" class="form-control" placeholder="Penggunaan Sebelumnya" required />
              </div>
              <div class="mb-3">
                <input v-model.number="form.tahun_perubahan" type="number" class="form-control" placeholder="Tahun Perubahan" required />
              </div>
              <div class="mb-3">
                <input v-model.number="form.tahun_jadi_sawit" type="number" class="form-control" placeholder="Tahun Jadi Sawit" required />
              </div>
              <div class="mb-3">
                <input v-model.number="form.luas" type="number" step="0.01" class="form-control" placeholder="Luas" required />
              </div>
              <div class="mb-3">
                <textarea v-model="form.batas" class="form-control" placeholder="GeoJSON batas (MultiPolygon)"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitEdit">
            <div class="modal-header">
              <h5 class="modal-title">Edit Data Lahan</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input v-model="editForm.penggunaan_sebelumnya" type="text" class="form-control" placeholder="Penggunaan Sebelumnya"/>
              </div>
              <div class="mb-3">
                <input v-model.number="editForm.tahun_perubahan" type="number" class="form-control" placeholder="Tahun Perubahan"/>
              </div>
              <div class="mb-3">
                <input v-model.number="editForm.tahun_jadi_sawit" type="number" class="form-control" placeholder="Tahun Jadi Sawit"/>
              </div>
              <div class="mb-3">
                <input v-model.number="editForm.luas" type="number" step="0.01" class="form-control" placeholder="Luas"/>
              </div>
              <!-- Field 'batas' dihapus dari modal edit -->
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'
import { VueGoodTable } from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'

export default {
  name: 'DataLahan',
  components: { VueGoodTable },
  data() {
    return {
      lahanList: [],
      columns: [
        { label: 'ID', field: 'id_lahan', sortable: true },
        { label: 'Penggunaan Sebelumnya', field: 'penggunaan_sebelumnya' },
        { label: 'Tahun Perubahan', field: 'tahun_perubahan' },
        { label: 'Tahun Jadi Sawit', field: 'tahun_jadi_sawit' },
        { label: 'Luas', field: 'luas' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        penggunaan_sebelumnya: '',
        tahun_perubahan: null,
        tahun_jadi_sawit: null,
        luas: null,
        batas: ''
      },
      editForm: {
        id_lahan: null,
        penggunaan_sebelumnya: '',
        tahun_perubahan: null,
        tahun_jadi_sawit: null,
        luas: null,
        // batas tidak dibutuhkan di edit form
      }
    }
  },
  mounted() {
    this.fetchLahan()
  },
  methods: {
    async fetchLahan() {
      try {
        const res = await axios.get('/lahan')
        this.lahanList = res.data
      } catch (err) {
        console.error('Gagal ambil data lahan:', err)
      }
    },
    async submitForm() {
      try {
        const payload = { ...this.form }
        await axios.post('/lahan', payload)
        this.fetchLahan()
        this.resetForm()
        this.hideModal('addModal')
        alert('Data berhasil ditambahkan')
      } catch (err) {
        console.error('Gagal tambah data lahan:', err)
        alert('Gagal menambahkan data')
      }
    },
    editLahan(row) {
      this.editForm = {
        id_lahan: row.id_lahan,
        penggunaan_sebelumnya: row.penggunaan_sebelumnya,
        tahun_perubahan: row.tahun_perubahan,
        tahun_jadi_sawit: row.tahun_jadi_sawit,
        luas: row.luas
        // batas sengaja tidak dimasukkan
      }
      this.showModal('editModal')
    },
    async submitEdit() {
      try {
        await axios.put(`/lahan/${this.editForm.id_lahan}`, this.editForm)
        this.fetchLahan()
        this.hideModal('editModal')
        alert('Data berhasil diperbarui')
      } catch (err) {
        console.error('Gagal update data:', err)
        alert('Gagal memperbarui data')
      }
    },
    async deleteLahan(row) {
      if (confirm(`Yakin ingin menghapus data ini?`)) {
        try {
          await axios.delete(`/lahan/${row.id_lahan}`)
          this.fetchLahan()
          alert('Data berhasil dihapus')
        } catch (err) {
          console.error('Gagal hapus data:', err)
          alert('Gagal menghapus data')
        }
      }
    },
    resetForm() {
      this.form = {
        penggunaan_sebelumnya: '',
        tahun_perubahan: null,
        tahun_jadi_sawit: null,
        luas: null,
        batas: ''
      }
    },
    showModal(id) {
      const modalEl = document.getElementById(id)
      let modal = window.bootstrap.Modal.getInstance(modalEl)
      if (!modal) modal = new window.bootstrap.Modal(modalEl)
      modal.show()
    },
    hideModal(id) {
      const modalEl = document.getElementById(id)
      let modal = window.bootstrap.Modal.getInstance(modalEl)
      if (!modal) modal = new window.bootstrap.Modal(modalEl)
      modal.hide()
    },
    exportCSV() {
      let csv = 'ID, Penggunaan Sebelumnya, Tahun Perubahan, Tahun Jadi Sawit, Luas\n'
      this.lahanList.forEach(item => {
        csv += `${item.id_lahan},"${item.penggunaan_sebelumnya}",${item.tahun_perubahan},${item.tahun_jadi_sawit},${item.luas}\n`
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_lahan.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>

<style>
.vgt-table {
  border-collapse: collapse !important;
  font-size: 14px !important;
  background-color: #fff !important;
}

.vgt-table th,
.vgt-table td {
  padding: 10px 14px !important;
  border: 1px solid #dee2e6 !important;
}

.vgt-table th {
  background-color: #f2f2f2 !important;
  font-weight: 600 !important;
  color: #333 !important;
  text-align: left !important;
}

.vgt-sort-icon::before {
  content: '⇅' !important;
  font-size: 12px !important;
  color: #999 !important;
  margin-left: 4px !important;
}

th.sorting-asc .vgt-sort-icon::before {
  content: '▲' !important;
  color: #007bff !important;
}

th.sorting-desc .vgt-sort-icon::before {
  content: '▼' !important;
  color: #007bff !important;
}

.vgt-input {
  padding: 6px 12px !important;
  border-radius: 8px !important;
  border: 1px solid #ccc !important;
}

.vgt-pagination {
  margin-top: 10px !important;
}

.data-lahan-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>