import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: any) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError(
        "Veuillez renseigner votre adresse e‑mail et votre mot de passe.",
      );
      return;
    }
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else if (res?.data?.error) {
        setError(String(res.data.error));
      } else {
        setError("Échec de la connexion. Réponse inattendue du serveur.");
      }
    } catch (err: any) {
      console.warn("Login error", err);
      const serverMsg =
        err?.response?.data?.error || err?.response?.data?.message;
      setError(
        serverMsg
          ? `Échec de la connexion : ${serverMsg}`
          : "Échec de la connexion. Vérifiez votre adresse e‑mail et votre mot de passe.",
      );
    }
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Connexion</h2>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={submit}>
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
        <button className="btn">Se connecter</button>
      </form>
    </div>
  );
}
