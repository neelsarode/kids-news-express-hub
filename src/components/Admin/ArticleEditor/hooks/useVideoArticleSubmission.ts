
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { VideoArticleFormData } from '@/utils/validation/separateFormSchemas';
import { UnifiedSubmissionService } from '@/services/articles/unifiedSubmissionService';
import { ArticleFormData } from '@/types/ArticleEditorTypes';
import { logger } from '@/utils/logger/logger';
import { LogSource } from '@/utils/logger/types';

interface UseVideoArticleSubmissionProps {
  form: UseFormReturn<VideoArticleFormData>;
  articleId?: string;
}

export const useVideoArticleSubmission = ({ form, articleId }: UseVideoArticleSubmissionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = React.useState(false);

  const convertToArticleFormData = (data: VideoArticleFormData): ArticleFormData => {
    // Convert form status to ArticleFormData status
    const convertedStatus = data.status === 'pending_review' ? 'pending' : data.status;
    
    return {
      id: articleId,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || '',
      imageUrl: data.imageUrl || '',
      categoryId: data.categoryId,
      slug: data.slug || '',
      articleType: 'video',
      videoUrl: data.videoUrl,
      status: convertedStatus as any,
      // Convert Date to string if needed, otherwise use as-is
      publishDate: data.publishDate 
        ? (data.publishDate instanceof Date ? data.publishDate.toISOString() : data.publishDate)
        : null,
      shouldHighlight: data.shouldHighlight,
      allowVoting: data.allowVoting
    };
  };

  const handleSaveDraft = async (): Promise<void> => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save drafts.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const formData = form.getValues();
      const convertedData = convertToArticleFormData(formData);
      
      logger.info(LogSource.ARTICLE, 'Saving video article draft');
      
      const result = await UnifiedSubmissionService.saveDraft(convertedData, user.id);
      
      if (result.success) {
        toast({
          title: "Draft saved",
          description: "Your changes have been saved successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to save draft');
      }
    } catch (error) {
      logger.error(LogSource.ARTICLE, 'Save draft error', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (data: VideoArticleFormData): Promise<void> => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit articles.",
        variant: "destructive"
      });
      return;
    }

    logger.info(LogSource.ARTICLE, 'Starting video article submission');

    try {
      const formData = convertToArticleFormData(data);
      
      const result = await UnifiedSubmissionService.submitForReview(formData, user.id);
      
      if (result.success) {
        toast({
          title: "Submission successful",
          description: "Your video article has been submitted for review!",
        });
        navigate('/admin/my-articles');
      } else {
        throw new Error(result.error || 'Failed to submit article');
      }
    } catch (error) {
      logger.error(LogSource.ARTICLE, 'Submit error', error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to submit article. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    isSaving,
    handleSaveDraft,
    handleSubmit
  };
};
