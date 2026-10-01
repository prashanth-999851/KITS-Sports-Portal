import { useState } from 'react';
import { motion } from 'framer-motion';
import { useConvexState } from '../context/ConvexStateContext';
import { Trophy, Medal, Award, Crown, ExternalLink } from 'lucide-react';
import AchievementRecordsModal from './AchievementRecordsModal';

function MedalTallySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 stagger-children">
      {[1, 2, 3, 4].map(n => (
        <div key={n} className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-3 animate-slideUp shadow-sm">
          <div className="w-10 h-10 rounded-full skeleton-shimmer mx-auto" />
          <div className="h-8 w-16 skeleton-shimmer mx-auto rounded" />
          <div className="h-3 w-20 skeleton-shimmer mx-auto rounded" />
        </div>
      ))}
    </div>
  );
}

export default function Achievements() {
  const { achievements, isLoading } = useConvexState();
  const { tallies, awards, records = [] } = achievements;
  const [activeModalType, setActiveModalType] = useState(null);

  const isTallyLoading = isLoading || !tallies?.isLoaded;

  const formatValue = (val) => {
    if (val === undefined || val === null || val === '') return '0+';
    const str = String(val).trim();
    return str.endsWith('+') ? str : `${str}+`;
  };

  const medalData = tallies ? [
    { 
      type: 'trophy',
      icon: Trophy, 
      value: (tallies.trophies !== undefined && tallies.trophies !== null) ? tallies.trophies : 75, 
      label: 'Trophies Won',
      iconColor: 'text-amber-500',
      badgeColor: 'text-amber-700 bg-amber-50 group-hover:bg-amber-100',
      canView: true,
    },
    { 
      type: 'gold',
      icon: Crown, 
      value: (tallies.gold !== undefined && tallies.gold !== null) ? tallies.gold : 18, 
      label: 'Gold Medals',
      iconColor: 'text-amber-500',
      badgeColor: 'text-yellow-800 bg-yellow-50 group-hover:bg-yellow-100',
      canView: false,
    },
    { 
      type: 'silver',
      icon: Award, 
      value: (tallies.silver !== undefined && tallies.silver !== null) ? tallies.silver : 14, 
      label: 'Silver Medals',
      iconColor: 'text-slate-400',
      badgeColor: 'text-slate-700 bg-slate-100 group-hover:bg-slate-200',
      canView: false,
    },
    { 
      type: 'bronze',
      icon: Medal, 
      value: (tallies.bronze !== undefined && tallies.bronze !== null) ? tallies.bronze : 22, 
      label: 'Bronze Medals',
      iconColor: 'text-amber-700',
      badgeColor: 'text-orange-800 bg-orange-50 group-hover:bg-orange-100',
      canView: false,
    },
  ] : [];

  return (
    <section id="achievements" className="py-12 sm:py-16 bg-white transition-colors overflow-hidden">
      <div className="section-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-12">
        
        {/* Header with scroll animation */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-2.5"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b2e5b]">
            Wall of Fame
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] section-accent">
            Sports <span className="accent-text">Achievements</span> & Laurels
          </h2>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Celebrating the champions, record breakers, best teams, and national representatives who bring honor to KKR & KSR Institute.
          </p>
        </motion.div>

        {/* Medal Tally Cards */}
        {isTallyLoading ? (
          <MedalTallySkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 stagger-children">
            {medalData.map((medal, idx) => {
              const Icon = medal.icon;
              const hasView = medal.canView;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                  role={hasView ? "button" : undefined}
                  tabIndex={hasView ? 0 : undefined}
                  aria-label={hasView ? `View all ${medal.label} records (${medal.value})` : undefined}
                  onClick={hasView ? () => setActiveModalType(medal.type) : undefined}
                  onKeyDown={hasView ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveModalType(medal.type);
                    }
                  } : undefined}
                  className={`group relative p-6 rounded-xl bg-white border border-slate-200 text-center space-y-2.5 shadow-sm transition-all duration-200 ${
                    hasView 
                      ? 'hover:border-[#0b2e5b] card-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0b2e5b] focus:ring-offset-2 hover:shadow-md' 
                      : ''
                  }`}
                >
                  <div className={`flex items-center justify-center mx-auto py-1 transition-transform duration-200 ${hasView ? 'group-hover:scale-110' : ''}`}>
                    <Icon className={`w-8 h-8 ${medal.iconColor}`} />
                  </div>
                  <h3 className={`text-3xl sm:text-4xl font-extrabold text-[#0b2e5b] tracking-tight transition-colors ${hasView ? 'group-hover:text-blue-700' : ''}`}>
                    {formatValue(medal.value)}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {medal.label}
                  </p>

                  {/* Interactive hint badge - Only for Trophies */}
                  {hasView && (
                    <div className="pt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-black group-hover:text-black opacity-90 group-hover:opacity-100 transition-opacity">
                      <span className="underline-offset-2 group-hover:underline text-black">View</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-black" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Modal for Detailed Records */}
        {activeModalType && (
          <AchievementRecordsModal
            isOpen={!!activeModalType}
            type={activeModalType}
            records={records}
            isLoading={isLoading}
            onClose={() => setActiveModalType(null)}
          />
        )}

        {/* Awards - Only displayed if awards exist */}
        {awards && awards.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 pt-4"
          >
            <h3 className="text-lg sm:text-xl font-bold text-[#0b2e5b] border-b border-slate-200 pb-3">
              Annual Excellence Awards
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
              {awards.map((award, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  className="group rounded-xl bg-white border border-slate-200 overflow-hidden flex flex-col sm:flex-row card-hover shadow-sm"
                >
                  <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0 overflow-hidden bg-slate-100 img-zoom">
                    <img
                      src={award.image}
                      alt={award.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600";
                      }}
                    />
                  </div>
                  <div className="p-5 space-y-2 flex-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 text-[#0b2e5b] uppercase tracking-wider">
                      {award.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-800 group-hover:text-[#0b2e5b] transition-colors">
                      {award.title}
                    </h4>
                    <p className="text-xs font-semibold text-amber-600">
                      Awarded to: {award.recipient}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {award.achievement}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
