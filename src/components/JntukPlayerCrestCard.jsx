import React, { useState } from 'react';
import { User } from 'lucide-react';

/**
 * JntukPlayerDiamondCard
 * 
 * Clean, plain diamond portrait shape with zero extra decoration:
 * - Simple diamond portrait frame with border and shadow on hover.
 * - Bold athlete name.
 * - Bold red registration number ("Reg no: ...").
 * - Bold event name ("Event : ...").
 * - Subtitle for Academic Year & Department.
 */
export default function JntukPlayerCrestCard({ 
  player, 
  onClick 
}) {
  const [imgError, setImgError] = useState(false);

  const {
    studentName = '',
    rollNumber = '',
    sport = '',
    department = '',
    academicYear = '',
    photoUrl = '',
  } = player || {};

  const eventName = sport ? sport.toUpperCase() : 'SPORTS';
  const rollNoDisplay = rollNumber ? rollNumber.toUpperCase() : '';
  const nameDisplay = studentName ? studentName.toUpperCase() : 'ATHLETE NAME';
  const hasPhoto = Boolean(photoUrl) && !imgError;

  return (
    <div 
      onClick={() => onClick && onClick(player)}
      className="group flex flex-col items-center text-center space-y-3 w-36 sm:w-48 md:w-52 animate-slideUp cursor-pointer select-none mx-auto"
    >
      {/* Plain Diamond Portrait Frame (Rotated Square) */}
      <div className="relative py-2 sm:py-3">
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 p-1 bg-white border border-gray-300 shadow-md group-hover:border-[#0b2e5b] group-hover:shadow-lg transition-all duration-300 rotate-45 rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="w-full h-full overflow-hidden bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
            {hasPhoto ? (
              <img
                src={photoUrl}
                alt={studentName}
                className="w-full h-full object-cover -rotate-45 scale-145 group-hover:scale-155 transition-transform duration-300 rounded-xl sm:rounded-2xl"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="-rotate-45 text-slate-400 group-hover:text-slate-600 transition-colors flex items-center justify-center">
                <User className="w-8 h-8 sm:w-12 sm:h-12 stroke-[1.5]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Athlete Information Directly Below */}
      <div className="space-y-0.5 sm:space-y-1 max-w-full px-1">
        
        {/* Athlete Name */}
        <h3 className="font-bold text-[#0b2e5b] leading-snug group-hover:text-[#0d3a73] transition-colors text-xs sm:text-sm md:text-base uppercase line-clamp-1">
          {nameDisplay}
        </h3>

        {/* Registration Number */}
        {rollNoDisplay && (
          <p className="text-[10.5px] sm:text-xs font-bold text-red-700 font-mono leading-tight">
            Reg no: {rollNoDisplay}
          </p>
        )}

        {/* Event */}
        <p className="text-[10.5px] sm:text-xs font-bold text-slate-700 uppercase leading-tight">
          Event : <span className="text-amber-600 font-extrabold">{eventName}</span>
        </p>

        {/* Academic Year & Department */}
        {(academicYear || department) && (
          <p className="text-[10px] font-semibold text-slate-500 leading-tight pt-0.5">
            {academicYear ? `AY ${academicYear}` : ''}{academicYear && department ? ' • ' : ''}{department ? `Dept: ${department}` : ''}
          </p>
        )}

      </div>
    </div>
  );
}
