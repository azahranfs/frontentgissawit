<template>
  <div class="data-pohon-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Pohon</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">
          + Add Data
        </button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <!-- FILTER ZONA -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Filter Zona</label>
      <select v-model="selectedZona" class="form-select w-auto">
        <option value="Semua">Semua Zona</option>
        <option v-for="n in 7" :key="n" :value="`Zona ${n}`">Zona {{ n }}</option>
      </select>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="pohonList"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: 5 }"
    >
      <template #table-row="props">
        <span v-if="props.column.field === 'aksi'">
          <button class="btn btn-sm btn-outline-secondary me-1" @click="editPohon(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deletePohon(props.row)">🗑 Hapus</button>
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
              <h5 class="modal-title">Tambah Data Pohon</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input v-model.number="form.longitude" type="number" step="0.0000000001" class="form-control" placeholder="Longitude" required />
              </div>
              <div class="mb-3">
                <input v-model.number="form.latitude" type="number" step="0.0000000001" class="form-control" placeholder="Latitude" required />
              </div>
              <div class="mb-3">
                <input v-model="form.varietas" type="text" class="form-control" placeholder="Varietas (opsional)" />
              </div>
              <div class="mb-3">
                <select v-model="form.zona" class="form-select" required>
                  <option disabled value="">-- Pilih Zona --</option>
                  <option v-for="n in 7" :key="n" :value="`Zona ${n}`">Zona {{ n }}</option>
                </select>
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
              <h5 class="modal-title">Edit Data Pohon</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input v-model.number="editForm.longitude" type="number" step="0.0000000001" class="form-control" placeholder="Longitude" />
              </div>
              <div class="mb-3">
                <input v-model.number="editForm.latitude" type="number" step="0.0000000001" class="form-control" placeholder="Latitude" />
              </div>
              <div class="mb-3">
                <input v-model="editForm.varietas" type="text" class="form-control" placeholder="Varietas" />
              </div>
              <div class="mb-3">
                <select v-model="editForm.zona" class="form-select" required>
                  <option disabled value="">-- Pilih Zona --</option>
                  <option v-for="n in 7" :key="n" :value="`Zona ${n}`">Zona {{ n }}</option>
                </select>
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
  name: 'DataPohon',
  components: { VueGoodTable },
  data() {
    return {
      selectedZona: 'Semua', // TAMBAHAN
      pohonList: [],
      columns: [
        { label: 'ID Pohon', field: 'id_pohon', type: 'number', sortable: true },
        { label: 'Longitude', field: 'longitude' },
        { label: 'Latitude', field: 'latitude' },
        { label: 'Varietas', field: 'varietas' },
        { label: 'Zona', field: 'zona' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        longitude: null,
        latitude: null,
        varietas: '',
        zona: ''
      },
      editForm: {
        id_pohon: null,
        longitude: null,
        latitude: null,
        varietas: '',
        zona: ''
      }
    }
  },

  watch: {
    selectedZona() {
      this.fetchPohon()
    }
  },

  mounted() {
    this.fetchPohon()
  },

  methods: {
    async fetchPohon() {
      try {
        let url = '/pohon'

        if (this.selectedZona !== 'Semua') {
          url = `/pohon?zona=${encodeURIComponent(this.selectedZona)}`
        }

        const res = await axios.get(url)
        this.pohonList = res.data
      } catch (err) {
        console.error('Gagal ambil data pohon:', err)
      }
    },

    async submitForm() {
      try {
        const payload = { ...this.form }
        await axios.post('/pohon', payload)
        this.fetchPohon()
        this.resetForm()
        this.hideModal('addModal')
        alert('Data berhasil ditambahkan')
      } catch (err) {
        console.error('Gagal tambah data pohon:', err)
        alert('Gagal menambahkan data')
      }
    },

    editPohon(row) {
      this.editForm = {
        id_pohon: row.id_pohon,
        longitude: row.longitude,
        latitude: row.latitude,
        varietas: row.varietas,
        zona: row.zona
      }
      this.showModal('editModal')
    },

    async submitEdit() {
      try {
        await axios.put(`/pohon/${this.editForm.id_pohon}`, this.editForm)
        this.fetchPohon()
        this.hideModal('editModal')
        alert('Data berhasil diperbarui')
      } catch (err) {
        console.error('Gagal update data pohon:', err)
      }
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

.data-pohon-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>