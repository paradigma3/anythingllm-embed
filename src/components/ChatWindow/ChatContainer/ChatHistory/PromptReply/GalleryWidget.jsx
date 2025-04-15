import { useEffect, useRef, useState } from 'react';

export default function GalleryWidget({ images, label }) {
  const parsedImages = typeof images === 'string'
    ? JSON.parse(images)
    : images;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const trackRef = useRef(null);

  // Duplicate slides for seamless looping
  const slides = [...parsedImages, ...parsedImages];

  // Kick off the 3s‑show / 1s‑slide cycle
  useEffect(() => {
    if (!parsedImages.length) return;
    let initialTimeout, intervalId;

    const slideOnce = () => setCurrentIndex(i => i + 1);

    // First slide after 3s
    initialTimeout = setTimeout(() => {
      slideOnce();
      // Then every 4s thereafter (3s static + 1s transition)
      intervalId = setInterval(slideOnce, 4000);
    }, 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [parsedImages.length]);

  // When we hit the duplicated‐first slide, snap back to real first
  useEffect(() => {
    if (currentIndex === parsedImages.length) {
      // after the 1s slide completes...
      const resetTimeout = setTimeout(() => {
        // disable transition, jump back to 0
        setTransitionEnabled(false);
        setCurrentIndex(0);
        // re‑enable transition on next frame
        requestAnimationFrame(() => setTransitionEnabled(true));
      }, 1000);
      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex, parsedImages.length]);

  if (!parsedImages.length) return null;

  return (
    <div className="allm-mt-4 allm-w-full">
      {label && (
        <h3 className="allm-text-sm allm-font-medium allm-mb-2">
          {label}
        </h3>
      )}
      <div
        className="allm-relative allm-w-full allm-overflow-hidden allm-rounded-lg"
        style={{ aspectRatio: '16 / 9' }} // enforce landscape
      >
        <div
          ref={trackRef}
          className="allm-flex allm-h-full"
          style={{
            width: `${slides.length * 100}%`, // track is N× wide
            transform: `translateX(-${currentIndex * (100 / slides.length)}%)`,
            transition: transitionEnabled
              ? 'transform 1s ease'
              : 'none',
          }}
        >
          {slides.map((src, idx) => (
            <div
              key={idx}
              className="allm-flex-none allm-h-full"
              style={{ width: `${100 / slides.length}%` }}
            >
              <img
                src={src}
                alt={`Gallery image ${idx + 1}`}
                className="allm-w-full allm-h-full allm-object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
