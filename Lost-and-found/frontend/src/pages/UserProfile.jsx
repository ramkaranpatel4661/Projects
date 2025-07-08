import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  MessageCircle, 
  Package, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import { usersApi } from '../utils/api';
import chatApi from '../api/chatApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [startingMessage, setStartingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('found');

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserItems('found');
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUser(id);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async (type) => {
    try {
      setItemsLoading(true);
      const response = await usersApi.getUserItems(id, type);
      setUserItems(response.data.items);
    } catch (error) {
      console.error('Error fetching user items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchUserItems(tab);
  };

  const handleStartMessage = async () => {
    if (!currentUser) {
      toast.error('Please login to send a message');
      return;
    }

    if (currentUser._id === id || currentUser.id === id) {
      toast.error('You cannot message yourself');
      return;
    }

    try {
      setStartingMessage(true);
      
      // Find any active item by this user to create message context
      if (userItems.length === 0) {
        toast.error('Cannot start message. User has no active items.');
        return;
      }

      // Use the first available item as context for the message
      const contextItem = userItems[0];
      const response = await chatApi.getOrCreateChat(contextItem._id);
      
      // Navigate to the chat
      window.location.href = `/chatroom/${response.data._id}`;
      toast.success('Message conversation started');
    } catch (error) {
      console.error('Failed to start message:', error);
      toast.error('Failed to start message conversation');
    } finally {
      setStartingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && (currentUser._id === id || currentUser.id === id);

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

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {userProfile.user.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined {new Date(userProfile.user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    <span>{userProfile.user.itemsCount} active items</span>
                  </div>
                  <div className="flex items-center">
                    <Activity className={`w-4 h-4 mr-1 ${userProfile.user.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={userProfile.user.isActive ? 'text-green-600' : 'text-gray-500'}>
                      {userProfile.user.isActive ? 'Online' : `Last seen ${new Date(userProfile.user.lastSeen).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <div className="mt-4 md:mt-0">
                <button
                  onClick={handleStartMessage}
                  disabled={startingMessage}
                  className="btn-primary flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {startingMessage ? 'Starting...' : 'Send Message'}
                </button>
              </div>
            )}

            {isOwnProfile && (
              <div className="mt-4 md:mt-0">
                <Link to="/profile" className="btn-outline">
                  Edit Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Items Section */}
        {userProfile.recentItems && userProfile.recentItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile.recentItems.map((item) => (
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
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`badge ${item.type === 'found' ? 'badge-found' : 'badge-lost'}`}>
                        {item.type === 'found' ? 'Found' : 'Lost'}
                      </span>
                      <span className="text-xs text-gray-500">{item.category}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{item.location.city}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Items Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Items</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleTabChange('found')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'found'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Found Items
              </button>
              <button
                onClick={() => handleTabChange('lost')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'lost'
                    ? 'bg-red-100 text-red-800'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lost Items
              </button>
            </div>
          </div>

          {itemsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : userItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No {activeTab} items posted yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.map((item) => (
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
        </div>
      </div>
    </div>
  );
};

export default UserProfile;