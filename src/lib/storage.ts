import { supabase } from "./supabase";
import type { Bib, Book } from "../types";

const ACTIVE_BIB_KEY = "ruilbib_active_bib";

// ── DB row <-> type conversion ──────────────────────────────────────────────

function toBib(row: Record<string, unknown>): Bib {
  return {
    id: row.id as string,
    name: row.name as string,
    location: row.location as string,
    description: (row.description as string) ?? "",
    createdAt: row.created_at as string,
    books: ((row.books as unknown[]) ?? []).map((b) => toBook(b as Record<string, unknown>)),
  };
}

function toBook(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    isbn: row.isbn as string,
    title: (row.title as string) ?? "",
    author: (row.author as string) ?? "",
    coverUrl: (row.cover_url as string) ?? "",
    description: (row.description as string) ?? "",
    genre: (row.genre as string) ?? "",
    addedAt: row.added_at as string,
    isNew: (row.is_new as boolean) ?? true,
    rawData: (row.raw_data as string) || undefined,
  };
}

// ── Active bib (still in localStorage — UI preference) ──────────────────────

export function getActiveBibId(): string | null {
  return localStorage.getItem(ACTIVE_BIB_KEY);
}

export function setActiveBibId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_BIB_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_BIB_KEY);
  }
}

export async function getActiveBib(): Promise<Bib | undefined> {
  const id = getActiveBibId();
  if (!id) return undefined;
  return getBib(id);
}

// ── Bib CRUD ────────────────────────────────────────────────────────────────

export async function getBibs(): Promise<Bib[]> {
  const { data, error } = await supabase
    .from("bibs")
    .select("*, books(*)")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => toBib(r as Record<string, unknown>));
}

export async function getBib(id: string): Promise<Bib | undefined> {
  const { data, error } = await supabase
    .from("bibs")
    .select("*, books(*)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return undefined;
    throw error;
  }
  return data ? toBib(data as Record<string, unknown>) : undefined;
}

export async function addBib(
  input: Pick<Bib, "name" | "location" | "description">
): Promise<Bib> {
  const { data, error } = await supabase
    .from("bibs")
    .insert({
      name: input.name,
      location: input.location,
      description: input.description,
    })
    .select("*, books(*)")
    .single();

  if (error) throw error;
  return toBib(data as Record<string, unknown>);
}

export async function deleteBib(id: string): Promise<void> {
  const { error } = await supabase.from("bibs").delete().eq("id", id);
  if (error) throw error;
  if (getActiveBibId() === id) setActiveBibId(null);
}

// ── Book CRUD ───────────────────────────────────────────────────────────────

export async function addBookToBib(
  bibId: string,
  input: Omit<Book, "id" | "addedAt" | "isNew">
): Promise<Book> {
  const { data: existing } = await supabase
    .from("books")
    .select("*")
    .eq("bib_id", bibId)
    .eq("isbn", input.isbn)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from("books")
      .update({ is_new: true })
      .eq("id", (existing as Record<string, unknown>).id)
      .select()
      .single();

    if (error) throw error;
    return toBook(updated as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("books")
    .insert({
      bib_id: bibId,
      isbn: input.isbn,
      title: input.title,
      author: input.author,
      cover_url: input.coverUrl,
      description: input.description,
      genre: input.genre,
      raw_data: input.rawData ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return toBook(data as Record<string, unknown>);
}

export async function removeBookFromBib(_bibId: string, bookId: string): Promise<void> {
  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) throw error;
}

export async function markBooksNotNew(bibId: string): Promise<void> {
  const { error } = await supabase
    .from("books")
    .update({ is_new: false })
    .eq("bib_id", bibId);

  if (error) throw error;
}

export async function updateBookData(
  bookId: string,
  data: {
    title: string;
    author: string;
    coverUrl: string;
    description: string;
    genre: string;
    rawData?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("books")
    .update({
      title: data.title,
      author: data.author,
      cover_url: data.coverUrl,
      description: data.description,
      genre: data.genre,
      raw_data: data.rawData ?? null,
    })
    .eq("id", bookId);

  if (error) throw error;
}

// ── Rescan (batch reconciliation) ───────────────────────────────────────────

export async function rescanBib(
  bibId: string,
  scannedIsbns: string[]
): Promise<{ added: Book[]; removed: Book[] }> {
  const { data: currentBooks, error: fetchError } = await supabase
    .from("books")
    .select("*")
    .eq("bib_id", bibId);

  if (fetchError) throw fetchError;

  const current = (currentBooks ?? []) as Record<string, unknown>[];
  const scannedSet = new Set(scannedIsbns.map((s) => s.trim()).filter(Boolean));
  const currentIsbns = new Set(current.map((b) => b.isbn as string));

  const toRemove = current.filter((b) => !scannedSet.has(b.isbn as string));
  if (toRemove.length > 0) {
    const removeIds = toRemove.map((b) => b.id);
    await supabase.from("books").delete().in("id", removeIds);
  }

  const toAddIsbns = [...scannedSet].filter((isbn) => !currentIsbns.has(isbn));
  const added: Book[] = [];

  if (toAddIsbns.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from("books")
      .insert(
        toAddIsbns.map((isbn) => ({
          bib_id: bibId,
          isbn,
          title: "",
          author: "",
          cover_url: "",
          description: "",
          genre: "",
          raw_data: null,
        }))
      )
      .select();

    if (insertError) throw insertError;
    added.push(
      ...((inserted ?? []) as Record<string, unknown>[]).map((r) => toBook(r))
    );
  }

  return {
    added,
    removed: toRemove.map((r) => toBook(r)),
  };
}
