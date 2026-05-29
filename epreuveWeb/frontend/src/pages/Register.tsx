import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: any) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !name) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    try {
      const res = await axios.post("/api/auth/register", {
        email,
        password,
        name,
      });
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else if (res?.data?.error) {
        setError(String(res.data.error));
      } else {
        setError("Inscription échouée : réponse inattendue du serveur.");
      }
    } catch (err: any) {
      console.warn("Register error", err);
      const serverMsg =
        err?.response?.data?.error || err?.response?.data?.message;
      setError(
        serverMsg
          ? `Erreur lors de l'inscription : ${serverMsg}`
          : "Erreur lors de l'inscription. Vérifiez les champs et réessayez.",
      );
    }
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Inscription</h2>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={submit}>
        <div className="form-field">
          <label className="label" htmlFor="name">
            Nom
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="label" htmlFor="email">
            Adresse e‑mail
          </label>
          <input
            id="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="label" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn">S'inscrire</button>
      </form>
    </div>
  );
}
