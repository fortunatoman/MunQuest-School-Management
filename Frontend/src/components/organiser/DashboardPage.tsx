import React from 'react';

interface Committee {
  id: string;
  committee: string;
  abbr: string;
  category: string;
  seatsTotal: string;
  committeeId?: string;
}

interface Registration {
  id: string;
  user_id: string;
  assigned_committees?: string;
  assigned_country?: string;
  user: {
    fullname: string;
    grade: string;
    school: {
      name: string;
    };
  };
}

interface DashboardPageProps {
  eventName: string;
  eventStartDate: string;
  eventEndDate: string;
  locality: string;
  area: string;
  feesPerDelegate: string;
  numberOfSeats: string;
  totalRevenue: string;
  committees?: Committee[];
  registrations?: Registration[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  eventName,
  eventStartDate,
  eventEndDate,
  locality,
  area,
  feesPerDelegate,
  numberOfSeats,
  totalRevenue,
  committees = [],
  registrations = []
}) => {
  // Format date to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate allocation summary data
  const calculateAllocationSummary = () => {
    // Group committees by category
    const committeesByCategory = committees.reduce((acc, committee) => {
      const category = committee.category || 'open';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(committee);
      return acc;
    }, {} as Record<string, Committee[]>);

    // Calculate totals for each category
    const categoryTotals = Object.entries(committeesByCategory).map(([category, categoryCommittees]) => {
      const totalSeats = categoryCommittees.reduce((sum, committee) => sum + parseInt(committee.seatsTotal || '0'), 0);
      
      // Count allocated delegates for this category
      let allocatedCount = 0;
      categoryCommittees.map(committee => {
        let committeeCount = registrations.filter(reg => {
          if (committee.committeeId === reg.assigned_committees) return true;
          return false;
        }).length;
        if (committeeCount > 0) {
          allocatedCount += committeeCount;
        }
      });

      return {
        category,
        count: categoryCommittees.length,
        seats: totalSeats,
        allocated: allocatedCount
      };
    });

    // Calculate overall totals
    const totalCount = committees.length;
    const totalSeats = committees.reduce((sum, committee) => sum + parseInt(committee.seatsTotal || '0'), 0);
    const totalAllocated = categoryTotals.reduce((sum, category) => sum + category.allocated, 0);

    return {
      total: { count: totalCount, seats: totalSeats, allocated: totalAllocated },
      country: categoryTotals.find(c => c.category === 'country') || { category: 'country', count: 0, seats: 0, allocated: 0 },
      crisis: categoryTotals.find(c => c.category === 'crisis') || { category: 'crisis', count: 0, seats: 0, allocated: 0 },
      role: categoryTotals.find(c => c.category === 'role') || { category: 'role', count: 0, seats: 0, allocated: 0 },
      open: categoryTotals.find(c => c.category === 'open') || { category: 'open', count: 0, seats: 0, allocated: 0 }
    };
  };

  const allocationData = calculateAllocationSummary();

  // Calculate allocation status data for individual committees
  const calculateAllocationStatus = () => {
    return committees.map(committee => {
      // Count assigned delegates for this specific committee
      const assignedCount = registrations.filter(reg => {
        if (reg.assigned_committees === committee.committeeId) return true;
        return false;
      }).length;

      const totalSeats = parseInt(committee.seatsTotal || '0');
      const assignedSeats = assignedCount;
      
      // Determine status based on assignment ratio
      let status = 'Open';
      let statusColor = 'text-green-600';
      
      if (assignedSeats >= totalSeats) {
        status = 'Full';
        statusColor = 'text-red-600';
      } else if (assignedSeats > totalSeats * 0.7) {
        status = 'Filling';
        statusColor = 'text-orange-600';
      }

      return {
        committeeType: committee.category || 'open',
        committeeName: committee.abbr,
        totalSeats,
        assignedSeats,
        status,
        statusColor
      };
    });
  };

  const allocationStatusData = calculateAllocationStatus();
  if (!eventName) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
        <p className="text-gray-500">Please create an event to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Event Information */}
      <div className="p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex justify-center items-center text-white border rounded-lg border border-gray-800">
            <div className="bg-[#607DA3] text-sm font-medium px-2.5 py-2 h-full rounded-l-[5px] flex justify-center items-center">Event</div>
            <div className="text-lg text-gray-800 p-[10px]  w-full">{eventName}</div>
          </div>
          <div className="flex justify-center items-center text-white border rounded-lg border border-gray-800">
            <div className="bg-[#607DA3] text-sm font-medium px-2.5 py-2 h-full rounded-l-[5px] flex justify-center items-center">Date</div>
            <div className="text-lg text-gray-800 p-[10px] w-full">{formatDate(eventStartDate)} - {formatDate(eventEndDate)}</div>
          </div>
          <div className="flex justify-center items-center text-white border rounded-lg border border-gray-800">
            <div className="bg-[#607DA3] text-sm font-medium px-2.5 py-2 h-full rounded-l-[5px] flex justify-center items-center">Locality</div>
            <div className="text-lg text-gray-800 p-[10px] w-full">{locality}</div>
          </div>
          <div className="flex justify-center items-center text-white border rounded-lg border border-gray-800">
            <div className="bg-[#607DA3] text-sm font-medium px-2.5 py-2 h-full rounded-l-[5px] flex justify-center items-center">Area</div>
            <div className="text-lg text-gray-800 p-[10px] w-full">{area || 'N/A'}</div>
          </div>
          <div className="flex justify-center items-center text-white border rounded-lg border border-gray-800">
            <div className="bg-[#607DA3] text-sm font-medium px-2.5 py-2 h-full rounded-l-[5px] flex justify-center items-center">Fees</div>
            <div className="text-lg text-gray-800 p-[10px] w-full">AED {feesPerDelegate}</div>
          </div>
          <div className="flex justify-center items-center text-white border rounded-lg border border-gray-800">
            <div className="bg-[#607DA3] text-sm font-medium px-2.5 py-2 h-full rounded-l-[5px] flex justify-center items-center">Delegates</div>
            <div className="text-lg text-gray-800 p-[10px] w-full">{numberOfSeats || '0'}</div>
          </div>
          <div className="flex justify-center items-center text-white border rounded-lg border border-gray-800">
            <div className="bg-[#607DA3] text-sm font-medium px-2.5 py-2 h-full rounded-l-[5px] flex justify-center items-center">Total Revenue</div>
            <div className="text-lg text-gray-800 p-[10px] w-full">AED {totalRevenue || '0'}</div>
          </div>
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Allocation Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-[800px] border border-gray-800 w-[570px]">
            <thead >
              <tr className="bg-[#607DA3] text-white ">
                <th className="px-4 py-3 text-center border border-gray-800 w-[19%]"></th>
                <th className="px-4 py-3 text-center border border-gray-800 w-[8%]">Count</th>
                <th className="px-4 py-3 text-center border border-gray-800 w-[8%]">Seats</th>
                <th className="px-4 py-3 text-center border border-gray-800 w-[8%]">Allocated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 text-center font-medium border border-gray-800">Total</td>
                <td className="px-4 py-3 text-center border border-gray-800">{allocationData.total.count}</td>
                <td className="px-4 py-3 text-center border border-gray-800">{allocationData.total.seats}</td>
                <td className="px-4 py-3 text-center border border-gray-800">{allocationData.total.allocated}</td>
              </tr>
              <tr>
                <td className="px-4 py-3  text-center font-medium border border-gray-800">Country Committees</td>
                <td className="px-4 py-3  text-center border border-gray-800">{allocationData.country.count}</td>
                <td className="px-4 py-3  text-center border border-gray-800">{allocationData.country.seats}</td>
                <td className="px-4 py-3  text-center border border-gray-800">{allocationData.country.allocated}</td>
              </tr>
              <tr>
                <td className="px-4 py-3  text-center font-medium border border-gray-800">Crisis Committees</td>
                <td className="px-4 py-3  text-center border border-gray-800">{allocationData.crisis.count}</td>
                <td className="px-4 py-3  text-center border border-gray-800">{allocationData.crisis.seats}</td>
                <td className="px-4 py-3  text-center border border-gray-800">{allocationData.crisis.allocated}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-center font-medium border border-gray-800">Role Committees</td>
                <td className="px-4 py-3 text-center border border-gray-800">{allocationData.role.count}</td>
                <td className="px-4 py-3 text-center border border-gray-800">{allocationData.role.seats}</td>
                <td className="px-4 py-3 text-center border border-gray-800">{allocationData.role.allocated}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-center font-medium border border-gray-800">Open Committees</td>
                <td className="px-4 py-3 text-center border border-gray-800">{allocationData.open.count}</td>
                <td className="px-4 py-3 text-center border border-gray-800">{allocationData.open.seats}</td>
                <td className="px-4 py-3 text-center border border-gray-800">{allocationData.open.allocated}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Status */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Allocation Status</h2>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-5 gap-2 w-[840px]">
            {/* Header Row */}
            <div className="bg-[#607DA3] text-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center justify-between">
              <span>Committee Type</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="bg-[#607DA3] text-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center justify-between">
              <span>Committees</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="bg-[#607DA3] text-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center justify-between">
              <span>Seats Total</span>
            </div>
            <div className="bg-[#607DA3] text-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center justify-between">
              <span>Seats Assigned</span>
            </div>
            <div className="bg-[#607DA3] text-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center justify-between">
              <span>Status</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Dynamic Data Rows from Real Committees */}
            {allocationStatusData.length > 0 ? (
              allocationStatusData.map((committee, index) => (
                <React.Fragment key={`${committee.committeeName}-${committee.committeeType}-${index}`}>
                  <div className="bg-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center capitalize">
                    {committee.committeeType}
                  </div>
                  <div className="bg-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center font-medium">
                    {committee.committeeName}
                  </div>
                  <div className="bg-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center">
                    {committee.totalSeats}
                  </div>
                  <div className="bg-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center">
                    {committee.assignedSeats}
                  </div>
                  <div className="bg-white px-4 py-3 rounded-[5px] border border-gray-800 flex items-center">
                    <span className={`${committee.statusColor} font-medium`}>
                      {committee.status}
                    </span>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="col-span-5 bg-white px-4 py-8 rounded-[5px] border border-gray-800 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm">No committees available</p>
                  <p className="text-xs text-gray-400 mt-1">Create committees to view allocation status</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
