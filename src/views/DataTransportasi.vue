<template>
  <div class="data-transportasi-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Transportasi</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">
          + Add Data
        </button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="transportasiList"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: 5 }"
    >
      <template #table-row="props">
        <span v-if="props.column.field === 'aksi'">
          <button class="btn btn-sm btn-outline-secondary me-1" @click="editTransportasi(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteTransportasi(props.row)">🗑 Hapus</button>
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
              <h5 class="modal-title">Tambah Data Transportasi</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input v-model="form.jenis_transportasi" type="text" class="form-control" placeholder="Jenis Transportasi" required />
              </div>
              <div class="mb-3">
                <input v-model.number="form.kapasitas" type="number" class="form-control" placeholder="Kapasitas" required />
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
              <h5 class="modal-title">Edit Data Transportasi</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input v-model="editForm.jenis_transportasi" type="text" class="form-control" placeholder="Jenis Transportasi" required />
              </div>
              <div class="mb-3">
                <input v-model.number="editForm.kapasitas" type="number" class="form-control" placeholder="Kapasitas" required />
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
  name: 'DataTransportasi',
  components: {
    VueGoodTable
  },
  data() {
    return {
      transportasiList: [],
      columns: [
        { label: 'ID', field: 'id_transportasi', sortable: true },
        { label: 'Jenis Transportasi', field: 'jenis_transportasi' },
        { label: 'Kapasitas', field: 'kapasitas' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        jenis_transportasi: '',
        kapasitas: null
      },
      editForm: {
        id_transportasi: null,
        jenis_transportasi: '',
        kapasitas: null
      }
    }
  },
  mounted() {
    this.fetchTransportasi()
  },
  methods: {
    async fetchTransportasi() {
      try {
        const res = await axios.get('/transportasi')
        this.transportasiList = res.data
      } catch (err) {
        console.error('Gagal ambil data transportasi:', err)
      }
    },
    async submitForm() {
      try {
        const payload = { ...this.form }
        await axios.post('/transportasi', payload)
        this.fetchTransportasi()
        this.resetForm()
        this.hideModal('addModal')
        alert('Data berhasil ditambahkan')
      } catch (err) {
        console.error('Gagal tambah data transportasi:', err)
        alert('Gagal menambahkan data')
      }
    },
    editTransportasi(row) {
      this.editForm = { ...row }
      this.showModal('editModal')
    },
    async submitEdit() {
      try {
        await axios.put(`/transportasi/${this.editForm.id_transportasi}`, this.editForm)
        this.fetchTransportasi()
        this.hideModal('editModal')
        alert('Data berhasil diperbarui')
      } catch (err) {
        console.error('Gagal update data:', err)
        alert('Gagal memperbarui data')
      }
    },
    async deleteTransportasi(row) {
      if (confirm(`Yakin ingin menghapus data ini?`)) {
        try {
          await axios.delete(`/transportasi/${row.id_transportasi}`)
          this.fetchTransportasi()
          alert('Data berhasil dihapus')
        } catch (err) {
          console.error('Gagal hapus data:', err)
          alert('Gagal menghapus data')
        }
      }
    },
    resetForm() {
      this.form = {
        jenis_transportasi: '',
        kapasitas: null
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
      let csv = 'ID,Jenis Transportasi,Kapasitas\n'
      this.transportasiList.forEach(item => {
        csv += `${item.id_transportasi},"${item.jenis_transportasi}",${item.kapasitas}\n`
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_transportasi.csv')
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

.data-transportasi-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>