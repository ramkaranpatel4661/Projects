import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, Users, ArrowRight, Package, Heart, Shield } from 'lucide-react'
import { itemsApi } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'

const Home = () => {
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const response = await itemsApi.getItems({ limit: 6 })
        setRecentItems(response.data.items)
      } catch (error) {
        console.error('Error fetching recent items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentItems()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Find What's Lost,
              <br />
              <span className="text-primary-200">Return What's Found</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto text-balance">
              Connect with your community to reunite lost items with their owners. 
              Every item has a story, and every story deserves a happy ending.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/browse"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Items
              </Link>
              <Link
                to="/post"
                className="inline-flex items-center px-8 py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-400 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-primary-400"
              >
                <Package className="w-5 h-5 mr-2" />
                Post an Item
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to help reunite lost items with their owners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <Package className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Post Your Item</h3>
              <p className="text-gray-600">
                Found something? Lost something? Post it with photos and details to help others identify it.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-200 transition-colors">
                <Search className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Search & Browse</h3>
              <p className="text-gray-600">
                Browse through posted items or use our search to find exactly what you're looking for.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-200 transition-colors">
                <Heart className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reunite & Connect</h3>
              <p className="text-gray-600">
                Connect with the poster through our secure chat system and arrange the return.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recent Posts
              </h2>
              <p className="text-xl text-gray-600">
                Latest items posted by our community
              </p>
            </div>
            <Link
              to="/browse"
              className="hidden md:inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <Link
                  key={item._id}
                  to={`/item/${item._id}`}
                  className="card-hover group"
                >
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
                      <span className="text-sm text-gray-500">{item.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{item.location.city}</span>
                      <Clock className="w-4 h-4 ml-4 mr-1" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/browse"
              className="btn-primary"
            >
              View All Items
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Community Impact</h2>
            <p className="text-primary-200 text-lg">Together, we're making a difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">2,500+</div>
              <div className="text-primary-200 text-lg">Items Posted</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">1,200+</div>
              <div className="text-primary-200 text-lg">Happy Reunions</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-primary-200 text-lg">Successful Claims</div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-primary-500 rounded-full px-6 py-3">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Secure Verification System</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community and help reunite lost items with their owners. 
            Every post makes a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Our Community
            </Link>
            <Link
              to="/browse"
              className="btn-outline"
            >
              <Search className="w-5 h-5 mr-2" />
              Start Browsing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home