<template>
  <div class="data-alat-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Alat</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">
          + Add Data
        </button>
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
import 'vue-good-table-next/dist/vue-good-table-next.css'

export default {
  name: 'DataAlat',
  components: { VueGoodTable },

  data() {
    return {
      alats: [],
      form: {
        nama_alat: '',
        penggunaan: ''
      },
      editId: null,

      columns: [
        { label: 'ID', field: 'id_alat', type: 'number' },
        { label: 'Nama Alat', field: 'nama_alat' },
        { label: 'Penggunaan', field: 'penggunaan' },
        { label: 'Aksi', field: 'aksi' }
      ]
    }
  },

  watch: {
    alats: {
      handler() {
      },
      deep: true
    }
  },

  mounted() {
    this.fetchAlat()
  },

  methods: {
    async fetchAlat() {
      const res = await axios.get('/alat')
      this.alats = res.data
    },

    async submitForm() {
      await axios.post('/alat', this.form)
      this.fetchAlat()
      this.resetForm()

      // Tutup modal Add
      const modal = bootstrap.Modal.getInstance(document.getElementById('addModal'))
      if (modal) modal.hide()
    },

    async submitEdit() {
      await axios.put(`/alat/${this.editId}`, this.form)
      this.fetchAlat()
      this.resetForm()

      const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'))
      if (modal) modal.hide()
    },

    editAlat(row) {
      this.editId = row.id_alat
      this.form = { nama_alat: row.nama_alat, penggunaan: row.penggunaan }
      new bootstrap.Modal(document.getElementById('editModal')).show()
    },

    async deleteAlat(row) {
      if (confirm('Yakin hapus data?')) {
        await axios.delete(`/alat/${row.id_alat}`)
        this.fetchAlat()
      }
    },

    exportCSV() {
      const header = "id_alat,nama_alat,penggunaan\n"
      const rows = this.alats
        .map(a => `${a.id_alat},${a.nama_alat},${a.penggunaan}`)
        .join("\n")

      const csv = header + rows
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")

      link.href = URL.createObjectURL(blob)
      link.setAttribute("download", "data_alat.csv")
      link.click()
    },

    resetForm() {
      this.form = { nama_alat: '', penggunaan: '' }
      this.editId = null
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