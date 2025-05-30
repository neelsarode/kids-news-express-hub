
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Activity, ActivityType } from '@/services/activityService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ActivityIcon from './ActivityIcon';
import ActivityFilters from './ActivityFilters';
import { logger } from '@/utils/logger/logger';
import { LogSource } from '@/utils/logger/types';
import ErrorDisplay from '@/components/Admin/Common/ErrorDisplay';

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  error?: Error | null;
  selectedTypes: string[];
  onFilterChange: (types: string[]) => void;
  onRetry?: () => void;
}

const getActivityDescription = (activity: Activity) => {
  const metadata = activity.metadata || {};
  
  switch (activity.activity_type) {
    case 'article_created':
      return `created article "${metadata.title || 'Untitled'}"`;
    case 'article_published':
      return `published article "${metadata.title || 'Untitled'}"`;
    case 'comment_added':
      return `commented: "${metadata.content ? 
        (metadata.content.length > 40 ? 
          `${metadata.content.substring(0, 40)}...` : 
          metadata.content) : 
        'No content'}"`;
    case 'article_updated':
      return `updated article "${metadata.title || 'Untitled'}"`;
    case 'article_reviewed':
      return `reviewed an article`;
    case 'article_approved':
      return `approved an article`;
    case 'article_rejected':
      return `rejected an article`;
    case 'comment_edited':
      return `edited a comment`;
    case 'comment_deleted':
      return `deleted a comment`;
    default:
      // Ensure we're handling activity_type as a string
      return (activity.activity_type as string).replace(/_/g, ' ');
  }
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  isLoading,
  error,
  selectedTypes,
  onFilterChange,
  onRetry
}) => {
  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorDisplay 
          message={error.message || 'Failed to load activity feed'}
          details={error.stack}
          onRetry={onRetry}
        />
        
        <ActivityFilters 
          selectedTypes={selectedTypes}
          onFilterChange={onFilterChange}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="text-center py-6 text-gray-500">
        No recent activity to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ActivityFilters 
        selectedTypes={selectedTypes}
        onFilterChange={onFilterChange}
      />
      
      {activities.map((activity) => {
        // Extract profile data safely
        let profileName = "Unknown user";
        let profileAvatar = "";
        let profileInitial = "U";
        
        if (activity.profile) {
          profileName = activity.profile.display_name || "Unknown user";
          profileAvatar = activity.profile.avatar_url || "";
          profileInitial = profileName.charAt(0).toUpperCase();
        } else {
          logger.warn(
            LogSource.ACTIVITY, 
            "Activity missing profile data",
            { activityId: activity.id, userId: activity.user_id }
          );
        }

        return (
          <div key={activity.id} className="flex gap-3 items-start">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profileAvatar} alt={profileName} />
              <AvatarFallback>
                {profileInitial}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <ActivityIcon type={activity.activity_type} />
                <span className="font-medium">
                  {profileName}
                </span>
                <span className="text-gray-600">
                  {getActivityDescription(activity)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
