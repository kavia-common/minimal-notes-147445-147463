import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import { NoteSidebar, type Note } from "../components/NoteSidebar";
import { NoteMain } from "../components/NoteMain";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../utils/api";
import type { DocumentHead } from "@builder.io/qwik-city";

// PUBLIC_INTERFACE
export default component$(() => {
  const notes = useSignal<Note[]>([]);
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);
  const selectedId = useSignal<string | null>(null);
  const isEditing = useSignal(false);
  const isNewNote = useSignal(false);
  const search = useSignal("");

  // Fetch notes on mount/refresh
  useTask$(async () => {
    loading.value = true;
    try {
      notes.value = await fetchNotes();
      error.value = null;
    } catch (e: any) {
      error.value = e.message ?? "Could not fetch notes";
    } finally {
      loading.value = false;
    }
  });

  // If all notes deleted, clear selection.
  useTask$(({ track }) => {
    track(() => notes.value.length);
    if (
      selectedId.value &&
      !notes.value.find((n) => n.id === selectedId.value)
    ) {
      selectedId.value = null;
      isEditing.value = false;
      isNewNote.value = false;
    }
  });

  // Add a new note
  const handleAdd = $(async () => {
    isEditing.value = true;
    isNewNote.value = true;
    selectedId.value = "_new";
    // Note field is null, a blank one shown
  });

  // Save note (create or update)
  const handleSave = $(async (title: string, content: string) => {
    loading.value = true;
    try {
      if (isNewNote.value) {
        const n = await createNote(title, content);
        notes.value = [n, ...notes.value];
        selectedId.value = n.id;
        isNewNote.value = false;
      } else {
        const id = selectedId.value!;
        const n = await updateNote(id, title, content);
        notes.value = notes.value.map((note) =>
          note.id === id ? n : note
        );
      }
      isEditing.value = false;
      error.value = null;
    } catch (e: any) {
      error.value = e.message ?? "Could not save note";
    } finally {
      loading.value = false;
    }
  });

  // Delete note
  const handleDelete = $(async () => {
    if (!selectedId.value) return;
    loading.value = true;
    try {
      if (isNewNote.value) {
        // Just cancel draft
        isEditing.value = false;
        isNewNote.value = false;
        selectedId.value = null;
      } else {
        await deleteNote(selectedId.value!);
        notes.value = notes.value.filter((n) => n.id !== selectedId.value);
        selectedId.value = null;
        isEditing.value = false;
        isNewNote.value = false;
      }
      error.value = null;
    } catch (e: any) {
      error.value = e.message ?? "Could not delete note";
    } finally {
      loading.value = false;
    }
  });

  // Enter edit mode on selected note
  const handleEdit = $(() => {
    isEditing.value = true;
    isNewNote.value = false;
  });

  // Select a note from sidebar
  const handleSelect = $((id: string) => {
    selectedId.value = id;
    isEditing.value = false;
    isNewNote.value = false;
  });

  // Cancel editing/creating
  const handleCancel = $(() => {
    if (isNewNote.value) {
      isEditing.value = false;
      isNewNote.value = false;
      selectedId.value = null;
    } else {
      isEditing.value = false;
    }
  });

  let selectedNote: Note | null = null;
  if (selectedId.value === "_new" && isEditing.value && isNewNote.value) {
    selectedNote = { id: "_new", title: "", content: "", updated_at: new Date().toISOString() };
  } else if (selectedId.value) {
    selectedNote = notes.value.find((n) => n.id === selectedId.value) || null;
  }

  return (
    <div class="app-container">
      <NoteSidebar
        notes={notes.value}
        selectedId={selectedId.value}
        onSelect$={handleSelect}
        onAdd$={handleAdd}
        searchValue={search.value}
        setSearchValue$={(v) => (search.value = v)}
      />
      <div class="content-area">
        <header class="app-header">
          <span class="app-title">Minimal Notes</span>
        </header>
        {error.value && <div class="error-banner">{error.value}</div>}
        <NoteMain
          note={selectedNote}
          isEditing={isEditing.value}
          onEdit$={handleEdit}
          onDelete$={handleDelete}
          onSave$={handleSave}
          onCancel$={handleCancel}
          loading={loading.value}
          isNewNote={isNewNote.value}
        />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Minimal Notes",
  meta: [
    {
      name: "description",
      content: "A minimalistic notes app built with Qwik.",
    },
  ],
};
