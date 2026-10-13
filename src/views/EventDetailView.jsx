import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Calendar, MapPin, ChevronLeft, AlertCircle,
  Trophy, ZoomIn, X, Image as ImageIcon,
  Tag, IndianRupee, Layers, CheckCircle
} from 'lucide-react';
import { tw } from '@/constants';

export default function EventDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = useQuery(api.events.getPublished, id ? { id } : "skip");
  const eventsEnabled = useQuery(api.events.isEventsEnabled);
  const sportsList = useQuery(api.sports.list) || [];

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Map sports IDs to names
  const sportsMap = useMemo(() => {
    const map = {};
    for (const s of sportsList) {
      if (s._id) map[s._id] = s.name;
      if (s.name) map[s.name] = s.name;
    }
    return map;
  }, [sportsList]);

  // Redirect if events disabled
  if (eventsEnabled === false) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans">
        <Navbar activeSection="events" setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />
        <div className="pt-24 pb-20 px-4 min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <h2 className={`${tw`text-h3`}`}>Events Unavailable</h2>
            <p className="text-sm text-[var(--text-secondary)]">The events section is currently disabled.</p>
            <button onClick={() => navigate('/')} className="px-5 py-2.5 rounded-lg bg-[#0b2e5b] text-white text-sm font-bold cursor-pointer">Back to Home</button>
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
            <button onClick={() => navigate('/events')} className="px-5 py-2.5 rounded-lg bg-[#0b2e5b] text-white text-sm font-bold cursor-pointer">View All Events</button>
          </div>
        </div>
        <Footer setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />
      </div>
    );
  }

  const eventName = event.eventName || event.title || 'Untitled Event';
  const posterUrl = event.posterUrl || event.imageUrl || (event.images && event.images[0]) || '';
  const eventImages = event.images && event.images.length > 0 ? event.images : (posterUrl ? [posterUrl] : []);
  const activeImage = eventImages[selectedImgIdx] || posterUrl;
  const eventTypeLabel = event.eventType === 'inter_college' ? 'Inter-College' : 'Intramural';
  const disciplines = Array.isArray(event.sportsDisciplines) && event.sportsDisciplines.length > 0
    ? event.sportsDisciplines.map(d => sportsMap[d] || d)
    : (event.category ? [event.category] : []);
  const startDate = event.registrationStartDate || event.registrationOpens || event.eventDate;
  const endDate = event.registrationEndDate || event.registrationCloses || event.eventDate;

  const now = new Date();
  const isRegOpen = (() => {
    if (startDate && new Date(startDate) > now) return false;
    if (endDate && new Date(endDate) < now) return false;
    return true;
  })();

  const fee = event.registrationFee;
  const isFeePaid = fee?.type === 'paid';
  const feeText = isFeePaid
    ? `₹${fee.amount ?? 0} (${fee.basis === 'per_person' ? 'Per Person' : 'Per Team'})`
    : 'Free Entry';

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      <Navbar activeSection="events" setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />

      {/* Back Button */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[#0b2e5b] dark:hover:text-blue-400 font-medium py-3 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> All Events
        </button>
      </div>

      {/* Main Event Showcase */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (2 cols) — Media, Description, Disciplines */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Poster Gallery with Lightbox */}
            {activeImage ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] bg-slate-950 group">
                  <img
                    src={activeImage}
                    alt={eventName}
                    className="w-full h-72 sm:h-96 md:h-[420px] object-cover transition-transform duration-300 group-hover:scale-101 cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  />

                  {/* Top overlay badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white shadow-sm flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{selectedImgIdx === 0 ? 'Official Poster' : `Poster ${selectedImgIdx + 1}`}</span>
                    </span>
                    {eventImages.length > 1 && (
                      <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-semibold text-white">
                        {selectedImgIdx + 1} of {eventImages.length}
                      </span>
                    )}
                  </div>

                  {/* Click to expand button */}
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer opacity-90 hover:opacity-100"
                    title="View full size poster"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>View Full Size</span>
                  </button>
                </div>

                {/* Multiple Images Selector Tabs */}
                {eventImages.length > 1 && (
                  <div className="flex items-center gap-3 p-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
                    {eventImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImgIdx(idx)}
                        className={`flex-1 flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedImgIdx === idx
                            ? 'bg-[var(--bg-card)] text-[#0b2e5b] dark:text-blue-400 border border-blue-500/30 shadow-xs'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
                        }`}
                      >
                        <div className="w-10 h-8 rounded overflow-hidden shrink-0 border border-[var(--border-color)] bg-slate-900">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left truncate">
                          <p className="truncate text-[11px]">
                            {idx === 0 ? 'Cover Poster' : `Poster ${idx + 1}`}
                          </p>
                          <span className="text-[10px] text-[var(--text-muted)] font-normal">
                            {idx === selectedImgIdx ? 'Viewing now' : 'Click to view'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                event.eventType === 'inter_college'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
              }`}>
                <Tag className="w-3.5 h-3.5" />
                {eventTypeLabel}
              </span>

              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                isFeePaid
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              }`}>
                <IndianRupee className="w-3 h-3" />
                {feeText}
              </span>

              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                isRegOpen
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isRegOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {isRegOpen ? 'Registration Active' : 'Registration Closed'}
              </span>
            </div>

            {/* Title & Short Summary */}
            <div>
              <h1 className={`${tw`text-h1`} text-[var(--text-primary)] tracking-tight`}>{eventName}</h1>
              {event.shortDescription && (
                <p className="mt-2 text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                  {event.shortDescription}
                </p>
              )}
            </div>

            {/* Sports Disciplines */}
            {disciplines.length > 0 && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Open Sports Disciplines
                </h3>
                <div className="flex flex-wrap gap-2">
                  {disciplines.map((d, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:border-[#0b2e5b] transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#0b2e5b] dark:text-blue-400" />
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full Event Description / Guidelines */}
            {(event.description || event.fullDescription) && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">About this Tournament & Rules</h3>
                <div className="prose max-w-none text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {event.description || event.fullDescription}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 col) — Event Info Overview & Schedule Card */}
          <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-24">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-5 shadow-xs">
              <h3 className="text-sm font-bold text-[var(--text-primary)] pb-3 border-b border-[var(--border-color)]">
                Event Overview
              </h3>

              <div className="space-y-4">
                {/* Event Type */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-[#0b2e5b] dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Event Type</p>
                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{eventTypeLabel}</p>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#0b2e5b] dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Venue</p>
                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{event.venue || 'Campus Grounds'}</p>
                  </div>
                </div>

                {/* Registration Dates */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#0b2e5b] dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Registration Window</p>
                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                      {startDate ? new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                      {' — '}
                      {endDate ? new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                    </p>
                  </div>
                </div>

                {/* Registration Fee */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4 text-[#0b2e5b] dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Registration Fee</p>
                    <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">
                      {feeText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Info Box */}
              <div className="pt-4 border-t border-[var(--border-color)]">
                <div className={`p-4 rounded-xl text-center space-y-1.5 ${
                  isRegOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <p className="text-xs font-bold">
                    {isRegOpen ? 'Registration is currently open' : 'Registration is closed'}
                  </p>
                  <p className="text-[11px] opacity-80">
                    {isRegOpen
                      ? `Open until ${endDate ? new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'further notice'}.`
                      : 'Stay tuned for upcoming tournaments and schedules.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Full-Resolution Event Poster Inspection */}
      {isLightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[95vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between py-2.5 px-4 text-white bg-black/40 rounded-t-xl">
              <span className="text-xs font-bold flex items-center gap-2 truncate">
                <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{eventName} — {selectedImgIdx === 0 ? 'Official Poster' : `Poster ${selectedImgIdx + 1}`}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full max-h-[78vh] flex items-center justify-center overflow-auto p-2">
              <img
                src={activeImage}
                alt={eventName}
                className="max-h-[78vh] max-w-full w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
            {eventImages.length > 1 && (
              <div className="flex items-center gap-3 pt-3">
                {eventImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      selectedImgIdx === idx
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/20 text-white/80 hover:bg-white/30'
                    }`}
                  >
                    <span>{idx === 0 ? 'Poster 1' : `Poster ${idx + 1}`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer setActiveSection={(sec) => navigate(sec === 'home' ? '/' : `/${sec}`)} />
    </div>
  );
}
