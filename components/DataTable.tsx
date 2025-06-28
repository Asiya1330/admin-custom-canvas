'use client'
import { useState, useMemo } from 'react'
import { Search, Filter, Download, Edit, Trash2, Plus } from 'lucide-react'
import { PaginatedResult } from '../services/crud'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (value: any, item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title: string
  editable?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onCreate?: () => void
}

interface PaginatedDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title: string
  editable?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onCreate?: () => void
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  loading?: boolean
  totalCount?: number
}

export default function DataTable<T extends { id?: string | number }>({ 
  data = [], 
  columns = [], 
  title, 
  editable = false, 
  onEdit, 
  onDelete, 
  onCreate 
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = useMemo(() => {
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField as keyof T]
      const bVal = b[sortField as keyof T]
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }, [filteredData, sortField, sortDirection])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

const handleSort = (field: string): void => {
    if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
        setSortField(field)
        setSortDirection('asc')
    }
}

  return (
    <div className="glass-effect rounded-2xl animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 mt-1">{sortedData.length} items</p>
        </div>
        <div className="flex items-center space-x-3">
          {editable && onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <Plus size={16} />
              <span>Add New</span>
            </button>
          )}
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white placeholder-gray-400"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="text-left p-3 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                  onClick={() => handleSort(column.key as string)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 font-medium">{column.label}</span>
                    {sortField === column.key && (
                      <span className="text-violet-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {editable && <th className="text-left p-3 text-gray-300 font-medium whitespace-nowrap">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={item.id || index}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key as string} className="p-3">
                    {column.render ? column.render(item[column.key as keyof T], item) : (
                      <span className="text-gray-200 break-words">
                        {String(item[column.key as keyof T] || '—')}
                      </span>
                    )}
                  </td>
                ))}
                {editable && (
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit?.(item)}
                        className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        disabled
                        className="p-1 text-gray-500 cursor-not-allowed opacity-50"
                        title="Delete disabled"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{' '}
            {sortedData.length} results
          </p>
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded transition-colors ${
                  currentPage === page
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// New PaginatedDataTable component for server-side pagination
export function PaginatedDataTable<T extends { id?: string | number }>({ 
  data = [], 
  columns = [], 
  title, 
  editable = false, 
  onEdit, 
  onDelete, 
  onCreate,
  onLoadMore,
  hasMore = false,
  loading = false,
  totalCount = 0
}: PaginatedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = useMemo(() => {
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  return (
    <div className="glass-effect rounded-2xl animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 mt-1">
            {totalCount > 0 ? `${filteredData.length} of ${totalCount} items` : `${filteredData.length} items`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {editable && onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <Plus size={16} />
              <span>Add New</span>
            </button>
          )}
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white placeholder-gray-400"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="text-left p-3 text-gray-300 font-medium whitespace-nowrap"
                >
                  <span>{column.label}</span>
                </th>
              ))}
              {editable && <th className="text-left p-3 text-gray-300 font-medium whitespace-nowrap">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={item.id || index}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key as string} className="p-3">
                    {column.render ? column.render(item[column.key as keyof T], item) : (
                      <span className="text-gray-200 break-words">
                        {String(item[column.key as keyof T] || '—')}
                      </span>
                    )}
                  </td>
                ))}
                {editable && (
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit?.(item)}
                        className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete?.(item)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Loading...</span>
            ) : (
              <span>Load More</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
