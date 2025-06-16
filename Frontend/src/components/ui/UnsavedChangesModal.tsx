import React from 'react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onKeepEditing: () => void;
  onDiscardChanges: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onKeepEditing,
  onDiscardChanges
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        {/* Title */}
        <h2 className="text-xl font-bold text-black mb-4 text-center">
          Unsaved Changes
        </h2>
        
        {/* Message */}
        <p className="text-black text-center mb-6 leading-relaxed">
          Your changes have not been saved.
        </p>
        
        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onKeepEditing}
            className="px-6 py-2 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Keep Editing
          </button>
          <button
            onClick={onDiscardChanges}
            className="px-6 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
