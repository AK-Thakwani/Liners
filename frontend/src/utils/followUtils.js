// Utility functions for follow system

export const getFollowStatus = (currentUserId, targetUserId, targetUser) => {
  if (!currentUserId || !targetUserId || !targetUser) return 'none';
  
  // Check if already following
  if (targetUser.followers.includes(currentUserId)) {
    return 'following';
  }
  
  // Check if request sent (for private accounts)
  if (targetUser.followRequests.includes(currentUserId)) {
    return 'requested';
  }
  
  return 'none';
};

export const canViewContent = (currentUserId, targetUserId, targetUser) => {
  if (!targetUser) return false;
  
  // Public accounts: anyone can view
  if (!targetUser.isPrivate) return true;
  
  // Private accounts: only followers can view
  if (targetUser.followers.includes(currentUserId)) return true;
  
  // Users can always view their own content
  if (currentUserId === targetUserId) return true;
  
  return false;
};

export const getFollowButtonText = (status) => {
  switch (status) {
    case 'following':
      return 'Following';
    case 'requested':
      return 'Requested';
    default:
      return 'Follow';
  }
};

export const getFollowButtonColor = (status) => {
  switch (status) {
    case 'following':
      return 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200';
    case 'requested':
      return 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300';
    default:
      return 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white';
  }
};

export const formatFollowerCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const getPrivacyBadge = (isPrivate) => {
  return isPrivate ? (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
      Private
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Public
    </span>
  );
};
