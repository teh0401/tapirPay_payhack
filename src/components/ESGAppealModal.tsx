import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Upload, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ESGAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
}

interface AppealData {
  merchantId: string;
  submittedAt: string;
  status: 'pending' | 'reviewed';
}

export const ESGAppealModal = ({ isOpen, onClose, merchantId }: ESGAppealModalProps) => {
  const { toast } = useToast();
  const [appealReason, setAppealReason] = useState('');
  const [businessChanges, setBusinessChanges] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState<AppealData | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Check for existing appeal
      const appeals = JSON.parse(localStorage.getItem('esg_appeals') || '[]');
      const existing = appeals.find((appeal: AppealData) => appeal.merchantId === merchantId);
      setExistingAppeal(existing || null);
    }
  }, [isOpen, merchantId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + uploadedFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 5 files.",
        variant: "destructive",
      });
      return;
    }
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isResubmission: boolean = false) => {
    if (!appealReason.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a reason for your appeal.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Store appeal data
    const appeals = JSON.parse(localStorage.getItem('esg_appeals') || '[]');
    const newAppeal: AppealData = {
      merchantId,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    if (isResubmission) {
      // Replace existing appeal
      const updatedAppeals = appeals.filter((appeal: AppealData) => appeal.merchantId !== merchantId);
      updatedAppeals.push(newAppeal);
      localStorage.setItem('esg_appeals', JSON.stringify(updatedAppeals));
    } else {
      appeals.push(newAppeal);
      localStorage.setItem('esg_appeals', JSON.stringify(appeals));
    }

    setIsSubmitting(false);
    
    toast({
      title: "Appeal Submitted Successfully",
      description: "Your ESG evaluation appeal has been submitted. We'll review your documentation and get back to you within 5-7 business days.",
    });

    // Reset form
    setAppealReason('');
    setBusinessChanges('');
    setUploadedFiles([]);
    onClose();
  };

  const handleResubmission = () => {
    handleSubmit(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ESG Evaluation Appeal</DialogTitle>
          <DialogDescription>
            Submit an appeal for your ESG evaluation with supporting documentation
          </DialogDescription>
        </DialogHeader>

        {existingAppeal && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have a previous appeal submitted on {new Date(existingAppeal.submittedAt).toLocaleDateString()} 
              that is currently under review. Do you want to submit a new appeal to replace it?
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appeal-reason">Reason for Appeal *</Label>
            <Textarea
              id="appeal-reason"
              placeholder="Please explain why you believe your ESG score should be reconsidered..."
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              rows={4}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-changes">Recent Business Changes</Label>
            <Textarea
              id="business-changes"
              placeholder="Describe any recent changes to your business practices, sustainability initiatives, or ESG improvements..."
              value={businessChanges}
              onChange={(e) => setBusinessChanges(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Supporting Documents (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Upload certificates, reports, or other documents supporting your appeal (max 5 files, 10MB each)
            </p>
            
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or click to select
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm">
                  Select Files
                </Button>
              </Label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Note:</strong> This is a demonstration feature. No files will actually be uploaded to our servers. 
              In a real implementation, files would be securely uploaded and reviewed by our ESG evaluation team.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => existingAppeal ? handleResubmission() : handleSubmit()}
              disabled={isSubmitting || !appealReason.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : existingAppeal ? 'Submit New Appeal' : 'Submit Appeal'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};