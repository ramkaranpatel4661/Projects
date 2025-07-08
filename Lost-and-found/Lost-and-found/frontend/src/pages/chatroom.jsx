import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import chatApi from '../api/chatApi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ChatRoom = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket, joinChat, leaveChat } = useSocket();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [sending, setSending] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const getId = u => u?._id || u?.id;

  useEffect(() => {
    setInitialScrollDone(false); // Reset when a new chat is opened
  }, [chatId]);

  // 1) Fetch chat (with access control)
  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      try {
        const res = await chatApi.getChat(chatId);
        setChat(res.data);
        setMessages(res.data.messages);
      } catch (err) {
        console.error('Failed to load private chat:', err);
        if (err.response?.status === 403) {
          toast.error('Access denied. This is a private conversation.');
        } else {
          toast.error('Failed to load chat');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [chatId]);

  // 2) Mark messages as read
  useEffect(() => {
    if (chatId && user && chat) {
      chatApi.markAsRead(chatId).catch(console.error);
    }
  }, [chatId, user, chat]);
  
  // 3) Join/leave socket room for private chat
  useEffect(() => {
    if (chat?.item?._id) {
      joinChat(chat.item._id);
      return () => leaveChat(chat.item._id);
    }
  }, [chat]);

  // 4) Listen for new_message (only from the other participant)
  useEffect(() => {
    if (!socket || !chat) return;

    const handler = ({ message, itemId, chatId: messageChatId }) => {
      const senderId = message.sender._id || message.sender.id;
      const meId = user?._id || user?.id;

      // Only add message if it's for this specific chat and not from current user
      if (messageChatId === chat._id && senderId !== meId) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, chat, user]);

  // 5) Auto-scroll to bottom
  useLayoutEffect(() => {
    if (!initialScrollDone && messages.length > 0) {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'auto'
      });
      setInitialScrollDone(true);
    }
  }, [messages, initialScrollDone]);

  useLayoutEffect(() => {
    // Scroll smoothly for every new incoming message
    if (messages.length > 0) {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // 6) Send a message
  const handleSend = async () => {
    if (!newMessage.trim() || !chat || !user || sending) return;

    try {
      setSending(true);
      
      // Optimistically add message to UI
      const tempMessage = {
        _id: Date.now().toString(),
        sender: user,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isRead: false
      };
      setMessages(prev => [...prev, tempMessage]);

      // Send via API (which will also emit via socket)
      await chatApi.sendMessage(chat.item._id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Chat Not Found</h2>
          <p className="text-gray-600">This private conversation doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  const otherUser = chat?.participants.find(
    p => p._id !== (user?._id || user?.id)
  );

  return (
    <div className="max-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          to="/chats"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Conversations
        </Link>

        <div className="bg-white rounded-xl shadow p-4 h-[75vh] flex flex-col">
          {/* Header */}
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {otherUser?.name || 'Private Chat'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    About: {chat.item?.title || 'Item'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto space-y-3 mb-4 px-2"
          >
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
                <p className="text-xs text-gray-400 mt-2">
                  🔒 This is a private conversation between you and {otherUser?.name}
                </p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = getId(msg.sender) === getId(user);
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isMe 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        isMe ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="form-input flex-1"
                placeholder="Type your private message..."
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="btn-primary"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              Only you and {otherUser?.name} can see this conversation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;