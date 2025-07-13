import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ItemDetail from './pages/ItemDetail'
import UserProfile from './pages/UserProfile'
import PostItem from './pages/PostItem'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import MyItems from './pages/MyItems'
import ChatList from './pages/ChatList'
import LoadingSpinner from './components/LoadingSpinner'
import ChatRoom from './pages/chatroom'
import ClaimItem from './pages/ClaimItem'
import MyClaims from './pages/MyClaims'
import ClaimReviews from './pages/ClaimReviews'
import HandoverSuccess from './pages/HandoverSuccess'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="item/:id" element={<ItemDetail />} />
        <Route path="user/:id" element={<UserProfile />} />
      </Route>

      {/* Auth routes (only when not logged in) */}
      {!user && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </>
      )}

      {/* Protected routes (only when logged in) */}
      {user && (
        <Route path="/" element={<Layout />}>
          <Route path="post" element={<PostItem />} />
          <Route path="profile" element={<Profile />} />
          <Route path="my-items" element={<MyItems />} />
          <Route path="chats" element={<ChatList />} />
          <Route path="/chatroom/:chatId" element={<ChatRoom />} />
          <Route path="claim/:id" element={<ClaimItem />} />
          <Route path="my-claims" element={<MyClaims />} />
          <Route path="claim-reviews" element={<ClaimReviews />} />
          <Route path="handover-success/:claimId" element={<HandoverSuccess />} />
        </Route>
      )}

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App