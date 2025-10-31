<template>
  <div class="data-irigasi-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Irigasi</h2>
      <div class="d-flex gap-2">
        <!-- 🔹 Tombol Add Data Utama -->
        <button class="btn btn-success" @click="openAddManual">+ Add Data</button>
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
        <span v-if="props.column.field === 'aksi'" class="d-flex gap-2">
          <button class="btn btn-sm btn-success" @click="addFromRow(props.row)">➕ Add Record Data</button>
          <button class="btn btn-sm btn-outline-secondary" @click="editIrigasi(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteIrigasi(props.row)">🗑 Hapus</button>
        </span>

        <span v-else-if="props.column.field === 'lokasi_wkb'">
          {{ props.row.lokasi_wkb ? props.row.lokasi_wkb.substring(0, 40) + '...' : '-' }}
        </span>

        <span v-else-if="props.column.field === 'created_at'">
          {{ formatTanggal(props.row.created_at) }}
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>

    <!-- 🔹 MODAL TAMBAH -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isAddFromRow ? 'Tambah Data (Dari Record Lama)' : 'Tambah Data Irigasi' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Kode Unik</label>
                <input
                  v-model="form.kode_unik"
                  type="text"
                  class="form-control"
                  :readonly="isAddFromRow"
                  placeholder="Masukkan kode unik"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Lokasi (WKB)</label>
                <textarea
                  v-model="form.lokasi_wkb"
                  class="form-control"
                  rows="3"
                  :readonly="isAddFromRow"
                  placeholder="Masukkan lokasi WKB"
                ></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Kondisi</label>
                  <input v-model="form.kondisi" type="text" class="form-control" placeholder="Kondisi" />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Sumber</label>
                  <input v-model="form.sumber" type="text" class="form-control" placeholder="Sumber" />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Luas (Ha)</label>
                  <input
                    v-model="form.luas"
                    type="number"
                    step="0.1"
                    class="form-control"
                    placeholder="Luas (Ha)"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="onCancelAdd">
                Batal
              </button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 🔹 MODAL EDIT -->
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
                <label class="form-label">Kode Unik</label>
                <input v-model="editForm.kode_unik" type="text" class="form-control" readonly />
              </div>

              <div class="mb-3">
                <label class="form-label">Lokasi (WKB)</label>
                <textarea v-model="editForm.lokasi_wkb" class="form-control" rows="3" readonly></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Kondisi</label>
                  <input v-model="editForm.kondisi" type="text" class="form-control" />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Sumber</label>
                  <input v-model="editForm.sumber" type="text" class="form-control" />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Luas (Ha)</label>
                  <input v-model="editForm.luas" type="number" step="0.1" class="form-control" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
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
  components: { VueGoodTable },
  data() {
    return {
      irigasiList: [],
      columns: [
        { label: 'ID', field: 'id_irigasi', type: 'number', sortable: true },
        { label: 'Kode Unik', field: 'kode_unik' },
        { label: 'Kondisi', field: 'kondisi' },
        { label: 'Sumber', field: 'sumber' },
        { label: 'Luas (Ha)', field: 'luas' },
        { label: 'Lokasi (WKB)', field: 'lokasi_wkb' },
        { label: 'Tanggal Buat', field: 'created_at' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: { kode_unik: '', lokasi_wkb: '', kondisi: '', sumber: '', luas: '' },
      editForm: { id_irigasi: null, kode_unik: '', lokasi_wkb: '', kondisi: '', sumber: '', luas: '' },
      isAddFromRow: false
    }
  },
  mounted() {
    this.fetchIrigasi()
  },
  methods: {
    formatTanggal(tanggal) {
      if (!tanggal) return '-'
      const t = new Date(tanggal)
      return t.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    async fetchIrigasi() {
      try {
        const res = await axios.get('/irigasi')
        this.irigasiList = res.data
      } catch (err) {
        console.error('Gagal ambil data irigasi:', err)
      }
    },
    // 🔹 Tombol Add Data manual
    openAddManual() {
      this.isAddFromRow = false
      this.resetForm()
      this.showModal('addModal')
    },
    // 🔹 Add Record dari baris (prefill form seperti edit tapi tetap POST)
    addFromRow(row) {
      this.isAddFromRow = true
      this.form = {
        kode_unik: row.kode_unik || '',
        lokasi_wkb: row.lokasi_wkb || '',
        kondisi: row.kondisi || '',
        sumber: row.sumber || '',
        luas: row.luas || ''
      }
      this.$nextTick(() => {
        this.showModal('addModal')
      })
    },
    async submitForm() {
      try {
        const payload = {
          kode_unik: this.form.kode_unik,
          kondisi: this.form.kondisi,
          sumber: this.form.sumber,
          luas: this.form.luas,
          lokasi: this.form.lokasi_wkb
        }
        await axios.post('/irigasi', payload)
        this.fetchIrigasi()
        this.hideModal('addModal')
        this.resetForm()
        this.isAddFromRow = false
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
          kondisi: this.editForm.kondisi,
          sumber: this.editForm.sumber,
          luas: this.editForm.luas
        }
        await axios.put(`/irigasi/${this.editForm.id_irigasi}`, payload)
        this.fetchIrigasi()
        this.hideModal('editModal')
        alert('Data berhasil diperbarui')
      } catch (err) {
        console.error('Gagal update data irigasi:', err)
        alert('Gagal memperbarui data')
      }
    },
    resetForm() {
      this.form = { kode_unik: '', lokasi_wkb: '', kondisi: '', sumber: '', luas: '' }
      this.isAddFromRow = false
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
    onCancelAdd() {
      this.isAddFromRow = false
      this.resetForm()
    },
    async deleteIrigasi(row) {
      if (!confirm(`Yakin hapus data irigasi dengan kode ${row.kode_unik}?`)) return
      try {
        await axios.delete(`/irigasi/${row.id_irigasi}`)
        this.fetchIrigasi()
        alert('Data berhasil dihapus')
      } catch (err) {
        console.error('Gagal hapus data irigasi:', err)
        alert('Gagal menghapus data')
      }
    },
    exportCSV() {
      let csv = 'ID,Kode Unik,Kondisi,Sumber,Luas,Lokasi WKB,Tanggal Buat\n'
      this.irigasiList.forEach(item => {
        const tanggal = this.formatTanggal(item.created_at)
        csv += `${item.id_irigasi},"${item.kode_unik}","${item.kondisi || ''}","${item.sumber || ''}",${item.luas || ''},"${item.lokasi_wkb || ''}","${tanggal}"\n`
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