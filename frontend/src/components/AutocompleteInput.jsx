import React, { useState, useRef, useEffect } from 'react';

export default function AutocompleteInput({
    value, 
    onChange, 
    suggestions = [], // The full list of names (e.g., all strengthNames)
    placeholder = "" 
}) {
    const [inputValue, setInputValue] = useState(value || '');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null); // Ref to detect clicks outside

    // Update internal state if the prop value changes (e.g., from parent form reset)
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    // Effect to handle clicks outside the component to close the suggestion box
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue); // Immediately update the parent form's state

        // Filter suggestions
        if (newValue.length > 0) {
            const filtered = suggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(newValue.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);
        onChange(suggestion); // Update parent form's state with the selected suggestion
        setShowSuggestions(false); // Close the suggestion box
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputChange} // Show suggestions on focus as well
                placeholder={placeholder}
                className="flex-1 w-full px-2 py-1 mr-2 border rounded text-sm font-medium"
                autoComplete="off"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    <ul className="divide-y divide-gray-100">
                        {filteredSuggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}