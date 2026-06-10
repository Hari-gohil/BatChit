import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import MainLayout from "../layouts/MainLayout";
import CreateGroup from "../pages/CreateGroup";
import CreateChat from "../pages/CreateChat";
import Profile from "../pages/Profile";
import GroupChat from "../pages/GroupChat";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
      </Route>

      <Route path="/create-group" element={<CreateGroup />} />

      <Route path="/groups/:groupId" element={<GroupChat />} />

      <Route path="/create-chat" element={<CreateChat />} />

      <Route path="*" element={<NotFound />} />

      <Route path="/Profile" element={<Profile />} />
    </Routes>
  );
};

export default AppRoutes;
