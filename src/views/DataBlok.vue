<template>
  <div class="data-blok-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Blok</h2>
      <div class="d-flex gap-2">
        <button class="btn btn-success" @click="openAddManual">
          + Add Data
        </button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="blokList"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: 5 }"
    >
      <template #table-row="props">
        <span v-if="props.column.field === 'aksi'" class="d-flex gap-2">
          <button class="btn btn-sm btn-success" @click="addFromRow(props.row)">➕ Add Record Data</button>
          <button class="btn btn-sm btn-outline-secondary" @click="editBlok(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteBlok(props.row)">🗑 Hapus</button>
        </span>

        <span v-else-if="props.column.field === 'lokasi'">
          {{ props.row.lokasi ? props.row.lokasi.substring(0, 20) + '...' : '-' }}
        </span>

        <span v-else-if="props.column.field === 'pekerja'">
          <ul class="mb-0 ps-3">
            <li v-for="p in props.row.pekerja" :key="p.id_pekerja">
              {{ p.nama }}
            </li>
          </ul>
        </span>

        <span v-else-if="props.column.field === 'waktu_tanam' || props.column.field === 'waktu_panen' || props.column.field === 'created_at'">
          {{ formatTanggal(props.row[props.column.field]) }}
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>

    <!-- ✅ MODAL ADD -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isAddFromRow ? "Tambah Data (Dari Record Lama)" : "Tambah Data Blok" }}
              </h5>

              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="onCancelAdd"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Kode Unik</label>

                <input v-model="form.kode_unik" type="text" class="form-control" :readonly="isAddFromRow"/>
              </div>

              <div class="mb-3">
                <label class="form-label">Lokasi (WKB)</label>
                <textarea v-model="form.lokasi" class="form-control" rows="3" :readonly="isAddFromRow"></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="form.nama_blok" type="text" class="form-control" placeholder="Nama Blok" />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="form.waktu_tanam" type="date" class="form-control" />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="form.waktu_panen" type="date" class="form-control" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Pilih Pekerja</label>
                <multiselect
                  v-model="form.pekerja"
                  :options="pekerjaList"
                  :multiple="true"
                  :close-on-select="false"
                  placeholder="Pilih Pekerja"
                  label="nama"
                  track-by="id_pekerja"
                  class="mb-3"
                >
                  <template #option="props">
                    {{ props.option.nama }} ({{ props.option.pekerjaan }})
                  </template>
                </multiselect>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal" @click="onCancelAdd">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </div>


    <!-- MODAL EDIT (NO CHANGE) -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="submitEdit">
            <div class="modal-header">
              <h5 class="modal-title">Edit Data Blok</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Kode Unik</label>
                <input v-model="editForm.kode_unik" type="text" class="form-control" readonly />
              </div>

              <div class="mb-3">
                <label class="form-label">Lokasi (WKB)</label>
                <textarea v-model="editForm.lokasi" class="form-control" rows="3" readonly></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nama Blok</label>
                  <input v-model="editForm.nama_blok" type="text" class="form-control" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Waktu Tanam</label>
                  <input v-model="editForm.waktu_tanam" type="date" class="form-control" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Waktu Panen</label>
                  <input v-model="editForm.waktu_panen" type="date" class="form-control" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Pilih Pekerja</label>
                <multiselect
                  v-model="editForm.pekerja"
                  :options="pekerjaList"
                  :multiple="true"
                  :close-on-select="false"
                  placeholder="Pilih Pekerja"
                  label="nama"
                  track-by="id_pekerja"
                  class="mb-3"
                >
                  <template #option="props">
                    {{ props.option.nama }} ({{ props.option.pekerjaan }})
                  </template>
                </multiselect>
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
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

export default {
  name: 'DataBlok',
  components: { VueGoodTable, Multiselect },
  data() {
    return {
      blokList: [],
      pekerjaList: [],
      isAddFromRow: false,      

      columns: [
        { label: 'ID', field: 'id_blok', type: 'number', sortable: true },
        { label: 'Kode Unik', field: 'kode_unik' },
        { label: 'Nama Blok', field: 'nama_blok' },
        { label: 'Waktu Tanam', field: 'waktu_tanam' },
        { label: 'Waktu Panen', field: 'waktu_panen' },
        { label: 'Lokasi (WKB)', field: 'lokasi' },
        { label: 'Pekerja', field: 'pekerja' },
        { label: 'Tanggal Buat', field: 'created_at' },
        { label: 'Aksi', field: 'aksi' }
      ],

      form: {
        kode_unik: '',
        lokasi: '',
        nama_blok: '',
        waktu_tanam: '',
        waktu_panen: '',
        pekerja: []
      },
      editForm: {
        id_blok: null,
        kode_unik: '',
        lokasi: '',
        nama_blok: '',
        waktu_tanam: '',
        waktu_panen: '',
        pekerja: []
      }
    }
  },
  mounted() {
    this.fetchBlok()
    this.fetchPekerja()
  },
  methods: {
    formatTanggal(tanggal) {
      if (!tanggal) return '-'
      const t = new Date(tanggal)
      return t.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    async fetchBlok() {
      try {
        const res = await axios.get('/blok')
        this.blokList = res.data
      } catch (err) {
        console.error('Gagal ambil data blok:', err)
      }
    },
    async fetchPekerja() {
      try {
        const res = await axios.get('/pekerja')
        this.pekerjaList = res.data
      } catch (err) {
        console.error('Gagal ambil data pekerja:', err)
      }
    },

    openAddManual() {
      this.isAddFromRow = false       
      this.resetForm()
      this.showModal('addModal')
    },

    addFromRow(row) {
      this.isAddFromRow = true      

      this.form = {
        kode_unik: row.kode_unik,
        lokasi: row.lokasi,
        nama_blok: '',
        waktu_tanam: '',
        waktu_panen: '',
        pekerja: []
      }
      this.showModal('addModal')
    },

    onCancelAdd() {
      this.isAddFromRow = false      
      this.resetForm()
    },

    async submitForm() {
      try {
        const payload = {
          ...this.form,
          id_pekerja: this.form.pekerja.map(p => p.id_pekerja)
        }
        await axios.post('/blok', payload)

        this.fetchBlok()
        this.resetForm()
        this.isAddFromRow = false   
        this.hideModal('addModal')
        alert('Data berhasil ditambahkan')
      } catch (err) {
        console.error('Gagal tambah data blok:', err)
        alert('Gagal menambahkan data')
      }
    },

    editBlok(row) {
      this.editForm = { ...row, pekerja: row.pekerja || [] }
      this.showModal('editModal')
    },

    async submitEdit() {
      try {
        const payload = {
          nama_blok: this.editForm.nama_blok,
          waktu_tanam: this.editForm.waktu_tanam,
          waktu_panen: this.editForm.waktu_panen,
          id_pekerja: this.editForm.pekerja.map(p => p.id_pekerja)
        }
        await axios.put(`/blok/${this.editForm.id_blok}`, payload)

        this.fetchBlok()
        this.hideModal('editModal')
        alert('Data berhasil diperbarui')
      } catch (err) {
        console.error('Gagal update data blok:', err)
        alert('Gagal memperbarui data')
      }
    },

    resetForm() {
      this.form = { kode_unik: '', lokasi: '', nama_blok: '', waktu_tanam: '', waktu_panen: '', pekerja: [] }
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

    async deleteBlok(row) {
      if (!confirm(`Yakin hapus data blok dengan kode ${row.kode_unik}?`)) return
      try {
        await axios.delete(`/blok/${row.id_blok}`)
        this.fetchBlok()
        alert('Data berhasil dihapus')
      } catch (err) {
        console.error('Gagal hapus data blok:', err)
        alert('Gagal menghapus data')
      }
    },

    exportCSV() {
      let csv = 'ID,Kode Unik,Nama Blok,Waktu Tanam,Waktu Panen,Lokasi,Pekerja,Tanggal Buat\n'
      this.blokList.forEach(item => {
        const tanggal = this.formatTanggal(item.created_at)
        const pekerjaStr = item.pekerja ? item.pekerja.map(p => p.nama).join('; ') : ''
        csv += `${item.id_blok},"${item.kode_unik}","${item.nama_blok || ''}",${item.waktu_tanam || ''},${item.waktu_panen || ''},"${item.lokasi || ''}","${pekerjaStr}","${tanggal}"\n`
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_blok.csv')
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

.data-blok-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>
