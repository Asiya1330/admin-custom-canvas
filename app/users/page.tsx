'use client'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import { useEffect, useState } from 'react'
import { getUsers, addDocument, updateDocument, deleteDocument, setAdminStatus } from '../../services/crud'

interface User {
    id: string;
    email: string;
    displayName: string;
    createdAt: any;
    photoURL: string;
    isAdmin?: boolean;
}

interface Column {
    key: keyof User;
    label: string;
    render?: (value: any, row: User) => React.ReactNode | string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: Column[] = [
    {
        key: 'photoURL',
        label: 'Photo',
        render: (value: string) => (
            <img src={value || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full" />
        )
    },
    { key: 'displayName', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
        key: 'createdAt',
        label: 'Created',
        render: (value: any) => value?.toDate ? new Date(value.toDate()).toLocaleDateString() : 'Unknown'
    },
    {
        key: 'isAdmin',
        label: 'Admin',
        render: (_: any, row: User) => (
          console.log(row),
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  console.log(row.id, !row.isAdmin)
                  await setAdminStatus(row.id, !row.isAdmin);
                  // Update local state
                  setUsers((prev: User[]) => prev.map((u: User) => u.id === row.id ? { ...u, isAdmin: !u.isAdmin } : u));
                } catch (error) {
                  alert('Failed to update admin status');
                }
              }}
              className={`px-2 py-1 rounded text-xs font-semibold ${row.isAdmin ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}
            >
              {row.isAdmin ? 'Revoke Admin' : 'Make Admin'}
            </button>
        )
    }
];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = async (user: User) => {
    try {
      // Update user logic here
      console.log('Edit user:', user);
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteDocument('users', user.id);
      setUsers(users.filter(u => u.id !== user.id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading users...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="">
        <DataTable
          data={users}
          columns={columns}
          title="Users Management"
          editable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  )
}
