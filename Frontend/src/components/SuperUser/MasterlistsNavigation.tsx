import React, { useEffect } from 'react';

interface MasterlistsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  usersSubSection: boolean;
  setUsersSubSection: (section: boolean) => void;
  schoolsSubSection: number;
  setSchoolsSubSection: (section: number) => void;
}

const MasterlistsNavigation: React.FC<MasterlistsNavigationProps> = ({
  activeSection,
  onSectionChange,
  usersSubSection,
  setUsersSubSection,
  schoolsSubSection,
  setSchoolsSubSection
}) => {
  const sections = [
    { id: 'events-related', label: 'Events Related' },
    { id: 'users-related', label: 'Users Related' },
    { id: 'schools-related', label: 'Schools Related' }
  ];
  const subSections = {
    'events-related': [
      { id: 'events', label: 'Events' },
      { id: 'organisers', label: 'Organisers' },
      { id: 'leadership-roles', label: 'Leadership Roles' },
      { id: 'committees', label: 'Committees' }
    ],
    'users-related': [
      { id: 'users', label: 'Users' },
      { id: 'superusers', label: 'Superusers' },
    ],
    'schools-related': [
      { id: 'schools', label: 'Schools' },
      { id: 'localities', label: 'Localities' }
    ],
    'schools-city-related': [
      { id: 'DU', label: 'Dubai' },
      { id: 'AD', label: 'Abu Dhabi' },
      { id: 'AIN', label: 'Al Ain' },
      { id: 'SH', label: 'Sharjah' },
      { id: 'AJ', label: 'Ajman' },
      { id: 'RAK', label: 'Ras Al Khaimah' },
      { id: 'UAQ', label: 'Umm Al Quwain' },
      { id: 'other', label: 'Other' }
    ]
  };


  const getButtonStyle = (isActive: boolean, isSubSection: boolean = false, isParent: boolean = false, colorOrder: number = 0) => {
    const baseStyle = "font-medium transition-colors duration-200";
    if (isSubSection) {
      if (colorOrder === 3) {
        return `${baseStyle} ${isActive
          ? 'bg-[#84B5F3] text-white'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          }`;
      } else {
        return `${baseStyle} ${isActive
          ? 'bg-[#C6DAF4] text-white'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          }`;
      }
    }

    // Handle parent state with lighter blue
    if (isParent && !isActive) {
      return `${baseStyle} bg-[#607DA3] text-white`;
    }
    if (colorOrder === 1) {
      return `${baseStyle} ${isActive
        ? 'bg-[#1E395D] text-white'
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
        }`;
    }
    if (colorOrder === 2) {
      return `${baseStyle} ${isActive
        ? 'bg-[#607DA3] text-white'
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
        }`;
    }
  };

  const isMainSectionActive = (sectionId: string) => {
    return activeSection === sectionId ||
      (sectionId === 'masterlists' && ['events-related',
        'users-related',
        'schools-related',
        'events',
        'organisers',
        'leadership-roles',
        'committees',
        'students',
        'teachers',
        'users',
        'superusers',
        'users-students',
        'users-teachers',
        'schools',
        'localities',
        'dubai',
        'abu-dhabi',
        'al-ain',
        'sharjah',
        'ajman',
        'ras-al-khaimah',
        'umm-al-quwain',
        'other'].includes(activeSection));
  };

  const isSubSectionActive = (sectionId: string) => {
    // Only highlight the main category if we're on that category page, not on a sub-page
    if (sectionId === 'events-related') {
      return activeSection === 'events-related' || activeSection === 'events' || activeSection === 'organisers' || activeSection === 'leadership-roles' || activeSection === 'committees' || activeSection === 'students' || activeSection === 'teachers';
    }
    if (sectionId === 'users-related') {
      return activeSection === 'users-related' || activeSection === 'users' || activeSection === 'superusers';
    }
    if (sectionId === 'schools-related') {
      return activeSection === 'schools-related' || activeSection === 'schools' || activeSection === 'localities' || activeSection === 'dubai' || activeSection === 'abu-dhabi' || activeSection === 'al-ain' || activeSection === 'sharjah' || activeSection === 'ajman' || activeSection === 'ras-al-khaimah' || activeSection === 'umm-al-quwain' || activeSection === 'other';
    }
    if (sectionId === 'organisers') {
      return activeSection === 'students' || activeSection === 'teachers';
    }
    if (sectionId === 'users') {
      return activeSection === 'users' || activeSection === 'users-students';
    }
    if (sectionId === 'superusers') {
      return activeSection === 'superusers' || activeSection === 'users-teachers';
    }
    if (sectionId === 'schools') {
      return activeSection === 'schools' || activeSection === 'dubai' || activeSection === 'abu-dhabi' || activeSection === 'al-ain' || activeSection === 'sharjah' || activeSection === 'ajman' || activeSection === 'ras-al-khaimah' || activeSection === 'umm-al-quwain' || activeSection === 'other';
    }
    if (sectionId === 'localities') {
      return activeSection === 'localities' || activeSection === 'dubai' || activeSection === 'abu-dhabi' || activeSection === 'al-ain' || activeSection === 'sharjah' || activeSection === 'ajman' || activeSection === 'ras-al-khaimah' || activeSection === 'umm-al-quwain' || activeSection === 'other';
    }

    return activeSection === sectionId;
  };

  const isSubSectionParent = (sectionId: string) => {
    // Check if this section is a parent of the currently active section
    if (sectionId === 'events-related') {
      return ['events', 'organisers', 'leadership-roles', 'committees', 'students', 'teachers'].includes(activeSection);
    }
    if (sectionId === 'users-related') {
      return ['users', 'superusers', 'users-students', 'users-teachers'].includes(activeSection);
    }
    if (sectionId === 'schools-related') {
      return ['schools', 'localities'].includes(activeSection);
    }
    if (sectionId === 'organisers') {
      return ['students', 'teachers'].includes(activeSection);
    }
    return false;
  };

  useEffect(() => {
    setSchoolsSubSection(0);
    setUsersSubSection(true);
  }, [activeSection])

  return (
    <div className="space-y-4">
      {/* Main Navigation Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onSectionChange('dashboard')}
          className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] ${getButtonStyle(isMainSectionActive('dashboard'), false, false, 1)}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSectionChange('events')}
          className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] ${getButtonStyle(isMainSectionActive('masterlists'), false, false, 1)}`}
        >
          Masterlists
        </button>
      </div>

      {/* Sub Navigation Buttons */}
      {(isMainSectionActive('masterlists') ||
        activeSection === 'events' ||
        activeSection === 'students' ||
        activeSection === 'teachers' ||
        activeSection === 'users' ||
        activeSection === 'superusers' ||
        activeSection === 'global-students' ||
        activeSection === 'global-teachers' ||
        activeSection === 'users-students' ||
        activeSection === 'users-teachers' ||
        activeSection === 'schools' ||
        activeSection === 'localities' ||
        activeSection === 'dubai' ||
        activeSection === 'abu-dhabi' ||
        activeSection === 'al-ain' ||
        activeSection === 'sharjah' ||
        activeSection === 'ajman' ||
        activeSection === 'ras-al-khaimah' ||
        activeSection === 'umm-al-quwain' ||
        activeSection === 'other') && (
          <div className="space-y-2">
            {/* First row of sub-sections */}
            <div className="flex space-x-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    onSectionChange(section.id === 'events-related' ? 'events' : section.id === 'users-related' ? 'users' : section.id === 'schools-related' ? 'schools' : section.id);
                  }}
                  className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] ${getButtonStyle(isSubSectionActive(section.id), false, isSubSectionParent(section.id), 2)}`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* Events related second row of sub-sections */}
            {(activeSection === 'events-related' || activeSection === 'events' || activeSection === 'organisers' || activeSection === 'leadership-roles' || activeSection === 'committees' || activeSection === 'students' || activeSection === 'teachers') ? (
              <div className="flex space-x-2">
                {subSections['events-related']?.map((subSection) => (
                  <button
                    key={subSection.id}
                    onClick={() => onSectionChange(subSection.id === 'organisers' ? 'students' : subSection.id)}
                    className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] ${getButtonStyle(isSubSectionActive(subSection.id), true, isSubSectionParent(subSection.id), 3)}`}
                  >
                    {subSection.label}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Events related third row for Organisers sub-sections */}
            {activeSection === 'students' || activeSection === 'teachers' ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => onSectionChange('students')}
                  className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] ${getButtonStyle(isSubSectionActive('students'), true, false, 4)}`}
                >
                  Students
                </button>
                <button
                  onClick={() => onSectionChange('teachers')}
                  className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] ${getButtonStyle(isSubSectionActive('teachers'), true, false, 4)}`}
                >
                  Teachers
                </button>
              </div>
            ) : null}

            {/* Users related second row of sub-sections */}
            {
              (activeSection === 'users-related' || activeSection === 'users' || activeSection === 'superusers' || activeSection === 'users-students' || activeSection === 'users-teachers') ? (
                <div className="flex space-x-2">
                  {subSections['users-related']?.map((subSection) => (
                    <button
                      key={subSection.id}
                      onClick={() => {
                        onSectionChange(subSection.id);
                      }}
                      className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] ${getButtonStyle(isSubSectionActive(subSection.id), true, isSubSectionParent(subSection.id), 3)}`}
                    >
                      {subSection.label}
                    </button>
                  ))}
                </div>
              ) : null
            }

            {/* Users related third row of sub-sections */}
            {(activeSection === 'users-related' || activeSection === 'users' || activeSection === 'superusers' || activeSection === 'users-students' || activeSection === 'users-teachers') ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setUsersSubSection(true);
                  }}
                  className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] font-medium transition-colors duration-200 ${usersSubSection ? 'bg-[#C6DAF4] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                >
                  Students
                </button>
                <button
                  onClick={() => {
                    setUsersSubSection(false);
                  }}
                  className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] font-medium transition-colors duration-200 ${!usersSubSection ? 'bg-[#C6DAF4] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                >
                  Teachers
                </button>
              </div>
            ) : null}

            {/* Schools related second row of sub-sections */}
            {(activeSection === 'schools-related' ||
              activeSection === 'schools' ||
              activeSection === 'departments' ||
              activeSection === 'programs' ||
              activeSection === 'localities' ||
              activeSection === 'dubai' ||
              activeSection === 'abu-dhabi' ||
              activeSection === 'al-ain' ||
              activeSection === 'sharjah' ||
              activeSection === 'ajman' ||
              activeSection === 'ras-al-khaimah' ||
              activeSection === 'umm-al-quwain' ||
              activeSection === 'other') ? (
              <div className="flex space-x-2">
                {subSections['schools-related']?.map((subSection) => (
                  <button
                    key={subSection.id}
                    onClick={() => {
                      onSectionChange(subSection.id);
                    }}
                    className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] ${getButtonStyle(isSubSectionActive(subSection.id), true, isSubSectionParent(subSection.id), 3)}`}
                  >
                    {subSection.label}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Schools related third row of sub-sections */}
            {(activeSection === 'schools-related' ||
              activeSection === 'schools' ||
              activeSection === 'departments' ||
              activeSection === 'programs' ||
              activeSection === 'localities' ||
              activeSection === 'dubai' ||
              activeSection === 'abu-dhabi' ||
              activeSection === 'al-ain' ||
              activeSection === 'sharjah' ||
              activeSection === 'ajman' ||
              activeSection === 'ras-al-khaimah' ||
              activeSection === 'umm-al-quwain' ||
              activeSection === 'other') ? (
              <div className="flex space-x-2">
                {subSections['schools-city-related']?.map((subSection, index) => (
                  <button
                    key={subSection.id}
                    onClick={() => {
                      console.log('MasterlistsNavigation - School locality clicked:', subSection.label, 'index:', index);
                      setSchoolsSubSection(index);
                    }}
                    className={`w-[130px] h-[58px] px-[5px] py-[5px] text-sm rounded-[20px] font-medium transition-colors duration-200 ${schoolsSubSection === index ? 'bg-[#C6DAF4] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                  >
                    {subSection.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
    </div>
  );
};

export default MasterlistsNavigation;
