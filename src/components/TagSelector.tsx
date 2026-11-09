import React, { useState } from 'react';
import { Tag as TagIcon, Plus, X, Check, ChevronDown } from 'lucide-react';
import { TagItem } from '../types';

interface TagSelectorProps {
  availableTags: TagItem[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  onAddNewTag: (name: string, color?: string) => Promise<TagItem | null>;
}

const PRESET_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // amber
  '#ef4444', // red
];

export const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  onChange,
  onAddNewTag,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const removeTag = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTags.filter((t) => t !== tagName));
  };

  const handleCreateNewTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await onAddNewTag(newTagName.trim(), selectedColor);
      if (created) {
        if (!selectedTags.includes(created.name)) {
          onChange([...selectedTags, created.name]);
        }
        setNewTagName('');
        setIsAddingNew(false);
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <TagIcon className="w-3.5 h-3.5 text-emerald-500" />
        <span>Tags</span>
      </label>

      {/* Selected Tags Display & Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 cursor-pointer flex items-center justify-between gap-2 transition-all hover:border-emerald-500"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedTags.length === 0 ? (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Select tags or choose "Other" to add a new one...
            </span>
          ) : (
            selectedTags.map((tagName) => {
              const meta = availableTags.find((t) => t.name === tagName);
              const color = meta?.color || '#10b981';
              return (
                <span
                  key={tagName}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-800 dark:text-slate-100 border transition-all"
                  style={{
                    backgroundColor: `${color}18`,
                    borderColor: `${color}40`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{tagName}</span>
                  <button
                    type="button"
                    onClick={(e) => removeTag(tagName, e)}
                    className="p-0.5 hover:text-rose-500 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2 animate-in fade-in duration-150 max-h-64 overflow-y-auto">
          {/* Existing tags list */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
              Available Tags (from DB)
            </span>
            <div className="grid grid-cols-2 gap-1 pt-1">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color || '#10b981' }}
                      />
                      <span className="truncate">{tag.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* "+ Add New Tag / Other option" */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {!isAddingNew ? (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Other / + Add New Tag to Table</span>
              </button>
            ) : (
              <form onSubmit={handleCreateNewTag} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Add New Tag to Database
                </span>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name (e.g. Vacation, Gym)..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />

                {/* Color presets */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Color:</span>
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        selectedColor === col ? 'scale-125 ring-2 ring-emerald-500' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewTagName('');
                    }}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newTagName.trim()}
                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Select'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
