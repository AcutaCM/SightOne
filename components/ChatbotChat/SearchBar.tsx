/**
 * Search Bar Component
 * 
 * Provides search functionality for assistants with:
 * - Search input with debouncing
 * - Search suggestions dropdown
 * - Clear search button
 * - Keyboard navigation support
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Kbd } from '@heroui/kbd';
import { Search, X } from 'lucide-react';
import styled from '@emotion/styled';
import { useDebouncedCallback } from 'use-debounce';

// ============================================================================
// Styled Components
// ============================================================================

const SearchBarContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SuggestionsDropdown = styled.div<{ show: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: hsl(var(--heroui-content1));
  border: 1px solid hsl(var(--heroui-divider));
  border-radius: 12px;
  box-shadow: 0 8px 24px hsl(0 0% 0% / 0.12);
  max-height: 300px;
  overflow-y: auto;
  z-index: 50;
  
  opacity: ${p => p.show ? 1 : 0};
  transform: translateY(${p => p.show ? '0' : '-8px'});
  pointer-events: ${p => p.show ? 'auto' : 'none'};
  transition: opacity 0.2s ease, transform 0.2s ease;
  
  .dark & {
    box-shadow: 0 8px 24px hsl(0 0% 0% / 0.24);
  }
`;

const SuggestionItem = styled.div<{ highlighted: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s ease;
  
  background: ${p => p.highlighted 
    ? 'hsl(var(--heroui-content2))' 
    : 'transparent'};
  
  &:hover {
    background: hsl(var(--heroui-content2));
  }
  
  &:first-of-type {
    border-radius: 12px 12px 0 0;
  }
  
  &:last-of-type {
    border-radius: 0 0 12px 12px;
  }
  
  &:only-child {
    border-radius: 12px;
  }
`;

const SuggestionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: hsl(var(--heroui-foreground) / 0.5);
`;

const SuggestionText = styled.span`
  flex: 1;
  font-size: 14px;
  color: hsl(var(--heroui-foreground));
`;

const SuggestionHighlight = styled.span`
  font-weight: 600;
  color: hsl(var(--heroui-primary));
`;

const NoSuggestions = styled.div`
  padding: 16px;
  text-align: center;
  color: hsl(var(--heroui-foreground) / 0.5);
  font-size: 13px;
`;

const SearchHint = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: hsl(var(--heroui-foreground) / 0.5);
`;

// ============================================================================
// Component Props
// ============================================================================

export interface SearchBarProps {
  /**
   * Current search value
   */
  value: string;
  
  /**
   * Callback when search value changes
   */
  onChange: (value: string) => void;
  
  /**
   * Callback when search is triggered
   */
  onSearch: (query: string) => void;
  
  /**
   * Available suggestions (tags, titles, etc.)
   */
  suggestions?: string[];
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Debounce delay in milliseconds
   */
  debounceDelay?: number;
  
  /**
   * Maximum number of suggestions to show
   */
  maxSuggestions?: number;
  
  /**
   * Language for UI text
   */
  language?: 'zh' | 'en';
}

// ============================================================================
// Component
// ============================================================================

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  suggestions = [],
  placeholder,
  debounceDelay = 300,
  maxSuggestions = 5,
  language = 'zh',
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((query: string) => {
    onSearch(query);
  }, debounceDelay);

  // Filter suggestions based on input
  const updateSuggestions = useCallback((query: string) => {
    if (!query || query.trim().length === 0) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(lowerQuery)
      )
      .slice(0, maxSuggestions);

    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [suggestions, maxSuggestions]);

  // Handle input change
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    updateSuggestions(newValue);
    debouncedSearch(newValue);
  };

  // Handle clear button
  const handleClear = () => {
    onChange('');
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    onSearch('');
    inputRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        } else {
          onSearch(value);
          setShowSuggestions(false);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight matching text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <SuggestionHighlight>
          {text.substring(index, index + query.length)}
        </SuggestionHighlight>
        {text.substring(index + query.length)}
      </>
    );
  };

  const placeholderText = placeholder || (language === 'zh' ? '搜索助理...' : 'Search assistants...');
  const clearText = language === 'zh' ? '清空' : 'Clear';
  const hintText = language === 'zh' ? '按 Enter 搜索' : 'Press Enter to search';

  return (
    <SearchBarContainer ref={containerRef}>
      <SearchInputWrapper>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          startContent={<Search size={18} />}
          endContent={
            value && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleClear}
                aria-label={clearText}
              >
                <X size={16} />
              </Button>
            )
          }
          classNames={{
            input: 'text-sm',
            inputWrapper: 'h-12',
          }}
        />
      </SearchInputWrapper>

      <SuggestionsDropdown show={showSuggestions}>
        {filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion, index) => (
            <SuggestionItem
              key={suggestion}
              highlighted={index === highlightedIndex}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <SuggestionIcon>
                <Search size={16} />
              </SuggestionIcon>
              <SuggestionText>
                {highlightMatch(suggestion, value)}
              </SuggestionText>
            </SuggestionItem>
          ))
        ) : (
          <NoSuggestions>
            {language === 'zh' ? '没有找到相关建议' : 'No suggestions found'}
          </NoSuggestions>
        )}
      </SuggestionsDropdown>

      {!showSuggestions && (
        <SearchHint>
          <span>{hintText}</span>
          <Kbd keys={['enter']} />
        </SearchHint>
      )}
    </SearchBarContainer>
  );
};

export default SearchBar;
