<template>
  <div class="data-zona-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Zona</h2>
      <div>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="zonaList"
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
        
        <!-- tampilkan potongan lokasi_zona_wkb -->
        <span v-else-if="props.column.field === 'lokasi_zona_wkb'">
          {{ props.row.lokasi_zona_wkb ? props.row.lokasi_zona_wkb.substring(0, 40) + '...' : '-' }}
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
              <h5 class="modal-title">Tambah Data Zona</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <!-- readonly kode_unik -->
              <div class="mb-3">
                <label class="form-label">Kode Unik</label>
                <input v-model="form.kode_unik" type="text" class="form-control" readonly />
              </div>

              <!-- readonly lokasi_zona_wkb -->
              <div class="mb-3">
                <label class="form-label">Lokasi (WKB)</label>
                <textarea v-model="form.lokasi_zona_wkb" class="form-control" rows="3" readonly></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="form.nama_zona" type="text" class="form-control" placeholder="Nama Zona" />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model.number="form.jumlah" type="number" step="1" class="form-control" placeholder="Jumlah" />
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
              <h5 class="modal-title">Edit Data Zona</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Kode Unik</label>
                <input v-model="form.kode_unik" type="text" class="form-control" readonly />
              </div>

              <div class="mb-3">
                <label class="form-label">Lokasi (WKB)</label>
                <textarea v-model="editForm.lokasi_zona_wkb" class="form-control" rows="3" readonly></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nama Zona</label>
                  <input v-model="editForm.nama_zona" type="text" class="form-control" placeholder="Nama Zona" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Jumlah</label>
                  <input v-model.number="editForm.jumlah" type="number" step="1" class="form-control" placeholder="Jumlah" />
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
  name: 'DataZona',
  components: { VueGoodTable },
  data() {
    return {
      zonaList: [],
      columns: [
        { label: 'ID', field: 'id_zona', sortable: true },
        { label: 'Kode Unik', field: 'kode_unik' },
        { label: 'Nama Zona', field: 'nama_zona' },
        { label: 'Jumlah', field: 'jumlah' },
        { label: 'Lokasi (WKB)', field: 'lokasi_zona_wkb' },
        { label: 'Tanggal Buat', field: 'created_at' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        kode_unik: '',
        lokasi_zona_wkb: '',
        nama_zona: '',
        jumlah: null
      },
      editForm: {
        id_zona: null,
        lokasi_zona_wkb: '',
        nama_zona: '',
        jumlah: null
      }
    }
  },
  mounted() {
    this.fetchZona()
  },
  methods: {
    formatTanggal(tanggal) {
      if (!tanggal) return '-'
      const t = new Date(tanggal)
      return t.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    async fetchZona() {
      try {
        const res = await axios.get('/zona')
        this.zonaList = res.data
      } catch (err) {
        console.error('Gagal ambil data zona:', err)
      }
    },
    addFromRow(row) {
      this.form = {
        kode_unik: row.kode_unik,
        lokasi_zona_wkb: row.lokasi_zona_wkb,
        nama_zona: '',
        jumlah: null
      }
      this.showModal('addModal')
    },
    async submitForm() {
      try {
        const payload = {
          kode_unik: this.form.kode_unik,
          lokasi_zona_wkb: this.form.lokasi_zona_wkb,
          nama_zona: this.form.nama_zona || null,
          jumlah: this.form.jumlah || null
        }
        await axios.post('/zona', payload)
        this.fetchZona()
        this.resetForm()
        this.hideModal('addModal')
        alert('Data berhasil ditambahkan')
      } catch (err) {
        console.error('Gagal tambah data zona:', err)
        alert('Gagal menambahkan data')
      }
    },
    editZona(row) {
      this.editForm = {
        id_zona: row.id_zona,
        lokasi_zona_wkb: row.lokasi_zona_wkb,
        nama_zona: row.nama_zona,
        jumlah: row.jumlah
      }
      this.showModal('editModal')
    },
    async submitEdit() {
      try {
        const payload = {
          nama_zona: this.editForm.nama_zona || null,
          jumlah: this.editForm.jumlah || null
        }
        await axios.put(`/zona/${this.editForm.id_zona}`, payload)
        this.fetchZona()
        this.hideModal('editModal')
        alert('Data berhasil diperbarui')
      } catch (err) {
        console.error('Gagal update data zona:', err)
        alert('Gagal memperbarui data')
      }
    },
    resetForm() {
      this.form = { kode_unik: '', lokasi_zona_wkb: '', nama_zona: '', jumlah: null }
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
    async deleteZona(row) {
      if (!confirm(`Yakin hapus data zona dengan kode ${row.kode_unik}?`)) return
      try {
        await axios.delete(`/zona/${row.id_zona}`)
        this.fetchZona()
        alert('Data berhasil dihapus')
      } catch (err) {
        console.error('Gagal hapus data zona:', err)
        alert('Gagal menghapus data')
      }
    },
    exportCSV() {
      let csv = 'ID,Kode Unik,Nama Zona,Jumlah,Lokasi WKB,Tanggal Buat\n'
      this.zonaList.forEach(item => {
        const tanggal = this.formatTanggal(item.created_at)
        csv += `${item.id_zona},"${item.kode_unik}","${item.nama_zona || ''}",${item.jumlah || ''},"${item.lokasi_zona_wkb || ''}","${tanggal}"\n`
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_zona.csv')
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

.data-zona-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>