import React, { useState, useRef, useEffect } from 'react';

interface SearchableDropdownProps {
  options: Array<{ id: string; name: string; }>;
  value: string;
  placeholder: string;
  onSelect: (id: string, name: string) => void;
  disabled?: boolean;
  className?: string;
  setSelected?: (id: string, name: string) => void;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  placeholder,
  onSelect,
  disabled = false,
  className = '',
  setSelected
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleSelect = (option: { id: string; name: string }) => {
    onSelect(option.id, option.name);
    setIsOpen(false);
    setSearchTerm('');
    setSelected?.(option.id, option.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const selectedOption = options.find(option => option.id === value);
  const displayValue = selectedOption ? selectedOption.name : 'Unassigned';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Display Value */}
      <div
        className={`h-full flex items-center justify-between bg-white px-3 py-2 text-sm rounded-md border border-gray-200 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'
        }`}
        onClick={handleToggle}
      >
        <span className={value ? 'text-gray-900' : 'text-red-600'}>
          {displayValue}
        </span>
        <svg 
          className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No {placeholder.toLowerCase()} found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="px-3 py-2 text-sm text-gray-900 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                  onClick={() => handleSelect(option)}
                >
                  <span>{option.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
