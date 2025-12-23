'use client';

import { useState, useEffect, useRef } from 'react';

type User = {
  id: string;
  name: string | null;
  email: string;
};

type MentionAutocompleteProps = {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  users: User[];
  onSelect: (user: User) => void;
};

export default function MentionAutocomplete({
  textareaRef,
  users,
  onSelect,
}: MentionAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use refs to access latest state in event handlers
  const suggestionsRef = useRef(suggestions);
  const selectedIndexRef = useRef(selectedIndex);
  const showSuggestionsRef = useRef(showSuggestions);
  const mentionStartRef = useRef(mentionStart);

  useEffect(() => {
    suggestionsRef.current = suggestions;
    selectedIndexRef.current = selectedIndex;
    showSuggestionsRef.current = showSuggestions;
    mentionStartRef.current = mentionStart;
  }, [suggestions, selectedIndex, showSuggestions, mentionStart]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      const value = target.value;
      const cursorPosition = target.selectionStart;

      // Find @mention pattern before cursor (supports @ followed by word characters, dots, hyphens)
      const textBeforeCursor = value.substring(0, cursorPosition);
      const mentionMatch = textBeforeCursor.match(/@([\w.-]*)$/);

      if (mentionMatch) {
        const start = cursorPosition - mentionMatch[0].length;
        const term = mentionMatch[1].toLowerCase();

        setMentionStart(start);
        setSearchTerm(term);

        // Filter users by name or email (case-insensitive)
        const filtered = users.filter((user) => {
          const nameMatch = user.name?.toLowerCase().includes(term);
          const emailMatch = user.email.toLowerCase().includes(term);
          return nameMatch || emailMatch;
        });

        // Limit to 5 suggestions
        setSuggestions(filtered.slice(0, 5));
        // Show suggestions after 2 characters (e.g., @ch)
        setShowSuggestions(filtered.length > 0 && term.length >= 2);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
        setMentionStart(null);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentShowSuggestions = showSuggestionsRef.current;
      const currentSuggestions = suggestionsRef.current;
      const currentSelectedIndex = selectedIndexRef.current;
      const currentMentionStart = mentionStartRef.current;

      if (!currentShowSuggestions || currentSuggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % currentSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + currentSuggestions.length) % currentSuggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (currentSuggestions[currentSelectedIndex] && currentMentionStart !== null) {
          const textarea = textareaRef.current;
          if (!textarea) return;
          
          const value = textarea.value;
          const beforeMention = value.substring(0, currentMentionStart);
          const afterMention = value.substring(textarea.selectionStart);
          
          const user = currentSuggestions[currentSelectedIndex];
          const displayName = user.name || user.email.split('@')[0];
          const newValue = `${beforeMention}@${displayName} ${afterMention}`;

          textarea.value = newValue;
          const newCursorPosition = currentMentionStart + displayName.length + 2;
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
          textarea.focus();

          setShowSuggestions(false);
          setMentionStart(null);
          setSearchTerm('');

          const event = new Event('input', { bubbles: true });
          textarea.dispatchEvent(event);
          onSelect(user);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  }, [textareaRef, users, onSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions, textareaRef]);

  // Calculate position when suggestions change
  useEffect(() => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea || mentionStart === null) return;

    const updatePosition = () => {
      const textareaRect = textarea.getBoundingClientRect();
      const textBeforeMention = textarea.value.substring(0, mentionStart);
      
      // Create a temporary span to measure text width
      const measureSpan = document.createElement('span');
      measureSpan.style.visibility = 'hidden';
      measureSpan.style.position = 'absolute';
      measureSpan.style.whiteSpace = 'pre-wrap';
      measureSpan.style.font = window.getComputedStyle(textarea).font;
      measureSpan.style.padding = window.getComputedStyle(textarea).padding;
      measureSpan.style.width = textarea.offsetWidth + 'px';
      measureSpan.textContent = textBeforeMention;
      document.body.appendChild(measureSpan);
      const textWidth = Math.min(measureSpan.offsetWidth, textarea.offsetWidth);
      document.body.removeChild(measureSpan);

      setPosition({
        left: textareaRect.left + textWidth,
        top: textareaRect.bottom + 4,
      });
    };

    updatePosition();
    
    // Update position on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showSuggestions, suggestions, mentionStart]);

  const handleSelectUser = (user: User) => {
    const textarea = textareaRef.current;
    if (!textarea || mentionStart === null) return;

    const value = textarea.value;
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(textarea.selectionStart);
    
    // Use name if available, otherwise email
    const displayName = user.name || user.email.split('@')[0];
    const newValue = `${beforeMention}@${displayName} ${afterMention}`;

    textarea.value = newValue;
    const newCursorPosition = mentionStart + displayName.length + 2; // +2 for @ and space
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    textarea.focus();

    setShowSuggestions(false);
    setMentionStart(null);
    setSearchTerm('');

    // Trigger input event to update form state
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);

    onSelect(user);
  };

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  const textarea = textareaRef.current;
  if (!textarea || mentionStart === null) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        left: `${position.left}px`,
        top: `${position.top}px`,
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e0',
        borderRadius: 6,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 10000,
        maxWidth: 300,
        minWidth: 200,
        maxHeight: 200,
        overflowY: 'auto',
      }}
    >
      {suggestions.map((user, index) => {
        const displayName = user.name || user.email.split('@')[0];
        const isSelected = index === selectedIndex;

        return (
          <div
            key={user.id}
            onClick={() => handleSelectUser(user)}
            onMouseEnter={() => setSelectedIndex(index)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: isSelected ? '#e5f8fa' : 'transparent',
              borderBottom: index < suggestions.length - 1 ? '1px solid #f0f4f8' : 'none',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 500, color: '#2d3748' }}>
              {user.name || displayName}
            </div>
            {user.name && (
              <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                {user.email}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
