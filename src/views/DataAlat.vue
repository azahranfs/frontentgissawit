<template>
  <div class="data-alat-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Alat</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">+ Add Data</button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="alats"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: 5 }"
    >
      <template #table-row="props">
        <span v-if="props.column.field === 'aksi'">
          <button class="btn btn-sm btn-outline-secondary me-1" @click="editAlat(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteAlat(props.row)">🗑 Hapus</button>
        </span>
        <span v-else-if="props.column.field === 'pekerja'">
          <span v-if="Array.isArray(props.row.pekerja)">
            {{ props.row.pekerja.map(p => p.nama).join(', ') }}
          </span>
          <span v-else>
            {{ props.row.pekerja?.nama || '-' }}
          </span>
        </span>
        <span v-else-if="props.column.field === 'blok'">
          {{ props.row.blok?.nama_blok || 'Blok ' + props.row.id_blok }}
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>

    <!-- Modal Add -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">Tambah Data Alat</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <input v-model="form.nama_alat" class="form-control mb-3" placeholder="Nama Alat" required />
              <input v-model="form.penggunaan" class="form-control mb-3" placeholder="Penggunaan" required />
              <input v-model="form.tanggal" type="date" class="form-control mb-3" required />

              <multiselect
                v-model="form.id_pekerja"
                :options="pekerjaList"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Pilih Pekerja"
                label="nama"
                track-by="id_pekerja"
                class="mb-3"
              />

              <select v-model="form.id_blok" class="form-control mb-3" required>
                <option disabled value="">Pilih Blok</option>
                <option v-for="b in blokList" :key="b.id_blok" :value="b.id_blok">
                  {{ b.nama_blok || `Blok ${b.id_blok}` }}
                </option>
              </select>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitEdit">
            <div class="modal-header">
              <h5 class="modal-title">Edit Data Alat</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <input v-model="form.nama_alat" class="form-control mb-3" placeholder="Nama Alat" required />
              <input v-model="form.penggunaan" class="form-control mb-3" placeholder="Penggunaan" required />
              <input v-model="form.tanggal" type="date" class="form-control mb-3" required />

              <multiselect
                v-model="form.id_pekerja"
                :options="pekerjaList"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Pilih Pekerja"
                label="nama"
                track-by="id_pekerja"
                class="mb-3"
              />

              <select v-model="form.id_blok" class="form-control mb-3" required>
                <option disabled value="">Pilih Blok</option>
                <option v-for="b in blokList" :key="b.id_blok" :value="b.id_blok">
                  {{ b.nama_blok || `Blok ${b.id_blok}` }}
                </option>
              </select>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary">Update</button>
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
import Multiselect from 'vue-multiselect'
import 'vue-good-table-next/dist/vue-good-table-next.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'

export default {
  name: 'DataAlat',
  components: { VueGoodTable, Multiselect },
  data() {
    return {
      alats: [],
      pekerjaList: [],
      blokList: [],
      form: {
        nama_alat: '',
        penggunaan: '',
        tanggal: '',
        id_pekerja: [],
        id_blok: ''
      },
      editId: null,
      columns: [
        { label: 'ID', field: 'id_alat' },
        { label: 'Nama Alat', field: 'nama_alat' },
        { label: 'Penggunaan', field: 'penggunaan' },
        { label: 'Tanggal', field: 'tanggal' },
        { label: 'Pekerja', field: 'pekerja' },
        { label: 'Blok', field: 'blok' },
        { label: 'Aksi', field: 'aksi' }
      ]
    }
  },
  mounted() {
    this.fetchAlat()
    this.fetchPekerja()
    this.fetchBlok()
  },
  methods: {
    async fetchAlat() {
      const res = await axios.get('/alat')
      this.alats = res.data
    },
    async fetchPekerja() {
      const res = await axios.get('/pekerja')
      this.pekerjaList = res.data
    },
    async fetchBlok() {
      const res = await axios.get('/blok')
      this.blokList = res.data
    },
    async submitForm() {
      await axios.post('/alat', {
        ...this.form,
        id_pekerja: this.form.id_pekerja.map(p => p.id_pekerja)
      })
      await this.fetchAlat()
      this.resetForm()
      this.hideModal('addModal')
      alert('Data berhasil ditambahkan')
    },
    async deleteAlat(row) {
      if (confirm(`Hapus alat: ${row.nama_alat}?`)) {
        await axios.delete(`/alat/${row.id_alat}`)
        await this.fetchAlat()
      }
    },
    editAlat(row) {
      this.editId = row.id_alat
      this.form = {
        nama_alat: row.nama_alat,
        penggunaan: row.penggunaan,
        tanggal: row.tanggal,
        id_pekerja: Array.isArray(row.pekerja) ? row.pekerja : (row.pekerja ? [row.pekerja] : []),
        id_blok: row.id_blok
      }
      this.showModal('editModal')
    },
    async submitEdit() {
      await axios.put(`/alat/${this.editId}`, {
        ...this.form,
        id_pekerja: this.form.id_pekerja.map(p => p.id_pekerja)
      })
      await this.fetchAlat()
      this.resetForm()
      this.hideModal('editModal')
      alert('Data berhasil diperbarui')
    },
    resetForm() {
      this.form = {
        nama_alat: '',
        penggunaan: '',
        tanggal: '',
        id_pekerja: [],
        id_blok: ''
      }
    },
    showModal(id) {
      const el = document.getElementById(id)
      let modal = window.bootstrap.Modal.getInstance(el)
      if (!modal) modal = new window.bootstrap.Modal(el)
      modal.show()
    },
    hideModal(id) {
      const el = document.getElementById(id)
      let modal = window.bootstrap.Modal.getInstance(el)
      if (modal) modal.hide()
    },
    exportCSV() {
      let csv = 'ID,Nama Alat,Penggunaan,Tanggal,Pekerja,Blok\n'
      this.alats.forEach(a => {
        const pekerjaNames = Array.isArray(a.pekerja) ? a.pekerja.map(p => p.nama).join(', ') : (a.pekerja?.nama || '')
        csv += `${a.id_alat},"${a.nama_alat}","${a.penggunaan}",${a.tanggal},"${pekerjaNames}","${a.blok?.nama_blok || ''}"\n`
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', 'data_alat.csv')
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

.data-alat-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>