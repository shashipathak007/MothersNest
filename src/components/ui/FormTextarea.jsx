const fieldCls =
  "w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl " +
  "focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent " +
  "placeholder:text-stone-300 resize-none transition-shadow";

export default function FormTextarea({ label, className = "", ...rest }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea className={fieldCls} rows={3} {...rest} />
    </div>
  );
}
