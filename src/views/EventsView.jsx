import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar, MapPin, Users, User, ChevronLeft, 
  ArrowRight, Trophy, Image as ImageIcon
} from 'lucide-react';
import { tw } from '@/constants';

export default function EventsView() {
  const navigate = useNavigate();
  const eventsEnabled = useQuery(api.events.isEventsEnabled);
  const events = useQuery(api.events.listPublished);

  // If events are disabled, show graceful message
  if (eventsEnabled === false) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans">
        <Navbar activeSection="events" setActiveSection={(id) => navigate(id === 'home' ? '/' : `/${id}`)} />
        <div className="pt-24 pb-20 px-4 min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h2 className={`${tw`text-h2`} text-[var(--text-primary)]`}>Events Coming Soon</h2>
            <p className="text-sm text-[var(--text-secondary)]">The events section is currently unavailable. Please check back later for upcoming events.</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0b2e5b] hover:bg-[#0d3a73] text-white text-sm font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </button>
          </div>
        </div>
        <Footer setActiveSection={(id) => navigate(id === 'home' ? '/' : `/${id}`)} />
      </div>
    );
  }

  // Loading
  if (eventsEnabled === undefined || events === undefined) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/kits_logo.png?v=2" alt="KiTS" className="w-16 h-16 object-contain" />
          <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-[#0b2e5b] animate-spin" />
        </div>
      </div>
    );
  }

  const publishedEvents = events || [];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      <Navbar activeSection="events" setActiveSection={(id) => navigate(id === 'home' ? '/' : `/${id}`)} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0b2e5b] to-[#0d3a73] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold backdrop-blur-sm">
            <Calendar className="w-3.5 h-3.5" /> Upcoming Events
          </div>
          <h1 className={`${tw`text-h1`} text-white`}>Events & Tournaments</h1>
          <p className="text-sm text-white/70 max-w-xl mx-auto">
            Explore upcoming sports events, tournaments, and competitions. Register now to secure your spot!
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {publishedEvents.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className={`${tw`text-h3`} text-[var(--text-primary)]`}>No Events Available</h3>
            <p className="text-sm text-[var(--text-secondary)]">There are no published events at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedEvents.map((event) => (
              <EventCard key={event._id} event={event} onClick={() => navigate(`/events/${event._id}`)} />
            ))}
          </div>
        )}
      </section>

      <Footer setActiveSection={(id) => navigate(id === 'home' ? '/' : `/${id}`)} />
    </div>
  );
}

function EventCard({ event, onClick }) {
  const isRegOpen = event.registrationEnabled && (() => {
    const now = new Date();
    if (event.registrationOpens && new Date(event.registrationOpens) > now) return false;
    if (event.registrationCloses && new Date(event.registrationCloses) < now) return false;
    return true;
  })();

  return (
    <div
      onClick={onClick}
      className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden card-hover cursor-pointer"
    >
      {/* Image */}
      {event.imageUrl && (
        <div className="relative img-zoom h-44 bg-gradient-to-br from-[#0b2e5b] to-[#0d3a73]">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          {event.images && event.images.length > 1 && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[10px] text-white font-bold flex items-center gap-1 shadow-sm">
              <ImageIcon className="w-3 h-3 text-blue-300" />
              <span>2 Photos</span>
            </div>
          )}
        </div>
      )}
      {!event.imageUrl && (
        <div className="h-44 bg-gradient-to-br from-[#0b2e5b] to-[#0d3a73] flex items-center justify-center">
          <Calendar className="w-12 h-12 text-white/20" />
        </div>
      )}

      <div className="p-5 space-y-3">
        {/* Category & Type Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {event.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 text-[10px] font-bold">
              <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> {event.category}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            event.registrationType === 'team'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
          }`}>
            {event.registrationType === 'team' ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
            {event.registrationType === 'team'
              ? `Team (${event.minTeamSize || 2}–${event.maxTeamSize || 10})`
              : 'Individual'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[#0d3a73] dark:group-hover:text-blue-400 transition-colors line-clamp-2">{event.title}</h3>

        {/* Description */}
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{event.shortDescription}</p>

        {/* Details */}
        <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {event.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {event.venue}
            </span>
          )}
        </div>

        {/* Registration Status */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
          <span className={`text-[10px] font-bold ${isRegOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {isRegOpen ? '● Registration Open' : '● Registration Closed'}
          </span>
          <span className="text-[10px] font-semibold text-[#0d3a73] dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            View Details <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
