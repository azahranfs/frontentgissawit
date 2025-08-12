<template>
  <div class="upload-peta-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Upload Peta</h2>
      <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#uploadModal">
        + Upload Peta
      </button>
    </div>

    <vue-good-table
      :columns="columns"
      :rows="petaList"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: 5 }"
    >
      <template #table-row="props">
        <span v-if="props.column.field === 'aksi'">
          <button class="btn btn-sm btn-secondary me-1" @click="openEditModal(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deletePeta(props.row)">🗑 Hapus</button>
        </span>
        <span v-else-if="props.column.field === 'link_peta'">
          <a :href="props.row.link_peta" target="_blank">Lihat File</a>
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>

    <!-- MODAL UPLOAD PETA -->
    <div class="modal fade" id="uploadModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">Upload Peta Baru</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="form.nama_peta" type="text" class="form-control" placeholder="Nama Peta" required />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="form.tanggal_upload" type="date" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="form.uploader" type="text" class="form-control" placeholder="Uploader" required />
                </div>
                <div class="col-md-6 mb-3">
                  <select v-model="form.format_file" class="form-control" required>
                    <option disabled value="">Pilih Format File</option>
                    <option value="tif">tif</option>
                    <option value="tiff">tiff</option>
                  </select>
                </div>
                <div class="col-md-12 mb-3">
                  <input @change="handleFileUpload" type="file" class="form-control" required />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary">Upload</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT PETA -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="submitEditForm">
            <div class="modal-header">
              <h5 class="modal-title">Edit Peta</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="editForm.nama_peta" type="text" class="form-control" placeholder="Nama Peta" required />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="editForm.tanggal_upload" type="date" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="editForm.uploader" type="text" class="form-control" placeholder="Uploader" required />
                </div>
                <div class="col-md-6 mb-3">
                  <select v-model="editForm.format_file" class="form-control" required>
                    <option disabled value="">Pilih Format File</option>
                    <option value="tif">tif</option>
                    <option value="tiff">tiff</option>
                  </select>
                </div>
                <div class="col-md-12 mb-3">
                  <input @change="handleEditFileUpload" type="file" class="form-control" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
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
  name: 'UploadPeta',
  components: {
    VueGoodTable
  },
  data() {
    return {
      petaList: [],
      columns: [
        { label: 'ID', field: 'id_peta', sortable: true },
        { label: 'Nama Peta', field: 'nama_peta', sortable: true },
        { label: 'Tanggal Upload', field: 'tanggal_upload', sortable: true },
        { label: 'Uploader', field: 'uploader', sortable: true },
        { label: 'Format File', field: 'format_file', sortable: true },
        { label: 'Link Peta', field: 'link_peta', sortable: true },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        nama_peta: '',
        tanggal_upload: '',
        uploader: '',
        format_file: '',
        file: null
      },
      editForm: {
        id_peta: null,
        nama_peta: '',
        tanggal_upload: '',
        uploader: '',
        format_file: '',
        file: null
      }
    }
  },
  mounted() {
    this.fetchPeta()
  },
  methods: {
    async fetchPeta() {
      try {
        const response = await axios.get('/upload_peta')
        this.petaList = response.data
      } catch (error) {
        console.error('Gagal ambil data peta:', error)
      }
    },
    handleFileUpload(event) {
      this.form.file = event.target.files[0]
    },
    async submitForm() {
      try {
        const formData = new FormData()
        formData.append('nama_peta', this.form.nama_peta)
        formData.append('tanggal_upload', this.form.tanggal_upload)
        formData.append('uploader', this.form.uploader)
        formData.append('format_file', this.form.format_file)
        formData.append('file', this.form.file)

        await axios.post('/upload_peta', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        const modalEl = document.getElementById('uploadModal')
        let modal = window.bootstrap.Modal.getInstance(modalEl)
        if (!modal) modal = new window.bootstrap.Modal(modalEl)
        modal.hide()

        this.resetForm()
        await this.fetchPeta()
        alert('Peta berhasil diupload')
      } catch (error) {
        console.error('Gagal upload peta:', error)
        alert('Gagal upload peta')
      }
    },
    resetForm() {
      this.form = {
        nama_peta: '',
        tanggal_upload: '',
        uploader: '',
        format_file: '',
        file: null
      }
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    },
    async deletePeta(peta) {
      const konfirmasi = confirm(`Yakin ingin menghapus peta "${peta.nama_peta}"?`)
      if (konfirmasi) {
        try {
          await axios.delete(`/upload_peta/${peta.id_peta}`)
          await this.fetchPeta()
          alert('Peta berhasil dihapus')
        } catch (error) {
          console.error('Gagal hapus peta:', error)
          alert('Gagal hapus peta')
        }
      }
    },
    openEditModal(peta) {
      this.editForm = {
        id_peta: peta.id_peta,
        nama_peta: peta.nama_peta,
        tanggal_upload: peta.tanggal_upload,
        uploader: peta.uploader,
        format_file: peta.format_file,
        file: null
      }
      const modalEl = document.getElementById('editModal')
      let modal = window.bootstrap.Modal.getInstance(modalEl)
      if (!modal) modal = new window.bootstrap.Modal(modalEl)
      modal.show()
    },
    async submitEditForm() {
      try {
        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('nama_peta', this.editForm.nama_peta)
        formData.append('tanggal_upload', this.editForm.tanggal_upload)
        formData.append('uploader', this.editForm.uploader)
        formData.append('format_file', this.editForm.format_file)

        if (this.editForm.file) {
          formData.append('file', this.editForm.file)
        }

        await axios.post(`/upload_peta/${this.editForm.id_peta}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        const modalEl = document.getElementById('editModal')
        let modal = window.bootstrap.Modal.getInstance(modalEl)
        if (modal) modal.hide()

        await this.fetchPeta()
        alert('Data peta berhasil diubah')
      } catch (error) {
        console.error('Gagal edit peta:', error)
        alert('Gagal edit peta')
      }
    },
    handleEditFileUpload(event) {
      this.editForm.file = event.target.files[0]
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

.upload-peta-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>