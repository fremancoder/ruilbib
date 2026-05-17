const OPEN_LIBRARY_API = "https://openlibrary.org";

interface OpenLibraryBook {
  title: string;
  authors?: Array<{ name: string }>;
  cover?: { small: string; medium: string; large: string };
  description?: string | { value: string };
  notes?: string;
  excerpts?: Array<{ text: string; comment?: string }>;
  subjects?: Array<{ name: string; url?: string }>;
  subject_places?: Array<{ name: string }>;
  subject_people?: Array<{ name: string }>;
  subject_times?: Array<{ name: string }>;
}

interface OpenLibrarySearchResult {
  docs: Array<{
    key: string;
    title: string;
    author_name?: string[];
    cover_i?: number;
    subject?: string[];
    first_publish_year?: number;
  }>;
}

function getCoverUrl(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function lookupISBN(isbn: string): Promise<{
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  genre: string;
  rawData: string;
}> {
  const cleanIsbn = isbn.replace(/[-\s]/g, "");

  const response = await fetch(
    `${OPEN_LIBRARY_API}/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`
  );
  const data = await response.json();
  const key = `ISBN:${cleanIsbn}`;
  const bookData = data[key] as OpenLibraryBook | undefined;

  const result = {
    title: "",
    author: "",
    coverUrl: "",
    description: "",
    genre: "",
    rawData: JSON.stringify(data[key] || {}),
  };

  if (bookData) {
    result.title = bookData.title || "";
    result.author = bookData.authors?.[0]?.name || "";

    if (bookData.cover) {
      result.coverUrl = bookData.cover.medium || bookData.cover.large || "";
    }

    const rawDesc = bookData.description
      ? typeof bookData.description === "string"
        ? bookData.description
        : bookData.description?.value || ""
      : "";
    result.description = rawDesc || bookData.notes || "";

    if (!result.description && bookData.excerpts?.length) {
      result.description = bookData.excerpts
        .map((e) => e.text)
        .join(" ")
        .slice(0, 500);
    }

    const genreNames = (bookData.subjects || [])
      .map((s) => (typeof s === "string" ? s : s.name))
      .filter(Boolean);

    if (!genreNames.length) {
      const allSubjects = [
        ...(bookData.subject_places || []),
        ...(bookData.subject_people || []),
        ...(bookData.subject_times || []),
      ];
      genreNames.push(...allSubjects.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean));
    }

    if (genreNames.length) {
      result.genre = genreNames.slice(0, 5).join(", ");
    }
  }

  if (!result.title) {
    const searchResp = await fetch(
      `${OPEN_LIBRARY_API}/search.json?q=isbn:${cleanIsbn}&limit=1`
    );
    const searchData = (await searchResp.json()) as OpenLibrarySearchResult;
    if (searchData.docs?.[0]) {
      const doc = searchData.docs[0];
      result.title = doc.title || result.title;
      result.author = doc.author_name?.[0] || result.author;
      result.coverUrl = doc.cover_i ? getCoverUrl(doc.cover_i) : "";
      result.genre = doc.subject?.slice(0, 3).join(", ") || result.genre;
      result.rawData = JSON.stringify(doc, null, 2);
    }
  }

  return result;
}

export async function searchBooks(
  query: string
): Promise<Array<{ isbn: string; title: string; author: string; coverUrl: string }>> {
  const response = await fetch(
    `${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(query)}&limit=20`
  );
  const data = (await response.json()) as OpenLibrarySearchResult;
  return (data.docs || []).map((doc) => ({
    isbn: "",
    title: doc.title || "Unknown Title",
    author: doc.author_name?.[0] || "Unknown Author",
    coverUrl: doc.cover_i ? getCoverUrl(doc.cover_i) : "",
  }));
}
