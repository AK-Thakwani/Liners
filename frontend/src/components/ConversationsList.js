import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import {
  FaSearch,
  FaUser,
  FaCircle,
  FaTimes,
  FaPaperPlane
} from 'react-icons/fa';
import { useChat } from '../contexts/ChatContext';
import axios from 'axios';

const ConversationsList = ({ isOpen, onClose, onStartChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  const { conversations, fetchConversations, isConnected, startChat, setCurrentChat } = useChat();

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      // Autofocus search to encourage starting a chat quickly
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen, fetchConversations]);

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
        headers: { 'auth-token': token }
      });

      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchUsers(value);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <Container
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <Header>
          <Title>Messages</Title>
          <HeaderActions>
            <NewChatButton
              onClick={() => {
                // Clear results and focus search to start a new chat
                setUsers([]);
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
            >
              Start new chat
            </NewChatButton>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </HeaderActions>
        </Header>

        {/* Search */}
        <SearchContainer>
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </SearchContainer>

        {/* Content */}
        <Content>
          {searchTerm ? (
            // Search Results
            <SearchResults>
              {loading ? (
                <LoadingState>Searching...</LoadingState>
              ) : users.length > 0 ? (
                <UsersList>
                  {users.map((user) => (
                    <UserItem
                      key={user._id}
                      onClick={() => {
                        setCurrentChat(user);
                        startChat(user);
                        onStartChat(user);
                        setSearchTerm('');
                        setUsers([]);
                      }}
                    >
                      <UserAvatar>
                        <img
                          src={user.profilePicture || '/default-avatar.png'}
                          alt={user.name || 'User'}
                          onError={(e) => e.target.src = '/default-avatar.png'}
                        />
                      </UserAvatar>
                      <UserInfo>
                        <UserName>{user.name}</UserName>
                        <UserEmail>{user.email}</UserEmail>
                      </UserInfo>
                      <StartChatIcon>
                        <FaPaperPlane />
                      </StartChatIcon>
                    </UserItem>
                  ))}
                </UsersList>
              ) : (
                <EmptyState>No users found</EmptyState>
              )}
            </SearchResults>
          ) : (
            // Conversations List
            <Conversations>
              {conversations.length > 0 ? (
                <ConversationsListContainer>
                  {conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation._id}
                      onClick={() => {
                        startChat(conversation.user);
                        onStartChat(conversation.user);
                      }}
                    >
                      <UserAvatar>
                        <img
                          src={conversation.user?.profilePicture || '/default-avatar.png'}
                          alt={conversation.user?.name || 'User'}
                          onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                          loading="lazy"
                        />
                        {conversation.unreadCount > 0 && (
                          <UnreadBadge>
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </UnreadBadge>
                        )}
                      </UserAvatar>
                      <ConversationInfo>
                        <ConversationHeader>
                          <UserName>{conversation.user?.name || 'Unknown User'}</UserName>
                          <TimeStamp>
                            {formatTime(conversation.lastMessage.timestamp)}
                          </TimeStamp>
                        </ConversationHeader>
                        <LastMessage>
                          {truncateText(conversation.lastMessage.text)}
                        </LastMessage>
                      </ConversationInfo>
                    </ConversationItem>
                  ))}
                </ConversationsListContainer>
              ) : (
                <EmptyState>
                  <div>No messages yet</div>
                  <div>Click "Start new chat" or search a user above.</div>
                </EmptyState>
              )}
            </Conversations>
          )}
        </Content>

        {/* Connection Status */}
        <ConnectionStatus $isConnected={isConnected}>
          <StatusIndicator $isConnected={isConnected}>
            <FaCircle />
          </StatusIndicator>
          {isConnected ? 'Connected' : 'Disconnected'}
        </ConnectionStatus>
      </Container>
    </Overlay>
  );
};

export default ConversationsList;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  justify-content: flex-start;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Container = styled(motion.div)`
  width: 400px;
  height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 5px 0 30px rgba(102, 126, 234, 0.2);
  border-radius: 0 20px 20px 0;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    width: 100vw;
    border-radius: 0;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const NewChatButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  transition: transform 0.15s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
  }

  &:active {
    transform: translateY(0px) scale(0.98);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 14px;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const SearchResults = styled.div`
  padding: 20px;
`;

const LoadingState = styled.div`
  text-align: center;
  color: #6b7280;
  padding: 40px 20px;
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`;

const UserAvatar = styled.div`
  position: relative;
  
  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const UnreadBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 14px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const StartChatIcon = styled.div`
  color: #3b82f6;
  font-size: 16px;
`;

const Conversations = styled.div`
  padding: 20px;
`;

const ConversationsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`;

const ConversationInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ConversationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TimeStamp = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const LastMessage = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6b7280;
  padding: 40px 20px;
  
  div:first-child {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  div:last-child {
    font-size: 14px;
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 12px;
  color: ${props => props.$isConnected ? '#10b981' : '#ef4444'};
`;

const StatusIndicator = styled.div`
  color: ${props => props.$isConnected ? '#10b981' : '#ef4444'};
  font-size: 8px;
`;
