import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const submit = async (e:any) => {
    e.preventDefault();
    try{
      const res = await axios.post('/api/auth/register', { email, password, name });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    }catch(err){
      alert('Erreur lors de l\'inscription');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Inscription</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label>Nom</label>
          <input className="w-full border p-2" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input className="w-full border p-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" className="w-full border p-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded">S'inscrire</button>
      </form>
    </div>
  )
}
