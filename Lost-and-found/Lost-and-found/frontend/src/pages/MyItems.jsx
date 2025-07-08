import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Package, MapPin, Clock, Eye, Edit, Trash2, Filter } from 'lucide-react'
import { itemsApi } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const MyItems = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (user) {
      fetchMyItems()
    }
  }, [user])

  const fetchMyItems = async () => {
    try {
      setLoading(true)
      const response = await itemsApi.getMyItems()
      setItems(response.data) // response.data is the array of items
    } catch (error) {
      console.error('Error fetching my items:', error)
      toast.error('Failed to load your items')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      await itemsApi.deleteItem(itemId)
      setItems(items.filter(item => item._id !== itemId))
      toast.success('Item deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const filteredItems = items.filter(item => {
    const typeMatch = filter === 'all' || item.type === filter
    const statusMatch = statusFilter === 'all' || item.status === statusFilter
    return typeMatch && statusMatch
  })

  const stats = {
    total: items.length,
    found: items.filter(item => item.type === 'found').length,
    lost: items.filter(item => item.type === 'lost').length,
    active: items.filter(item => item.status === 'active').length,
    resolved: items.filter(item => item.status === 'resolved').length
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your items.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              My Items
            </h1>
            <p className="text-lg text-gray-600">
              Manage your posted found and lost items
            </p>
          </div>
          <Link
            to="/post"
            className="btn-primary mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Item
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success-600">{stats.found}</div>
            <div className="text-sm text-gray-600">Found Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-error-600">{stats.lost}</div>
            <div className="text-sm text-gray-600">Lost Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Filters:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Types</option>
                <option value="found">Found Items</option>
                <option value="lost">Lost Items</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {items.length === 0 ? 'No items posted yet' : 'No items match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {items.length === 0 
                ? 'Start by posting your first found or lost item'
                : 'Try adjusting your filter criteria'
              }
            </p>
            {items.length === 0 && (
              <Link
                to="/post"
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Item
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item._id} className="card group">
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-t-xl overflow-hidden">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img
                      src={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${item.imageUrls[0]}`}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`badge ${item.type === 'found' ? 'badge-found' : 'badge-lost'}`}>
                      {item.type === 'found' ? 'Found' : 'Lost'}
                    </span>
                    <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-resolved'}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate flex-1">{item.location.city}</span>
                    <Eye className="w-4 h-4 ml-2 mr-1" />
                    <span>{item.views}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Posted {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/item/${item._id}`}
                      className="btn-outline flex-1 text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => {/* TODO: Implement edit */}}
                      className="btn-secondary"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="btn-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyItems
