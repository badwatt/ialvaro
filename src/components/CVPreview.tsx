import { XIcon, DownloadSimpleIcon, SpinnerIcon } from "@phosphor-icons/react";

type Props = {
  url: string | null;
  isGenerating: boolean;
  onClose: () => void;
  onDownload: () => void;
};

export const CVPreview = ({ url, isGenerating, onClose, onDownload }: Props) => {
  if (!url && !isGenerating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-alvaro-dark/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full h-full md:max-w-4xl md:h-[85vh] bg-alvaro-surface rounded-none md:rounded-2xl border border-alvaro-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-alvaro-border">
          <h3 className="text-lg font-bold text-alvaro-white">CV Preview</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDownload}
              disabled={!url}
              className="flex items-center gap-2 px-4 py-2 bg-alvaro-primary text-alvaro-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <DownloadSimpleIcon size={18} weight="bold" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="p-2 rounded-lg text-alvaro-muted hover:text-alvaro-white hover:bg-alvaro-primary/10 transition-colors"
            >
              <XIcon size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <SpinnerIcon size={40} weight="bold" className="text-alvaro-primary animate-spin" />
              <p className="text-alvaro-muted text-sm">Generating CV...</p>
            </div>
          ) : (
            <iframe
              src={url ?? undefined}
              title="CV Preview"
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};