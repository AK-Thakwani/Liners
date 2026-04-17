import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaShieldAlt, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

const ContentModeration = () => {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFlaggedPosts();
  }, []);

  const fetchFlaggedPosts = async () => {
    try {
      const token = window.localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/liner/flagged`, {
        headers: { 'auth-token': token }
      });
      setFlaggedPosts(response.data.liners || []);
    } catch (error) {
      console.error('Error fetching flagged posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (postId, action) => {
    try {
      const token = window.localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.put(`${API_URL}/liner/moderate/${postId}`,
        { action },
        { headers: { 'auth-token': token } }
      );

      fetchFlaggedPosts();
      setShowModal(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error moderating post:', error);
    }
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  if (loading) {
    return (
      <PageWrapper className="flex items-center justify-center">
        <LoadingContainer className="relative z-10">Loading flagged content...</LoadingContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container className="relative z-10 py-32">
        <Header>
          <div className="flex justify-center mb-6">
            <IconBox>
              <FaShieldAlt size={32} />
            </IconBox>
          </div>
          <h2 className="text-4xl font-black text-white mb-2">Content Moderation</h2>
          <p className="text-gray-400">Review and moderate flagged posts across the platform</p>
        </Header>

        {flaggedPosts.length === 0 ? (
          <EmptyState>
            <FaShieldAlt size={48} />
            <h3>No flagged content</h3>
            <p>All posts are currently approved and within guidelines.</p>
          </EmptyState>
        ) : (
          <PostsList>
            {flaggedPosts.map((post) => (
              <PostCard key={post._id}>
                <PostHeader>
                  <UserInfo>
                    <img
                      src={post.user?.profilePicture || '/default-avatar.png'}
                      alt={post.user?.name}
                      onError={(e) => e.target.src = '/default-avatar.png'}
                    />
                    <div>
                      <h4>{post.user?.name || 'Unknown User'}</h4>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </UserInfo>
                  <StatusBadge status={post.moderationStatus}>
                    {post.moderationStatus}
                  </StatusBadge>
                </PostHeader>

                <PostContent>
                  <p>{post.content}</p>
                  {post.image && (
                    <img src={post.image} alt="Post content" />
                  )}
                  {post.tag && (
                    <Tag>#{post.tag}</Tag>
                  )}
                </PostContent>

                <ModerationFlags>
                  <h5>Flags:</h5>
                  {post.moderationFlags.map((flag, index) => (
                    <FlagItem key={index}>
                      <span>{flag.reason}</span>
                      <span className="confidence">({Math.round(flag.confidence * 100)}%)</span>
                    </FlagItem>
                  ))}
                </ModerationFlags>

                <ActionButtons>
                  <Button variant="approve" onClick={() => handleModerationAction(post._id, 'approve')}>
                    <FaCheck /> Approve
                  </Button>
                  <Button variant="reject" onClick={() => handleModerationAction(post._id, 'reject')}>
                    <FaTimes /> Reject
                  </Button>
                  <Button variant="view" onClick={() => openModal(post)}>
                    <FaEye /> View Details
                  </Button>
                </ActionButtons>
              </PostCard>
            ))}
          </PostsList>
        )}

        {showModal && selectedPost && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3>Post Details</h3>
                <button onClick={() => setShowModal(false)}>×</button>
              </ModalHeader>
              <ModalBody>
                <UserInfo>
                  <img
                    src={selectedPost.user?.profilePicture || '/default-avatar.png'}
                    alt={selectedPost.user?.name}
                    onError={(e) => e.target.src = '/default-avatar.png'}
                  />
                  <div>
                    <h4>{selectedPost.user?.name || 'Unknown User'}</h4>
                    <span>{new Date(selectedPost.createdAt).toLocaleString()}</span>
                  </div>
                </UserInfo>

                <PostContent>
                  <p>{selectedPost.content}</p>
                  {selectedPost.image && (
                    <img src={selectedPost.image} alt="Post content" />
                  )}
                  {selectedPost.tag && (
                    <Tag>#{selectedPost.tag}</Tag>
                  )}
                </PostContent>

                <ModerationFlags>
                  <h5>Moderation Flags:</h5>
                  {selectedPost.moderationFlags.map((flag, index) => (
                    <FlagItem key={index}>
                      <span>{flag.reason}</span>
                      <span className="confidence">Confidence: {Math.round(flag.confidence * 100)}%</span>
                      <span className="date">Flagged: {new Date(flag.flaggedAt).toLocaleString()}</span>
                    </FlagItem>
                  ))}
                </ModerationFlags>

                <ModalActions>
                  <Button variant="approve" onClick={() => handleModerationAction(selectedPost._id, 'approve')}>
                    <FaCheck /> Approve Post
                  </Button>
                  <Button variant="reject" onClick={() => handleModerationAction(selectedPost._id, 'reject')}>
                    <FaTimes /> Reject Post
                  </Button>
                  <Button variant="hide" onClick={() => handleModerationAction(selectedPost._id, 'hide')}>
                    <FaEyeSlash /> Hide Post
                  </Button>
                </ModalActions>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0f172a;
  position: relative;
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const IconBox = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #94a3b8;
`;

const EmptyState = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  text-align: center;
  padding: 80px 40px;
  
  svg {
    color: #10b981;
    margin-bottom: 24px;
    opacity: 0.5;
  }
  
  h3 {
    color: #fff;
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 12px;
  }
  
  p {
    color: #94a3b8;
    font-size: 1.1rem;
  }
`;

const PostsList = styled.div`
  display: grid;
  gap: 24px;
`;

const PostCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 30px;
  transition: all 0.3s ease;
  border-left: 4px solid #ef4444;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }
  
  h4 {
    margin: 0;
    color: #fff;
    font-weight: 700;
  }
  
  span {
    color: #64748b;
    font-size: 14px;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: ${props => {
    switch (props.status) {
      case 'flagged': return 'rgba(245, 158, 11, 0.15)';
      case 'pending': return 'rgba(59, 130, 246, 0.15)';
      case 'rejected': return 'rgba(239, 68, 68, 0.15)';
      default: return 'rgba(148, 163, 184, 0.15)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'flagged': return '#f59e0b';
      case 'pending': return '#3b82f6';
      case 'rejected': return '#ef4444';
      default: return '#94a3b8';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'flagged': return 'rgba(245, 158, 11, 0.2)';
      case 'pending': return 'rgba(59, 130, 246, 0.2)';
      case 'rejected': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(148, 163, 184, 0.2)';
    }
  }};
`;

const PostContent = styled.div`
  margin-bottom: 24px;
  
  p {
    margin-bottom: 16px;
    line-height: 1.6;
    color: #e2e8f0;
    font-size: 1.1rem;
  }
  
  img {
    max-width: 100%;
    border-radius: 16px;
    margin-top: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

const Tag = styled.span`
  display: inline-block;
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 10px;
`;

const ModerationFlags = styled.div`
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  
  h5 {
    margin: 0 0 12px 0;
    color: #fca5a5;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const FlagItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  
  span {
    color: #fecaca;
  }

  .confidence {
    color: #ef4444;
    font-weight: 900;
  }
  
  .date {
    color: #94a3b8;
    font-size: 12px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'approve':
        return `
          background: #10b981;
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          &:hover { 
            background: #059669;
            transform: translateY(-2px);
          }
        `;
      case 'reject':
        return `
          background: #ef4444;
          color: white;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          &:hover { 
            background: #dc2626;
            transform: translateY(-2px);
          }
        `;
      case 'view':
        return `
          background: rgba(255, 255, 255, 0.1);
          color: white;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          &:hover { 
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
          }
        `;
      case 'hide':
        return `
          background: #475569;
          color: white;
          &:hover { background: #334155; }
        `;
      default:
        return `
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          &:hover { background: rgba(255, 255, 255, 0.1); }
        `;
    }
  }}
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  h3 {
    margin: 0;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 800;
  }
  
  button {
    background: rgba(255, 255, 255, 0.05);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.2s;
    &:hover { 
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
`;

const ModalBody = styled.div`
  padding: 30px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 30px;
  flex-wrap: wrap;
`;

export default ContentModeration;
