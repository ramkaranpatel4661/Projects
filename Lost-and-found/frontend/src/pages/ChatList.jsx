// src/pages/ChatList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import chatApi from '../api/chatApi';
import { MessageCircle, Package, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ChatList = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations initially
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await chatApi.getMyChats();
        console.log('Fetched private conversations:', res.data);
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching private chats:', err);
        if (err.response?.status === 403) {
          toast.error('Access denied to view conversations');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  // Handle clear chat
  const handleClearChat = async (chatId) => {
    try {
      await chatApi.clearChat(chatId);
      toast.success('Private chat cleared successfully');
      // Refresh chat list
      const res = await chatApi.getMyChats();
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to clear private chat:', err);
      if (err.response?.status === 403) {
        toast.error('Access denied. You can only clear your own conversations.');
      } else {
        toast.error(err.response?.data?.message || 'Something went wrong');
      }
    }
  };

  // Listen for new_message events and update the chat list
  useEffect(() => {
    if (!socket) return;
    
    const handler = (data) => {
      console.log('💬 ChatList received new private message:', data);
      // Refresh conversations to show updated last message
      chatApi.getMyChats()
        .then(res => setConversations(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error('Error re-fetching private chats:', err));
    };
    
    socket.on('new_message', handler);
    return () => {
      socket.off('new_message', handler);
    };
  }, [socket]);

  // Join personal room for real-time updates
  useEffect(() => {
    if (!socket || !user?._id) return;
    // Join personal room to receive private message notifications
    socket.emit('join_user_room', user._id);
  }, [socket, user]);

  // Compute total unread messages
  const totalUnread = conversations.reduce((count, chat) => {
    return (
      count + chat.messages.filter(
        msg => !msg.isRead && msg.sender._id !== user._id
      ).length
    );
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your private conversations...</p>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Private Conversations Yet</h2>
          <p className="text-gray-600 mb-4">
            Start a private conversation by visiting an item page and clicking "Chat" button.
          </p>
          <p className="text-sm text-gray-500">
            Only you and the item owner can see your private messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Private Conversations</h1>
        <p className="text-gray-600">
          Private chats between you and item owners. Only participants can see these messages.
        </p>
        {totalUnread > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            You have {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        {conversations.map(chat => {
          // Find the other participant (not the current user)
          const otherUser = chat.participants.find(p => {
            const participantId = p._id || p.id;
            const currentUserId = user._id || user.id;
            return participantId !== currentUserId;
          });
          const unreadCount = chat.messages.filter(
            msg => {
              const senderId = msg.sender._id || msg.sender.id;
              const currentUserId = user._id || user.id;
              return !msg.isRead && senderId !== currentUserId;
            }
          ).length;

          return (
            <div
              key={chat._id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition"
            >
              <Link to={`/chatroom/${chat._id}`} className="flex-1 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {otherUser?.name || 'Unknown User'}
                    </p>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{chat.item?.title || 'Item Chat'}</span>
                  </div>
                  
                  {chat.messages.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      Last message: {new Date(chat.messages[0].timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
              
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to clear this private conversation? This action cannot be undone.')) {
                      handleClearChat(chat._id);
                    }
                  }}
                  className="text-xs text-red-600 hover:underline px-2 py-1 rounded hover:bg-red-50"
                >
                  Clear
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">🔒 Privacy Notice</h3>
        <p className="text-sm text-blue-800">
          All conversations are private between you and the item owner. No one else can see your messages.
        </p>
      </div>
    </div>
  );
};

export default ChatList;