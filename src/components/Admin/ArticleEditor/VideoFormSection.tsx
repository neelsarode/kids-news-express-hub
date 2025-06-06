
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface VideoFormSectionProps {
  form: UseFormReturn<any>;
  isOptional?: boolean;
}

const VideoFormSection: React.FC<VideoFormSectionProps> = ({ form, isOptional = false }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Video Content
          {isOptional && <span className="text-sm text-muted-foreground ml-2">(Optional)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter YouTube or Vimeo URL" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default VideoFormSection;
