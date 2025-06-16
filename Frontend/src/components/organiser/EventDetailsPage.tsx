import React, { useRef } from 'react';
import { LoadingSpinner, DateRangePicker } from '../ui';
import EditIcon from '../../assets/edit_icon.svg';

interface EventDetailsPageProps {
  eventName: string;
  coverImage: string;
  eventDescription: string;
  eventStartDate: string;
  eventEndDate: string;
  school: string;
  locality: string;
  numberOfSeats: string;
  feesPerDelegate: string;
  totalRevenue: string;
  website: string;
  instagram: string;
  isUploadingCoverImage: boolean;
  editingField: string | null;
  tempValue: string;
  showDatePicker: boolean;
  onFieldEdit: (field: string, currentValue: string) => void;
  onFieldChange: (field: string, value: string) => void;
  onCancelEdit: () => void;
  onCoverImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onDatePickerToggle: () => void;
  onDatePickerClose: () => void;
  onUpdateEvent: () => void;
  isSaving: boolean;
}

const EventDetailsPage: React.FC<EventDetailsPageProps> = ({
  eventName,
  coverImage,
  eventDescription,
  eventStartDate,
  eventEndDate,
  school,
  locality,
  numberOfSeats,
  feesPerDelegate,
  totalRevenue,
  website,
  instagram,
  isUploadingCoverImage,
  editingField,
  tempValue,
  showDatePicker,
  onFieldEdit,
  onFieldChange,
  onCancelEdit,
  onCoverImageUpload,
  onDateRangeChange,
  onDatePickerToggle,
  onDatePickerClose,
  onUpdateEvent,
  isSaving
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reusable field component
  const renderEditableField = (label: string, field: string, value: string, type: 'text' | 'textarea' = 'text', rows?: number, showEditButton: boolean = true) => {
    const isEditingThisField = editingField === field;
    const displayValue = isEditingThisField ? tempValue : value;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="relative">
          {type === 'textarea' ? (
            <textarea
              value={displayValue}
              disabled={!isEditingThisField}
              onChange={(e) => onFieldChange(field, e.target.value)}
              rows={rows || 4}
              className={`w-[400px] px-4 py-3 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 ${isEditingThisField ? 'border-[#1E395D]' : 'border-gray-300 bg-gray-50'
                }`}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <input
              type={type}
              value={displayValue}
              disabled={!isEditingThisField}
              onChange={(e) => onFieldChange(field, e.target.value)}
              className={`w-[400px] px-4 py-3 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 ${isEditingThisField ? 'border-[#1E395D]' : 'border-gray-300 bg-gray-50'
                }`}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          )}

          {!isEditingThisField && showEditButton && (
            <button
              onClick={() => onFieldEdit(field, value)}
              className="absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              style={{ right: '43.75rem' }}
            >
              <img src={EditIcon} alt="Edit" className="w-4 h-4" />
            </button>
          )}

          {isEditingThisField && showEditButton && (
            <div className="absolute top-1/2 transform -translate-y-1/2 flex space-x-2" style={{ right: '43rem' }}>
              <button
                onClick={onCancelEdit}
                className="text-red-600 hover:text-red-800 text-sm font-medium mr-2"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Date field component with DateRangePicker
  const renderDateField = (label: string, field: string) => {
    const isEditingThisField = editingField === field;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="relative">
          <div
            onClick={() => isEditingThisField && onDatePickerToggle()}
            className={`w-[400px] px-4 py-3 border rounded-lg transition-colors ${isEditingThisField
              ? 'border-[#1E395D] cursor-pointer hover:border-[#1E395D]'
              : 'border-gray-300 bg-gray-50 cursor-not-allowed'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Start Date</span>
                  <span className="text-sm font-medium">
                    {eventStartDate ? new Date(eventStartDate).toLocaleDateString('en-GB') : 'DD / MM / YYYY'}
                  </span>
                </div>
                <div className="text-gray-400">to</div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">End Date</span>
                  <span className="text-sm font-medium">
                    {eventEndDate ? new Date(eventEndDate).toLocaleDateString('en-GB') : 'DD / MM / YYYY'}
                  </span>
                </div>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {showDatePicker && isEditingThisField && (
            <div className="absolute top-full left-0 z-50 mt-1">
              <DateRangePicker
                startDate={eventStartDate}
                endDate={eventEndDate}
                onDateRangeChange={onDateRangeChange}
                onClose={onDatePickerClose}
                maxDays={7}
              />
            </div>
          )}

          {!isEditingThisField && (
            <button
              onClick={() => onFieldEdit(field, `${eventStartDate} - ${eventEndDate}`)}
              className="absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              style={{ right: '43.75rem' }}
            >
              <img src={EditIcon} alt="Edit" className="w-4 h-4" />
            </button>
          )}

          {isEditingThisField && (
            <div className="absolute top-1/2 transform -translate-y-1/2 flex space-x-2" style={{ right: '43rem' }}>
              <button
                onClick={onCancelEdit}
                className="text-red-600 hover:text-red-800 text-sm font-medium mr-2"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {isEditingThisField ? 'Click on the date field to open calendar' : 'Select the start and end dates for your event'}
        </div>
      </div>
    );
  };

  if (!eventName) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No event selected</h3>
        <p className="text-gray-500">Please select an event to view details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Event Image Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Event Image</h2>
        </div>
        <div className="relative inline-block">
          {isUploadingCoverImage ? (
            <div className="w-[400px] h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <LoadingSpinner size="large" text="Uploading..." />
            </div>
          ) : (
            <div className="w-[400px] h-64 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={coverImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop'}
                alt={eventName}
                className="w-[400px] h-full object-cover"
              />
            </div>
          )}
          <button
            onClick={() => !isUploadingCoverImage && fileInputRef.current?.click()}
            disabled={isUploadingCoverImage}
            className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isUploadingCoverImage
              ? 'bg-gray-300 cursor-not-allowed opacity-50'
              : 'hover:bg-gray-300'
              }`}
            style={{ right: '-1.5rem', bottom: '-0.5rem' }}
          >
            <img src={EditIcon} alt="Edit Cover Image" className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onCoverImageUpload}
            disabled={isUploadingCoverImage}
            className="hidden"
          />
        </div>
      </div>

      {/* Event Details Form */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Event Information</h2>
        <div className="flex flex-col gap-6">
          {/* Event Name */}
          {renderEditableField('Event Name', 'name', eventName || '')}

          {/* Event Description */}
          {renderEditableField('Event Description', 'description', eventDescription || '', 'textarea', 4)}

          {/* Date */}
          {renderDateField('Date', 'date')}

          {/* School */}
          {renderEditableField('School', 'school_name', school || '', 'text', undefined, false)}

          {/* Locality */}
          {renderEditableField('Locality', 'locality', locality || '', 'text', undefined, false)}

          {/* Seats */}
          {renderEditableField('Seats', 'number_of_seats', numberOfSeats || '')}

          {/* Fees */}
          {renderEditableField('Fees', 'fees_per_delegate', feesPerDelegate || '')}

          {/* Total Revenue */}
          <div className="w-[400px] flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Total Revenue</span>
            <div className="text-lg text-gray-800 font-medium">AED {totalRevenue || '0'}</div>
          </div>

          {/* Website */}
          {renderEditableField('Website', 'website', website || '')}

          {/* Instagram */}
          {renderEditableField('Instagram', 'instagram', instagram || '')}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-start">
          <button
            onClick={() => {
              onUpdateEvent();
              onCancelEdit();
            }}
            disabled={isSaving}
            className={`text-white font-medium transition-colors`}
            style={{
              width: '105px',
              height: '44px',
              borderRadius: '30px',
              padding: '10px',
              gap: '10px',
              opacity: 1,
              background: isSaving ? '#bdbdbd' : '#C2A46D',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
