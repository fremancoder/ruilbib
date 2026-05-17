export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  genre: string;
  addedAt: string;
  isNew: boolean;
  rawData?: string;
}

export interface Bib {
  id: string;
  name: string;
  location: string;
  description: string;
  books: Book[];
  createdAt: string;
}

export interface BookSearchResult {
  isbn: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  genre: string;
}
