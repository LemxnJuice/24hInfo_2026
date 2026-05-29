import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async (e:any) => {
    e.preventDefault();
    try{
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    }catch(err){
      alert('Erreur de connexion');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Connexion</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label>Email</label>
          <input className="w-full border p-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" className="w-full border p-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Se connecter</button>
      </form>
    </div>
  )
}
