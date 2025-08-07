import { component$, PropFunction } from "@builder.io/qwik";

// PUBLIC_INTERFACE
export interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

interface NoteSidebarProps {
  notes: Note[];
  selectedId: string | null;
  onSelect$: PropFunction<(id: string) => void>;
  onAdd$: PropFunction<() => void>;
  searchValue: string;
  setSearchValue$: PropFunction<(val: string) => void>;
}

export const NoteSidebar = component$((props: NoteSidebarProps) => {
  const { notes, selectedId, onSelect$, onAdd$, searchValue, setSearchValue$ } =
    props;
  const filterNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <aside class="sidebar">
      <header class="sidebar-header">
        <span class="brand">Notes</span>
        <button
          class="add-btn"
          aria-label="Add note"
          title="Add note"
          onClick$={onAdd$}
        >
          +
        </button>
      </header>
      <input
        class="search-input"
        placeholder="Search notes..."
        value={searchValue}
        onInput$={(e) => setSearchValue$((e.target as HTMLInputElement).value)}
        type="search"
      />
      <nav class="note-list">
        {filterNotes.length === 0 && (
          <div class="empty-list">No notes found.</div>
        )}
        {filterNotes.map((note) => (
          <button
            key={note.id}
            class={{
              "note-item": true,
              selected: selectedId === note.id,
            }}
            onClick$={() => onSelect$(note.id)}
            tabIndex={0}
          >
            <div class="note-item-title">{note.title || "Untitled"}</div>
            <div class="note-item-date">
              {new Date(note.updated_at).toLocaleString()}
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
});
