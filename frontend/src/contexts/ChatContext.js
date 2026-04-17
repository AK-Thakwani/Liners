import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { UserContext } from './UserContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Get user from context to trigger reconnect on login
  const { user } = useContext(UserContext);

  // Socket initialization effect
  useEffect(() => {
    const token = localStorage.getItem('token');

    // If no token or user (logout), ensure we disconnect and clean up
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // If we already have a functional socket and user hasn't effectively changed, 
    // we might want to keep it. But simplest is to reconnect on user change/login.
    // Disconnect existing socket before creating a new one
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
      timeout: 7000,
      withCredentials: false,
      query: { token } // Pass token in query for handshake
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('authenticate', token);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listeners ...
    // Event listeners
    const onReceiveMessage = (message) => {
      // Update current chat if applicable
      setCurrentChat(prevChat => {
        if (prevChat && (message.senderId === prevChat._id || message.sender?._id === prevChat?._id)) {
          setMessages(prev => {
            if (prev.some(m => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
        return prevChat;
      });

      setConversations(prev => {
        const senderId = message.senderId || message.sender?._id;
        const index = prev.findIndex(c => c.user?._id === senderId || c._id === senderId);
        let newConvs = [...prev];
        if (index !== -1) {
          const updated = {
            ...newConvs[index],
            unreadCount: (newConvs[index].unreadCount || 0) + 1,
            messageCount: (newConvs[index].messageCount || 0) + 1,
            lastMessage: message.text,
            timestamp: message.timestamp
          };
          newConvs.splice(index, 1);
          newConvs.unshift(updated);
        } else {
          newConvs.unshift({
            _id: senderId,
            user: message.sender,
            unreadCount: 1,
            messageCount: 1,
            lastMessage: message.text,
            timestamp: message.timestamp
          });
        }
        return newConvs;
      });
    };

    const onMessageSent = (message) => {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });

      setConversations(prev => {
        const receiverId = message.receiver?._id || message.receiver;
        const index = prev.findIndex(c => c.user?._id === receiverId || c._id === receiverId);
        let newConvs = [...prev];
        if (index !== -1) {
          const updated = {
            ...newConvs[index],
            lastMessage: message.text,
            timestamp: message.timestamp,
            messageCount: (newConvs[index].messageCount || 0) + 1
          };
          newConvs.splice(index, 1);
          newConvs.unshift(updated);
        } else {
          newConvs.unshift({
            _id: receiverId,
            user: message.receiver,
            unreadCount: 0,
            messageCount: 1,
            lastMessage: message.text,
            timestamp: message.timestamp
          });
        }
        return newConvs;
      });
    };

    const onUnreadMessages = (unreadMessages) => {
      if (Array.isArray(unreadMessages) && unreadMessages.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m._id));
          const toAdd = unreadMessages.filter(m => !existingIds.has(m._id));
          if (toAdd.length === 0) return prev;
          return [...prev, ...toAdd].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
      }
    };

    const onError = (error) => {
      console.error('Socket.io error:', error);
      if (error.message) {
        alert(`Messaging Error: ${error.message}`);
      }
    };

    newSocket.on('receive-message', onReceiveMessage);
    newSocket.on('message-sent', onMessageSent);
    newSocket.on('unread-messages', onUnreadMessages);
    newSocket.on('error', onError);

    setSocket(newSocket);

    return () => {
      newSocket.off('receive-message', onReceiveMessage);
      newSocket.off('message-sent', onMessageSent);
      newSocket.off('unread-messages', onUnreadMessages);
      newSocket.off('error', onError);
      newSocket.disconnect();
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sendMessage = useCallback((receiverId, text, mediaUrl = '', mediaType = 'text') => {
    if (socket && (text.trim() || mediaUrl)) {
      socket.emit('send-message', { receiverId, text, mediaUrl, mediaType });
      // We don't manually fetchConversations here anymore, relying on 'message-sent' event for speed
      // But keeping a backup refresh is okay if event fails (though 'message-sent' is from server)
    }
  }, [socket]);

  const markAsRead = useCallback((messageId) => {
    if (socket) {
      socket.emit('mark-as-read', { messageId });
    }
  }, [socket]);

  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'auth-token': token }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        // Calculate unread
        const count = (data.conversations || []).reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Fetch conversations error", error);
    }
  }, []);

  const fetchMessages = useCallback(async (userId) => {
    const token = localStorage.getItem('token');
    // Use user from context instead of localStorage.getItem('userId')
    if (!token || !user || !user._id) return;

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/messages/${user._id}/${userId}`, {
        headers: { 'auth-token': token }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => {
          // Merge strategy
          const existingIds = new Set(prev.map(m => m._id));
          const newMsgs = (data.messages || []).filter(m => !existingIds.has(m._id));
          return [...prev, ...newMsgs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Fetch messages error", error);
    }
  }, [scrollToBottom, user]);

  const startChat = useCallback((user) => {
    setCurrentChat(user);
    fetchMessages(user._id);
  }, [fetchMessages]);

  const value = React.useMemo(() => ({
    socket,
    isConnected,
    conversations,
    currentChat,
    messages,
    unreadCount,
    messagesEndRef,
    sendMessage,
    markAsRead,
    fetchConversations,
    fetchMessages,
    startChat,
    setCurrentChat,
    scrollToBottom
  }), [socket, isConnected, conversations, currentChat, messages, unreadCount, sendMessage, markAsRead, fetchConversations, fetchMessages, startChat, scrollToBottom]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
