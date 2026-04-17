import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const FollowButton = ({ targetUserId, currentUserId, isPrivate, initialFollowStatus, onFollowChange }) => {
  const [followStatus, setFollowStatus] = useState(initialFollowStatus || 'none'); // 'none', 'following', 'requested'
  const [loading, setLoading] = useState(false);
  const [showRequestActions, setShowRequestActions] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setFollowStatus(initialFollowStatus || 'none');
  }, [initialFollowStatus]);

  const handleFollow = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/users/${targetUserId}/follow`,
        {},
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        if (isPrivate) {
          setFollowStatus('requested');
          onFollowChange?.('requested');
        } else {
          setFollowStatus('following');
          onFollowChange?.('following');
        }
      }
    } catch (error) {
      console.error('Follow error:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/users/${targetUserId}/unfollow`,
        {},
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        setFollowStatus('none');
        onFollowChange?.('none');
      }
    } catch (error) {
      console.error('Unfollow error:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/users/${targetUserId}/accept`,
        {},
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        setFollowStatus('following');
        onFollowChange?.('following');
        setShowRequestActions(false);
      }
    } catch (error) {
      console.error('Accept error:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/users/${targetUserId}/reject`,
        {},
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        setFollowStatus('none');
        onFollowChange?.('none');
        setShowRequestActions(false);
      }
    } catch (error) {
      console.error('Reject error:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/users/${targetUserId}/cancel-request`,
        {},
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        setFollowStatus('none');
        onFollowChange?.('none');
      }
    } catch (error) {
      console.error('Cancel request error:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button for own profile
  if (targetUserId === currentUserId) {
    return null;
  }

  const renderButton = () => {
    switch (followStatus) {
      case 'following':
        return (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleUnfollow}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer border-none pointer-events-auto"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              'Following'
            )}
          </motion.button>
        );

      case 'requested':
        return (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleCancelRequest}
            disabled={loading}
            className="bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer border-none pointer-events-auto"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              'Requested'
            )}
          </motion.button>
        );

      default:
        return (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleFollow}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer border-none pointer-events-auto"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Follow'
            )}
          </motion.button>
        );
    }
  };

  return (
    <div className="relative">
      {renderButton()}

      {/* Request Actions Dropdown (for incoming requests) */}
      {followStatus === 'requested' && showRequestActions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10 min-w-[120px]"
        >
          <button
            type="button"
            onClick={handleAcceptRequest}
            className="w-full text-left px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors cursor-pointer border-none bg-transparent"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={handleRejectRequest}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer border-none bg-transparent"
          >
            Reject
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default FollowButton;
