import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Calendar, MapPin, Clock, Users, User, ChevronLeft, CheckCircle,
  AlertCircle, UserPlus, Minus, Plus, Mail, Phone, Building2, Trophy
} from 'lucide-react';
import { tw } from '@/constants';

export default function EventDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = useQuery(api.events.getPublished, id ? { id } : "skip");
  const eventsEnabled = useQuery(api.events.isEventsEnabled);

  // Redirect if events disabled
  if (eventsEnabled === false) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans">
        <Navbar activeSection="events" setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />
        <div className="pt-24 pb-20 px-4 min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <h2 className={`${tw`text-h3`}`}>Events Unavailable</h2>
            <p className="text-sm text-[var(--text-secondary)]">The events section is currently disabled.</p>
            <button onClick={() => navigate('/')} className="px-5 py-2.5 rounded-lg bg-[#0b2e5b] text-white text-sm font-bold">Back to Home</button>
          </div>
        </div>
        <Footer setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />
      </div>
    );
  }

  // Loading
  if (event === undefined || eventsEnabled === undefined) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/kits_logo.png?v=2" alt="KiTS" className="w-16 h-16 object-contain" />
          <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-[#0b2e5b] animate-spin" />
        </div>
      </div>
    );
  }

  // Event not found
  if (!event) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans">
        <Navbar activeSection="events" setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />
        <div className="pt-24 pb-20 px-4 min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className={`${tw`text-h3`}`}>Event Not Found</h2>
            <p className="text-sm text-[var(--text-secondary)]">This event may have been removed or is no longer available.</p>
            <button onClick={() => navigate('/events')} className="px-5 py-2.5 rounded-lg bg-[#0b2e5b] text-white text-sm font-bold">View All Events</button>
          </div>
        </div>
        <Footer setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />
      </div>
    );
  }

  const now = new Date();
  const isRegOpen = event.registrationEnabled && (() => {
    if (event.registrationOpens && new Date(event.registrationOpens) > now) return false;
    if (event.registrationCloses && new Date(event.registrationCloses) < now) return false;
    return true;
  })();
  const isCapacityFull = event.capacity && event.registrationCount >= event.capacity;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      <Navbar activeSection="events" setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />

      {/* Back Button */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[#0b2e5b] font-medium py-3 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> All Events
        </button>
      </div>

      {/* Event Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {event.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-[var(--border-color)]">
                <img src={event.imageUrl} alt={event.title} className="w-full h-64 sm:h-80 object-cover" onError={(e) => { e.target.parentElement.style.display = 'none'; }} />
              </div>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {event.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" /> {event.category}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                event.registrationType === 'team'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              }`}>
                {event.registrationType === 'team' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {event.registrationType === 'team'
                  ? `Team Event (${event.minTeamSize || 2}–${event.maxTeamSize || 10} players)`
                  : 'Individual Event'}
              </span>
            </div>

            {/* Title & Description */}
            <h1 className={`${tw`text-h1`} text-[var(--text-primary)]`}>{event.title}</h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{event.shortDescription}</p>
            {event.fullDescription && (
              <div className="prose max-w-none text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {event.fullDescription}
              </div>
            )}

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon={Calendar} label="Date" value={new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
              {event.startTime && (
                <InfoCard icon={Clock} label="Time" value={`${event.startTime}${event.endTime ? ` — ${event.endTime}` : ''}`} />
              )}
              {event.venue && <InfoCard icon={MapPin} label="Venue" value={event.venue} />}
              {event.capacity && (
                <InfoCard icon={Users} label="Capacity" value={`${event.registrationCount || 0} / ${event.capacity} registered`} />
              )}
              {event.registrationType === 'team' && (
                <InfoCard icon={Users} label="Team Size" value={`${event.minTeamSize || 2} — ${event.maxTeamSize || 10} members`} />
              )}
            </div>
          </div>

          {/* Right — Registration Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {!isRegOpen || isCapacityFull ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {isCapacityFull ? 'Event Full' : 'Registration Closed'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {isCapacityFull
                      ? 'This event has reached its maximum capacity.'
                      : event.registrationOpens && new Date(event.registrationOpens) > now
                        ? `Registration opens ${new Date(event.registrationOpens).toLocaleDateString()}`
                        : 'Registration for this event is currently closed.'
                    }
                  </p>
                </div>
              ) : event.registrationType === 'individual' ? (
                <IndividualRegistrationForm eventId={event._id} />
              ) : (
                <TeamRegistrationForm eventId={event._id} minSize={event.minTeamSize || 2} maxSize={event.maxTeamSize || 10} />
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
      <div className="w-9 h-9 rounded-lg bg-[#0b2e5b]/5 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#0b2e5b] dark:text-blue-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Individual Registration Form ──────────────────────────────────────────
function IndividualRegistrationForm({ eventId }) {
  const registerMut = useMutation(api.events.registerIndividual);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', gender: '', college: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required.';
    if (!form.phone.trim() || !/^[\d\s+\-()]{7,15}$/.test(form.phone)) return 'Valid phone number is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError('');
    setSubmitting(true);
    try {
      await registerMut({
        eventId,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender || undefined,
        college: form.college.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[var(--bg-card)] border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 text-center space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">Registration Successful!</h3>
        <p className="text-xs text-[var(--text-secondary)]">You've been registered successfully. We'll contact you with further details.</p>
        <button onClick={() => setSuccess(false)} className="text-xs font-semibold text-[#0d3a73] dark:text-blue-400 hover:underline">Register Another Person</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
        <UserPlus className="w-4 h-4 text-[#0b2e5b] dark:text-blue-400" />
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Register Now</h3>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <RegInput label="Full Name *" value={form.fullName} onChange={(v) => handleChange('fullName', v)} placeholder="Your full name" icon={<User className="w-3.5 h-3.5" />} />
      <RegInput label="Email Address *" type="email" value={form.email} onChange={(v) => handleChange('email', v)} placeholder="your@email.com" icon={<Mail className="w-3.5 h-3.5" />} />
      <RegInput label="Phone Number *" type="tel" value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder="+91 9876543210" icon={<Phone className="w-3.5 h-3.5" />} />
      
      <div>
        <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Gender</label>
        <select
          value={form.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/20"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <RegInput label="College / Organization" value={form.college} onChange={(v) => handleChange('college', v)} placeholder="Your college or organization" icon={<Building2 className="w-3.5 h-3.5" />} />

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-lg text-sm font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        {submitting ? 'Submitting...' : 'Complete Registration'}
      </button>
    </form>
  );
}

// ── Team Registration Form ────────────────────────────────────────────────
function TeamRegistrationForm({ eventId, minSize, maxSize }) {
  const registerMut = useMutation(api.events.registerTeam);
  const [form, setForm] = useState({
    teamName: '', captainName: '', email: '', phone: '', college: '',
    members: Array.from({ length: minSize }, () => ({
      name: '', email: '', phone: '',
    })),
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleMemberChange = (idx, field, value) => {
    setForm((prev) => {
      const members = [...prev.members];
      members[idx] = { ...members[idx], [field]: value };
      return { ...prev, members };
    });
  };

  const addMember = () => {
    if (form.members.length >= maxSize) return;
    setForm((prev) => ({
      ...prev,
      members: [...prev.members, { name: '', email: '', phone: '' }],
    }));
  };

  const removeMember = (idx) => {
    if (form.members.length <= minSize) return;
    setForm((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx),
    }));
  };

  const validate = () => {
    if (!form.teamName.trim()) return 'Team name is required.';
    if (!form.captainName.trim()) return 'Captain name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid captain email is required.';
    if (!form.phone.trim() || !/^[\d\s+\-()]{7,15}$/.test(form.phone)) return 'Valid captain phone number is required.';
    for (let i = 0; i < form.members.length; i++) {
      if (!form.members[i].name.trim()) return `Member ${i + 1} name is required.`;
    }
    if (form.members.length < minSize) return `Team must have at least ${minSize} members.`;
    if (form.members.length > maxSize) return `Team cannot have more than ${maxSize} members.`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError('');
    setSubmitting(true);
    try {
      await registerMut({
        eventId,
        teamName: form.teamName.trim(),
        captainName: form.captainName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        college: form.college.trim() || undefined,
        members: form.members.map((m) => ({
          name: m.name.trim(),
          email: m.email?.trim() || undefined,
          phone: m.phone?.trim() || undefined,
        })),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[var(--bg-card)] border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 text-center space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">Team Registered!</h3>
        <p className="text-xs text-[var(--text-secondary)]">Your team "{form.teamName}" has been registered successfully.</p>
        <button onClick={() => setSuccess(false)} className="text-xs font-semibold text-[#0d3a73] dark:text-blue-400 hover:underline">Register Another Team</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0b2e5b] dark:text-blue-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Team Registration</h3>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">
          {minSize}–{maxSize} players
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <RegInput label="Team Name *" value={form.teamName} onChange={(v) => handleChange('teamName', v)} placeholder="e.g., Thunder Warriors" icon={<Users className="w-3.5 h-3.5" />} />

      <div className="pt-2 border-t border-[var(--border-color)]">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Captain Information</p>
        <div className="space-y-3">
          <RegInput label="Captain Name *" value={form.captainName} onChange={(v) => handleChange('captainName', v)} placeholder="Captain's full name" icon={<User className="w-3.5 h-3.5" />} />
          <RegInput label="Captain Email *" type="email" value={form.email} onChange={(v) => handleChange('email', v)} placeholder="captain@email.com" icon={<Mail className="w-3.5 h-3.5" />} />
          <RegInput label="Captain Phone *" type="tel" value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder="+91 9876543210" icon={<Phone className="w-3.5 h-3.5" />} />
        </div>
      </div>

      <RegInput label="College / Organization" value={form.college} onChange={(v) => handleChange('college', v)} placeholder="Team's college or organization" icon={<Building2 className="w-3.5 h-3.5" />} />

      {/* Team Members */}
      <div className="pt-2 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Team Members ({form.members.length} / {minSize}–{maxSize})
          </p>
          <button
            type="button"
            onClick={addMember}
            disabled={form.members.length >= maxSize}
            className="p-1 rounded-lg bg-[#0d3a73] text-white disabled:opacity-30 hover:bg-[#104a8e] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {form.members.map((member, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                  {idx === 0 ? '👑 Captain' : `Member ${idx + 1}`}
                </span>
                {form.members.length > minSize && (
                  <button type="button" onClick={() => removeMember(idx)} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <Minus className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Member name *"
                value={member.name}
                onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/20 placeholder:text-[var(--text-muted)]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={member.email}
                  onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/20 placeholder:text-[var(--text-muted)]"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={member.phone}
                  onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/20 placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-lg text-sm font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        {submitting ? 'Submitting...' : 'Register Team'}
      </button>
    </form>
  );
}

// Shared input component
function RegInput({ label, value, onChange, placeholder, type = 'text', icon }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/20 placeholder:text-[var(--text-muted)] transition-colors`}
        />
      </div>
    </div>
  );
}
