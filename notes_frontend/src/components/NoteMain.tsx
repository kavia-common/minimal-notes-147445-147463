import {
  component$,
  useSignal,
  useTask$,
  $,
  PropFunction,
} from "@builder.io/qwik";
import type { Note } from "./NoteSidebar";

// PUBLIC_INTERFACE
interface NoteMainProps {
  note: Note | null;
  isEditing: boolean;
  onEdit$: PropFunction<() => void>;
  onDelete$: PropFunction<() => void>;
  onSave$: PropFunction<(title: string, content: string) => void>;
  onCancel$: PropFunction<() => void>;
  loading: boolean;
  isNewNote: boolean;
}

export const NoteMain = component$((props: NoteMainProps) => {
  const {
    note,
    isEditing,
    onEdit$,
    onDelete$,
    onSave$,
    onCancel$,
    loading,
    isNewNote,
  } = props;

  // Local signal state during editing
  const titleSig = useSignal(note?.title || "");
  const contentSig = useSignal(note?.content || "");

  useTask$(({ track }) => {
    track(() => note?.id);
    // Reset fields on note change or new
    titleSig.value = note?.title || "";
    contentSig.value = note?.content || "";
  });

  const saveHandler = $(() => {
    onSave$(titleSig.value, contentSig.value);
  });

  if (!note) {
    return (
      <section class="main-panel blank">
        <div class="hint">Select a note or add a new one.</div>
      </section>
    );
  }

  return (
    <section class="main-panel">
      {isEditing ? (
        <form
          class="note-form"
          preventdefault:submit
          onSubmit$={saveHandler}
          aria-disabled={loading ? "true" : undefined}
        >
          <input
            class="title-input"
            placeholder="Note title"
            value={titleSig.value}
            onInput$={(e) =>
              (titleSig.value = (e.target as HTMLInputElement).value)
            }
            disabled={loading}
            required
            maxLength={100}
            autoFocus
          />
          <textarea
            class="content-input"
            placeholder="Write your note..."
            value={contentSig.value}
            onInput$={(e) =>
              (contentSig.value = (e.target as HTMLTextAreaElement).value)
            }
            rows={12}
            disabled={loading}
            required
          />
          <div class="edit-controls">
            <button class="primary-btn" type="submit" disabled={loading}>
              Save
            </button>
            <button
              class="secondary-btn"
              type="button"
              onClick$={onCancel$}
              disabled={loading}
            >
              Cancel
            </button>
            {!isNewNote && (
              <button
                class="danger-btn"
                type="button"
                onClick$={onDelete$}
                disabled={loading}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <article>
          <header class="main-header">
            <h2 class="note-title">{note.title || "(Untitled)"}</h2>
            <div class="main-actions">
              <button
                class="edit-btn"
                aria-label="Edit note"
                onClick$={onEdit$}
              >
                Edit
              </button>
              <button
                class="danger-btn"
                aria-label="Delete note"
                onClick$={onDelete$}
              >
                Delete
              </button>
            </div>
          </header>
          <div class="note-content">
            {note.content.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
          <div class="note-updated">
            Updated: {new Date(note.updated_at).toLocaleString()}
          </div>
        </article>
      )}
      {loading && (
        <div class="loading-overlay">
          <div class="loader" aria-label="Please wait">Saving…</div>
        </div>
      )}
    </section>
  );
});
