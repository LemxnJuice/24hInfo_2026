import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/ads').then(r => setAds(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Annonces récentes</h2>
      <div className="grid gap-4">
        {ads.map(a => (
          <div key={a.id} className="border p-3 rounded">
            <h3 className="font-bold">{a.title} - {a.price}€</h3>
            <p className="text-sm text-gray-600">{a.city} - {a.categories}</p>
            <p>{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
