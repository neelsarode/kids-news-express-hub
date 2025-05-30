
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Send, Loader2 } from 'lucide-react';

interface SimpleFormActionsProps {
  onSaveDraft: () => Promise<void>;
  onSubmit: (e?: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  isDirty: boolean;
  isSaving: boolean;
  disabled?: boolean;
}

const SimpleFormActions: React.FC<SimpleFormActionsProps> = ({
  onSaveDraft,
  onSubmit,
  isSubmitting,
  isDirty,
  isSaving,
  disabled = false
}) => {
  const handleSubmitClick = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SimpleFormActions: Submit button clicked - calling onSubmit');
    try {
      await onSubmit(e);
      console.log('SimpleFormActions: onSubmit completed successfully');
    } catch (error) {
      console.error('SimpleFormActions: Submit error:', error);
    }
  };

  const handleSaveDraftClick = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SimpleFormActions: Save draft button clicked');
    try {
      await onSaveDraft();
      console.log('SimpleFormActions: onSaveDraft completed successfully');
    } catch (error) {
      console.error('SimpleFormActions: Save draft error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraftClick}
            disabled={isSaving || isSubmitting || disabled}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            type="submit"
            onClick={handleSubmitClick}
            disabled={isSubmitting || isSaving || disabled}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
        
        {isDirty && !isSaving && (
          <p className="text-sm text-muted-foreground mt-2">
            You have unsaved changes
          </p>
        )}
        
        {disabled && (
          <p className="text-sm text-destructive mt-2">
            Category must be loaded before submission
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleFormActions;
