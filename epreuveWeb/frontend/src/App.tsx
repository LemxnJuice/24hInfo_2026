import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">
          <Link to="/">Petit Annonces</Link>
        </h1>
        <nav className="nav">
          <Link to="/login">Se connecter</Link>
          <Link to="/register">S'inscrire</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}
