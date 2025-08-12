<template>
  <div class="data-jalan-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Jalan</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">+ Add Data</button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="jalanList"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: 5 }"
    >
      <template #table-row="props">
        <span v-if="props.column.field === 'aksi'">
          <button class="btn btn-sm btn-outline-secondary me-1" @click="editJalan(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteJalan(props.row)">🗑 Hapus</button>
        </span>
        <span v-else-if="props.column.field === 'lokasi'">
          {{ props.row.lokasi?.substring(0, 30) + '...' }}
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
              <h5 class="modal-title">Tambah Data Jalan</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <textarea v-model="form.lokasi" class="form-control" rows="3" placeholder="WKT Lokasi Jalan" required></textarea>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="form.kondisi" type="text" class="form-control" placeholder="Kondisi" />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model.number="form.lebar" type="number" step="0.01" class="form-control" placeholder="Lebar (m)" />
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
              <h5 class="modal-title">Edit Data Jalan</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <!-- LOKASI: readonly -->
              <div class="mb-3">
                <label class="form-label">Lokasi (WKT)</label>
                <textarea v-model="editForm.lokasi" class="form-control" rows="3" readonly></textarea>
              </div>

              <div class="row">
                <!-- KONDISI: editable -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Kondisi</label>
                  <input v-model="editForm.kondisi" type="text" class="form-control" placeholder="Kondisi" />
                </div>

                <!-- LEBAR: editable -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Lebar (m)</label>
                  <input v-model.number="editForm.lebar" type="number" step="0.01" class="form-control" placeholder="Lebar (m)" />
                </div>

                <!-- ID PETA -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Peta</label>
                  <select v-model="editForm.id_peta" class="form-control">
                    <option value="">Pilih Peta</option>
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
  name: 'DataJalan',
  components: {
    VueGoodTable
  },
  data() {
    return {
      jalanList: [],
      daftarPeta: [],
      columns: [
        { label: 'ID', field: 'id_jalan', sortable: true },
        { label: 'Lokasi', field: 'lokasi' },
        { label: 'Kondisi', field: 'kondisi' },
        { label: 'Lebar (m)', field: 'lebar' },
        { label: 'Tanggal Upload', field: 'tanggal_upload' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        lokasi: '',
        kondisi: '',
        lebar: null,
        id_peta: ''
      },
      editForm: {
        id_jalan: null,
        lokasi: '',
        kondisi: '',
        lebar: null,
        id_peta: ''
      }
    }
  },
  mounted() {
    this.fetchJalan()
    this.fetchPeta()
  },
  methods: {
    formatTanggal(tanggal) {
      if (!tanggal) return '-'
      const tanggalObj = new Date(tanggal)
      return tanggalObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    async fetchJalan() {
      try {
        const res = await axios.get('/jalan')
        this.jalanList = res.data
      } catch (err) {
        console.error('Gagal ambil data jalan:', err)
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
          lebar: this.form.lebar || null,
          id_peta: this.form.id_peta || null
        }
        await axios.post('/jalan', payload)
        this.fetchJalan()
        this.resetForm()
        this.hideModal('addModal')
        alert('Data berhasil ditambahkan')
      } catch (err) {
        console.error('Gagal tambah data jalan:', err)
        alert('Gagal menambahkan data')
      }
    },
    editJalan(row) {
      this.editForm = {
        id_jalan: row.id_jalan,
        kondisi: row.kondisi,
        lebar: row.lebar,
        id_peta: row.id_peta,
        lokasi: row.lokasi // hanya untuk tampil di readonly textarea, tidak dikirim
      }
      this.showModal('editModal')
    },
    async submitEdit() {
      try {
        const payload = {
          kondisi: this.editForm.kondisi || null,
          lebar: this.editForm.lebar || null,
          id_peta: this.editForm.id_peta || null
        }

        await axios.put(`/jalan/${this.editForm.id_jalan}`, payload)
        this.fetchJalan()
        this.hideModal('editModal')
        alert('Data berhasil diperbarui')
      } catch (err) {
        console.error('Gagal update data:', err)
        alert('Gagal memperbarui data')
      }
    },
    resetForm() {
      this.form = {
        lokasi: '',
        kondisi: '',
        lebar: null,
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
      let csv = 'ID,Lokasi,Kondisi,Lebar,Tanggal Upload,Peta\n'
      this.jalanList.forEach(item => {
        const namaPeta = item.upload_peta?.nama_peta || ''
        const tanggal = this.formatTanggal(item.upload_peta?.tanggal_upload)
        csv += `${item.id_jalan},"${item.lokasi}","${item.kondisi || ''}",${item.lebar || ''},"${tanggal}","${namaPeta}"\n`
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_jalan.csv')
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

.data-jalan-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>