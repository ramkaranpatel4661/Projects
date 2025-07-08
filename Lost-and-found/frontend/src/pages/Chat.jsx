import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../utils/api';
import { MessageCircle } from 'lucide-react';

const ChatList = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await chatApi.getUserChats();
        setConversations(res.data);
      } catch (err) {
        console.error('Error fetching chat list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading chats...</p>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Conversations Yet</h2>
          <p className="text-gray-600">Start a chat by visiting an item page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Conversations</h1>
      <div className="space-y-4">
        {conversations.map((chat) => {
          const otherUser = chat.participants.find(p => p._id !== user._id);
          return (
            <Link
              key={chat._id}
              to={`/chat/${chat._id}`}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-100 transition"
            >
              <div>
                <p className="font-semibold text-gray-900">{otherUser?.name}</p>
                <p className="text-sm text-gray-600">{chat.item?.title || 'Item chat'}</p>
              </div>
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
