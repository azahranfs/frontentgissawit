<template>
  <div class="user-management-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>User Management</h2>
      <div>
        <button class="btn btn-success me-2" @click="addUser">
          + Add User
        </button>
        <button class="btn btn-primary" @click="exportCSV">
          Export CSV
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table id="userTable" class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Lengkap</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="index">
            <td>{{ user.id }}</td>
            <td>{{ user.nama }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.status }}</td>
            <td>
              <button class="btn btn-sm btn-outline-secondary me-1" @click="editUser(user)">
                ✎ Edit
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteUser(user)">
                🗑 Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [
        { id: 1, nama: "Azahra Nafisa", email: "zahra@example.com", role: "Admin", status: "Aktif" },
        { id: 2, nama: "Budi Santoso", email: "budi@example.com", role: "Staff", status: "Aktif" },
        { id: 3, nama: "Citra Ayu", email: "citra@example.com", role: "Staff", status: "Nonaktif" },
        { id: 4, nama: "Dian Pratama", email: "dian@example.com", role: "Admin", status: "Aktif" },
      ]
    };
  },
  mounted() {
    this.$nextTick(() => {
      new DataTable("#userTable", {
        perPage: 5,
        perPageSelect: [5, 10, 20]
      });
    });
  },
  methods: {
    addUser() {
      alert("Form tambah user belum dibuat 😁");
    },
    exportCSV() {
      let csv = "ID,Nama Lengkap,Email,Role,Status\n";
      this.users.forEach((u) => {
        csv += `${u.id},${u.nama},${u.email},${u.role},${u.status}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user_management.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    editUser(user) {
      alert(`Edit user dengan ID ${user.id}`);
    },
    deleteUser(user) {
      const confirmDelete = confirm(`Yakin ingin menghapus user ID ${user.id}?`);
      if (confirmDelete) {
        this.users = this.users.filter((item) => item.id !== user.id);
      }
    }
  }
};
</script>

<style scoped>
.user-management-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
</style>
