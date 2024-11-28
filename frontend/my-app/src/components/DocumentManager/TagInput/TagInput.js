import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import styles from './TagInput.module.css';

const TagInput = ({ value = [], onChange, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  );

  const submitTag = () => {
    if (inputValue && !value.includes(inputValue)) {
      onChange([...value, inputValue]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      submitTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className={styles.tagInput}>
      <div className={styles.inputContainer}>
        {value.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button
              onClick={() => onChange(value.filter(t => t !== tag))}
              className={styles.removeTag}
            >
              <X />
            </button>
          </span>
        ))}
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className={styles.tagInputField}
            placeholder={value.length === 0 ? "Add tags..." : ""}
          />
          {inputValue && (
            <button onClick={submitTag} className={styles.addButton}>
              <Check className={styles.checkIcon} />
            </button>
          )}
        </div>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className={styles.suggestions}>
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                onChange([...value, suggestion]);
                setInputValue('');
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              className={styles.suggestionItem}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;