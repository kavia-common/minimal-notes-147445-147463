const API_BASE =
  import.meta.env.PUBLIC_NOTES_API_URL || "http://localhost:4000/api"; // fallback

// PUBLIC_INTERFACE
export async function fetchNotes(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/notes`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

// PUBLIC_INTERFACE
export async function createNote(
  title: string = "",
  content: string = ""
): Promise<any> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

// PUBLIC_INTERFACE
export async function updateNote(
  id: string,
  title: string,
  content: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

// PUBLIC_INTERFACE
export async function deleteNote(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete note");
  return { success: true };
}
