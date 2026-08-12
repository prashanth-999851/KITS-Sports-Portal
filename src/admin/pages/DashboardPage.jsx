import React from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Users, UserCheck, Clock, XCircle, Trophy, Calendar, Activity, Award, BarChart2, PieChart as PieIcon, FileText } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { applications, sports, jntukPlayers = [], executiveBody = [], achievements, isLoading } = useConvexState();

  if (isLoading) {
    return <LoadingSpinner text="Loading Admin Dashboard Analytics..." />;
  }

  const totalApps = applications.length;
  const approvedApps = applications.filter(a => a.status === 'Approved').length;
  const pendingApps = applications.filter(a => a.status === 'Pending').length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;

  const statsCards = [
    { label: 'Total Registrations', value: totalApps, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Approved Students', value: approvedApps, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Pending Applications', value: pendingApps, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Rejected Applications', value: rejectedApps, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
    { label: 'Active Sports Panels', value: sports.length, icon: Trophy, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { label: 'JNTUK Athletes', value: jntukPlayers.length, icon: Calendar, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Leadership Roster', value: executiveBody.length, icon: Activity, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    { label: 'Championship Trophies', value: achievements.tallies.trophies, icon: Award, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' }
  ];

  // Dynamic Monthly Data Calculation from Real Applications
  const monthlyMap = {};
  applications.forEach(app => {
    const rawDate = app.appliedDate || app.createdAt;
    let monthStr = 'Aug';
    if (rawDate) {
      const dateObj = new Date(rawDate);
      if (!isNaN(dateObj.getTime())) {
        monthStr = dateObj.toLocaleString('en-US', { month: 'short' });
      }
    }
    if (!monthlyMap[monthStr]) {
      monthlyMap[monthStr] = { month: monthStr, applications: 0, approved: 0 };
    }
    monthlyMap[monthStr].applications += 1;
    if (app.status === 'Approved') {
      monthlyMap[monthStr].approved += 1;
    }
  });
  const monthlyData = Object.values(monthlyMap);

  // Dynamic Sports Participation Calculation from Real Applications
  const sportsCountMap = {};
  applications.forEach(app => {
    const prefs = Array.isArray(app.preferredSports) ? app.preferredSports : [app.preferredSports];
    prefs.forEach(sp => {
      if (sp) {
        sportsCountMap[sp] = (sportsCountMap[sp] || 0) + 1;
      }
    });
  });
  const sportsParticipation = Object.keys(sportsCountMap).map(sp => ({
    name: sp,
    count: sportsCountMap[sp]
  }));

  const pieColors = ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">System Analytics Dashboard</h2>
          <p className="text-xs text-[var(--text-muted)]">Real-time overview of registrations, sports, matches, and achievements.</p>
        </div>
        <span className="text-xs text-blue-700 dark:text-blue-400 font-mono font-semibold px-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
          Live Data Sync Active
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 card-hover">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[var(--text-primary)]">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Registration Analytics Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Registration Analytics Trend</h3>
            <span className="text-xs text-[var(--text-muted)] font-medium">Monthly Intake 2026</span>
          </div>

          {monthlyData.length === 0 ? (
            <EmptyState
              title="No Analytics Data Available Yet"
              description="Minimum registration records required to generate monthly trend charts."
              icon={BarChart2}
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="applications" stroke="#1E3A8A" fill="#1E3A8A" fillOpacity={0.2} name="Applications" />
                  <Area type="monotone" dataKey="approved" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Approved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sports Participation Pie (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Sports Participation</h3>

          {sportsParticipation.length === 0 ? (
            <EmptyState
              title="No Participation Data"
              description="No student sports preferences recorded yet."
              icon={PieIcon}
            />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sportsParticipation} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                    {sportsParticipation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Recent Applications Activity List */}
      <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Membership Requests</h3>
        
        {recentApplications.length === 0 ? (
          <EmptyState
            title="No Recent Membership Requests"
            description="There are currently no student registration requests in the system."
            icon={FileText}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] uppercase font-bold border-b border-[var(--border-color)]">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll & Department</th>
                  <th className="p-3">Preferred Sports</th>
                  <th className="p-3">Applied Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-[var(--bg-card-subtle)]">
                    <td className="p-3 font-mono font-semibold text-blue-600 dark:text-blue-400">{app.id}</td>
                    <td className="p-3 font-bold text-[var(--text-primary)]">{app.name}</td>
                    <td className="p-3">{app.rollNumber} ({app.department})</td>
                    <td className="p-3">{Array.isArray(app.preferredSports) ? app.preferredSports.join(", ") : app.preferredSports}</td>
                    <td className="p-3 text-[var(--text-muted)]">{app.appliedDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                        app.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                        'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
