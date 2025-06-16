import React, { useState, useMemo, useEffect } from 'react';
import SchoolsTable from './SchoolsTable';
import SchoolsLocalitiesTable from './Schools-LocalitiesTable';
import { useApp } from '../../contexts/AppContext';
interface SchoolsPageProps {
  type?: 'schools' | 'localities';
  selectedLocality?: number;
}

const SchoolsPage: React.FC<SchoolsPageProps> = ({ type = 'schools', selectedLocality = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { allSchools, allLocalities, allUsers, refreshLocalitiesData, refreshAreasData } = useApp();
  const localityMapping = ['Dubai', 'Abu Dhabi', 'Al Ain', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Umm Al Quwain', 'Other'];

  // Fetch localities and areas data when component mounts
  useEffect(() => {
    refreshLocalitiesData();
    refreshAreasData();
  }, [refreshLocalitiesData, refreshAreasData]);

  const filteredData = useMemo(() => {
    let data: any[] = [];
    if (type === 'localities') {
      // if (!allLocalities || allLocalities.length === 0) {
      if (allSchools && allSchools.length > 0) {
        const localityMap = new Map();
        allSchools.forEach((school: any) => {
          const localityName = school?.locality?.name || 'Unknown';
          const areaId = school?.area_id || 'Unknown';
          const areaName = school?.area?.name || 'Unknown';
          const localityCode = school?.locality?.code || localityName.substring(0, 2).toUpperCase();
          const areaCode = school?.area?.code || areaName.substring(0, 3).toUpperCase();
          const status = school?.area?.status || 'Active';

          const key = `${localityName}-${areaName}`;

          if (!localityMap.has(key)) {
            localityMap.set(key, {
              id: key,
              locality: {
                code: localityCode,
                name: localityName
              },
              area: {
                code: areaCode,
                id: areaId,
                name: areaName
              },
              linkedSchoolsCount: 0,
              linkedStudentsCount: 0,
              status: status
            });
          }
          localityMap.get(key).linkedSchoolsCount += 1;
        });

        data = Array.from(localityMap.values());

        if (allUsers && allUsers.length > 0) {
          data.forEach((localityItem: any) => {
            const areaCode = localityItem.area.code;
            const localityCode = localityItem.locality.code;
            const status = localityItem.status;
            const schoolsInArea = allSchools.filter((school: any) => {
              return school.area && school.area.code === areaCode &&
                school.locality && school.locality.code === localityCode;
            });

            const studentCount = allUsers.filter((user: any) => {
              if (!user.school || typeof user.school !== 'object') return false;
              return schoolsInArea.some((school: any) => {
                return user.school.id === school.id &&
                  user.school.area_id === school.area_id &&
                  user.school.locality_id === school.locality_id;
              });
            }).length;

            localityItem.linkedStudentsCount = studentCount;
            localityItem.status = status;
          });
        }
      }
    } else {
      if (!allSchools || allSchools.length === 0) {
        return [];
      }
      data = allSchools;
    }

    const selectedLocalityName = localityMapping[selectedLocality];

    if (selectedLocalityName && selectedLocalityName !== 'Other') {
      data = data.filter((item: any) => {
        const itemLocality = type === 'localities' ? item?.locality?.name : item?.locality?.name || '';
        const matches = itemLocality && itemLocality.toLowerCase() === selectedLocalityName.toLowerCase();
        return matches;
      });
    } else if (selectedLocalityName === 'Other') {
      // For 'Other', show items that don't match any of the main localities
      const mainLocalities = ['Dubai', 'Abu Dhabi', 'Al Ain', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Umm Al Quwain'];
      data = data.filter((item: any) => {
        const itemLocality = type === 'localities' ? item?.locality?.name : item?.locality?.name || '';
        const isOther = !mainLocalities.some(locality =>
          itemLocality && itemLocality.toLowerCase() === locality.toLowerCase()
        );
        return isOther;
      });
    }
    if (!searchTerm.trim()) {
      return data;
    }

    const searchLower = searchTerm.toLowerCase();
    const searchFiltered = data.filter((item: any) => {
      if (type === 'localities') {
        const localityCode = item?.localityCode || item?.code || '';
        const localityName = item?.localityName || item?.locality?.name || '';
        const areaCode = item?.areaCode || item?.area?.code || '';
        const areaName = item?.areaName || item?.area?.name || '';
        const linkedSchools = item?.linkedSchools || item?.schoolsCount || '';
        const linkedStudents = item?.linkedStudents || item?.studentsCount || '';
        const status = item?.status || '';

        const matches = (localityCode && localityCode.toLowerCase().includes(searchLower)) ||
          (localityName && localityName.toLowerCase().includes(searchLower)) ||
          (areaCode && areaCode.toLowerCase().includes(searchLower)) ||
          (areaName && areaName.toLowerCase().includes(searchLower)) ||
          linkedSchools.toString().includes(searchLower) ||
          linkedStudents.toString().includes(searchLower) ||
          (status && status.toLowerCase().includes(searchLower));
        return matches;
      } else {
        const schoolId = item?.id?.toString() || '';
        const schoolCode = item?.code || '';
        const schoolName = item?.name || '';
        const locality = item?.locality?.name || '';
        const area = item?.area?.name || '';
        const status = item?.status || '';

        const matches = (schoolId && schoolId.toLowerCase().includes(searchLower)) ||
          (schoolCode && schoolCode.toLowerCase().includes(searchLower)) ||
          (schoolName && schoolName.toLowerCase().includes(searchLower)) ||
          (locality && locality.toLowerCase().includes(searchLower)) ||
          (area && area.toLowerCase().includes(searchLower)) ||
          (status && status.toLowerCase().includes(searchLower));
        return matches;
      }
    });
    return searchFiltered;
  }, [type, allSchools, allLocalities, searchTerm, selectedLocality]);

  const handleSchoolAction = (action: string) => {
    switch (action) {
      case 'active':
        break;
      case 'inactive':
        break;
      case 'edit':
        break;
      case 'delete':
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-[1000px] space-y-6">
      {/* Search Bar */}
      <div className="flex justify-left">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-[10px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      {type === 'localities' ? (
        <SchoolsLocalitiesTable
          localities={filteredData}
          onAction={handleSchoolAction}
          localityType={type}
        />
      ) : (
        <SchoolsTable
          schools={filteredData}
          onAction={handleSchoolAction}
          schoolType={type}
        />
      )}
    </div>
  );
};

export default SchoolsPage;
