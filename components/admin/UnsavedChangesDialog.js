'use client';

export default function UnsavedChangesDialog({ isOpen, onSave, onDiscard, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900">Unsaved changes</h3>
          <p className="mt-2 text-sm text-zinc-600">
            You have unsaved changes. What would you like to do?
          </p>
        </div>
        <div className="flex gap-3 border-t border-zinc-100 p-4">
          <button
            type="button"
            onClick={onSave}
            className="flex-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="flex-1 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

