'use client'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import { useEffect, useState } from 'react'
import { getUsers, addDocument, updateDocument, deleteDocument } from '../../services/crud'

interface User {
    id: string;
    email: string;
    displayName: string;
    createdAt: any;
    photoURL: string;
}

interface Column {
    key: keyof User;
    label: string;
    render?: (value: any) => React.ReactNode | string;
}

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
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="p-8">
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
