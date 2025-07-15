import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Clock, User, Eye, MessageCircle, Phone, Mail, ArrowLeft, Package, Lock, Shield } from 'lucide-react'
import { itemsApi } from '../utils/api'
import chatApi from '../api/chatApi'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ImageDisplay from '../components/ImageDisplay'
import toast from 'react-hot-toast'

const ItemDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate();
  const [item, setItem] = useState(null)
  const [similarItems, setSimilarItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [startingChat, setStartingChat] = useState(false)

  useEffect(() => {
    if (id) {
      fetchItem()
    }
  }, [id])

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await itemsApi.getItem(id);
      setItem(res.data.item);
      setSimilarItems(res.data.similarItems || []);
    } catch (err) {
      console.error('Error fetching item:', err);
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to start a private chat');
      return;
    }
    
    if (!item) return;


    try {
      setStartingChat(true);
      const response = await chatApi.getOrCreateChat(item._id);
      console.log('Private chat API response:', response);
      
      // ✅ Fixed: Access the chat ID directly from response.data._id
      const chatId = response.data._id;
      console.log('Private chatId:', chatId);
      
      navigate(`/chatroom/${chatId}`);
      console.log('Navigating to private chatroom with ID:', chatId);
      toast.success('Private chat started successfully');
    } catch (error) {
      console.error('Failed to start private chat:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Unable to create private chat.');
      } else {
        toast.error('Failed to start private chat');
      }
    } finally {
      setStartingChat(false);
    }
  }

  const handleViewProfile = () => {
    navigate(`/user/${item.postedBy._id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Item not found</h2>
          <p className="text-gray-600 mb-6">The item you're looking for doesn't exist or has been removed.</p>
          <Link to="/browse" className="btn-primary">
            Browse Items
          </Link>
        </div>
      </div>
    )
  }

  const isOwner =
    user &&
    (
      user.id?.toString() === item.postedBy._id?.toString() ||
      user._id?.toString() === item.postedBy._id?.toString()
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/browse"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <ImageDisplay
                imageUrls={item.imageUrls}
                title={item.title}
                aspectRatio="aspect-w-16 aspect-h-12"
                showThumbnails={true}
              />
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`badge ${item.type === 'found' ? 'badge-found' : 'badge-lost'}`}>
                  {item.type === 'found' ? 'Found Item' : 'Lost Item'}
                </span>
                <span className="badge badge-active">{item.status}</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Package className="w-5 h-5 mr-2" />
                  <span>{item.category}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Eye className="w-5 h-5 mr-2" />
                  <span>{item.views} views</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{item.location.city}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Details</h3>
                <p className="text-gray-700">{item.location.address}</p>
              </div>

              {item.dateFound && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Date Found</h3>
                  <p className="text-gray-700">{new Date(item.dateFound).toLocaleDateString()}</p>
                </div>
              )}

              {item.dateLost && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Date Lost</h3>
                  <p className="text-gray-700">{new Date(item.dateLost).toLocaleDateString()}</p>
                </div>
              )}

              {!isOwner && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h3>
                  <div className="space-y-3">
                    {item.type === 'found' && (
                      <Link
                        to={`/claim/${item._id}`}
                        className="btn-primary w-full flex items-center justify-center"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Claim This Item
                      </Link>
                    )}
                    <button
                      onClick={handleStartChat}
                      disabled={startingChat}
                      className={`${item.type === 'found' ? 'btn-outline' : 'btn-primary'} w-full flex items-center justify-center`}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      <Lock className="w-3 h-3 mr-1" />
                      {startingChat ? 'Starting Private Chat...' : 'Start Private Chat'}
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      🔒 Private conversation between you and the item owner
                    </p>
                    
                    {item.contactInfo.showPhone && item.contactInfo.phone && (
                      <a
                        href={`tel:${item.contactInfo.phone}`}
                        className="btn-outline w-full"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call: {item.contactInfo.phone}
                      </a>
                    )}
                    {item.contactInfo.showEmail && item.contactInfo.email && (
                      <a
                        href={`mailto:${item.contactInfo.email}`}
                        className="btn-outline w-full"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email: {item.contactInfo.email}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted By</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.postedBy.name}</p>
                      <p className="text-sm text-gray-600">
                        Member since {new Date(item.postedBy.createdAt).getFullYear()}
                      </p>
                    </div>
                  </div>
                  {!isOwner && (
                    <button
                      onClick={handleViewProfile}
                      className="btn-outline text-sm"
                    >
                      View Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {similarItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarItems.map((similarItem) => (
                <Link
                  key={similarItem._id}
                  to={`/item/${similarItem._id}`}
                  className="card-hover group"
                >
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-t-xl overflow-hidden">
                    {similarItem.imageUrls && similarItem.imageUrls.length > 0 ? (
                      <img
                        src={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${similarItem.imageUrls[0]}`}
                        alt={similarItem.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`badge ${similarItem.type === 'found' ? 'badge-found' : 'badge-lost'}`}>
                        {similarItem.type === 'found' ? 'Found' : 'Lost'}
                      </span>
                      <span className="text-xs text-gray-500">{similarItem.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {similarItem.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{similarItem.location.city}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemDetail