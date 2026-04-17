import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from 'react-modal';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FollowButton from './FollowButton';

Modal.setAppElement('#root');

// Loading Skeleton Component with shimmer effect
const PostSkeleton = React.memo(() => (
  <div className="animate-pulse space-y-4 rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="flex gap-4 items-center">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
    <div className="w-full h-64 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex gap-6">
        <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  </div>
));

// Error Component
const ErrorMessage = React.memo(({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700"
  >
    <div className="text-red-600 dark:text-red-400 text-xl mb-2 font-semibold">⚠️ {message}</div>
    <div className="text-gray-600 dark:text-gray-400 text-sm mb-6">
      {message.includes('deploying') && <p>This usually takes 2-3 minutes. Check back shortly!</p>}
    </div>
    <button
      onClick={onRetry}
      className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 font-medium shadow-lg border-none cursor-pointer"
    >
      Try Again
    </button>
  </motion.div>
));

// Empty State Component
const EmptyState = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700"
  >
    <div className="text-gray-800 dark:text-gray-200 text-xl mb-2 font-semibold">No posts yet</div>
    <div className="text-gray-600 dark:text-gray-300 text-base">Be the first to share something amazing!</div>
  </motion.div>
));

// Floating Action Button with modern emerald
const FloatingActionButton = React.memo(({ onClick }) => (
  <motion.button
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-200 z-50"
    aria-label="Create new post"
  >
    <i className="bi bi-plus-lg"></i>
  </motion.button>
));

// Hashtag and Mention Detection with navigation handlers
const splitTextWithTags = (text) => {
  if (!text) return [];
  return text.split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
};

// Media Grid Component with enhanced styling
const MediaGrid = React.memo(({ media, onClick }) => {
  if (!media || media.length === 0) return null;

  if (media.length === 1) {
    return (
      <div className="px-6 pb-4">
        <img
          src={media[0]}
          alt="Post content"
          onClick={() => onClick(media[0])}
          className="w-full max-h-96 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          loading="lazy"
        />
      </div>
    );
  }

  if (media.length === 2) {
    return (
      <div className="px-6 pb-4 grid grid-cols-2 gap-2">
        {media.map((item, index) => (
          <img
            key={index}
            src={item}
            alt={`Post content ${index + 1}`}
            onClick={() => onClick(item)}
            className="w-full h-48 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            loading="lazy"
          />
        ))}
      </div>
    );
  }

  if (media.length === 3) {
    return (
      <div className="px-6 pb-4 grid grid-cols-2 gap-2">
        <img
          src={media[0]}
          alt="Post content 1"
          onClick={() => onClick(media[0])}
          className="w-full h-48 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg row-span-2"
          loading="lazy"
        />
        <img
          src={media[1]}
          alt="Post content 2"
          onClick={() => onClick(media[1])}
          className="w-full h-24 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          loading="lazy"
        />
        <img
          src={media[2]}
          alt="Post content 3"
          onClick={() => onClick(media[2])}
          className="w-full h-24 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          loading="lazy"
        />
      </div>
    );
  }

  if (media.length >= 4) {
    return (
      <div className="px-6 pb-4 grid grid-cols-2 gap-2">
        {media.slice(0, 4).map((item, index) => (
          <div key={index} className="relative">
            <img
              src={item}
              alt={`Post content ${index + 1}`}
              onClick={() => onClick(item)}
              className="w-full h-24 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              loading="lazy"
            />
            {index === 3 && media.length > 4 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                +{media.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
});

// Animated heart icon with water-fill effect
const WaterHeartIcon = ({ isFilled, idSuffix = '' }) => {
  const fillId = `heartFill${idSuffix}`;
  const maskId = `heartMask${idSuffix}`;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0">
      <defs>
        <linearGradient id={fillId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <path d="M12 21s-1.45-1.32-3.05-2.77C6.4 16.88 4 14.74 4 11.99 4 9.79 5.79 8 7.99 8c1.14 0 2.22.5 2.96 1.29L12 10.37l1.05-1.08C13.79 8.5 14.87 8 16.01 8 18.21 8 20 9.79 20 12c0 2.75-2.4 4.89-4.95 6.24C13.45 19.68 12 21 12 21z" fill="#fff" />
        </mask>
      </defs>
      {/* Outline */}
      <path d="M12 21s-1.45-1.32-3.05-2.77C6.4 16.88 4 14.74 4 11.99 4 9.79 5.79 8 7.99 8c1.14 0 2.22.5 2.96 1.29L12 10.37l1.05-1.08C13.79 8.5 14.87 8 16.01 8 18.21 8 20 9.79 20 12c0 2.75-2.4 4.89-4.95 6.24C13.45 19.68 12 21 12 21z"
        fill="none" stroke={isFilled ? '#fb7185' : 'currentColor'} strokeWidth="1.8" />
      {/* Water fill rectangle animated with framer-motion */}
      <g mask={`url(#${maskId})`}>
        <motion.rect x="3" width="18" height="24" fill={`url(#${fillId})`}
          initial={false}
          animate={{ y: isFilled ? 0 : 24 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </g>
    </svg>
  );
};

const PostList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [modalImg, setModalImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeLoading, setLikeLoading] = useState(new Set());
  const [commentLoading, setCommentLoading] = useState(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedComments, setExpandedComments] = useState(new Set());

  const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}')?._id;
  const observerInstance = useRef(null);
  const lastPostElementRef = useCallback((node) => {
    if (observerInstance.current) observerInstance.current.disconnect();
    if (node) {
      observerInstance.current = new IntersectionObserver(
        debounce((entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            setPage(prev => prev + 1);
          }
        }, 300),
        { threshold: 0.1 }
      );
      observerInstance.current.observe(node);
    }
  }, [hasMore, loading]);
  const containerRef = useRef(null);

  // Memoized API base URL
  const API_BASE = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5000/api', []);

  console.log('PostList mounted, API_BASE:', API_BASE);
  console.log('userId:', userId);

  // Render content with clickable hashtags and mentions
  const renderProcessedText = useCallback((text) => {
    const parts = splitTextWithTags(text || '');
    return parts.map((part, index) => {
      if (typeof part === 'string' && part.startsWith('#')) {
        const tag = part.substring(1);
        return (
          <span
            key={index}
            onClick={() => navigate(`/tags/${encodeURIComponent(tag)}`)}
            className="text-violet-700 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-200 cursor-pointer font-medium transition-colors"
          >
            {part}
          </span>
        );
      }
      if (typeof part === 'string' && part.startsWith('@')) {
        const handle = part.substring(1);
        return (
          <span
            key={index}
            onClick={() => navigate(`/user/handle/${encodeURIComponent(handle)}`)}
            className="text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200 cursor-pointer font-medium transition-colors"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [navigate]);

  // Toggle comment section visibility
  const toggleComments = useCallback((postId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  // Pull to refresh functionality - commented out as it's not currently used
  // const handleRefresh = useCallback(async () => {
  //   setRefreshing(true);
  //   try {
  //     await fetchPosts(1, false);
  //   } finally {
  //     setRefreshing(false);
  //   }
  // }, [fetchPosts]);

  // (Replaced by callback ref lastPostElementRef)

  // Fetch posts with pagination
  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      console.warn('No authentication token found');
      setError('Please log in to view posts');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = `${API_BASE}/liner/allposts?page=${pageNum}&limit=10`;
      console.log('Fetching posts from:', apiUrl);
      console.log('Token being sent:', storedToken.substring(0, 20) + '...');

      const res = await axios.get(apiUrl, {
        headers: { 'auth-token': storedToken },
        withCredentials: true,
      });

      console.log('Posts response:', res.data);

      const newPosts = res.data.liners || [];

      setPosts(prev => {
        const postMap = new Map();
        [...(append ? prev : []), ...newPosts].forEach(post => {
          postMap.set(post._id, post);
        });
        return Array.from(postMap.values());
      });

      setHasMore(newPosts.length === 10);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Failed to load posts';
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized - Please log in again';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found - Backend may be deploying';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error - Backend may be starting up';
      } else {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  }, [API_BASE]);

  // Initial posts fetch
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Load more posts
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, true);
    }
  }, [page, fetchPosts]);

  // Handle like with optimistic update
  const handleLike = useCallback(async (postId) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || likeLoading.has(postId)) return;

    setLikeLoading(prev => new Set(prev).add(postId));

    // Optimistic update
    setPosts(prev => prev.map(post => {
      if (post._id !== postId) return post;
      const alreadyLiked = post.likes.includes(userId);
      if (alreadyLiked) return post;
      return { ...post, likes: [...post.likes, userId] };
    }));

    try {
      const res = await axios.put(
        `${API_BASE}/liner/like/${postId}`,
        {},
        { headers: { 'auth-token': storedToken } }
      );

      // Update with actual response
      if (res?.data?.likes) {
        setPosts(prev => prev.map(post => post._id === postId ? { ...post, likes: res.data.likes } : post));
      }
    } catch (error) {
      console.error("Like failed:", error.message);
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => post._id === postId ? { ...post, likes: post.likes.filter(id => id !== userId) } : post));
    } finally {
      setLikeLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  }, [userId, likeLoading, API_BASE]);

  // Handle unlike with optimistic update
  const handleUnlike = useCallback(async (postId) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || likeLoading.has(postId)) return;

    setLikeLoading(prev => new Set(prev).add(postId));

    // Optimistic update
    setPosts(prev => prev.map(post => post._id === postId ? { ...post, likes: post.likes.filter(id => id !== userId) } : post));

    try {
      const res = await axios.put(
        `${API_BASE}/liner/unlike/${postId}`,
        {},
        { headers: { 'auth-token': storedToken } }
      );

      // Update with actual response
      if (res?.data?.likes) {
        setPosts(prev => prev.map(post => post._id === postId ? { ...post, likes: res.data.likes } : post));
      }
    } catch (error) {
      console.error("Unlike failed:", error.message);
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => post._id === postId ? { ...post, likes: [...post.likes, userId] } : post));
    } finally {
      setLikeLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  }, [userId, likeLoading, API_BASE]);

  // Handle comment submission
  const handleComment = useCallback(async (postId) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || !commentText[postId]?.trim() || commentLoading.has(postId)) return;

    setCommentLoading(prev => new Set(prev).add(postId));

    try {
      const res = await axios.post(
        `${API_BASE}/liner/comment/${postId}`,
        { text: commentText[postId].trim() },
        { headers: { 'auth-token': storedToken } }
      );

      setPosts(prev =>
        prev.map(post =>
          post._id === postId ? { ...post, comments: res.data.comments } : post
        )
      );

      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error("Comment failed:", error.message);
    } finally {
      setCommentLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  }, [commentText, commentLoading, API_BASE]);

  // Handle share functionality
  const handleShare = useCallback(async (post) => {
    if (navigator.share) {
      try {
        const permalink = `${window.location.origin}/post/${post._id}`;
        await navigator.share({
          title: `${post.user?.name || 'User'}'s post`,
          text: post.content,
          url: permalink,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        const permalink = `${window.location.origin}/post/${post._id}`;
        await navigator.clipboard.writeText(`${post.user?.name || 'User'}: ${post.content}\n${permalink}`);
        // Show success message
      } catch (error) {
        console.error('Failed to copy to clipboard');
      }
    }
  }, []);

  // Handle post options
  const handlePostOptions = useCallback((postId) => {
    // Implement post options menu (report, save, delete, etc.)
    console.log('Post options for:', postId);
  }, []);

  // Handle create new post
  const handleCreatePost = useCallback(() => {
    // Navigate to create post page or open modal
    console.log('Create new post');
  }, []);

  // Memoized post rendering
  const renderPost = useCallback((post, index) => {
    const likedByUser = post.likes.includes(userId);
    const isLastPost = index === posts.length - 1;
    const isCommentsExpanded = expandedComments.has(post._id);
    // const isOwnPost = post.user?._id === userId; // Removed unused variable

    return (
      <motion.div
        key={post._id}
        ref={isLastPost ? lastPostElementRef : null}
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-gray-700/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden hover:ring-1 hover:ring-emerald-200/50"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-4">
          <div
            onClick={() => navigate(`/user/${post.user?._id}`)}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            {post.user?.profilePicture ? (
              <img
                src={post.user.profilePicture}
                alt={`${post.user.name || 'User'}'s profile`}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200/60 dark:border-emerald-600/60 ring-2 ring-emerald-200/40 dark:ring-emerald-600/30 shadow-md"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-500 dark:bg-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {post.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                onClick={() => navigate(`/user/${post.user?._id}`)}
                className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-200 cursor-pointer truncate transition-colors"
              >
                {post.user?.name || 'User'}
              </span>
              {/* Privacy Badge */}
              {post.user?.isPrivate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-black-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Private
                </span>
              )}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
            {/* Follower Count */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{post.user?.followers?.length || 0} followers</span>
              <span>{post.user?.following?.length || 0} following</span>
            </div>
          </div>

          {/* Follow Button */}
          <FollowButton
            targetUserId={post.user?._id}
            currentUserId={userId}
            isPrivate={post.user?.isPrivate}
            initialFollowStatus={post.user?.followers?.includes(userId) ? 'following' : 'none'}
            onFollowChange={(newStatus) => {
              // Update local state if needed
              console.log('Follow status changed to:', newStatus);
            }}
          />

          <button
            onClick={() => handlePostOptions(post._id)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            aria-label="Post options"
          >
            <i className="bi bi-three-dots text-gray-700 dark:text-gray-300"></i>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 text-base text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
          {renderProcessedText(post.content)}
        </div>

        {/* Media */}
        {post.image && (
          <MediaGrid
            media={Array.isArray(post.image) ? post.image : [post.image]}
            onClick={setModalImg}
          />
        )}

        {/* Reactions */}
        <div className="flex justify-between items-center px-6 py-4 text-gray-800 dark:text-gray-200 text-sm border-t border-gray-200 dark:border-gray-700/70 bg-white/40 dark:bg-gray-800/40 backdrop-blur">
          <div className="flex items-center gap-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => (likedByUser ? handleUnlike(post._id) : handleLike(post._id))}
              disabled={likeLoading.has(post._id)}
              aria-label={likedByUser ? "Unlike post" : "Like post"}
              className={`flex items-center gap-2 ${likedByUser ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400'
                } transition-all duration-200 disabled:opacity-50`}
            >
              {likeLoading.has(post._id) ? (
                <div className="w-5 h-5 border-2 border-rose-600 dark:border-rose-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <WaterHeartIcon isFilled={likedByUser} idSuffix={post._id} />
              )}
              <span className={`font-medium select-none px-2 py-0.5 rounded-full ${likedByUser ? 'bg-rose-50 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700/70 dark:text-gray-200'}`}>{post.likes.length}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleComments(post._id)}
              aria-label="Toggle comments"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
            >
              <i className="bi bi-chat-fill text-xl"></i>
              <span className="select-none px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">{post.comments.length}</span>
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare(post)}
            aria-label="Share post"
            className="hover:text-sky-600 dark:hover:text-sky-400 text-gray-700 dark:text-gray-300 transition-all duration-200"
          >
            <i className="bi bi-share text-xl"></i>
          </motion.button>
        </div>

        {/* Comments Section - Only visible when expanded */}
        <AnimatePresence>
          {isCommentsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/60"
            >
              {/* Existing Comments */}
              {post.comments.length > 0 && (
                <div className="px-6 space-y-3 py-4 text-sm text-gray-800 dark:text-gray-200 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-400 dark:scrollbar-thumb-emerald-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                  {post.comments.map((comment, idx) => {
                    const commentUserId = typeof comment.user === 'string' ? comment.user : comment.user?._id;
                    const commentUserName = typeof comment.user === 'object' ? (comment.user?.name || 'User') : (comment.user === userId ? 'You' : 'User');
                    const userInitial = commentUserId === userId ? 'Y' : (commentUserName?.charAt(0) || 'U');
                    const isSelf = commentUserId === userId;
                    return (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-sm flex-shrink-0 ring-1 ring-emerald-200/60 dark:ring-emerald-700/40">
                          {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              onClick={() => commentUserId && !isSelf && navigate(`/user/${commentUserId}`)}
                              className={`font-semibold text-xs ${isSelf ? 'text-gray-800 dark:text-gray-200' : 'text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer'}`}
                            >
                              {isSelf ? 'You' : commentUserName}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                              {formatDistanceToNow(new Date(comment.createdAt || Date.now()), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 break-words leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Comment */}
              <div className="px-6 pb-6 flex gap-3 items-center">
                <input
                  id={`comment-input-${post._id}`}
                  name={`comment-${post._id}`}
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText[post._id] || ''}
                  onChange={(e) =>
                    setCommentText({ ...commentText, [post._id]: e.target.value })
                  }
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300/80 dark:border-gray-600/70 rounded-full focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400 bg-white/80 dark:bg-gray-800/70 backdrop-blur text-black dark:text-white shadow-inner"
                  disabled={commentLoading.has(post._id)}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleComment(post._id)}
                  disabled={!commentText[post._id]?.trim() || commentLoading.has(post._id)}
                  className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-500 disabled:bg-gray-400 disabled:text-gray-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                  {commentLoading.has(post._id) ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Post'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [posts, userId, likeLoading, commentLoading, commentText, expandedComments, handleLike, handleUnlike, handleComment, handleShare, handlePostOptions, toggleComments, renderProcessedText, lastPostElementRef, navigate]);

  // Memoized loading skeletons
  const loadingSkeletons = useMemo(() => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  ), []);

  return (
    <FeedWrapper ref={containerRef}>
      {/* Posts Container */}
      <div className="max-w-2xl mx-auto px-4 py-32 space-y-12 relative z-10">
        {error ? (
          <ErrorMessage message={error} onRetry={() => fetchPosts(1, false)} />
        ) : loading && posts.length === 0 ? (
          loadingSkeletons
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {posts.map((post, index) => renderPost(post, index))}

            {/* Load more indicator */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Loading more posts...</span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleCreatePost} />

      {/* Image Modal */}
      <Modal
        isOpen={!!modalImg}
        onRequestClose={() => setModalImg(null)}
        className="max-w-4xl mx-auto my-16 rounded-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        aria-label="Image preview"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative"
        >
          <button
            onClick={() => setModalImg(null)}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors z-10"
            aria-label="Close image preview"
          >
            <i className="bi bi-x-lg"></i>
          </button>
          <img
            src={modalImg}
            alt="Full view"
            className="rounded-2xl max-h-[85vh] object-contain mx-auto"
            onClick={() => setModalImg(null)}
          />
        </motion.div>
      </Modal>
    </FeedWrapper>
  );
};


// --- Styled Components ---

const FeedWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  background: transparent;
  overflow-x: hidden;
`;

// Utility function for debounce
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default PostList;
