import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConvexState } from '../context/ConvexStateContext';

// Automatically import pd.jpg, pd2.jpg, etc. as soon as they are placed in assets
const pdModules = import.meta.glob(
  [
    '/assets/pd*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
    '/assets/images/pd*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
    '/src/assets/pd*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  ],
  { eager: true, import: 'default' }
);

// Automatically import apd.jpg, apd2.jpg, asst_pd.jpg as soon as they are placed in assets
const apdModules = import.meta.glob(
  [
    '/assets/apd*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
    '/assets/images/apd*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
    '/assets/asst_pd*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
    '/assets/images/asst_pd*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
    '/src/assets/apd*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  ],
  { eager: true, import: 'default' }
);

// Sort photos naturally (pd, pd2, pd3, etc.) and deduplicate
const sortAndDedupePhotos = (modules) => {
  const sorted = Object.entries(modules)
    .sort(([pathA], [pathB]) => {
      const filenameA = pathA.split('/').pop();
      const filenameB = pathB.split('/').pop();
      return filenameA.localeCompare(filenameB, undefined, { numeric: true, sensitivity: 'base' });
    })
    .map(([_, src]) => src)
    .filter(Boolean);

  return Array.from(new Set(sorted));
};

const uploadedPdPhotos = sortAndDedupePhotos(pdModules);
const uploadedApdPhotos = sortAndDedupePhotos(apdModules);

/**
 * Reusable slideshow / photo component for Director profiles.
 * Works seamlessly with a single photo (no extra controls), and provides
 * smooth auto-advancing and clickable dot indicators when multiple photos exist.
 */
function ProfilePhotoSlideshow({ photos = [], name, role, intervalMs = 4500 }) {
  const [activePhotos, setActivePhotos] = useState(photos);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setActivePhotos(photos.filter(Boolean));
    setCurrentIndex(0);
  }, [photos]);

  const count = activePhotos.length;

  // Auto-advance slideshow if multiple photos exist
  useEffect(() => {
    if (count <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [count, intervalMs]);

  const handleImageError = (failedSrc) => {
    setActivePhotos((prev) => prev.filter((s) => s !== failedSrc));
    setCurrentIndex(0);
  };

  if (count === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 select-none">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center shadow-inner">
          <User className="w-12 h-12 sm:w-14 sm:h-14 text-slate-400 stroke-[1.5]" />
        </div>
        <p className="mt-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
          {name}
        </p>
        <p className="text-[11px] text-slate-400 font-medium text-center">
          {role}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Slides */}
      {activePhotos.map((src, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={src || index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            <img
              src={src}
              alt={`${name} photo ${index + 1}`}
              className="w-full h-full object-cover object-top"
              onError={() => handleImageError(src)}
            />
          </div>
        );
      })}

      {/* Bottom Dots Indicator (Only shown when multiple photos exist) */}
      {count > 1 && (
        <div className="absolute bottom-2.5 inset-x-0 z-20 flex justify-center items-center gap-1.5 pointer-events-auto drop-shadow-sm">
          {activePhotos.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full h-1.5 cursor-pointer ${
                idx === currentIndex
                  ? 'w-5 bg-white shadow-md'
                  : 'w-1.5 bg-white/60 hover:bg-white/90 shadow-xs'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DirectorProfile() {
  const { executiveBody = [] } = useConvexState();

  // Find Physical Director K. Venkata Rao from institutional leadership records
  const directorFromState = executiveBody.find(m => 
    m.name?.toLowerCase().includes('venkata rao') || 
    m.position?.toLowerCase().includes('physical director')
  );

  // Find Assistant Physical Director M. Surya Prakash Rao
  const asstDirectorFromState = executiveBody.find(m => 
    m.name?.toLowerCase().includes('surya prakash') || 
    m.position?.toLowerCase().includes('assistant physical director') ||
    m.position?.toLowerCase().includes('asst. physical director')
  );

  // Physical Director Data
  const directorData = {
    name: directorFromState?.name || "K. Venkata Rao",
    role: "Physical Director & Faculty Incharge",
    department: "Department of Physical Education",
    institution: "KKR & KSR Institute of Technology & Sciences (Autonomous)",
    photos: uploadedPdPhotos.length > 0 
      ? uploadedPdPhotos 
      : (directorFromState?.photo ? [directorFromState.photo] : []),
    photo: uploadedPdPhotos[0] || directorFromState?.photo || null,
    quote: "Sports is not for timepass, It is a way of life.",
    messageParagraph1: "At KiTS Sports Club, we encourage every student to take part in sports along with their studies. Sports help students stay fit, disciplined, confident, and work well as a team. We provide regular practice and support for students who are interested in different sports activities.",
    messageParagraph2: "We are happy to see our students representing KiTS in various competitions at the district, JNTUK, state, South Zone, and All-India levels. Our aim is to give every student a good opportunity to improve their skills, participate in competitions, and achieve success in sports while continuing their education."
  };

  // Assistant Physical Director Data
  const asstDirectorData = {
    name: asstDirectorFromState?.name || "M. Surya Prakash Rao",
    role: "Assistant Physical Director",
    department: "Department of Physical Education",
    institution: "KKR & KSR Institute of Technology & Sciences (Autonomous)",
    photos: uploadedApdPhotos.length > 0 
      ? uploadedApdPhotos 
      : (asstDirectorFromState?.photo ? [asstDirectorFromState.photo] : []),
    photo: uploadedApdPhotos[0] || asstDirectorFromState?.photo || null,
    quote: "Consistent training, mental grit, and team synergy on the practice field are the true cornerstones of athletic distinction and character building.",
    messageParagraph1: "Committed to advancing athletic discipline and physical fitness across all engineering and management branches. Providing specialized coaching, tactical training, and strength conditioning to help students realize their full potential in sports.",
    messageParagraph2: "Actively involved in coordinating intra-mural tournaments, organizing athletic trials, and preparing student teams to compete with distinction in JNTUK inter-collegiate championships and university leagues."
  };

  return (
    <section id="director-message" className="py-10 sm:py-14 lg:py-16 !bg-white bg-white text-slate-800 border-b border-slate-200 transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* ============================================================== */}
        {/* 1. PHYSICAL DIRECTOR (Photo LEFT, Text RIGHT)                  */}
        {/* ============================================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        >
          
          {/* LEFT SIDE — PERSON PHOTO (4:3 aspect ratio, wider) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="order-1 lg:col-span-5 flex flex-col items-center lg:items-start justify-center"
          >
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-none">
              <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 aspect-[4/3] w-full flex items-center justify-center">
                <ProfilePhotoSlideshow
                  photos={directorData.photos}
                  name={directorData.name}
                  role="Physical Director"
                />
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE — PERSON INFORMATION */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="order-2 lg:col-span-7 space-y-4 sm:space-y-5"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b2e5b]">
                ABOUT OUR PHYSICAL DIRECTOR
              </p>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b2e5b] tracking-tight">
                {directorData.name}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-amber-600">
                {directorData.role}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {directorData.department} • {directorData.institution}
              </p>
            </div>

            <div className="space-y-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed italic">
              <p>
                {directorData.messageParagraph1}
              </p>
              <p>
                {directorData.messageParagraph2}
              </p>
            </div>

            <div className="pt-1">
              <blockquote className="border-l-3 sm:border-l-4 border-[#0b2e5b] pl-4 py-1 text-slate-700 italic text-sm sm:text-[15px] leading-relaxed">
                “{directorData.quote}”
              </blockquote>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-500 pl-4 not-italic">
                — {directorData.name}
              </p>
            </div>
          </motion.div>

        </motion.div>

        {/* Subtle Section Divider */}
        <div className="border-t border-slate-200" />

        {/* ============================================================== */}
        {/* 2. ASST. PHYSICAL DIRECTOR (Text LEFT, Photo RIGHT)            */}
        {/* ============================================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        >
          
          {/* LEFT SIDE ON DESKTOP — PERSON INFORMATION */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="order-2 lg:order-1 lg:col-span-7 space-y-4 sm:space-y-5"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b2e5b]">
                ABOUT OUR ASSISTANT PHYSICAL DIRECTOR
              </p>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b2e5b] tracking-tight">
                {asstDirectorData.name}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-amber-600">
                {asstDirectorData.role}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {asstDirectorData.department} • {asstDirectorData.institution}
              </p>
            </div>

            <div className="space-y-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed italic">
              <p>
                {asstDirectorData.messageParagraph1}
              </p>
              <p>
                {asstDirectorData.messageParagraph2}
              </p>
            </div>

            <div className="pt-1">
              <blockquote className="border-l-3 sm:border-l-4 border-[#0b2e5b] pl-4 py-1 text-slate-700 italic text-sm sm:text-[15px] leading-relaxed">
                “{asstDirectorData.quote}”
              </blockquote>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-500 pl-4 not-italic">
                — {asstDirectorData.name}
              </p>
            </div>
          </motion.div>

          {/* RIGHT SIDE ON DESKTOP — PERSON PHOTO */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center lg:items-end justify-center"
          >
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-none">
              <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 aspect-[4/3] w-full flex items-center justify-center">
                <ProfilePhotoSlideshow
                  photos={asstDirectorData.photos}
                  name={asstDirectorData.name}
                  role="Assistant Physical Director"
                />
              </div>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
