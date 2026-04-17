import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import Chat from './Chat';
import { useChat } from '../contexts/ChatContext';
import { UserContext } from '../contexts/UserContext';
import { useContext } from 'react';

const Messaging = ({ isOpen, onClose }) => {
  return <MessagingContentMemo isOpen={isOpen} onClose={onClose} />;
};

const MessagingContent = ({ isOpen, onClose }) => {
  const [showChat, setShowChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { conversations = [], startChat, fetchConversations } = useChat();
  const { user } = useContext(UserContext);

  // Fetch conversations when messaging opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);



  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsSearching(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const url = `${API_URL}/users/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data.users);
        setSearchResults(data.users || []);
      } else {
        console.error('Search failed:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };


  const handleStartNewConversation = (user) => {
    console.log('Starting new conversation with:', user);
    setSelectedUser(user);
    // Ensure chat opens
    setTimeout(() => setShowChat(true), 10);
    setShowNewConversation(false);
    setSearchQuery('');
    setSearchResults([]);

    startChat(user);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedUser(null);
    // Refresh conversations when closing chat so new contacts appear in the list
    setTimeout(() => {
      console.log('📱 Chat closed - refreshing conversations list');
      fetchConversations();
    }, 100);
  };

  const handleCloseMessaging = () => {
    setShowChat(false);
    setSelectedUser(null);
    onClose();
  };

  // if (!isOpen) return null; // Removed to keep mounted for performance

  return (
    <Overlay
      initial={{ opacity: 0, pointerEvents: 'none' }}
      animate={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
      transition={{ duration: 0.2 }}
    >
      <Container
        initial={{ scale: 0.96, opacity: 0, pointerEvents: 'none' }}
        animate={{
          scale: 1,
          opacity: 1,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >

        {/* Left: Conversations Bubbles */}
        <BubblesColumn>
          <Header>
            <Title>Messages</Title>
            <HeaderActions>
              <NewChatBtn
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowNewConversation(true); }}
                title="Start new conversation"
              >
                ➕
              </NewChatBtn>
              <SmallBtn
                type="button"
                onClick={(e) => { e.stopPropagation(); handleCloseMessaging(); }}
                title="Close"
              >
                ✕
              </SmallBtn>
            </HeaderActions>
          </Header>
          <Subtitle>Your conversations secured</Subtitle>
          <DebugInfo>Conversations: {conversations.length}</DebugInfo>

          <ConversationListContainer>
            <AnimatePresence>
              {conversations.length > 0 ? (
                conversations.map((conv, index) => {
                  const lastMessage = conv.lastMessage;
                  const isLastMessageFromMe = lastMessage?.sender?.toString() === user?._id;
                  const lastMessageText = lastMessage?.text || 'No messages yet';
                  const lastMessageTime = lastMessage?.timestamp ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  const userName = conv.user?.name || conv.name || 'Unknown User';
                  const userAvatar = conv.user?.profilePicture || conv.profilePicture;

                  return (
                    <ConversationItem
                      key={conv._id}
                      layoutId={`conversation-${conv._id}`}
                      onClick={() => handleStartNewConversation(conv.user || conv)}
                      initial={{ x: -30, opacity: 0, scale: 0.95 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: -20, opacity: 0, scale: 0.95 }}
                      transition={{
                        delay: index * 0.08,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                      }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <ConversationAvatar title={userName}>
                        {userAvatar ? (
                          <AvatarImage src={userAvatar} alt={userName} />
                        ) : (
                          <AvatarText>{userName?.slice(0, 1).toUpperCase() || '?'}</AvatarText>
                        )}
                      </ConversationAvatar>

                      <ConversationContent>
                        <ConversationHeader>
                          <ConversationName>{userName}</ConversationName>
                          <ConversationTime>{lastMessageTime}</ConversationTime>
                        </ConversationHeader>
                        <ConversationPreview isFromMe={isLastMessageFromMe}>
                          <SenderLabel>{isLastMessageFromMe ? 'You: ' : ''}</SenderLabel>
                          {lastMessageText.length > 40 ? lastMessageText.substring(0, 40) + '...' : lastMessageText}
                        </ConversationPreview>
                      </ConversationContent>

                      {conv.unreadCount > 0 && <UnreadBadge>{conv.unreadCount}</UnreadBadge>}
                    </ConversationItem>
                  );
                })
              ) : (
                <EmptyConversations>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                  <div style={{ fontSize: '16px', color: '#475569', fontWeight: '600' }}>No conversations yet</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>Tap ➕ to start a new chat</div>
                </EmptyConversations>
              )}
            </AnimatePresence>
          </ConversationListContainer>
        </BubblesColumn>
      </Container>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConversation && (
          <ModalBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowNewConversation(false);
              setSearchQuery('');
              setSearchResults([]);
            }}
          >
            <ModalContent
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <ModalHeader>
                <ModalTitle>Start New Conversation</ModalTitle>
                <CloseModalBtn onClick={() => {
                  setShowNewConversation(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}>
                  ✕
                </CloseModalBtn>
              </ModalHeader>

              <SearchInputWrapper>
                <SearchIcon>🔍</SearchIcon>
                <SearchInput
                  id="user-search-input"
                  name="search-users"
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </SearchInputWrapper>

              <SearchResultsList>
                {isSearching ? (
                  <LoadingText>Searching...</LoadingText>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <UserResult
                      key={user._id}
                      onClick={() => handleStartNewConversation(user)}
                      whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                    >
                      <UserResultAvatar>{user.name?.slice(0, 1).toUpperCase()}</UserResultAvatar>
                      <UserResultInfo>
                        <UserResultName>{user.name}</UserResultName>
                        <UserResultEmail>{user.email}</UserResultEmail>
                      </UserResultInfo>
                      <ArrowIcon>→</ArrowIcon>
                    </UserResult>
                  ))
                ) : searchQuery ? (
                  <NoResults>No users found</NoResults>
                ) : (
                  <EmptySearchText>Type to search for users</EmptySearchText>
                )}
              </SearchResultsList>
            </ModalContent>
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {showChat && (
          <Chat
            isOpen={showChat}
            onClose={handleCloseChat}
            selectedUser={selectedUser}
          />
        )}
      </AnimatePresence>
    </Overlay>
  );
};

const MessagingContentMemo = React.memo(MessagingContent);

export default Messaging;

// ===========================
// Animations
// ===========================




// ===========================
// Styled Components
// ===========================


const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.15) 0%, 
    rgba(168, 85, 247, 0.15) 25%,
    rgba(236, 72, 153, 0.1) 50%,
    rgba(59, 130, 246, 0.15) 75%,
    rgba(34, 197, 94, 0.1) 100%);
  backdrop-filter: blur(12px) saturate(1.2);
  will-change: opacity;
  pointer-events: none;

  @media (max-width: 768px) {
    align-items: flex-end;
    background: linear-gradient(180deg, 
      rgba(99, 102, 241, 0.2) 0%, 
      rgba(168, 85, 247, 0.2) 50%,
      rgba(236, 72, 153, 0.15) 100%);
  }
`;

const Container = styled(motion.div)`
  width: 92%;
  max-width: 1000px;
  height: 84vh;
  border-radius: 22px;
  overflow: hidden;
  position: relative;
  display: flex;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 250, 252, 0.96) 25%,
    rgba(240, 249, 255, 0.96) 50%,
    rgba(245, 240, 255, 0.96) 75%,
    rgba(255, 250, 245, 0.96) 100%);
  box-shadow: 
    0 30px 80px rgba(99, 102, 241, 0.25),
    0 0 1px rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  will-change: transform, opacity;
  pointer-events: none;

  @media (max-width: 768px) {
    width: 100%;
    height: 100vh;
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
    border: none;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.99) 0%,
      rgba(248, 250, 252, 0.99) 100%);
  }

  @media (max-width: 480px) {
    height: 100vh;
    width: 100%;
  }
`;

const BubblesColumn = styled.div`
  width: 100%;
  min-width: 260px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: linear-gradient(180deg, 
    rgba(248, 250, 255, 0.6) 0%,
    rgba(240, 248, 255, 0.4) 50%,
    rgba(245, 240, 255, 0.4) 100%);
  border-right: 1px solid rgba(99, 102, 241, 0.15);
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(99, 102, 241, 0.15);
    padding: 16px;
    max-height: 40vh;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(99, 102, 241, 0.5);
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 50;
  position: relative;
  pointer-events: auto;
`;

// Removed unused internal styled components (BubbleGrid, Bubble, Avatar, Meta, Name, NameWithCount, MessageCount, Badge, LastMessagePreview, MessageTime, Footer, ChatArea, EmptyState, EmptyIcon)
// to clear compilation warnings. Using external components instead.
const NewChatBtn = styled.button`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(124, 58, 237, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  pointer-events: auto;
  z-index: 51;

  &:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(124, 58, 237, 0.15));
    border-color: rgba(99, 102, 241, 0.5);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #475569;
  font-size: 13px;
`;

const SmallBtn = styled.button`
  background: transparent;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 18px;
  color: #64748b;
  transition: color 0.2s;
  pointer-events: auto;
  z-index: 51;

  &:hover {
    color: #0f172a;
  }
`;



const ConversationListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin: -8px;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(99, 102, 241, 0.5);
    }
  }
`;

const ConversationItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background-color: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ConversationAvatar = styled.div`
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  font-size: 18px;
  overflow: hidden;
  position: relative;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarText = styled.span`
  font-weight: 700;
  color: white;
`;

const ConversationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const ConversationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ConversationName = styled.div`
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConversationTime = styled.span`
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  font-weight: 500;
`;

const ConversationPreview = styled.div`
  font-size: 13px;
  color: ${props => props.isFromMe ? '#6366f1' : '#64748b'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  gap: 4px;
`;

const UnreadBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
`;

const EmptyConversations = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #94a3b8;
  opacity: 0.8;
  min-height: 300px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  margin: 16px;
`;

const DebugInfo = styled.div`
  font-size: 12px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  text-align: center;
`;

const SenderLabel = styled.span`
  font-weight: 600;
  color: #6366f1;
`;

// ===========================
// Modal Styled Components
// ===========================
const ModalBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.3) 0%,
    rgba(168, 85, 247, 0.25) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px) saturate(1.1);
  pointer-events: auto;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 250, 255, 0.98) 50%,
    rgba(245, 240, 255, 0.98) 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 60px rgba(99, 102, 241, 0.3),
    0 0 1px rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(20px);
  pointer-events: auto;

  @media (max-width: 768px) {
    width: 95%;
    max-height: 80vh;
    border-radius: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  background: linear-gradient(90deg, 
    rgba(99, 102, 241, 0.05) 0%,
    rgba(168, 85, 247, 0.05) 100%);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
`;

const CloseModalBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;

  &:hover {
    color: #0f172a;
  }
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  background: linear-gradient(90deg, 
    rgba(248, 250, 255, 0.5) 0%,
    rgba(240, 248, 255, 0.5) 100%);
  position: relative;
`;

const SearchIcon = styled.div`
  font-size: 18px;
  color: #94a3b8;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 255, 0.9) 100%);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  border: 1px solid rgba(99, 102, 241, 0.15);
  pointer-events: auto;

  &::placeholder {
    color: #cbd5e1;
  }

  &:focus {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 1) 0%,
      rgba(248, 250, 255, 1) 100%);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
  }
`;

const SearchResultsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 200px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(99, 102, 241, 0.5);
    }
  }
`;

const UserResult = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    background: linear-gradient(135deg, 
      rgba(99, 102, 241, 0.12) 0%,
      rgba(168, 85, 247, 0.08) 100%);
    border-color: rgba(99, 102, 241, 0.15);
  }

  &:active {
    background: linear-gradient(135deg, 
      rgba(99, 102, 241, 0.18) 0%,
      rgba(168, 85, 247, 0.12) 100%);
  }
`;

const UserResultAvatar = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  font-size: 14px;
`;

const UserResultInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const UserResultName = styled.div`
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserResultEmail = styled.div`
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArrowIcon = styled.div`
  color: #cbd5e1;
  font-size: 16px;
  transition: all 0.2s;

  ${UserResult}:hover & {
    color: #6366f1;
    transform: translateX(4px);
  }
`;

const LoadingText = styled.div`
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
`;

const EmptySearchText = styled.div`
  padding: 20px;
  text-align: center;
  color: #cbd5e1;
  font-size: 14px;
`;

