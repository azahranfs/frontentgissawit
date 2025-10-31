<template>
  <div class="data-pengguna-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Manajemen Pengguna</h2>
      <div>
        <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addModal">
          + Tambah Pengguna
        </button>
        <button class="btn btn-primary" @click="exportCSV">Export CSV</button>
      </div>
    </div>

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
              <h5 class="modal-title">Tambah Pengguna</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <div v-if="errorMessage" class="alert alert-danger py-2">
                {{ errorMessage }}
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="form.name" type="text" class="form-control" placeholder="Nama" required />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="form.email" type="email" class="form-control" placeholder="Email" required />
                  <small v-if="errors.email" class="text-danger">{{ errors.email[0] }}</small>
                </div>
                <div class="col-md-6 mb-3">
                  <select v-model="form.role" class="form-control" required>
                    <option disabled value="">Pilih Role</option>
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="form.password" type="password" class="form-control" placeholder="Password" required />
                  <small class="text-muted">Password minimal 6 karakter</small>
                  <small v-if="errors.password" class="text-danger">{{ errors.password[0] }}</small>
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
              <h5 class="modal-title">Edit Pengguna</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <div v-if="errorMessage" class="alert alert-danger py-2">
                {{ errorMessage }}
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <input v-model="editForm.name" type="text" class="form-control" placeholder="Nama" required />
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="editForm.email" type="email" class="form-control" placeholder="Email" required />
                  <small v-if="errors.email" class="text-danger">{{ errors.email[0] }}</small>
                </div>
                <div class="col-md-6 mb-3">
                  <select v-model="editForm.role" class="form-control" required>
                    <option disabled value="">Pilih Role</option>
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <input v-model="editForm.password" type="password" class="form-control" placeholder="Password" />
                  <small class="text-muted">Password minimal 6 karakter (opsional saat edit)</small>
                  <small v-if="errors.password" class="text-danger">{{ errors.password[0] }}</small>
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
  name: 'DataPengguna',
  components: { VueGoodTable },
  data() {
    return {
      users: [],
      columns: [
        { label: 'ID', field: 'id', type: 'number', sortable: true },
        { label: 'Nama', field: 'name', sortable: true },
        { label: 'Email', field: 'email', sortable: true },
        { label: 'Role', field: 'role', sortable: true },
        { label: 'Aksi', field: 'aksi' }
      ],
      form: { name: '', email: '', password: '', role: '' },
      editForm: { id: null, name: '', email: '', role: '', password: '' },
      errors: {}, // simpan error field
      errorMessage: '' // pesan umum dari Laravel
    }
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get('/admin/users')
        this.users = response.data
      } catch (error) {
        console.error('Gagal ambil data:', error)
      }
    },

    async submitForm() {
      this.errors = {}
      this.errorMessage = ''
      try {
        await axios.post('/admin/users', this.form)
        const modalEl = document.getElementById('addModal')
        let modal = window.bootstrap.Modal.getInstance(modalEl)
        if (!modal) modal = new window.bootstrap.Modal(modalEl)
        modal.hide()
        this.resetForm()
        await this.fetchUsers()
        alert('Data berhasil ditambahkan')
      } catch (error) {
        if (error.response && error.response.status === 422) {
          this.errors = error.response.data.errors
          this.errorMessage = error.response.data.message
        } else {
          this.errorMessage = 'Terjadi kesalahan saat menambah data.'
        }
        console.error('Gagal menambah:', error)
      }
    },

    async submitEdit() {
      this.errors = {}
      this.errorMessage = ''
      try {
        await axios.put(`/admin/users/${this.editForm.id}`, this.editForm)
        const modalEl = document.getElementById('editModal')
        let modal = window.bootstrap.Modal.getInstance(modalEl)
        if (!modal) modal = new window.bootstrap.Modal(modalEl)
        modal.hide()
        await this.fetchUsers()
        alert('Data berhasil diperbarui')
      } catch (error) {
        if (error.response && error.response.status === 422) {
          this.errors = error.response.data.errors
          this.errorMessage = error.response.data.message
        } else {
          this.errorMessage = 'Terjadi kesalahan saat memperbarui data.'
        }
        console.error('Gagal memperbarui:', error)
      }
    },

    resetForm() {
      this.form = { name: '', email: '', password: '', role: '' }
      this.errors = {}
      this.errorMessage = ''
    },

    editUser(user) {
      this.errors = {}
      this.errorMessage = ''
      this.editForm = { ...user, password: '' }
      const modalEl = document.getElementById('editModal')
      let modal = window.bootstrap.Modal.getInstance(modalEl)
      if (!modal) modal = new window.bootstrap.Modal(modalEl)
      modal.show()
    },

    async deleteUser(user) {
      const confirmDelete = confirm(`Yakin ingin menghapus pengguna ID ${user.id}?`)
      if (confirmDelete) {
        try {
          await axios.delete(`/admin/users/${user.id}`)
          await this.fetchUsers()
          alert('Berhasil dihapus')
        } catch (error) {
          alert('Gagal menghapus')
          console.error(error)
        }
      }
    },

    exportCSV() {
      let csv = 'ID,Nama,Email,Role\n'
      this.users.forEach(u => {
        csv += `${u.id},${u.name},${u.email},${u.role}\n`
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_pengguna.csv')
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

.data-pengguna-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>
