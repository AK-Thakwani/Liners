import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

import {
  FaPaperPlane,
  FaTimes,
  FaCircle,
  FaCheck,
  FaCheckDouble,
  FaPaperclip,
  FaSmile,
  FaPlay
} from 'react-icons/fa';
import { useChat } from '../contexts/ChatContext';
import { UserContext } from '../contexts/UserContext';
import { useContext } from 'react';

const Chat = ({ isOpen, onClose, selectedUser }) => {
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Media State
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState('text'); // 'image' | 'video' | 'text'
  const [isUploading, setIsUploading] = useState(false);

  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    currentChat,
    messages,
    isConnected,
    sendMessage,
    messagesEndRef,
    scrollToBottom,
    fetchConversations
  } = useChat();

  const { user } = useContext(UserContext);

  useEffect(() => {
    if (isOpen && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [isOpen, currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Clean up object URLs to avoid leaks
  useEffect(() => {
    return () => {
      if (previewUrl && mediaFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, mediaFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType('file');
      }
    }
  };

  const removeAttachment = () => {
    setMediaFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setMediaType('text');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onEmojiClick = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (messageInputRef.current) messageInputRef.current.focus();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !mediaFile) || !currentChat || isUploading) return;

    let finalMediaUrl = '';
    let finalMediaType = 'text';

    // 1. Upload File if present
    if (mediaFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('media', mediaFile);

        const token = localStorage.getItem('token');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/messages/upload`, {
          method: 'POST',
          headers: { 'auth-token': token },
          body: formData
        });

        const data = await response.json();
        if (data.success) {
          finalMediaUrl = data.mediaUrl;
          finalMediaType = data.mediaType.includes('video') ? 'video' : 'image';
        } else {
          console.error('Upload failed:', data.message);
          alert('Failed to upload file');
          setIsUploading(false);
          return;
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading file');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // 2. Send Message
    sendMessage(currentChat._id, messageText, finalMediaUrl, finalMediaType);

    // Reset UI
    setMessageText('');
    removeAttachment();

    // Refresh conversation list after sending
    setTimeout(() => {
      fetchConversations();
    }, 150);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageText.trim() || mediaFile) {
        handleSendMessage(e);
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👄', '💋', '👅'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ChatOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >


          <ChatContainer
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <ChatHeader>
              <UserInfo>
                <UserAvatar>
                  <img
                    src={currentChat?.profilePicture || selectedUser?.profilePicture || '/default-avatar.png'}
                    alt={currentChat?.name || selectedUser?.name}
                    onError={(e) => e.target.src = '/default-avatar.png'}
                  />
                  <OnlineIndicator isOnline={isConnected}>
                    <FaCircle />
                  </OnlineIndicator>
                </UserAvatar>
                <div>
                  <UserName>{currentChat?.name || selectedUser?.name || 'Select a conversation'}</UserName>
                  <UserStatus>
                    {isConnected ? 'Online' : 'Offline'}
                  </UserStatus>
                </div>
              </UserInfo>
              <CloseButton onClick={onClose}>
                <FaTimes />
              </CloseButton>
            </ChatHeader>

            {/* Messages Area */}
            <MessagesContainer>
              {
                messages.length === 0 ? (
                  <EmptyState>
                    <EmptyIllustration>💬</EmptyIllustration>
                    <div>No messages yet</div>
                    <div>Send a message to start the conversation</div>
                  </EmptyState>
                ) : (
                  <MessagesList>
                    {messages.map((message, index) => {
                      const isOwnMessage = message.sender._id === user?._id;
                      const showDate = index === 0 ||
                        formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
                      const prev = messages[index - 1];
                      const next = messages[index + 1];
                      const isFirstOfGroup = !prev || prev.sender._id !== message.sender._id ||
                        formatDate(prev.timestamp) !== formatDate(message.timestamp);
                      const isLastOfGroup = !next || next.sender._id !== message.sender._id ||
                        formatDate(next.timestamp) !== formatDate(message.timestamp);

                      return (
                        <React.Fragment key={message._id}>
                          {showDate && (
                            <DateSeparator data-date={formatDate(message.timestamp)} />
                          )}
                          <MessageBubble
                            isOwn={isOwnMessage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            {!isOwnMessage && isFirstOfGroup && (
                              <MessageAvatar>
                                <img
                                  src={message.sender.profilePicture || '/default-avatar.png'}
                                  alt={message.sender.name}
                                  onError={(e) => e.target.src = '/default-avatar.png'}
                                />
                              </MessageAvatar>
                            )}
                            <MessageContent isOwn={isOwnMessage}>
                              {/* Media Rendering */}
                              {message.mediaUrl && (
                                <MediaContent>
                                  {message.mediaType === 'video' ? (
                                    <video controls src={message.mediaUrl} />
                                  ) : (
                                    <img
                                      src={message.mediaUrl}
                                      alt="Shared media"
                                      onClick={() => window.open(message.mediaUrl, '_blank')}
                                      style={{ cursor: 'zoom-in' }}
                                    />
                                  )}
                                </MediaContent>
                              )}

                              {message.text && (
                                <MessageText isOwn={isOwnMessage} isFirst={isFirstOfGroup} isLast={isLastOfGroup}>
                                  {message.text}
                                </MessageText>
                              )}

                              {isLastOfGroup && (
                                <MessageTime isOwn={isOwnMessage}>
                                  {formatTime(message.timestamp)}
                                  {isOwnMessage && (
                                    <MessageStatus isRead={message.isRead}>
                                      {message.isRead ? <FaCheckDouble /> : <FaCheck />}
                                    </MessageStatus>
                                  )}
                                </MessageTime>
                              )}
                            </MessageContent>
                          </MessageBubble>
                        </React.Fragment>
                      );
                    })}
                    {/* Typing indicator */}

                    <div ref={messagesEndRef} />
                  </MessagesList>
                )
              }
            </MessagesContainer>

            {/* Message Input */}
            {
              currentChat && (
                <MessageInputContainer>
                  {/* Attachment Preview */}
                  <AnimatePresence>
                    {mediaFile && (
                      <AttachmentPreview
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <RemoveAttachmentBtn onClick={removeAttachment}>✕</RemoveAttachmentBtn>
                        {mediaType === 'image' ? (
                          <PreviewThumbnail src={previewUrl} />
                        ) : (
                          <VideoPreviewIcon><FaPlay /></VideoPreviewIcon>
                        )}
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '600' }}>{mediaFile.name}</div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>{(mediaFile.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </AttachmentPreview>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSendMessage}>
                    <MessageInputWrapper>
                      {/* Hidden File Input */}
                      <input
                        id="message-file-input"
                        name="message-file"
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                      />

                      <ToolbarButton
                        type="button"
                        aria-label="Attach"
                        title="Attach file"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaPaperclip />
                      </ToolbarButton>

                      <ToolbarButton
                        type="button"
                        aria-label="Emoji"
                        title="Insert emoji"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <FaSmile />
                      </ToolbarButton>

                      <InputTextarea
                        id="message-textarea"
                        name="message-text"
                        ref={messageInputRef}
                        rows={1}
                        placeholder={isUploading ? "Uploading..." : "Type a message..."}
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={!isConnected || isUploading}
                      />

                      <SendButton
                        type="submit"
                        disabled={(!messageText.trim() && !mediaFile) || !isConnected || isUploading}
                        aria-label="Send"
                        title="Send"
                      >
                        {isUploading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            ⌛
                          </motion.div>
                        ) : (
                          <FaPaperPlane />
                        )}
                      </SendButton>
                    </MessageInputWrapper>
                  </form>

                  {/* Emoji Picker Popover */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <EmojiPickerContainer
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#64748b' }}>Select Emoji</span>
                          <FaTimes style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowEmojiPicker(false)} />
                        </div>
                        <EmojiGrid>
                          {emojis.map((emoji) => (
                            <EmojiBtn key={emoji} onClick={() => onEmojiClick(emoji)}>
                              {emoji}
                            </EmojiBtn>
                          ))}
                        </EmojiGrid>
                      </EmojiPickerContainer>
                    )}
                  </AnimatePresence>
                </MessageInputContainer>
              )}
          </ChatContainer>
        </ChatOverlay>
      )}
    </AnimatePresence>
  );
};

export default Chat;


// --- Styled Components ---

// Animations
const float = keyframes`
      0% {transform: translateY(0px); }
      50% {transform: translateY(-5px); }
      100% {transform: translateY(0px); }
      `;



// Chat Overlay
const ChatOverlay = styled.div`
      position: fixed;
      inset: 0;
      z-index: 1050;
      display: flex;
      justify-content: flex-end;
      overflow: hidden;

      @media (max-width: 768px) {
        position: fixed;
      bottom: 0;
      right: 0;
      top: auto;
      left: auto;
      width: auto;
      height: auto;
      background: none;
      backdrop-filter: none;
      justify-content: flex-end;
  }
      `;

// Chat Container
const ChatContainer = styled(motion.div)`
      width: 60vw;
      min-width: 500px;
      max-width: 900px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      /* Premium Glassmorphism */
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(40px) saturate(180%);
      -webkit-backdrop-filter: blur(40px) saturate(180%);
      border-left: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow:
      -10px 0 50px rgba(0, 0, 0, 0.1),
      inset 0 0 100px rgba(255, 255, 255, 0.1);
      overflow: hidden;
      position: relative;

      &::before {
        content: '';
      position: absolute;
      inset: 0;
      background:
      radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.05) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
  }

      @media (max-width: 1200px) {
        width: 55vw;
      min-width: 450px;
  }

      @media (max-width: 768px) {
        position: fixed;
      bottom: 0;
      right: 0;
      top: auto;
      left: auto;
      width: 100%;
      height: 90vh;
      max-width: 100%;
      min-width: auto;
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.15);
  }
      `;

// Header
const ChatHeader = styled.div`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(99, 102, 241, 0.1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      z-index: 10;
      `;

const UserInfo = styled.div`
      display: flex;
      align-items: center;
      gap: 16px;
      `;

const UserAvatar = styled.div`
      position: relative;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
  }

      img {
        width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fff;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
  }
      `;

const OnlineIndicator = styled.div`
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #fff;
      background: ${props => props.isOnline ? '#10b981' : '#cbd5e1'};
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
      `;

const UserName = styled.div`
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.025em;
      `;

const UserStatus = styled.div`
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
      margin-top: 2px;
      `;

// Close Button
const CloseButton = styled.button`
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      color: #6366f1;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: #6366f1;
      color: white;
      transform: rotate(90deg);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

      &:active {
        transform: rotate(90deg) scale(0.95);
  }
      `;

// Messages
const MessagesContainer = styled.div`
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 16px;

      &::-webkit-scrollbar {
        width: 6px;
  }

      &::-webkit-scrollbar-track {
        background: transparent;
  }

      &::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.2);
      border-radius: 10px;

      &:hover {
        background: rgba(99, 102, 241, 0.4);
    }
  }
      `;

const EmptyState = styled.div`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: #94a3b8;
      animation: ${float} 3s ease-in-out infinite;

      div:first-child {
        font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #334155;
  }

      div:last-child {
        font-size: 15px;
      max-width: 250px;
      line-height: 1.5;
  }
      `;

const MessagesList = styled.div`
      display: flex;
      flex-direction: column;
      gap: 2px;
      `;

const EmptyIllustration = styled.div`
      font-size: 64px;
      margin-bottom: 24px;
      filter: drop-shadow(0 10px 20px rgba(99, 102, 241, 0.2));
      `;

const DateSeparator = styled.div`
      position: relative;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      margin: 24px 0;

      &::before {
        content: '';
      position: absolute;
      inset: 50% 0 auto 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent);
  }

      &::after {
        content: attr(data-date);
      background: rgba(255, 255, 255, 0.8);
      padding: 4px 16px;
      border-radius: 12px;
      position: relative;
      z-index: 2;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
      `;

const MessageBubble = styled(motion.div)`
      display: flex;
      gap: 12px;
      align-items: flex-end;
      flex-direction: ${props => props.isOwn ? 'row-reverse' : 'row'};
      justify-content: flex-start;
      margin-bottom: ${props => props.isLast ? '16px' : '4px'};
      padding: 0 8px;
      `;

const MessageAvatar = styled.div`
      flex-shrink: 0;

      img {
        width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
      border: 2px solid #fff;
  }
      `;

const MessageContent = styled.div`
      max-width: 75%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
      `;

const MessageText = styled.div`
      background: ${props => props.isOwn
    ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)'
    : 'rgba(255, 255, 255, 0.7)'};
      color: ${props => props.isOwn ? '#ffffff' : '#1e293b'};
      padding: 14px 20px;
      border-radius: 22px;
      border-bottom-${props => props.isOwn ? 'right' : 'left'}-radius: ${props => props.isLast ? '6px' : '22px'};
      font-size: 15.5px;
      font-weight: 500;
      line-height: 1.6;
      backdrop-filter: ${props => props.isOwn ? 'none' : 'blur(10px)'};
      box-shadow: ${props => props.isOwn
    ? '0 8px 25px rgba(99, 102, 241, 0.35), inset 0 2px 2px rgba(255, 255, 255, 0.2)'
    : '0 4px 15px rgba(0, 0, 0, 0.03), inset 0 0 0 1px rgba(255, 255, 255, 0.5)'};
      border: ${props => props.isOwn ? 'none' : '1px solid rgba(255, 255, 255, 0.5)'};
      position: relative;
      transition: transform 0.2s;
      word-break: break-word;
      white-space: pre-wrap;

      &:hover {
        transform: translateY(-1px);
      box-shadow: ${props => props.isOwn
    ? '0 6px 20px rgba(99, 102, 241, 0.4)'
    : '0 4px 8px rgba(0, 0, 0, 0.08)'};
  }
      `;

const MessageTime = styled.div`
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
      gap: 4px;
      font-weight: 500;
      padding: 0 4px;
      opacity: 0.8;
      `;

const MessageStatus = styled.span`
      color: ${props => props.isRead ? '#6366f1' : '#cbd5e1'};
      font-size: 11px;
      display: flex;
      `;

// Input
const MessageInputContainer = styled.div`
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(99, 102, 241, 0.1);
      position: relative;
      z-index: 20;
      `;

const MessageInputWrapper = styled.div`
      display: flex;
      align-items: flex-end;
      gap: 12px;
      background: rgba(255, 255, 255, 0.8);
      padding: 12px 16px;
      border-radius: 24px;
      box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.05),
      inset 0 0 0 1px rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(99, 102, 241, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:focus-within {
        box-shadow:
      0 15px 40px rgba(99, 102, 241, 0.2),
      inset 0 0 0 1px rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-3px);
      background: #ffffff;
  }
      `;

const InputTextarea = styled.textarea`
      flex: 1;
      border: none;
      background: transparent;
      resize: none;
      padding: 8px 4px;
      max-height: 120px;
      font-family: inherit;
      font-size: 15px;
      line-height: 1.5;
      color: #1e293b;

      &:focus {
        outline: none;
  }

      &::placeholder {
        color: #94a3b8;
  }
      `;

const SendButton = styled.button`
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border: none;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      flex-shrink: 0;

      &:hover:not(:disabled) {
        transform: scale(1.1) rotate(-10deg);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }

      &:active:not(:disabled) {
        transform: scale(0.95);
  }

      &:disabled {
        background: #e2e8f0;
      box-shadow: none;
      cursor: not-allowed;
  }
      `;

const ToolbarButton = styled.button`
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: #64748b;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.2s;
      font-size: 18px;
      flex-shrink: 0;

      &:hover {
        background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
      transform: scale(1.1);
  }

      &:active {
        transform: scale(0.95);
  }
      `;

// Media & Emoji Components
const EmojiPickerContainer = styled(motion.div)`
      position: absolute;
      bottom: 85px;
      left: 24px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(25px);
      border-radius: 20px;
      padding: 16px;
      box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.5) inset;
      border: 1px solid rgba(255, 255, 255, 0.2);
      width: 340px;
      z-index: 50;
      `;

const EmojiGrid = styled.div`
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
      max-height: 220px;
      overflow-y: auto;
      padding-right: 4px;

      &::-webkit-scrollbar {
        width: 4px;
  }

      &::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.05);
  }

      &::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.2);
      border-radius: 10px;
  }
      `;

const EmojiBtn = styled.button`
      background: transparent;
      border: none;
      font-size: 22px;
      padding: 6px;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(255, 255, 255, 0.8);
      transform: scale(1.35);
      z-index: 2;
  }
      `;

const AttachmentPreview = styled(motion.div)`
      margin-bottom: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      border: 1px dashed rgba(99, 102, 241, 0.3);
      backdrop-filter: blur(5px);
      `;

const PreviewThumbnail = styled.img`
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      `;

const VideoPreviewIcon = styled.div`
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b, #334155);
      color: white;
      border-radius: 10px;
      font-size: 24px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      `;

const RemoveAttachmentBtn = styled.button`
      position: absolute;
      top: -10px;
      right: -10px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.15);
  }
      `;

const MediaContent = styled.div`
      margin-top: 8px;
      border-radius: 16px;
      overflow: hidden;
      max-width: 100%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      position: relative;

      img, video {
        display: block;
      max-width: 100%;
      max-height: 300px;
      object-fit: cover;
  }
      `;

