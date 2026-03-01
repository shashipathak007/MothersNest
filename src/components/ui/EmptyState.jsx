export default function EmptyState({ icon = "✦", message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <span className="text-3xl opacity-20">{icon}</span>
      <p className="text-sm text-stone-400">{message}</p>
    </div>
  );
}


