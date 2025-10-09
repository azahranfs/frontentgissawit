<template>
  <div class="data-jalan-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Jalan</h2>
      <div>
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
        <!-- kolom aksi -->
        <span v-if="props.column.field === 'aksi'" class="d-flex gap-2">
          <button class="btn btn-sm btn-success" @click="addFromRow(props.row)">➕ Add Data</button>
          <button class="btn btn-sm btn-outline-secondary" @click="editBlok(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteBlok(props.row)">🗑 Hapus</button>
        </span>

        <!-- tampilkan potongan lokasi_wkb -->
        <span v-else-if="props.column.field === 'lokasi_wkb'">
          {{ props.row.lokasi_wkb ? props.row.lokasi_wkb.substring(0, 40) + '...' : '-' }}
        </span>

        <!-- format tanggal created_at -->
        <span v-else-if="props.column.field === 'created_at'">
          {{ formatTanggal(props.row.created_at) }}
        </span>

        <!-- default -->
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
              <!-- readonly kode_unik -->
              <div class="mb-3">
                <label class="form-label">Kode Unik</label>
                <input v-model="form.kode_unik" type="text" class="form-control" readonly />
              </div>

              <!-- readonly lokasi_wkb -->
              <div class="mb-3">
                <label class="form-label">Lokasi (WKB)</label>
                <textarea v-model="form.lokasi_wkb" class="form-control" rows="3" readonly></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="form.kondisi" type="text" class="form-control" placeholder="Kondisi" />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model.number="form.lebar" type="number" step="0.01" class="form-control" placeholder="Lebar (m)" />
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
              <!-- LOKASI WKB: readonly -->
              <div class="mb-3">
                <label class="form-label">Lokasi (WKT)</label>
                <textarea v-model="editForm.lokasi_wkb" class="form-control" rows="3" readonly></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Kondisi</label>
                  <input v-model="editForm.kondisi" type="text" class="form-control" placeholder="Kondisi" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Lebar (m)</label>
                  <input v-model.number="editForm.lebar" type="number" step="0.01" class="form-control" placeholder="Lebar (m)" />
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
  components: { VueGoodTable },
  data() {
    return {
      jalanList: [],
      columns: [
        { label: 'ID', field: 'id_jalan', sortable: true },
        { label: 'Kode Unik', field: 'kode_unik' },
        { label: 'Kondisi', field: 'kondisi' },
        { label: 'Lebar (m)', field: 'lebar' },
        { label: 'Lokasi (WKB)', field: 'lokasi_wkb' },
        { label: 'Tanggal Buat', field: 'created_at' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        kode_unik: '',
        lokasi_wkb: '',
        kondisi: '',
        lebar: null
      },
      editForm: {
        id_jalan: null,
        lokasi_wkb: '',
        kondisi: '',
        lebar: null
      }
    }
  },
  mounted() {
    this.fetchJalan()
  },
  methods: {
    formatTanggal(tanggal) {
      if (!tanggal) return '-'
      const t = new Date(tanggal)
      return t.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    async fetchJalan() {
      try {
        const res = await axios.get('/jalan')
        this.jalanList = res.data
      } catch (err) {
        console.error('Gagal ambil data jalan:', err)
      }
    },
    addFromRow(row) {
      this.form = {
        kode_unik: row.kode_unik,
        lokasi_wkb: row.lokasi_wkb,
        kondisi: '',
        lebar: null
      }
      this.showModal('addModal')
    },
    async submitForm() {
      try {
        const payload = {
          kode_unik: this.form.kode_unik,
          lokasi_wkb: this.form.lokasi_wkb,
          kondisi: this.form.kondisi || null,
          lebar: this.form.lebar || null
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
        lokasi_wkb: row.lokasi_wkb,
        kondisi: row.kondisi,
        lebar: row.lebar
      }
      this.showModal('editModal')
    },
    async submitEdit() {
      try {
        const payload = {
          kondisi: this.editForm.kondisi || null,
          lebar: this.editForm.lebar || null
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
      this.form = { kode_unik: '', lokasi_wkb: '', kondisi: '', lebar: null }
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
    
  async deleteJalan(row) {
    if (!confirm(`Yakin hapus data jalan dengan kode ${row.kode_unik}?`)) return
    try {
      await axios.delete(`/jalan/${row.id_jalan}`)
      this.fetchJalan()
      alert('Data berhasil dihapus')
    } catch (err) {
      console.error('Gagal hapus data jalan:', err)
      alert('Gagal menghapus data')
    }
  },
  
    exportCSV() {
      let csv = 'ID,Kode Unik,Kondisi,Lebar,Lokasi WKB,Tanggal Buat\n'
      this.jalanList.forEach(item => {
        const tanggal = this.formatTanggal(item.created_at)
        csv += `${item.id_jalan},"${item.kode_unik}","${item.kondisi || ''}",${item.lebar || ''},"${item.lokasi_wkb || ''}","${tanggal}"\n`
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