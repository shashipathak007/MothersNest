const BASE =
  "inline-flex items-center gap-2 font-medium rounded-xl transition-all " +
  "focus:outline-none focus:ring-2 focus:ring-offset-1 " +
  "disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]";

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const VARIANTS = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 focus:ring-brand-600 shadow-sm",
  ghost:   "text-stone-500 hover:bg-stone-100 focus:ring-stone-300",
  outline: "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50 focus:ring-brand-600",
  danger:  "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm",
};

export default function Button({
  children, onClick, type = "button",
  variant = "primary", size = "md",
  disabled, className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
