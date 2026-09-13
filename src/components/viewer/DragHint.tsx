interface DragHintProps {
  visible: boolean;
}

export function DragHint({ visible }: DragHintProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-4 flex justify-center transition-opacity duration-300 motion-reduce:hidden ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="flex items-center gap-2 rounded-full bg-carbon/70 px-3.5 py-1.5 text-xs font-medium text-hueso backdrop-blur">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5c-1.5 3-4 4.5-6 4.5S5.5 13 4 10Z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <circle cx="10" cy="10" r="1.8" fill="currentColor" />
        </svg>
        Arrastrá para girar
      </span>
    </div>
  );
}
