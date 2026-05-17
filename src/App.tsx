import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import BibBooks from "./pages/BibBooks";
import AddBook from "./pages/AddBook";
import BookDetail from "./pages/BookDetail";
import ManageBibs from "./pages/ManageBibs";
import ScanBib from "./pages/ScanBib";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/bib/:bibId" element={<BibBooks />} />
        <Route path="/bib/:bibId/add" element={<AddBook />} />
        <Route path="/bib/:bibId/book/:bookId" element={<BookDetail />} />
        <Route path="/bib/:bibId/scan" element={<ScanBib />} />
        <Route path="/manage" element={<ManageBibs />} />
      </Route>
    </Routes>
  );
}
