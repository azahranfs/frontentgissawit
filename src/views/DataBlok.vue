<template>
  <div class="data-blok-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Blok</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">
          + Add Data
        </button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="bloks"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: 5 }"
    >
      <template #table-row="props">
        <span v-if="props.column.field === 'pekerja'">
          {{ props.row.pekerja?.map(p => p.nama).join(', ') || '-' }}
        </span>
        <span v-else-if="props.column.field === 'aksi'">
          <button class="btn btn-sm btn-outline-secondary me-1" @click="editBlok(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteBlok(props.row)">🗑 Hapus</button>
        </span>
        <span v-else-if="props.column.field === 'pekerja'">
          <span v-if="Array.isArray(props.row.pekerja)">
            {{ props.row.pekerja.map(p => p.nama).join(', ') }}
          </span>
          <span v-else>
            {{ props.row.pekerja?.nama || '-' }}
          </span>
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>

    <!-- MODAL ADD -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">Tambah Data Blok</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <input v-model="form.nama_blok" type="text" class="form-control mb-3" placeholder="Nama Blok" required />
              <textarea v-model="form.lokasi" class="form-control mb-3" placeholder="Lokasi (WKT)" required></textarea>
              <input v-model="form.waktu_tanam" type="date" class="form-control mb-3" required />
              <input v-model="form.waktu_panen" type="date" class="form-control mb-3" />
              <select v-model="form.id_peta" class="form-control mb-3" required>
                <option disabled value="">Pilih Peta</option>
                <option v-for="peta in daftarPeta" :key="peta.id_peta" :value="peta.id_peta">{{ peta.nama_peta }}</option>
              </select>
              <multiselect
                v-model="form.id_pekerja"
                :options="daftarPekerja"
                :multiple="true"
                :close-on-select="false"
                placeholder="Pilih Pekerja"
                label="nama"
                track-by="id_pekerja"
                class="mb-3"
              />
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
              <h5 class="modal-title">Edit Data Blok</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <input v-model="editForm.nama_blok" type="text" class="form-control mb-3" required />
              <textarea v-model="editForm.lokasi" class="form-control mb-3" required></textarea>
              <input v-model="editForm.waktu_tanam" type="date" class="form-control mb-3" required />
              <input v-model="editForm.waktu_panen" type="date" class="form-control mb-3" />
              <select v-model="editForm.id_peta" class="form-control mb-3" required>
                <option v-for="peta in daftarPeta" :key="peta.id_peta" :value="peta.id_peta">{{ peta.nama_peta }}</option>
              </select>
              <multiselect
                v-model="editForm.id_pekerja"
                :options="daftarPekerja"
                :multiple="true"
                :close-on-select="false"
                placeholder="Pilih Pekerja"
                label="nama"
                track-by="id_pekerja"
                class="mb-3"
              />
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
import 'vue-multiselect/dist/vue-multiselect.min.css'

export default {
  components: {
    VueGoodTable,
    Multiselect
  },
  data() {
    return {
      bloks: [],
      daftarPeta: [],
      daftarPekerja: [],
      columns: [
        { label: 'ID', field: 'id_blok' },
        { label: 'Nama Blok', field: 'nama_blok' },
        { label: 'Waktu Tanam', field: 'waktu_tanam' },
        { label: 'Waktu Panen', field: 'waktu_panen' },
        { label: 'Tanggal Upload Peta', field: 'upload_peta.tanggal_upload' },
        { label: 'Nama Pekerja', field: 'pekerja' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        nama_blok: '',
        lokasi: '',
        waktu_tanam: '',
        waktu_panen: '',
        id_peta: '',
        id_pekerja: []
      },
      editForm: {
        id_blok: null,
        nama_blok: '',
        lokasi: '',
        waktu_tanam: '',
        waktu_panen: '',
        id_peta: '',
        id_pekerja: []
      }
    }
  },
  mounted() {
    this.fetchBloks()
    this.fetchPeta()
    this.fetchPekerja()
  },
  methods: {
    async fetchBloks() {
      try {
        const res = await axios.get('/blok')
        this.bloks = res.data
      } catch (error) {
        console.error('Gagal ambil data blok:', error)
      }
    },
    async fetchPeta() {
      try {
        const res = await axios.get('/upload_peta')
        this.daftarPeta = res.data
      } catch (error) {
        console.error('Gagal ambil data peta:', error)
      }
    },
    async fetchPekerja() {
      try {
        const res = await axios.get('/pekerja')
        this.daftarPekerja = res.data
      } catch (error) {
        console.error('Gagal ambil data pekerja:', error)
      }
    },
    async submitForm() {
      try {
        const payload = {
          ...this.form,
          id_pekerja: this.form.id_pekerja.map(p => p.id_pekerja)
        }
        await axios.post('/blok', payload)
        this.hideModal('addModal')
        this.resetForm()
        await this.fetchBloks()
        alert('Data berhasil ditambahkan')
      } catch (error) {
        console.error('Gagal menambahkan blok:', error)
        alert('Gagal menambahkan data')
      }
    },
    editBlok(row) {
      this.editForm = {
        id_blok: row.id_blok,
        nama_blok: row.nama_blok,
        lokasi: row.lokasi,
        waktu_tanam: row.waktu_tanam,
        waktu_panen: row.waktu_panen,
        id_peta: row.id_peta,
        id_pekerja: Array.isArray(row.pekerja) ? row.pekerja : (row.pekerja ? [row.pekerja] : [])
      }
      this.showModal('editModal')
    },
    async submitEdit() {
      try {
        const payload = {
          ...this.editForm,
          id_pekerja: this.editForm.id_pekerja.map(p => p.id_pekerja)
        }
        await axios.put(`/blok/${this.editForm.id_blok}`, payload)
        this.hideModal('editModal')
        await this.fetchBloks()
        alert('Data berhasil diperbarui')
      } catch (error) {
        console.error('Gagal mengedit data:', error)
        alert('Gagal memperbarui data')
      }
    },
    async deleteBlok(row) {
      if (confirm(`Yakin ingin menghapus blok: ${row.nama_blok}?`)) {
        try {
          await axios.delete(`/blok/${row.id_blok}`)
          await this.fetchBloks()
          alert('Data berhasil dihapus')
        } catch (error) {
          console.error('Gagal menghapus blok:', error)
          alert('Gagal menghapus data')
        }
      }
    },
    resetForm() {
      this.form = {
        nama_blok: '',
        lokasi: '',
        waktu_tanam: '',
        waktu_panen: '',
        id_peta: '',
        id_pekerja: []
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
      let csv = 'ID,Nama Blok,Waktu Tanam,Waktu Panen,Tanggal Upload Peta,Nama Pekerja\n'
      this.bloks.forEach(b => {
        const tanggalUpload = b.upload_peta?.tanggal_upload || ''
        const pekerjaStr = b.pekerja?.map(p => p.nama).join(', ') || ''
        csv += `${b.id_blok},"${b.nama_blok}",${b.waktu_tanam},${b.waktu_panen},${tanggalUpload},"${pekerjaStr}"\n`
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
