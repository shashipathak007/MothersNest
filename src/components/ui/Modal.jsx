import { createPortal } from "react-dom";

const SIZE_MAP = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" };

export default function Modal({ title, subtitle, onClose, children, size = "md" }) {
  return createPortal(
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white w-full ${SIZE_MAP[size]} rounded-2xl shadow-2xl flex flex-col max-h-[85vh]`}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="font-semibold text-stone-900">{title}</h2>
            {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors ml-4 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}