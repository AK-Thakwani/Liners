import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const FollowRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(new Set());

  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchFollowRequests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFollowRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/users/follow-requests`, {
        headers: { 'auth-token': token }
      });

      if (response.data.success) {
        setRequests(response.data.followRequests);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load follow requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requesterId) => {
    if (processing.has(requesterId)) return;

    setProcessing(prev => new Set(prev).add(requesterId));

    try {
      const response = await axios.put(
        `${API_BASE}/users/${requesterId}/accept`,
        {},
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        // Remove from requests list
        setRequests(prev => prev.filter(req => req._id !== requesterId));

        // Show success notification
        showNotification('Follow request accepted!', 'success');
      }
    } catch (err) {
      showNotification('Failed to accept request', 'error');
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(requesterId);
        return newSet;
      });
    }
  };

  const handleReject = async (requesterId) => {
    if (processing.has(requesterId)) return;

    setProcessing(prev => new Set(prev).add(requesterId));

    try {
      const response = await axios.put(
        `${API_BASE}/users/${requesterId}/reject`,
        {},
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        // Remove from requests list
        setRequests(prev => prev.filter(req => req._id !== requesterId));

        // Show success notification
        showNotification('Follow request rejected', 'success');
      }
    } catch (err) {
      showNotification('Failed to reject request', 'error');
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(requesterId);
        return newSet;
      });
    }
  };

  const showNotification = (message, type) => {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${type === 'success'
      ? 'bg-emerald-500 text-white'
      : 'bg-red-500 text-white'
      }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  if (loading) {
    return (
      <PageWrapper className="flex items-center justify-center">
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading follow requests...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper className="flex items-center justify-center">
        <div className="text-center relative z-10">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={fetchFollowRequests}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full"
          >
            Try Again
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-32 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Follow Requests
          </h1>
          <p className="text-lg text-gray-400">
            Manage who can follow you and see your content
          </p>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/10 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-emerald-500/10 rounded-2xl">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                {requests.length}
              </div>
              <div className="text-sm text-emerald-400 font-medium">
                Pending Requests
              </div>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-2xl">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {requests.filter(r => r.profilePicture).length}
              </div>
              <div className="text-sm text-blue-400 font-medium">
                With Profile Pictures
              </div>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-2xl">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {requests.filter(r => !r.profilePicture).length}
              </div>
              <div className="text-sm text-purple-400 font-medium">
                Without Pictures
              </div>
            </div>
          </div>
        </motion.div>

        {/* Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {requests.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-16 text-center shadow-lg border border-white/10">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Pending Requests
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                You're all caught up! When someone sends you a follow request, it will appear here for you to review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-6">
                Review Requests ({requests.length})
              </h2>

              <AnimatePresence>
                {requests.map((request, index) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Profile Picture */}
                        {request.profilePicture ? (
                          <img
                            src={request.profilePicture}
                            alt={`${request.name}'s profile`}
                            className="w-16 h-16 rounded-full object-cover border-4 border-white/10 shadow-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            {request.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}

                        {/* User Info */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {request.name}
                          </h3>
                          <p className="text-gray-400 mb-2">
                            {request.email}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAccept(request._id)}
                          disabled={processing.has(request._id)}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg"
                        >
                          {processing.has(request._id) ? 'Accepting...' : 'Accept'}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(request._id)}
                          disabled={processing.has(request._id)}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg"
                        >
                          {processing.has(request._id) ? 'Rejecting...' : 'Reject'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            💡 How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 font-bold text-xs">1</span>
              </div>
              <p>Someone sends you a follow request</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 font-bold text-xs">2</span>
              </div>
              <p>Review their profile and decide</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 font-bold text-xs">3</span>
              </div>
              <p>Accept to let them follow you</p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  background: transparent;
  position: relative;
  overflow-x: hidden;
`;

export default FollowRequests;
