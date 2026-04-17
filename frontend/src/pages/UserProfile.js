import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import styled from 'styled-components';
import FollowButton from '../components/FollowButton';
import { formatDistanceToNow } from 'date-fns';
import {
  HeartFill,
  ChatFill,
  ShieldLockFill,
  PersonPlusFill,
  EnvelopeFill,
  ArrowLeft
} from 'react-bootstrap-icons';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canViewPosts, setCanViewPosts] = useState(false);
  const [followStatus, setFollowStatus] = useState('none');
  const [showPrivateModal, setShowPrivateModal] = useState(false);

  const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Check if current user can view posts
  const checkViewAccess = useCallback((targetUser) => {
    if (!targetUser) return false;

    // Public accounts: anyone can view
    if (!targetUser.isPrivate) return true;

    // Private accounts: only followers can view
    if (targetUser.followers.includes(currentUserId)) return true;

    // Users can always view their own content
    if (currentUserId === userId) return true;

    return false;
  }, [currentUserId, userId]);

  // Get follow status
  const getFollowStatus = useCallback((targetUser) => {
    if (!targetUser || !currentUserId) return 'none';

    if (targetUser.followers?.includes(currentUserId)) {
      return 'following';
    }

    if (targetUser.followRequests?.includes(currentUserId)) {
      return 'requested';
    }

    return 'none';
  }, [currentUserId]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching user profile for userId:', userId);
      const response = await axios.get(`${API_BASE}/users/${userId}/profile`);
      console.log('Profile response:', response.data);

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setCanViewPosts(checkViewAccess(userData));
        setFollowStatus(getFollowStatus(userData));
      }
    } catch (err) {
      console.error('Profile fetch error:', err.response?.data);
      console.error('Full error:', err);
      console.error('Error URL:', err.config?.url);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, API_BASE, checkViewAccess, getFollowStatus]);

  // Fetch user posts
  const fetchUserPosts = useCallback(async () => {
    if (!canViewPosts || !token) return;

    try {
      console.log('Fetching user posts for userId:', userId);
      const response = await axios.get(`${API_BASE}/liner/userposts/${userId}`, {
        headers: { 'auth-token': token }
      });
      console.log('Posts response:', response.data);

      if (response.data.success) {
        setPosts(response.data.liners);
      }
    } catch (err) {
      console.error('Posts fetch error:', err.response?.data);
      console.error('Full posts error:', err);
      console.error('Posts error URL:', err.config?.url);
      console.error('Posts error status:', err.response?.status);
      // Handle content filtering errors gracefully
      if (err.response?.data?.message?.includes('inappropriate language')) {
        console.warn('Content filter triggered - this might be a false positive');
        console.warn('This error is coming from the posts fetch, not profile fetch');
      }
    }
  }, [userId, canViewPosts, token, API_BASE]);

  // Handle follow status change
  const handleFollowChange = useCallback((newStatus) => {
    setFollowStatus(newStatus);

    // If now following, refresh user data to update follower count
    if (newStatus === 'following') {
      fetchUserProfile();
    }
  }, [fetchUserProfile]);

  // Handle message button click - check privacy
  const handleMessageClick = useCallback(() => {
    // Allow messaging if account is public OR user is following
    if (!user?.isPrivate || followStatus === 'following') {
      navigate('/messages');
    } else {
      // Show modal for private accounts
      setShowPrivateModal(true);
    }
  }, [user?.isPrivate, followStatus, navigate]);

  // Handle follow request acceptance - commented out as it's not currently used
  // const handleRequestAccepted = useCallback(() => {
  //   setCanViewPosts(true);
  //   fetchUserPosts();
  // }, [fetchUserPosts]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, fetchUserProfile]);

  useEffect(() => {
    if (canViewPosts) {
      fetchUserPosts();
    }
  }, [canViewPosts, fetchUserPosts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">User not found</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userId;

  return (
    <ProfileWrapper>

      <div className="max-w-4xl mx-auto px-4 py-32 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-12"
        >
          <GlassHeader>
            <HeaderGlow />
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <AvatarRing
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                  <UserName>{user.name}</UserName>
                  {user.isPrivate && (
                    <Badge variant="private">
                      <ShieldLockFill size={14} />
                      Private
                    </Badge>
                  )}
                </div>

                <UserEmail>{user.email}</UserEmail>

                {/* Stats Container */}
                <div className="flex justify-center md:justify-start gap-12 mt-8 mb-8">
                  <StatItem>
                    <StatValue>{user.followers?.length || 0}</StatValue>
                    <StatLabel>Followers</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{user.following?.length || 0}</StatValue>
                    <StatLabel>Following</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{user.postCount || 0}</StatValue>
                    <StatLabel>Posts</StatLabel>
                  </StatItem>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {!isOwnProfile && (
                    <FollowButton
                      targetUserId={userId}
                      currentUserId={currentUserId}
                      isPrivate={user.isPrivate}
                      initialFollowStatus={followStatus}
                      onFollowChange={handleFollowChange}
                    />
                  )}
                  {isOwnProfile && (
                    <EditProfileBtn onClick={() => navigate('/profile')}>
                      <PersonPlusFill />
                      Edit Profile
                    </EditProfileBtn>
                  )}
                  {!isOwnProfile && (
                    <MessageBtn onClick={handleMessageClick}>
                      <EnvelopeFill />
                      Message
                    </MessageBtn>
                  )}
                </div>
              </div>
            </div>
          </GlassHeader>
        </motion.div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {!canViewPosts ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12"
            >
              <LockedContent>
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-inner">
                  <ShieldLockFill className="text-indigo-400" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">This Account is Private</h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                  Follow {user.name} to see their posts and updates.
                  Join the Liner community to connect and share moments with your network.
                </p>
                {followStatus !== 'requested' && !isOwnProfile && (
                  <FollowButton
                    targetUserId={userId}
                    currentUserId={currentUserId}
                    isPrivate={user.isPrivate}
                    initialFollowStatus={followStatus}
                    onFollowChange={handleFollowChange}
                  />
                )}
                {followStatus === 'requested' && (
                  <div className="text-indigo-400 font-semibold py-3 px-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-block">
                    ✓ Follow request sent!
                  </div>
                )}
              </LockedContent>
            </motion.div>
          ) : (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  Posts
                  <PostCount>{posts.length}</PostCount>
                </h2>
              </div>

              {posts.length === 0 ? (
                <EmptyState>
                  <div className="text-7xl mb-6">📸</div>
                  <h3 className="text-2xl font-semibold text-white mb-3">No posts yet</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    {isOwnProfile ? "You haven't shared anything yet. Start your journey today!" : `${user.name} hasn't posted anything yet.`}
                  </p>
                </EmptyState>
              ) : (
                <div className="grid gap-8">
                  {posts.map((post) => (
                    <ProfilePostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Private Account Modal */}
      <AnimatePresence>
        {showPrivateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPrivateModal(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Private Account
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  This is a private account. You can only send messages after your follow request is accepted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPrivateModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProfileWrapper>
  );
};

// --- Post Card Component ---

const ProfilePostCard = ({ post }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative group h-full"
    >
      <PostGlassCard>
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            {post.user?.profilePicture ? (
              <img
                src={post.user.profilePicture}
                alt={post.user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-white font-bold border border-white/10">
                {post.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-lg truncate">{post.user?.name || 'User'}</h4>
            <span className="text-gray-400 text-sm">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="text-gray-200 text-lg mb-6 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {post.image && (
          <div className="rounded-2xl overflow-hidden mb-6 border border-white/5 shadow-2xl">
            <img
              src={Array.isArray(post.image) ? post.image[0] : post.image}
              alt="Post"
              className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        <div className="flex items-center gap-8 border-t border-white/5 pt-6">
          <div className="flex items-center gap-3 text-indigo-400 group/item cursor-pointer">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/10 group-hover/item:bg-red-500/20 group-hover/item:text-red-400 transition-all">
              <HeartFill size={20} />
            </div>
            <span className="font-bold text-lg">{post.likes?.length || 0}</span>
          </div>
          <div className="flex items-center gap-3 text-emerald-400 group/item cursor-pointer">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 group-hover/item:bg-emerald-500/20 transition-all">
              <ChatFill size={20} />
            </div>
            <span className="font-bold text-lg">{post.comments?.length || 0}</span>
          </div>
        </div>
      </PostGlassCard>
    </motion.div>
  );
};

// --- Styled Components ---

const ProfileWrapper = styled.div`
  min-height: 100vh;
  background: transparent;
  position: relative;
  overflow-x: hidden;
  pointer-events: auto;
`;

const GlassHeader = styled.div`
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(40px) saturate(2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  padding: 48px;
  overflow: hidden;
  position: relative;
  pointer-events: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const HeaderGlow = styled.div`
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  filter: blur(60px);
`;

const AvatarRing = styled(motion.div)`
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px dashed rgba(99, 102, 241, 0.4);
`;

const UserName = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #fff 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
`;

const UserEmail = styled.p`
  color: #94a3b8;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #6366f1;
  margin-top: 4px;
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
`;

const EditProfileBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  padding: 12px 28px;
  border-radius: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(99, 102, 241, 0.5);
  }

  &:active {
    transform: translateY(0px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MessageBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 12px 28px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LockedContent = styled.div`
  background: rgba(30, 41, 59, 0.3);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 40px;
  padding: 80px 40px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
`;

const PostCount = styled.span`
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: #6366f1;
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 1rem;
  margin-left: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 30px;
`;

const PostGlassCard = styled.div`
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 30px;
  padding: 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  }
`;

export default UserProfile;
