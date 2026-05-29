import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("/api/ads")
      .then((r) => {
        const data = r && (r.data ?? r);
        if (Array.isArray(data)) {
          setAds(data);
        } else {
          console.warn(
            "Unexpected /api/ads response, expected array but got:",
            data,
          );
          setAds([]);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch ads", err);
        setAds([]);
      });
  }, []);

  return (
    <div>
      <h2 className="page-title">Annonces récentes</h2>
      <div className="cards">
        {Array.isArray(ads) && ads.length > 0 ? (
          ads.map((a: any) => (
            <div key={a.id} className="card">
              <h3>
                {a.title} - {a.price}€
              </h3>
              <p className="card-meta">
                {a.city} - {a.categories}
              </p>
              <p>{a.description}</p>
            </div>
          ))
        ) : (
          <div className="text-muted">Aucune annonce pour le moment.</div>
        )}
      </div>
    </div>
  );
}
