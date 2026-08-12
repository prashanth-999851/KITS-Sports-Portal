import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { Shield, Bell, FileDown, Send } from 'lucide-react';

export default function AdminDashboard({
  applications,
  onUpdateAppStatus,
  fixtures,
  onUpdateFixtureScore,
  onBroadcastNotification
}) {
  const [activeTab, setActiveTab] = useState("Applications");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("2026-08-10");
  
  const [attendanceList, setAttendanceList] = useState([
    { id: 1, name: "K. Vikranth", sport: "Cricket", roll: "22KK1A0501", present: true },
    { id: 2, name: "S. Rohit", sport: "Football", roll: "22KK1A0304", present: true },
    { id: 3, name: "V. Sai Kumar", sport: "Basketball", roll: "22KK1A0512", present: false },
    { id: 4, name: "R. Tejaswini", sport: "Badminton", roll: "22KK1A0410", present: true },
    { id: 5, name: "P. Anusha", sport: "Volleyball", roll: "23KK1A0201", present: true }
  ]);

  const toggleAttendance = (id) => {
    setAttendanceList(prev => prev.map(item => item.id === id ? { ...item, present: !item.present } : item));
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    onBroadcastNotification(broadcastMessage);
    alert("Notification Broadcast Sent to All Registered Members!");
    setBroadcastMessage("");
  };

  const tabs = [
    { id: "Applications", label: `Applications (${applications.length})` },
    { id: "Players", label: "Player Database" },
    { id: "Attendance", label: "Attendance" },
    { id: "Tournaments", label: "Scores" },
    { id: "Broadcast", label: "Broadcast" },
    { id: "Forms", label: "Forms" }
  ];

  return (
    <section id="admin" className="py-20 bg-[#0F172A] text-white border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Administrative Portal</p>
            <h2 className="text-2xl font-bold text-white">Physical Education Management Console</h2>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-400 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700">
            ADMIN SESSION: ACTIVE
          </span>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-700 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1E3A8A] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Applications */}
        {activeTab === "Applications" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Student Membership Requests</h3>
            <div className="overflow-x-auto rounded-lg bg-slate-900/50 border border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 uppercase font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">App ID</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Roll & Dept</th>
                    <th className="p-3.5">Sports</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-slate-300">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/50">
                      <td className="p-3.5 font-mono text-blue-400 font-semibold">{app.id}</td>
                      <td className="p-3.5 font-semibold text-white">{app.name}</td>
                      <td className="p-3.5">{app.rollNumber} ({app.department} - {app.year})</td>
                      <td className="p-3.5">{Array.isArray(app.preferredSports) ? app.preferredSports.join(", ") : app.preferredSports}</td>
                      <td className="p-3.5 text-slate-400">{app.appliedDate}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400' :
                          app.status === 'Rejected' ? 'bg-red-500/15 text-red-400' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3.5 space-x-2">
                        {app.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => onUpdateAppStatus(app.id, 'Approved')}
                              className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onUpdateAppStatus(app.id, 'Rejected')}
                              className="px-2.5 py-1 rounded text-[10px] font-bold bg-red-600 hover:bg-red-500 text-white transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500 italic text-[10px]">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Players */}
        {activeTab === "Players" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Registered Athletes Directory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "K. Vikranth", dept: "CSE IV Yr", sport: "Cricket Captain", phone: "9876543210" },
                { name: "S. Rohit", dept: "ME IV Yr", sport: "Football Captain", phone: "9876543212" },
                { name: "V. Sai Kumar", dept: "CSE IV Yr", sport: "Basketball Captain", phone: "9876543215" },
                { name: "R. Tejaswini", dept: "ECE IV Yr", sport: "Badminton Captain", phone: "9876543211" },
                { name: "T. Shiva", dept: "Civil IV Yr", sport: "Kabaddi Captain", phone: "9876543220" },
                { name: "M. Lokesh", dept: "CSE III Yr", sport: "Chess Captain", phone: "9876543221" }
              ].map((p, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white text-sm">{p.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E3A8A] text-white">{p.sport}</span>
                  </div>
                  <p className="text-xs text-slate-400">{p.dept}</p>
                  <p className="text-xs text-blue-400 font-mono">{p.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance */}
        {activeTab === "Attendance" && (
          <div className="p-5 rounded-lg bg-slate-900/50 border border-slate-700 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-white">Daily Attendance Log</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
            <div className="space-y-2.5">
              {attendanceList.map((item) => (
                <div key={item.id} className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.roll} • {item.sport}</p>
                  </div>
                  <button
                    onClick={() => toggleAttendance(item.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      item.present ? 'bg-emerald-600 text-white' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {item.present ? 'PRESENT' : 'ABSENT'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tournament Scores */}
        {activeTab === "Tournaments" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Live Score Manager</h3>
            <div className="space-y-3">
              {fixtures.map((fix) => (
                <div key={fix.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3">
                  <div className="flex justify-between text-xs text-blue-400 font-semibold">
                    <span>{fix.tournament}</span>
                    <span>{fix.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-semibold">
                    <span className="w-1/3 text-right text-white">{fix.team1}</span>
                    <input
                      type="text"
                      defaultValue={fix.score1}
                      onBlur={(e) => onUpdateFixtureScore(fix.id, e.target.value, fix.score2)}
                      className="w-1/3 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 text-center font-mono text-xs"
                    />
                    <span className="w-1/3 text-left text-white">{fix.team2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Broadcast */}
        {activeTab === "Broadcast" && (
          <div className="max-w-xl mx-auto p-5 rounded-lg bg-slate-900/50 border border-slate-700 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Broadcast Alert</span>
            </h3>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <textarea
                required
                rows={4}
                placeholder="Type announcement..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-3.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg font-semibold text-xs bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast</span>
              </button>
            </form>
          </div>
        )}

        {/* Forms */}
        {activeTab === "Forms" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Downloadable Forms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOWNLOADABLE_FORMS.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{doc.title}</h4>
                    <p className="text-xs text-slate-400">{doc.category} • {doc.size}</p>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${doc.title}...`)}
                    className="p-2.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-[#1E3A8A] hover:text-white transition-colors border border-slate-700"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
