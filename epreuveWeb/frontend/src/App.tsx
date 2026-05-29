import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold"><Link to="/">Petit-Annonces</Link></h1>
        <nav>
          <Link to="/login" className="mr-2">Login</Link>
          <Link to="/register">Register</Link>
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
