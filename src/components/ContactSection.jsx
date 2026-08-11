import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, Clock, ShieldAlert, UserCheck, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function ContactSection({ onBack }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: "", email: "", phone: "", category: "General Inquiry", subject: "", message: "" });
    }, 5000);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How do student athletes obtain On-Duty (OD) attendance letters?",
      a: "OD requests must be submitted through the Sports Club portal or at the Physical Education desk at least 48 hours before the tournament. Approvals are granted based on the official sports register signed by the Physical Director."
    },
    {
      q: "What is the procedure for booking campus sports grounds or indoor courts?",
      a: "Students and departmental teams can reserve court time via the Sports Desk during non-practice hours (10:00 AM - 03:00 PM). External bookings require prior written clearance from the Registrar."
    },
    {
      q: "How are team trial dates notified to registered applicants?",
      a: "Once you register via the Membership Portal, trial schedules and venue details are sent via official SMS and broadcasted on the portal notifications center."
    },
    {
      q: "What first-aid and medical facilities are available during matches?",
      a: "A certified sports physiotherapist and emergency medical kit are stationed at the Athletic Complex during practice hours, with a 24/7 college ambulance on standby."
    }
  ];

  const facultyDesk = [
    {
      name: "K. Venkata Rao",
      role: "Head Physical Director & Chief Sports Coordinator",
      dept: "Department of Physical Education",
      phone: "+91 91827 55664",
      email: "physicaldirector@kkrksr.ac.in",
      office: "Sports Complex Office, Room 102"
    },
    {
      name: "M. Surya Prakash Rao",
      role: "Assistant Physical Director",
      dept: "Department of Physical Education",
      phone: "+91 93909 53342",
      email: "suryaprakash@kkrksr.ac.in",
      office: "Sports Complex Office, Room 104"
    },
    {
      name: "Campus Emergency Medical Desk",
      role: "24/7 Medical & Ambulance Emergency",
      dept: "KITS Health & Safety Cell",
      phone: "+91 863 2288254",
      email: "medical@kkrksr.ac.in",
      office: "Campus Health Center, Ground Floor"
    }
  ];

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Header & Navigation */}
      <header className="sticky top-0 z-40 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal Home</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-[var(--border-color)]" />

            <div className="flex items-center gap-2.5">
              <img src="/assets/images/logo.png" alt="KITS Logo" className="w-8 h-8 rounded-md border border-[var(--border-color)]" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100"; }} />
              <div>
                <h1 className="text-sm font-bold text-[var(--text-primary)] leading-none">
                  KITS Physical Education & Sports Directorate
                </h1>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Official Contact & Helpdesk Portal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Desk Open: 08:00 AM - 06:00 PM</span>
            </span>
          </div>

        </div>
      </header>

      {/* Main Page Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Banner */}
        <div className="p-6 rounded-xl bg-[#0F172A] text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-900/60 text-blue-300 border border-blue-700 uppercase tracking-wider">
              Official Help Desk
            </span>
            <span className="text-xs text-slate-400 font-mono">Guntur District, Andhra Pradesh</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Contact KITS Sports Office</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Connect with our physical education directors, inquire about trial schedules, submit tournament entries, or request facility reservations.
            </p>
          </div>
        </div>

        {/* 3 Grid Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2.5 card-hover">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Campus Location</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              KKR & KSR Institute of Technology & Sciences,<br />
              Vinjanampadu, Vaddeswaram Post, Guntur - 522017,<br />
              Andhra Pradesh, India.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2.5 card-hover">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Direct Phone Desk</h3>
            <div className="text-xs text-[var(--text-secondary)] space-y-1">
              <p>Sports Office: <strong className="text-[var(--text-primary)]">+91 863 2288254</strong></p>
              <p>Physical Director: <strong className="text-[var(--text-primary)]">+91 91827 55664</strong></p>
              <p>Emergency Desk: <strong className="text-[var(--text-primary)]">+91 93909 53342</strong></p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2.5 card-hover">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Email Channels</h3>
            <div className="text-xs text-[var(--text-secondary)] space-y-1">
              <p>General Queries: <strong className="text-blue-600 dark:text-blue-400">sports@kkrksr.ac.in</strong></p>
              <p>Physical Director: <strong className="text-blue-600 dark:text-blue-400">physicaldirector@kkrksr.ac.in</strong></p>
              <p>Academic ODs: <strong className="text-blue-600 dark:text-blue-400">sportsod@kkrksr.ac.in</strong></p>
            </div>
          </div>
        </div>

        {/* 2 Column Layout: Form & Officers Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inquiry Form */}
          <div className="lg:col-span-7 p-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <MessageSquare className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">Submit Official Inquiry</h3>
            </div>

            {submitted ? (
              <div className="p-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-[var(--text-primary)]">Inquiry Transmitted Successfully!</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Your ticket has been logged into the Physical Education Directorate system. A response will be sent to your email within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Full Name *</label>
                    <input
                      type="text" required placeholder="e.g. M. Bharath Kumar"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Email Address *</label>
                    <input
                      type="email" required placeholder="name@kkrksr.ac.in"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Phone Number *</label>
                    <input
                      type="tel" required placeholder="9876543210"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Inquiry Category *</label>
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
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Subject *</label>
                  <input
                    type="text" required placeholder="e.g. Inter-College Cricket Trial Registration"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Message Details *</label>
                  <textarea
                    required rows={4} placeholder="Please provide specific details regarding your request..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-sm bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry to Sports Office</span>
                </button>
              </form>
            )}
          </div>

          {/* Officers Directory */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Physical Education Officers</h3>
            <div className="space-y-3">
              {facultyDesk.map((officer, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 card-hover">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{officer.name}</h4>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">{officer.role}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{officer.dept} • {officer.office}</p>
                  <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap justify-between items-center text-xs text-[var(--text-secondary)] gap-2">
                    <span>📞 {officer.phone}</span>
                    <a href={`mailto:${officer.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">{officer.email}</a>
                  </div>
                </div>
              ))}
            </div>

            {/* Campus Map Embed Card */}
            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Campus Map Location</h4>
                <a
                  href="https://maps.google.com/?q=KKR+%26+KSR+Institute+of+Technology+and+Sciences"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="h-44 rounded-lg overflow-hidden border border-[var(--border-color)] shadow-inner">
                <iframe
                  title="KKR & KSR Campus Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3829.839498263124!2d80.5234!3d16.2755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDE2JzMxLjgiTiA4MMKwMzEnMjQuMiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            </div>

          </div>

        </div>

        {/* FAQ Section */}
        <div className="p-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
            Frequently Asked Inquiries (FAQ)
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 text-xs font-bold text-[var(--text-primary)] flex items-center justify-between hover:bg-[var(--bg-card)] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 bg-[var(--bg-card)] border-t border-[var(--border-color)] py-6 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KKR & KSR Institute of Technology & Sciences — Physical Education Directorate</p>
          <button
            onClick={onBack}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            ← Return to Main Portal Homepage
          </button>
        </div>
      </footer>

    </div>
  );
}
