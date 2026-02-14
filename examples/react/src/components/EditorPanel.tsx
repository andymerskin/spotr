import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark';

interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
  width: number;
  parseError: string | null;
  onReset: () => void;
}

export function EditorPanel({ value, onChange, width, parseError, onReset }: EditorPanelProps) {
  return (
    <div 
      className="shrink-0 border-l border-neutral-700 flex flex-col bg-neutral-900"
      style={{ width }}
    >
      <div className="p-3 border-b border-neutral-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-300">Config Editor</h3>
        <button
          onClick={onReset}
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          Reset
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={value}
          height="100%"
          extensions={[javascript()]}
          theme={vsCodeDark}
          onChange={onChange}
          className="h-full text-sm"
          style={{ height: '100%' }}
        />
      </div>
      {parseError && (
        <div className="p-2 text-xs text-red-400 bg-red-900/30 border-t border-red-800">
          Parse Error: {parseError}
        </div>
      )}
      <div className="p-2 text-xs text-neutral-500 border-t border-neutral-700">
        Keywords handlers are fixed per example
      </div>
    </div>
  );
}
