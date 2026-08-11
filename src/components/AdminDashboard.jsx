import React, { useState } from 'react';
import { DOWNLOADABLE_FORMS } from '../data/mockData';
import { Shield, Users, CheckCircle2, XCircle, UserCheck, Calendar, Bell, FileDown, Plus, Edit, Sparkles, Send } from 'lucide-react';

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
  
  // Sample Attendance State
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

  return (
    <section id="admin" className="py-20 bg-slate-950 text-white border-t border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>Administrative Portal</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">PHYSICAL EDUCATION MANAGEMENT CONSOLE</h2>
          </div>

          <span className="text-xs font-mono font-bold text-amber-400 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
            ADMIN SESSION: ACTIVE
          </span>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {[
            { id: "Applications", label: `Applications (${applications.length})` },
            { id: "Players", label: "Player Database" },
            { id: "Attendance", label: "Attendance Tracker" },
            { id: "Tournaments", label: "Tournament Scores" },
            { id: "Broadcast", label: "Notification Broadcaster" },
            { id: "Forms", label: "Downloadable Forms" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Application Approvals */}
        {activeTab === "Applications" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Student Membership Requests</h3>
            
            <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">App ID</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Roll No & Dept</th>
                    <th className="p-4">Sports Preference</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-850">
                      <td className="p-4 font-mono text-amber-400 font-bold">{app.id}</td>
                      <td className="p-4 font-bold text-white">{app.name}</td>
                      <td className="p-4">{app.rollNumber} ({app.department} - {app.year})</td>
                      <td className="p-4">{Array.isArray(app.preferredSports) ? app.preferredSports.join(", ") : app.preferredSports}</td>
                      <td className="p-4 text-slate-400">{app.appliedDate}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          app.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 space-x-2">
                        {app.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => onUpdateAppStatus(app.id, 'Approved')}
                              className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onUpdateAppStatus(app.id, 'Rejected')}
                              className="px-3 py-1 rounded bg-rose-500 hover:bg-rose-400 text-white font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status !== 'Pending' && (
                          <span className="text-slate-500 italic">Action Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Player Database */}
        {activeTab === "Players" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Registered Athletes Directory (1,500+)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "K. Vikranth", dept: "CSE IV Yr", sport: "Cricket Captain", phone: "9876543210" },
                { name: "S. Rohit", dept: "ME IV Yr", sport: "Football Captain", phone: "9876543212" },
                { name: "V. Sai Kumar", dept: "CSE IV Yr", sport: "Basketball Captain", phone: "9876543215" },
                { name: "R. Tejaswini", dept: "ECE IV Yr", sport: "Badminton Captain", phone: "9876543211" },
                { name: "T. Shiva", dept: "Civil IV Yr", sport: "Kabaddi Captain", phone: "9876543220" },
                { name: "M. Lokesh", dept: "CSE III Yr", sport: "Chess Captain", phone: "9876543221" }
              ].map((p, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-base">{p.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase">{p.sport}</span>
                  </div>
                  <p className="text-xs text-slate-400">{p.dept}</p>
                  <p className="text-xs text-amber-400 font-mono">Contact: {p.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Practice Attendance Tracker */}
        {activeTab === "Attendance" && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-white">Daily Practice Session Attendance Log</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              {attendanceList.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.roll} • {item.sport}</p>
                  </div>

                  <button
                    onClick={() => toggleAttendance(item.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      item.present ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {item.present ? 'PRESENT' : 'ABSENT'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Tournament Score Management */}
        {activeTab === "Tournaments" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Live Tournament Score Modifier</h3>
            
            <div className="space-y-4">
              {fixtures.map((fix) => (
                <div key={fix.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs text-amber-400 font-bold">
                    <span>{fix.tournament}</span>
                    <span>{fix.status}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-bold">
                    <span className="w-1/3 text-right text-white">{fix.team1}</span>
                    <input
                      type="text"
                      defaultValue={fix.score1}
                      onBlur={(e) => onUpdateFixtureScore(fix.id, e.target.value, fix.score2)}
                      className="w-1/3 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-amber-400 text-center font-mono"
                    />
                    <span className="w-1/3 text-left text-white">{fix.team2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Notification Broadcaster */}
        {activeTab === "Broadcast" && (
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Broadcast Campus Sports Alert</span>
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <textarea
                required
                rows={4}
                placeholder="Type official announcement message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Alert to Student Portal</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: Downloadable Forms */}
        {activeTab === "Forms" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Downloadable Forms & PDF Repository</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {DOWNLOADABLE_FORMS.map((doc, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{doc.title}</h4>
                    <p className="text-xs text-slate-400">{doc.category} • {doc.size}</p>
                  </div>

                  <button
                    onClick={() => alert(`Downloading ${doc.title}...`)}
                    className="p-3 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
                  >
                    <FileDown className="w-5 h-5" />
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
