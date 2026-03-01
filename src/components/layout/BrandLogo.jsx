export default function BrandLogo({ showText = true }) {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <div className="w-9 h-9 rounded-2xl bg-brand-700 flex items-center justify-center shadow-sm">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      {showText && (
        <div className="hidden sm:block">
          <p className="text-lg font-semibold text-stone-900 leading-none"
             style={{ fontFamily: "var(--font-display)" }}>
            MothersNest
          </p>
          <p className="text-[10px] text-stone-400 tracking-wide mt-0.5">Antenatal Care Clinic</p>
        </div>
      )}
    </div>
  );
}
