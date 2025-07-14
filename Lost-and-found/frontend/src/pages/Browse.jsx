import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, MapPin, Clock, Package, ChevronDown, CheckCircle, Award } from 'lucide-react'
import { itemsApi } from '../utils/api'
import claimsApi from '../api/claimsApi'
import LoadingSpinner from '../components/LoadingSpinner'

const Browse = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [successfulReturns, setSuccessfulReturns] = useState(0)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    'Electronics', 'Clothing', 'Accessories', 'Documents', 'Keys', 
    'Bags', 'Jewelry', 'Books', 'Sports Equipment', 'Pet Items', 'Toys', 'Other'
  ]

  useEffect(() => {
    fetchItems()
    fetchSuccessfulReturns()
  }, [filters])

  const fetchSuccessfulReturns = async () => {
    try {
      const response = await claimsApi.getSuccessfulReturnsCount()
      setSuccessfulReturns(response.data.count)
    } catch (error) {
      console.error('Error fetching successful returns:', error)
    }
  }
  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await itemsApi.getItems(filters)
      setItems(response.data.items)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Browse Items
              </h1>
              <p className="text-lg text-gray-600">
                Find lost items or browse found items in your area
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">{successfulReturns}</span>
              </div>
              <p className="text-sm text-green-600 font-medium">Items Successfully Returned</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for items..."
                className="form-input pl-10"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <div>
              <label className="form-label">Type</label>
              <select
                className="form-input"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              >
                <option value="">All Types</option>
                <option value="found">Found Items</option>
                <option value="lost">Lost Items</option>
                <option value="returned">Returned Items</option>
              </select>
            </div>

            <div>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                placeholder="Enter city name"
                className="form-input"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {items.length} of {pagination.totalItems} items
          </p>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse all items
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link
                key={item._id}
                to={`/item/${item._id}`}
                className="card-hover group"
              >
                {/* Status Badge */}
                {(item.status === 'resolved' || item.claimStatus) && (
                  <div className="absolute top-2 right-2 z-10">
                    {item.claimStatus === 'completed' ? (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Returned
                      </div>
                    ) : item.claimStatus === 'approved' ? (
                      <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Claimed
                      </div>
                    ) : item.status === 'resolved' ? (
                      <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Resolved
                      </div>
                    ) : null}
                  </div>
                )}
                
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
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`badge ${item.type === 'found' ? 'badge-found' : 'badge-lost'}`}>
                      {item.type === 'found' ? 'Found' : 'Lost'}
                    </span>
                    <span className="text-xs text-gray-500">{item.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate flex-1">{item.location.city}</span>
                    <Clock className="w-3 h-3 ml-2 mr-1" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    page === pagination.currentPage
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

export default Browse