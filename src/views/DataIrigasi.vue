<template>
  <div class="data-irigasi-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Irigasi</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">
          + Add Data
        </button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="irigasiList"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: 5 }"
    >
      <template #table-row="props">
        <span v-if="props.column.field === 'aksi'">
          <button class="btn btn-sm btn-outline-secondary me-1" @click="editIrigasi(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteIrigasi(props.row)">🗑 Hapus</button>
        </span>
        <span v-else-if="props.column.field === 'tanggal_upload'">
          {{ formatTanggal(props.row.upload_peta?.tanggal_upload) }}
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>

    <!-- MODAL TAMBAH -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">Tambah Data Irigasi</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <textarea v-model="form.lokasi" class="form-control" rows="3" placeholder="WKT Lokasi Irigasi" required></textarea>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="form.kondisi" type="text" class="form-control" placeholder="Kondisi" />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="form.sumber" type="text" class="form-control" placeholder="Sumber Irigasi" />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model.number="form.luas" type="number" step="0.01" class="form-control" placeholder="Luas (ha)" />
                </div>
                <div class="col-md-6 mb-3">
                  <select v-model="form.id_peta" class="form-control">
                    <option disabled value="">Pilih Peta</option>
                    <option v-for="peta in daftarPeta" :key="peta.id_peta" :value="peta.id_peta">
                      {{ peta.nama_peta }}
                    </option>
                  </select>
                </div>
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
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="submitEdit">
            <div class="modal-header">
              <h5 class="modal-title">Edit Data Irigasi</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <textarea v-model="editForm.lokasi" class="form-control" rows="3" placeholder="WKT Lokasi Irigasi" readonly></textarea>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="editForm.kondisi" type="text" class="form-control" placeholder="Kondisi" />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="editForm.sumber" type="text" class="form-control" placeholder="Sumber Irigasi" />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model.number="editForm.luas" type="number" step="0.01" class="form-control" placeholder="Luas (ha)" />
                </div>
                <div class="col-md-6 mb-3">
                  <select v-model="editForm.id_peta" class="form-control">
                    <option disabled value="">Pilih Peta</option>
                    <option v-for="peta in daftarPeta" :key="peta.id_peta" :value="peta.id_peta">
                      {{ peta.nama_peta }}
                    </option>
                  </select>
                </div>
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
  </div>
</template>

<script>
import axios from '@/axios'
import { VueGoodTable } from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'

export default {
  name: 'DataIrigasi',
  components: {
    VueGoodTable
  },
  data() {
    return {
      irigasiList: [],
      daftarPeta: [],
      columns: [
        { label: 'ID', field: 'id_irigasi', sortable: true },
        { label: 'Kondisi', field: 'kondisi' },
        { label: 'Sumber', field: 'sumber' },
        { label: 'Luas (ha)', field: 'luas' },
        { label: 'Tanggal Upload', field: 'tanggal_upload' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        lokasi: '',
        kondisi: '',
        sumber: '',
        luas: null,
        id_peta: ''
      },
      editForm: {
        id_irigasi: null,
        lokasi: '',
        kondisi: '',
        sumber: '',
        luas: null,
        id_peta: ''
      }
    }
  },
  mounted() {
    this.fetchIrigasi()
    this.fetchPeta()
  },
  methods: {
    formatTanggal(dateString) {
      if (!dateString) return '-'
      const options = { day: 'numeric', month: 'long', year: 'numeric' }
      return new Date(dateString).toLocaleDateString('id-ID', options)
    },
    async fetchIrigasi() {
      try {
        const res = await axios.get('/irigasi')
        this.irigasiList = res.data
      } catch (err) {
        console.error('Gagal ambil data irigasi:', err)
      }
    },
    async fetchPeta() {
      try {
        const res = await axios.get('/upload_peta')
        this.daftarPeta = res.data
      } catch (err) {
        console.error('Gagal ambil data peta:', err)
      }
    },
    async submitForm() {
      try {
        const payload = {
          lokasi: this.form.lokasi,
          kondisi: this.form.kondisi || null,
          sumber: this.form.sumber || null,
          luas: this.form.luas || null,
          id_peta: this.form.id_peta || null
        }
        await axios.post('/irigasi', payload)
        this.fetchIrigasi()
        this.resetForm()
        this.hideModal('addModal')
        alert('Data berhasil ditambahkan')
      } catch (err) {
        console.error('Gagal tambah data irigasi:', err)
        alert('Gagal menambahkan data')
      }
    },
    editIrigasi(row) {
      this.editForm = { ...row }
      this.showModal('editModal')
    },
    async submitEdit() {
      try {
        const payload = {
          lokasi: this.editForm.lokasi,
          kondisi: this.editForm.kondisi || null,
          sumber: this.editForm.sumber || null,
          luas: this.editForm.luas || null,
          id_peta: this.editForm.id_peta || null
        }
        await axios.put(`/irigasi/${this.editForm.id_irigasi}`, payload)
        this.fetchIrigasi()
        this.hideModal('editModal')
        alert('Data berhasil diperbarui')
      } catch (err) {
        console.error('Gagal update data:', err)
        alert('Gagal memperbarui data')
      }
    },
    async deleteIrigasi(row) {
      if (confirm(`Yakin ingin menghapus irigasi ini?`)) {
        try {
          await axios.delete(`/irigasi/${row.id_irigasi}`)
          this.fetchIrigasi()
          alert('Data berhasil dihapus')
        } catch (err) {
          console.error('Gagal hapus data:', err)
          alert('Gagal menghapus data')
        }
      }
    },
    resetForm() {
      this.form = {
        lokasi: '',
        kondisi: '',
        sumber: '',
        luas: null,
        id_peta: ''
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
      let csv = 'ID,Kondisi,Sumber,Luas,Tanggal Upload,Peta\n'
      this.irigasiList.forEach(item => {
        const namaPeta = item.upload_peta?.nama || ''
        const tgl = item.upload_peta?.tanggal_upload ? this.formatTanggal(item.upload_peta.tanggal_upload) : ''
        csv += `${item.id_irigasi},"${item.kondisi || ''}","${item.sumber || ''}",${item.luas || ''},"${tgl}","${namaPeta}"\n`
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_irigasi.csv')
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

.data-irigasi-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>