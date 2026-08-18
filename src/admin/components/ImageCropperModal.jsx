import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCw, RefreshCw, Crop as CropIcon } from 'lucide-react';

export default function ImageCropperModal({ 
  imageSrc, 
  onClose, 
  onSave, 
  initialAspect = '1:1',
  title = "Crop & Adjust Photo",
  circularPreview = false
}) {
  // Transform State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Natural image dimensions
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);
  const cropBoxRef = useRef(null);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Reset
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Pointer drag for smooth panning
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture?.(e.pointerId);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom(prev => Math.min(Math.max(1, prev + delta), 4.0));
  };

  // Export cropped canvas
  const handleApplyCrop = () => {
    if (!imageRef.current || !cropBoxRef.current) return;
    const img = imageRef.current;
    const cropBox = cropBoxRef.current;

    const isWidescreen = initialAspect === '16:9';
    const targetWidth = isWidescreen ? 960 : 600;
    const targetHeight = isWidescreen ? 540 : (initialAspect === '4:3' ? 450 : 600);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Translate to center of canvas
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Box dimensions in screen pixels
    const boxRect = cropBox.getBoundingClientRect();
    const scaleFactor = targetWidth / boxRect.width;

    ctx.scale(zoom * scaleFactor, zoom * scaleFactor);
    ctx.translate(pan.x / zoom, pan.y / zoom);

    // Determine baseline display size inside the crop frame
    const imgAspect = naturalSize.width / naturalSize.height;
    const boxAspect = boxRect.width / boxRect.height;
    let baseW, baseH;

    if (imgAspect > boxAspect) {
      baseH = boxRect.height;
      baseW = boxRect.height * imgAspect;
    } else {
      baseW = boxRect.width;
      baseH = boxRect.width / imgAspect;
    }

    ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();

    // Export as high quality compressed JPEG
    const resultBase64 = canvas.toDataURL('image/jpeg', 0.90);
    onSave(resultBase64);
    onClose();
  };

  const isWidescreen = initialAspect === '16:9';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/80 text-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar - Clean Transparent Glass */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-blue-50 text-[#0b2e5b]">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0b2e5b] leading-tight">{title}</h3>
              <p className="text-[10px] text-slate-500">Drag photo to adjust framing • Scroll to zoom</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Reset Zoom and Position"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Workspace - Soft Transparent Canvas */}
        <div className="relative bg-slate-100/70 flex items-center justify-center overflow-hidden p-6 sm:p-8 min-h-[300px] select-none">
          
          {/* Crop Box Window */}
          <div
            ref={cropBoxRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-[#0b2e5b] shadow-xl bg-white ${
              circularPreview ? 'rounded-full ring-8 ring-white/80' : 'rounded-2xl ring-8 ring-white/80'
            }`}
            style={{
              width: isWidescreen ? '100%' : '260px',
              maxWidth: isWidescreen ? '380px' : '260px',
              height: isWidescreen ? 'auto' : '260px',
              aspectRatio: isWidescreen ? '16/9' : (initialAspect === '4:3' ? '4/3' : '1/1'),
              touchAction: 'none'
            }}
          >
            {/* Rule-of-Thirds Grid */}
            <div className={`absolute inset-0 pointer-events-none z-20 grid grid-cols-3 grid-rows-3 transition-opacity duration-150 ${
              isDragging ? 'opacity-40' : 'opacity-15'
            }`}>
              <div className="border-r border-b border-slate-700" />
              <div className="border-r border-b border-slate-700" />
              <div className="border-b border-slate-700" />
              <div className="border-r border-b border-slate-700" />
              <div className="border-r border-b border-slate-700" />
              <div className="border-b border-slate-700" />
              <div className="border-r border-b border-slate-700" />
              <div className="border-r border-b border-slate-700" />
              <div />
            </div>

            {/* Transform Layer */}
            <div
              className="w-full h-full flex items-center justify-center origin-center"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Original Upload"
                onLoad={handleImageLoad}
                draggable={false}
                className="max-w-none max-h-none pointer-events-none select-none"
                style={{
                  minWidth: '100%',
                  minHeight: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

        </div>

        {/* Clean Controls Footer */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-slate-100 p-4 space-y-3.5">
          
          {/* Zoom Slider + Rotate */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Zoom Slider */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <button 
                type="button"
                onClick={() => setZoom(prev => Math.max(1, prev - 0.2))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#0b2e5b] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <button 
                type="button"
                onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-600 font-mono w-8 text-right font-semibold">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>

          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Save Photo</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
