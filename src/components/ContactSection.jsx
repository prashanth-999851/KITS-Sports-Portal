import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContactSection({ onBack }) {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "How can I register for college sports teams and trials?",
      a: "Students can register online through our official Membership Portal. Trials are conducted at the beginning of each semester for all 11 sports disciplines."
    },
    {
      q: "Are academic attendance on-duties (OD) provided for tournaments?",
      a: "Yes. All students officially representing KKR & KSR Institute in university (JNTUK), state, or national tournaments are granted full attendance OD clearance upon Physical Director endorsement."
    },
    {
      q: "What are the gymnasium and sports complex operating timings?",
      a: "The outdoor grounds and indoor gymnasium operate daily from 06:00 AM - 08:30 AM (Morning Session) and 03:45 PM - 07:00 PM (Evening Session)."
    },
    {
      q: "How do I know if I am selected after attending sports trials?",
      a: "Selected players will be notified via SMS and their names will be published on the Sports Portal notification center and departmental notice boards."
    }
  ];

  const facultyDesk = [
    {
      name: "K. Venkata Rao",
      role: "Physical Director & Faculty Incharge",
      dept: "Department of Physical Education",
      phone: "+91 99855 71444",
      office: "Sports Club, Room No: 29"
    },
    {
      name: "M. Surya Prakash Rao",
      role: "Assistant Physical Director",
      dept: "Department of Physical Education",
      phone: "+91 72889 14280",
      office: "Sports Club, Room No: 29"
    },
    {
      name: "M. Bharath Kumar",
      role: "Club President",
      dept: "Department of Physical Education",
      phone: "+91 91827 55664",
      office: "Sports Club, Room No: 29"
    }
  ];

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:border-[#0b2e5b] focus:bg-white focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300">

      {/* Header & Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              aria-label="Back to Portal Home"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo.png" alt="KITS Logo" className="h-8 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-[#0b2e5b] leading-tight truncate">
                  Contact & Helpdesk
                </h1>
                <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                  Physical Education Directorate • KKR & KSR Institute
                </p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Page Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0b2e5b] text-white shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/10 text-amber-300 uppercase tracking-wider">
              Official Helpdesk
            </span>
            <span className="text-[11px] text-slate-300 font-mono">Guntur, Andhra Pradesh</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold">Contact Sports Directorate Office</h2>
            <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
              Connect with our physical education directors, inquire about trial schedules, submit tournament entries, or request facility reservations.
            </p>
          </div>
        </div>

        {/* 2 Column Layout: Form & Officers Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Inquiry Form */}
          <div className="lg:col-span-7 p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4 h-4 text-[#0b2e5b]" />
              <h3 className="text-base font-bold text-slate-800">Submit Official Inquiry</h3>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-fadeIn">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">Inquiry Transmitted Successfully!</h4>
                <p className="text-xs text-slate-600">
                  Your ticket has been logged into the Physical Education Directorate system. We will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                    <input
                      type="text" 
                      required 
                      placeholder="Enter your full name"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address *</label>
                    <input
                      type="email" 
                      required 
                      placeholder="student@email.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number *</label>
                    <input
                      type="tel" 
                      required 
                      placeholder="+91 98765 43210"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Inquiry Category *</label>
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className={inputClass}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Trial Registration">Trial Registration</option>
                      <option value="Ground Booking">Ground / Arena Booking</option>
                      <option value="Academic OD">Academic On-Duty (OD)</option>
                      <option value="Tournament Entry">Tournament Entry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject *</label>
                  <input
                    type="text" 
                    required 
                    placeholder="Enter subject"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message Details *</label>
                  <textarea
                    required 
                    rows={4} 
                    placeholder="Enter your message details..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry to Sports Office</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Officers Directory & Map */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Physical Education Officers</h3>
            
            <div className="space-y-3">
              {facultyDesk.map((officer, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
                  <h4 className="text-sm font-bold text-[#0b2e5b]">{officer.name}</h4>
                  <p className="text-xs font-semibold text-slate-700">{officer.role}</p>
                  <p className="text-[11px] text-slate-500">{officer.dept} • {officer.office}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center text-xs text-slate-600">
                    <span>Direct Phone: <strong className="text-slate-800">{officer.phone}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Campus Map Embed Card */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Campus Map Location</h4>
                <a
                  href="https://www.google.com/maps/place/KKR+AND+KSR+Institute+Of+Technology+And+Sciences/@16.2478114,80.420423,15z/data=!3m1!4b1!4m6!3m5!1s0x3a4a74eab6bb902d:0x256a70b621cbfbf0!8m2!3d16.247791!4d80.4307228!16s%2Fg%2F1tf6q6bp?hl=en&entry=ttu&g_ep=EgoyMDI2MDgxMi4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#0b2e5b] hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="h-44 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                <iframe
                  title="KKR & KSR Campus Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3830.5694290740683!2d80.4281478759533!3d16.247796134764047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a74eab6bb902d%3A0x256a70b621cbfbf0!2sKKR%20AND%20KSR%20Institute%20Of%20Technology%20And%20Sciences!5e0!3m2!1sen!2sin!4v1716300000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

          </div>

        </div>

        {/* FAQ Section */}
        <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            Frequently Asked Inquiries (FAQ)
          </h3>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 text-xs font-bold text-slate-800 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-[#0b2e5b] shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer Back Link */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KKR & KSR Institute of Technology & Sciences — Sports Directorate</p>
          <button
            onClick={handleBack}
            className="text-[#0b2e5b] hover:underline font-bold cursor-pointer"
          >
            ← Return to Main Portal Homepage
          </button>
        </div>
      </footer>

    </div>
  );
}
