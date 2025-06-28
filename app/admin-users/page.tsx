'use client'

import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  invited?: boolean
}

interface Column {
  key: string
  label: string
  render?: (value: any) => React.ReactNode | string
}

const columns: Column[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Role',
    render: (value: string) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        value === 'super_admin' 
          ? 'bg-red-500/20 text-red-400' 
          : 'bg-blue-500/20 text-blue-400'
      }`}>
        {value === 'super_admin' ? 'Super Admin' : 'Admin'}
      </span>
    )
  },
  {
    key: 'invited',
    label: 'Status',
    render: (value: boolean) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        value 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-yellow-500/20 text-yellow-400'
      }`}>
        {value ? 'Active' : 'Invited'}
      </span>
    )
  }
]

export default function AdminUsers() {
  const { adminUsers, inviteUser, removeUser, loading } = useAuth()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('admin')

  const handleEdit = (user: AdminUser) => {
    console.log('Edit user:', user)
  }

  const handleDelete = async (user: AdminUser) => {
    try {
      await removeUser(user.id)
    } catch (error) {
      console.error('Error removing user:', error)
    }
  }

  const handleInvite = async () => {
    try {
      await inviteUser(inviteEmail, inviteRole)
      setInviteEmail('')
      setInviteRole('admin')
      setShowInviteModal(false)
    } catch (error) {
      console.error('Error inviting user:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className=" ">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading admin users...</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className=" ">
        <DataTable
          data={adminUsers}
          columns={columns}
          title="Admin Users Management"
          editable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={() => setShowInviteModal(true)}
        />

        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect bg-slate-900 rounded-2xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
                Invite New Admin User
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
