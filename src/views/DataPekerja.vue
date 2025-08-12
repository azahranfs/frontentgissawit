<template>
  <div class="data-pekerja-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Data Pekerja</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">
          + Add Data
        </button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <!-- TABEL -->
    <vue-good-table
        :columns="columns"
        :rows="users"
        :search-options="{ enabled: true }"
        :pagination-options="{ enabled: true, perPage: 5 }"
    >

      <template #table-row="props">
        <span v-if="props.column.field === 'aksi'">
          <button class="btn btn-sm btn-outline-secondary me-1" @click="editUser(props.row)">✎ Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteUser(props.row)">🗑 Hapus</button>
        </span>
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
              <h5 class="modal-title">Tambah Data Pekerja</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="form.nama" type="text" class="form-control" placeholder="Nama" required />
                </div>
                <div class="col-md-3 mb-3">
                  <input v-model.number="form.umur" type="number" class="form-control" placeholder="Umur" required />
                </div>
                <div class="col-md-3 mb-3">
                  <select v-model="form.jenis_kelamin" class="form-control" required>
                    <option disabled value="">Jenis Kelamin</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <input v-model.number="form.lama_kerja" type="number" class="form-control" placeholder="Lama Kerja (thn)" required />
                </div>
                <div class="col-md-4 mb-3">
                  <input v-model="form.kontak" type="text" class="form-control" placeholder="Kontak" required />
                </div>
                <div class="col-md-4 mb-3">
                  <input v-model="form.pekerjaan" type="text" class="form-control" placeholder="Pekerjaan" required />
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
              <h5 class="modal-title">Edit Data Pekerja</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="editForm.nama" type="text" class="form-control" placeholder="Nama" required />
                </div>
                <div class="col-md-3 mb-3">
                  <input v-model.number="editForm.umur" type="number" class="form-control" placeholder="Umur" required />
                </div>
                <div class="col-md-3 mb-3">
                  <select v-model="editForm.jenis_kelamin" class="form-control" required>
                    <option disabled value="">Jenis Kelamin</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <input v-model.number="editForm.lama_kerja" type="number" class="form-control" placeholder="Lama Kerja (thn)" required />
                </div>
                <div class="col-md-4 mb-3">
                  <input v-model="editForm.kontak" type="text" class="form-control" placeholder="Kontak" required />
                </div>
                <div class="col-md-4 mb-3">
                  <input v-model="editForm.pekerjaan" type="text" class="form-control" placeholder="Pekerjaan" required />
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
  name: 'DataPekerja',
  components: {
    VueGoodTable
  },
  data() {
    return {
      users: [],
      columns: [
        { label: 'ID', field: 'id_pekerja', sortable: true },
        { label: 'Nama', field: 'nama', sortable: true },
        { label: 'Umur', field: 'umur', sortable: true },
        { label: 'Jenis Kelamin', field: 'jenis_kelamin', sortable: false },
        { label: 'Lama Kerja', field: 'lama_kerja', sortable: true },
        { label: 'Kontak', field: 'kontak' },
        { label: 'Pekerjaan', field: 'pekerjaan' },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: {
        nama: '',
        umur: '',
        jenis_kelamin: '',
        lama_kerja: '',
        kontak: '',
        pekerjaan: ''
      },
      editForm: {
        id_pekerja: null,
        nama: '',
        umur: '',
        jenis_kelamin: '',
        lama_kerja: '',
        kontak: '',
        pekerjaan: ''
      }
    }
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get('/pekerja')
        this.users = response.data
      } catch (error) {
        console.error('Gagal ambil data:', error)
      }
    },
    async submitForm() {
      try {
        await axios.post('/pekerja', this.form)
        const modalEl = document.getElementById('addModal')
        let modal = window.bootstrap.Modal.getInstance(modalEl)
        if (!modal) modal = new window.bootstrap.Modal(modalEl)
        modal.hide()
        this.resetForm()
        await this.fetchUsers()
        alert('Data berhasil ditambahkan')
      } catch (error) {
        console.error('Gagal menambah:', error)
        alert('Gagal menambahkan data')
      }
    },
    resetForm() {
      this.form = {
        nama: '',
        umur: '',
        jenis_kelamin: '',
        lama_kerja: '',
        kontak: '',
        pekerjaan: ''
      }
    },
    editUser(user) {
      this.editForm = { ...user }
      const modalEl = document.getElementById('editModal')
      let modal = window.bootstrap.Modal.getInstance(modalEl)
      if (!modal) modal = new window.bootstrap.Modal(modalEl)
      modal.show()
    },
    async submitEdit() {
      try {
        await axios.put(`/pekerja/${this.editForm.id_pekerja}`, this.editForm)
        const modalEl = document.getElementById('editModal')
        let modal = window.bootstrap.Modal.getInstance(modalEl)
        if (!modal) modal = new window.bootstrap.Modal(modalEl)
        modal.hide()
        await this.fetchUsers()
        alert('Data berhasil diperbarui')
      } catch (error) {
        alert('Gagal memperbarui data')
        console.error(error)
      }
    },
    async deleteUser(user) {
      const confirmDelete = confirm(`Yakin ingin menghapus pekerja ID ${user.id_pekerja}?`)
      if (confirmDelete) {
        try {
          await axios.delete(`/pekerja/${user.id_pekerja}`)
          await this.fetchUsers()
          alert('Berhasil dihapus')
        } catch (error) {
          alert('Gagal menghapus')
          console.error(error)
        }
      }
    },
    exportCSV() {
      let csv = 'ID,Nama,Umur,Jenis Kelamin,Lama Kerja,Kontak,Pekerjaan\n'
      this.users.forEach(u => {
        csv += `${u.id_pekerja},${u.nama},${u.umur},${u.jenis_kelamin},${u.lama_kerja},${u.kontak},${u.pekerjaan}\n`
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_pekerja.csv')
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

.data-pekerja-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>
