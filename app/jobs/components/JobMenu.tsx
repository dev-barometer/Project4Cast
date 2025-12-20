'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThreeDotMenu } from '@/app/components/ThreeDotMenu';
import { markJobInactive, markJobActive } from '../actions';

type JobMenuProps = {
  jobId: string;
  jobNumber: string;
  jobStatus: string;
  onMoveTo: () => void;
};

export default function JobMenu({ jobId, jobNumber, jobStatus, onMoveTo }: JobMenuProps) {
  const isInactive = jobStatus === 'ARCHIVED';
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 2px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
        title="Job options"
      >
        <ThreeDotMenu />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minWidth: 200,
            zIndex: 1000,
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMoveTo();
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              color: '#2d3748',
              fontSize: 14,
              
              cursor: 'pointer',
            }}
          >
            Move it to...
          </button>
          {isInactive ? (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const formData = new FormData();
                formData.append('jobId', jobId);
                const result = await markJobActive(formData);
                if (result.success) {
                  setIsOpen(false);
                  window.location.reload();
                } else {
                  alert(result.error || 'Failed to mark job as active');
                  setIsOpen(false);
                }
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                color: '#5a6579',
                fontSize: 14,
                
                cursor: 'pointer',
              }}
            >
              Mark as active
            </button>
          ) : (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const formData = new FormData();
                formData.append('jobId', jobId);
                const result = await markJobInactive(formData);
                if (result.success) {
                  setIsOpen(false);
                  window.location.reload();
                } else {
                  alert(result.error || 'Failed to mark job as inactive');
                  setIsOpen(false);
                }
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                color: '#5a6579',
                fontSize: 14,
                
                cursor: 'pointer',
              }}
            >
              Mark as inactive
            </button>
          )}
        </div>
      )}
    </div>
  );
}
