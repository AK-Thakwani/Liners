import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FollowButton from './FollowButton';
import FollowRequests from './FollowRequests';

const FollowSystemDemo = () => {
  const [demoUser, setDemoUser] = useState({
    _id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    profilePicture: '',
    isPrivate: false,
    followers: [],
    following: [],
    followRequests: []
  });

  const [currentUserId] = useState('current-user-456');

  const handleFollowChange = (newStatus) => {
    console.log('Follow status changed to:', newStatus);
    
    if (newStatus === 'following') {
      setDemoUser(prev => ({
        ...prev,
        followers: [...prev.followers, currentUserId]
      }));
    } else if (newStatus === 'none') {
      setDemoUser(prev => ({
        ...prev,
        followers: prev.followers.filter(id => id !== currentUserId)
      }));
    }
  };

  const togglePrivacy = () => {
    setDemoUser(prev => ({
      ...prev,
      isPrivate: !prev.isPrivate
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Follow System Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This demonstrates the complete follow system with public/private accounts
        </p>
      </motion.div>

      {/* Demo User Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
              {demoUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {demoUser.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{demoUser.email}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{demoUser.followers.length} followers</span>
                <span>{demoUser.following.length} following</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <FollowButton
              targetUserId={demoUser._id}
              currentUserId={currentUserId}
              isPrivate={demoUser.isPrivate}
              initialFollowStatus={demoUser.followers.includes(currentUserId) ? 'following' : 'none'}
              onFollowChange={handleFollowChange}
            />
            
            <button
              onClick={togglePrivacy}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                demoUser.isPrivate
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300'
              }`}
            >
              {demoUser.isPrivate ? 'Private' : 'Public'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Account Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {demoUser.isPrivate 
                ? 'This is a private account. Users must send follow requests to see your content.'
                : 'This is a public account. Anyone can follow you and see your content.'
              }
            </p>
          </div>

          {demoUser.isPrivate && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Private Account Features</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Users must send follow requests</li>
                <li>• You can accept or reject requests</li>
                <li>• Only approved followers see your content</li>
                <li>• Better control over your audience</li>
              </ul>
            </div>
          )}

          {!demoUser.isPrivate && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h3 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">Public Account Features</h3>
              <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                <li>• Anyone can follow you instantly</li>
                <li>• Your content is visible to everyone</li>
                <li>• Faster follower growth</li>
                <li>• More discoverable content</li>
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Follow Requests Demo */}
      {demoUser.isPrivate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Follow Requests Management
          </h3>
          <FollowRequests 
            onRequestUpdate={(action, userId) => {
              console.log(`${action} request from user ${userId}`);
            }}
          />
        </motion.div>
      )}

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          How the Follow System Works
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Public Accounts</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>User clicks "Follow"</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Instantly added to followers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Can see all content immediately</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Private Accounts</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>User clicks "Follow"</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Follow request is sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Account owner reviews request</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Can accept or reject</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FollowSystemDemo;
