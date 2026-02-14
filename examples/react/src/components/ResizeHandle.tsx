interface ResizeHandleProps {
  onMouseDown: () => void;
}

export function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      className="w-1 bg-neutral-700 hover:bg-blue-500 cursor-col-resize shrink-0 transition-colors"
      onMouseDown={onMouseDown}
    />
  );
}
