
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger/logger';
import { LogSource } from '@/utils/logger/types';
import { ArticleFormData } from '@/types/ArticleEditorTypes';
import { mapFormDataToDatabase, validateMappedData } from '@/utils/article/articleDataMapper';
import { ARTICLE_STATUS } from '@/constants/articleConstants';

export interface SubmissionResult {
  success: boolean;
  error?: string;
  articleId?: string;
}

/**
 * Unified Article Submission Service
 * Uses proven database functions to avoid ambiguous column errors
 */
export class UnifiedSubmissionService {
  /**
   * Submit article for review using the proven submit_article_with_validation function
   */
  static async submitForReview(formData: ArticleFormData, userId: string): Promise<SubmissionResult> {
    try {
      console.log('UnifiedSubmissionService.submitForReview called with:', {
        articleType: formData.articleType,
        hasId: !!formData.id,
        title: formData.title?.substring(0, 30),
        userId,
        categoryId: formData.categoryId
      });

      logger.info(LogSource.ARTICLE, 'Starting unified article submission', {
        articleType: formData.articleType,
        hasId: !!formData.id,
        title: formData.title?.substring(0, 30)
      });

      // Validate required fields before processing
      if (!formData.title?.trim()) {
        return { success: false, error: 'Title is required' };
      }
      
      if (!formData.categoryId) {
        return { success: false, error: 'Category is required' };
      }

      // Map and validate form data with updated field mapping
      const mappedData = mapFormDataToDatabase(formData, userId);
      const validation = validateMappedData(mappedData);

      if (!validation.isValid) {
        console.error('Validation failed:', validation.errors);
        logger.error(LogSource.ARTICLE, 'Validation failed', { errors: validation.errors });
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      console.log('Mapped data for submission:', {
        ...mappedData,
        content: mappedData.content?.substring(0, 50) + '...'
      });

      // Use the proven submit_article_with_validation function
      const { data, error } = await supabase.rpc('submit_article_with_validation', {
        p_user_id: userId,
        p_article_data: mappedData,
        p_save_draft: true
      });

      console.log('Database response:', { data, error });

      if (error) {
        console.error('Database submission failed:', error);
        logger.error(LogSource.ARTICLE, 'Database submission failed', { 
          error: error.message,
          code: error.code 
        });
        
        // Handle specific database constraint violations
        if (error.code === '23514') {
          return {
            success: false,
            error: 'Invalid article status or type. Please check your submission.'
          };
        }
        
        if (error.code === '23503') {
          return {
            success: false,
            error: 'Invalid category selected. Please choose a valid category.'
          };
        }
        
        return {
          success: false,
          error: error.message || 'Failed to submit article'
        };
      }

      // Handle the response from submit_article_with_validation function
      const result = Array.isArray(data) ? data[0] : data;
      
      console.log('Processed result:', result);
      
      if (!result?.success) {
        console.error('Submission validation failed:', result?.error_message);
        logger.error(LogSource.ARTICLE, 'Submission validation failed', { 
          errorMessage: result?.error_message 
        });
        return {
          success: false,
          error: result?.error_message || 'Submission failed'
        };
      }

      console.log('Article submitted successfully:', result.article_id);
      logger.info(LogSource.ARTICLE, 'Article submitted successfully', { 
        articleId: result.article_id 
      });

      return {
        success: true,
        articleId: result.article_id
      };

    } catch (error) {
      console.error('Unexpected submission error:', error);
      logger.error(LogSource.ARTICLE, 'Unexpected submission error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Save article as draft using the proven save_article_draft function
   */
  static async saveDraft(formData: ArticleFormData, userId: string): Promise<SubmissionResult> {
    try {
      console.log('UnifiedSubmissionService.saveDraft called with:', {
        articleType: formData.articleType,
        hasId: !!formData.id,
        title: formData.title?.substring(0, 30),
        categoryId: formData.categoryId
      });

      logger.info(LogSource.ARTICLE, 'Saving article draft', {
        articleType: formData.articleType,
        hasId: !!formData.id
      });

      // Basic validation for drafts
      if (!formData.title?.trim()) {
        return { success: false, error: 'Title is required' };
      }

      const mappedData = mapFormDataToDatabase(formData, userId);
      // Override status to draft for save operations
      mappedData.status = ARTICLE_STATUS?.DRAFT || 'draft';

      console.log('Mapped data for draft save:', {
        ...mappedData,
        content: mappedData.content?.substring(0, 50) + '...'
      });

      // Use the proven save_article_draft function (returns UUID directly)
      const { data: articleId, error } = await supabase.rpc('save_article_draft', {
        p_article_data: mappedData
      });

      console.log('Draft save response:', { articleId, error });

      if (error) {
        console.error('Draft save failed:', error);
        logger.error(LogSource.ARTICLE, 'Draft save failed', { error: error.message });
        return {
          success: false,
          error: error.message || 'Failed to save draft'
        };
      }

      if (!articleId) {
        console.error('Draft save returned no article ID');
        return {
          success: false,
          error: 'Failed to save draft - no article ID returned'
        };
      }

      console.log('Draft saved successfully:', articleId);
      logger.info(LogSource.ARTICLE, 'Draft saved successfully', { 
        articleId 
      });

      return {
        success: true,
        articleId
      };

    } catch (error) {
      console.error('Unexpected draft save error:', error);
      logger.error(LogSource.ARTICLE, 'Unexpected draft save error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
