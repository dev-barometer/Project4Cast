'use client';

import { useState, useEffect, useRef } from 'react';
import { addTaskComment } from '../actions';
import { useFormState } from 'react-dom';
import { getFileUrl } from '@/lib/file-url-utils';
import { MAX_FILE_SIZE, isValidFileType } from '@/lib/file-upload';
import MentionAutocomplete from '@/app/components/MentionAutocomplete';

type User = {
  id: string;
  name: string | null;
  email: string;
};

type TaskDetailPanelProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    comments: Array<{
      id: string;
      body: string;
      createdAt: Date | string;
      author: {
        id: string;
        name: string | null;
        email: string;
      } | null;
    }>;
    attachments: Array<{
      id: string;
      filename: string;
      url: string;
      mimeType: string;
      uploadedAt: Date | string;
      uploadedBy: {
        id: string;
        name: string | null;
        email: string;
      } | null;
    }>;
  } | null;
  jobId: string;
  currentUserId: string;
  canEdit: boolean;
  allUsers?: User[];
};

export default function TaskDetailPanel({
  task,
  jobId,
  currentUserId,
  canEdit,
  allUsers = [],
}: TaskDetailPanelProps) {
  const [state, formAction] = useFormState(addTaskComment, { success: false, error: null });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Scroll to bottom when new comment is added
  useEffect(() => {
    if (state?.success && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
      // Clear selected files after successful submission
      setSelectedFiles([]);
      setFileError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [state?.success]);
  
  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const errors: string[] = [];
      
      files.forEach((file) => {
        // Validate file type
        if (!isValidFileType(file.name, file.type)) {
          errors.push(`${file.name}: Invalid file type. Allowed: PDF, DOCX, PNG, PPTX`);
          return;
        }
        
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
          errors.push(`${file.name}: File too large (${sizeMB}MB). Maximum: ${maxMB}MB`);
          return;
        }
        
        validFiles.push(file);
      });
      
      if (errors.length > 0) {
        setFileError(errors.join('; '));
        // Clear invalid files from input
        if (fileInputRef.current) {
          const dt = new DataTransfer();
          validFiles.forEach(f => dt.items.add(f));
          fileInputRef.current.files = dt.files;
        }
      } else {
        setFileError(null);
      }
      
      setSelectedFiles(validFiles);
    }
  };

  // Scroll to bottom when task changes
  useEffect(() => {
    if (commentsContainerRef.current && task?.comments.length) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [task?.id]);

  if (!task) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#f7fdfc',
          padding: '40px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a0aec0',
          fontSize: 14,
          
        }}
      >
        Select a task to view details
      </div>
    );
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get attachments for a comment (match by timestamp - within 30 seconds)
  // TODO: Add commentId to Attachment model for proper linking
  const getCommentAttachments = (commentCreatedAt: Date | string, commentAuthorId: string) => {
    const commentTime = typeof commentCreatedAt === 'string' 
      ? new Date(commentCreatedAt).getTime() 
      : commentCreatedAt.getTime();
    
    return task.attachments.filter(att => {
      const attTime = typeof att.uploadedAt === 'string'
        ? new Date(att.uploadedAt).getTime()
        : att.uploadedAt.getTime();
      // Match attachments uploaded within 30 seconds of comment by the same user
      const timeDiff = Math.abs(attTime - commentTime);
      const sameUser = att.uploadedBy?.id === commentAuthorId;
      return timeDiff < 30000 && sameUser; // 30 seconds window
    });
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#f7fdfc',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Comments moved to task rows - show message */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
        }}
      >
        <div style={{ textAlign: 'center', color: '#718096' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <p style={{ fontSize: 14, margin: 0, marginBottom: 8 }}>
            Comments are now under each task
          </p>
          <p style={{ fontSize: 12, margin: 0, color: '#a0aec0' }}>
            Click the arrow icon on the right side of any task row to view or add comments
          </p>
        </div>
      </div>
    </div>
  );
}
