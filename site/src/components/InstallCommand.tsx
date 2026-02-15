import { useState } from 'react';

type PackageManager = 'npm' | 'bun' | 'yarn' | 'pnpm';

const commands: Record<PackageManager, string> = {
  npm: 'npm install spotr',
  bun: 'bun add spotr',
  yarn: 'yarn add spotr',
  pnpm: 'pnpm add spotr',
};

export default function InstallCommand() {
  const [selectedManager, setSelectedManager] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState(false);
  const command = commands[selectedManager];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const managers: PackageManager[] = ['npm', 'bun', 'yarn', 'pnpm'];

  return (
    <div className="mt-6 w-[420px] bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-neutral-700">
        {managers.map((manager) => (
          <button
            key={manager}
            onClick={() => setSelectedManager(manager)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedManager === manager
                ? 'text-neutral-100 bg-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
            aria-label={`Select ${manager}`}
          >
            {manager}
          </button>
        ))}
      </div>

      {/* Command display and copy button */}
      <div className="flex items-center gap-3 px-4 py-3">
        <code className="flex-1 text-neutral-200 font-mono text-sm">{command}</code>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-neutral-100 bg-neutral-700 hover:bg-neutral-600 rounded transition-colors"
          aria-label="Copy install command"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
