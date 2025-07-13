import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, User, LogOut, Plus, MessageCircle, Package, Shield, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import chatApi from '../api/chatApi'
import { useSocket } from '../context/SocketContext'


const Header = () => {
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    useEffect(() => {
    if (!user) return
    const fetchUnread = async () => {
      try {
        const res = await chatApi.getMyChats()
        const convos = Array.isArray(res.data) ? res.data : []
        const count = convos.reduce((sum, chat) => {
          if (!chat.messages || !Array.isArray(chat.messages)) return sum;
          
          return sum + chat.messages.filter(msg => {
            const senderId = msg.sender?._id || msg.sender?.id;
            const currentUserId = user._id || user.id;
            return !msg.isRead && senderId !== currentUserId;
          }).length
        }, 0)
        setUnreadCount(count)
      } catch (err) {
        console.error('Failed to fetch unread messages:', err)
      }
    }
    fetchUnread()
  }, [user, location])


 // Listen for new_message only on your personal room
  useEffect(() => {
    if (!socket || !user) return

    const handler = ({ message, chatId }) => {
      // Only increment unread count if message is not from current user
      const senderId = message.sender._id || message.sender.id;
      const currentUserId = user._id || user.id;
      
      if (senderId !== currentUserId) {
        setUnreadCount(c => c + 1)
      }
    }

    socket.on('new_message', handler)
    return () => {
      socket.off('new_message', handler)
    }
  }, [socket, user])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Lost & Found</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className={`text-sm font-medium transition-colors ${
                isActive('/browse') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Browse Items
            </Link>
            {user && (
              <>
                <Link
                  to="/post"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/post') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Post Item
                </Link>
                <Link
                  to="/my-items"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/my-items') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  My Items
                </Link>
                <Link
                  to="/my-claims"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/my-claims') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  My Claims
                </Link>
                <Link
                  to="/claim-reviews"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/claim-reviews') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Claim Reviews
                </Link>
                <Link
                  to="/chats"
                  className={`text-sm font-medium transition-colors relative ${
                    isActive('/chats') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/post"
                  className="hidden md:inline-flex btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Item
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/my-items"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-3" />
                        My Items
                      </Link>
                      <Link
                        to="/my-claims"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        My Claims
                      </Link>
                      <Link
                        to="/claim-reviews"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Eye className="w-4 h-4 mr-3" />
                        Claim Reviews
                      </Link>
                      <Link
                        to="/chats"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <MessageCircle className="w-4 h-4 mr-3" />
                        Messages
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/browse"
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActive('/browse') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Items
              </Link>
              {user ? (
                <>
                  <Link
                    to="/post"
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                      isActive('/post') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Post Item
                  </Link>
                  <Link
                    to="/my-items"
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                      isActive('/my-items') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Items
                  </Link>
                  <Link
                    to="/my-claims"
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                      isActive('/my-claims') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Claims
                  </Link>
                  <Link
                    to="/claim-reviews"
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                      isActive('/claim-reviews') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Claim Reviews
                  </Link>
                  <Link
                    to="/chats"
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors relative ${
                      isActive('/chats') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Messages
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-3 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header