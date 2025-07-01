'use client'
import Layout from '../../components/Layout'
import { PaginatedDataTable } from '../../components/DataTable'
import { useEffect, useState } from 'react'
import { getUsersPaginated, addDocument, updateDocument, deleteDocument, setAdminStatus } from '../../services/crud'
import { PaginationParams, PaginatedResult } from '../../services/crud'
import Image from 'next/image'
import Link from 'next/link'
import { withAuth } from '../../components/withAuth'

interface User {
    id: string;
    email: string;
    displayName: string;
    createdAt: any;
    photoURL: string;
    isAdmin?: boolean;
}

interface Column {
    key: keyof User | 'actions';
    label: string;
    render?: (value: any, row: User) => React.ReactNode | string;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);

  const columns: Column[] = [
    {
        key: 'photoURL',
        label: 'Photo',
        render: (value: string) => (
            <Image src={value || '/default-avatar.png'} alt="" width={24} height={24} className="w-6 h-6 rounded-full" />
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
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await setAdminStatus(row.id, !row.isAdmin);
                  // Update local state
                  setUsers((prev: User[]) => prev.map((u: User) => u.id === row.id ? { ...u, isAdmin: !u.isAdmin } : u));
                } catch (error) {
                  alert('Failed to update admin status');
                }
              }}
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${row.isAdmin ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}
            >
              {row.isAdmin ? 'Revoke Admin' : 'Make Admin'}
            </button>
        )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: User) => (
        <Link
          href={`/users/${row.id}`}
          className="text-xs text-blue-500 underline hover:text-blue-700"
        >
          View
        </Link>
      )
    }
];

  const fetchUsers = async (params?: PaginationParams) => {
    try {
      const result: PaginatedResult<User> = await getUsersPaginated(params || { pageSize: 10 });
      
      if (params?.lastDoc) {
        // Loading more
        setUsers(prev => [...prev, ...result.data]);
      } else {
        // Initial load
        setUsers(result.data);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      setTotalCount(prev => prev + result.data.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    await fetchUsers({ pageSize: 10, lastDoc });
  };

  useEffect(() => {
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

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-white text-sm">Loading users...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="">
        <PaginatedDataTable
          data={users}
          columns={columns}
          title="Users Management"
          editable={true}
          onEdit={handleEdit}
          onDelete={()=>{}}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loading={loadingMore}
          totalCount={totalCount}
        />
      </div>
    </Layout>
  )
}

export default withAuth(Users)
