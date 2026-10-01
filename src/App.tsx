import { Routes, Route } from "react-router-dom";
import { AppShell, RequireAuth } from "./components/AppShell";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import SearchPage from "./pages/SearchPage";
import ArtDetailPage from "./pages/ArtDetailPage";
import ReaderPage from "./pages/ReaderPage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { BookmarksPage, MyListPage, MyWorksPage } from "./pages/LibraryPages";
import {
  ProfilePage,
  EditProfilePage,
  UserProfilePage,
  FollowListPage,
} from "./pages/ProfilePages";
import {
  CreateArtPage,
  EditArtPage,
  EditChapterPage,
} from "./pages/WriterPages";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/art/:id" element={<ArtDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/bookmarks"
          element={
            <RequireAuth>
              <BookmarksPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-list"
          element={
            <RequireAuth>
              <MyListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-works"
          element={
            <RequireAuth>
              <MyWorksPage />
            </RequireAuth>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/profile/edit"
          element={
            <RequireAuth>
              <EditProfilePage />
            </RequireAuth>
          }
        />
        <Route path="/user/:username" element={<UserProfilePage />} />
        <Route path="/user/:username/:type" element={<FollowListPage />} />
        <Route
          path="/create"
          element={
            <RequireAuth>
              <CreateArtPage />
            </RequireAuth>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <RequireAuth>
              <EditArtPage />
            </RequireAuth>
          }
        />
        <Route
          path="/edit/:id/chapter/:chapterNumber"
          element={
            <RequireAuth>
              <EditChapterPage />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="/read/:artId/:chapterNumber" element={<ReaderPage />} />
    </Routes>
  );
}
