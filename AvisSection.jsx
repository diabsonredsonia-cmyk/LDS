import React, { useState, useEffect } from 'react';

export default function AvisSection() {
  const [avis, setAvis] = useState([]);
  const [pseudo, setPseudo] = useState('');
  const [texte, setTexte] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filtre, setFiltre] = useState('tous');

  // Charger les avis au montage
  useEffect(() => {
    chargerAvis();
  }, []);

  const chargerAvis = async () => {
    try {
      const result = await window.storage.get('shin-avis');
      if (result && result.value) {
        const data = JSON.parse(result.value);
        // Trier par date décroissante
        setAvis(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
      setLoading(false);
    }
  };

  const validerEtAjouter = async () => {
    // Validation basique
    if (rating === 0) {
      setMessage('⚠️ Sélectionne une note!');
      return;
    }
    if (texte.trim().length === 0) {
      setMessage('⚠️ Écris un commentaire!');
      return;
    }

    // Anti-spam simple
    const pseudoFinal = pseudo.trim() || 'Anonyme';
    if (pseudoFinal.length > 30) {
      setMessage('⚠️ Le pseudo est trop long!');
      return;
    }

    const nouvelAvis = {
      id: Date.now(),
      pseudo: pseudoFinal,
      texte: texte.slice(0, 200),
      rating,
      date: new Date().toISOString(),
    };

    try {
      const tousLesAvis = [...avis, nouvelAvis].slice(-50); // Garde max 50 avis
      await window.storage.set('shin-avis', JSON.stringify(tousLesAvis));
      
      setAvis(tousLesAvis.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setPseudo('');
      setTexte('');
      setRating(0);
      setMessage('✨ Ton avis a été publié!');
      
      // Efface le message après 3s
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setMessage('❌ Erreur lors de la sauvegarde');
    }
  };

  const avisFiltres = filtre === 'tous' 
    ? avis 
    : avis.filter(a => a.rating === parseInt(filtre));

  return (
    <section className="shin-avis-section">
      <div className="shin-avis-container">
        {/* Titre */}
        <div className="shin-avis-header">
          <h2 className="shin-avis-title">Avis des Lecteurs</h2>
          <p className="shin-avis-subtitle">Partage ton ressenti sur La Légende de Shin</p>
        </div>

        {/* Formulaire */}
        <div className="shin-avis-form">
          <div className="shin-form-group">
            <label className="shin-form-label">Ton avis (max 200 caractères)</label>
            
            {/* Pseudo */}
            <input
              type="text"
              placeholder="Pseudo (optionnel)"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength="30"
              className="shin-pseudo-input"
            />

            {/* Étoiles */}
            <div className="shin-stars-container">
              <div className="shin-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`shin-star ${
                      star <= (hoveredRating || rating) ? 'active' : ''
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    aria-label={`Note ${star} étoiles`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="shin-rating-text">
                {rating > 0 ? `${rating}/5` : 'Sélectionne une note'}
              </span>
            </div>

            {/* Textarea */}
            <div className="shin-textarea-wrapper">
              <textarea
                placeholder="Qu'as-tu pensé de Shin? (200 caractères max)"
                value={texte}
                onChange={(e) => setTexte(e.target.value.slice(0, 200))}
                className="shin-avis-textarea"
                rows="4"
              />
              <div className="shin-char-count">
                {texte.length}/200
              </div>
            </div>

            {/* Bouton */}
            <button
              onClick={validerEtAjouter}
              className="shin-btn-submit"
              disabled={texte.length === 0 || rating === 0}
            >
              Publier
            </button>

            {/* Message */}
            {message && <div className="shin-message">{message}</div>}
          </div>
        </div>

        {/* Filtres */}
        {avis.length > 0 && (
          <div className="shin-filtres">
            <button
              className={`shin-filtre-btn ${filtre === 'tous' ? 'active' : ''}`}
              onClick={() => setFiltre('tous')}
            >
              Tous ({avis.length})
            </button>
            {[5, 4, 3, 2, 1].map((note) => {
              const count = avis.filter(a => a.rating === note).length;
              return count > 0 ? (
                <button
                  key={note}
                  className={`shin-filtre-btn ${filtre === note.toString() ? 'active' : ''}`}
                  onClick={() => setFiltre(note.toString())}
                >
                  {note}★ ({count})
                </button>
              ) : null;
            })}
          </div>
        )}

        {/* Liste des avis */}
        <div className="shin-avis-list">
          {loading ? (
            <p className="shin-loading">Chargement des avis...</p>
          ) : avisFiltres.length === 0 ? (
            <p className="shin-empty">
              {avis.length === 0
                ? 'Sois le premier à donner ton avis! ✨'
                : 'Aucun avis avec cette note.'}
            </p>
          ) : (
            avisFiltres.map((item, index) => (
              <div
                key={item.id}
                className="shin-avis-item"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="shin-avis-header-item">
                  <div>
                    <h4 className="shin-avis-pseudo">{item.pseudo}</h4>
                    <div className="shin-avis-stars-display">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`shin-star-display ${
                            i < item.rating ? 'filled' : ''
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <time className="shin-avis-date">
                    {new Date(item.date).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                <p className="shin-avis-texte">{item.texte}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .shin-avis-section {
          padding: 5rem 6vw;
          background: linear-gradient(135deg, #06080f 0%, #0c1018 100%);
          border-top: 1px solid rgba(201, 168, 76, 0.1);
        }

        .shin-avis-container {
          max-width: 900px;
          margin: 0 auto;
        }

        /* Header */
        .shin-avis-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .shin-avis-title {
          font-family: Georgia, serif;
          font-size: clamp(1.6rem, 4vw, 2.8rem);
          color: #e8e4df;
          margin-bottom: 0.5rem;
          font-weight: 400;
          letter-spacing: 0.05em;
        }

        .shin-avis-subtitle {
          font-size: 0.95rem;
          color: #6b6a70;
          letter-spacing: 0.1em;
        }

        /* Formulaire */
        .shin-avis-form {
          background: rgba(12, 16, 24, 0.6);
          border: 1px solid rgba(201, 168, 76, 0.15);
          border-radius: 2px;
          padding: 2.5rem;
          margin-bottom: 3rem;
          backdrop-filter: blur(10px);
        }

        .shin-form-group {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .shin-form-label {
          font-size: 0.85rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c9a84c;
          font-weight: 600;
        }

        .shin-pseudo-input {
          padding: 0.8rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 168, 76, 0.2);
          border-radius: 2px;
          color: #e8e4df;
          font-family: 'Georgia', serif;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .shin-pseudo-input::placeholder {
          color: #6b6a70;
        }

        .shin-pseudo-input:focus {
          outline: none;
          border-color: #c9a84c;
          background: rgba(201, 168, 76, 0.05);
        }

        /* Étoiles */
        .shin-stars-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .shin-stars {
          display: flex;
          gap: 0.8rem;
        }

        .shin-star {
          background: none;
          border: none;
          font-size: 2rem;
          color: rgba(201, 168, 76, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          line-height: 1;
        }

        .shin-star:hover,
        .shin-star.active {
          color: #c9a84c;
          transform: scale(1.15);
          filter: drop-shadow(0 0 8px rgba(201, 168, 76, 0.5));
        }

        .shin-rating-text {
          font-size: 0.85rem;
          color: #6b6a70;
          min-width: 60px;
          letter-spacing: 0.05em;
        }

        /* Textarea */
        .shin-textarea-wrapper {
          position: relative;
        }

        .shin-avis-textarea {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 168, 76, 0.2);
          border-radius: 2px;
          color: #e8e4df;
          font-family: 'Georgia', serif;
          font-size: 0.95rem;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .shin-avis-textarea::placeholder {
          color: #6b6a70;
        }

        .shin-avis-textarea:focus {
          outline: none;
          border-color: #c9a84c;
          background: rgba(201, 168, 76, 0.05);
        }

        .shin-char-count {
          position: absolute;
          bottom: 0.7rem;
          right: 1rem;
          font-size: 0.75rem;
          color: #6b6a70;
          letter-spacing: 0.1em;
        }

        /* Bouton */
        .shin-btn-submit {
          padding: 0.85rem 2rem;
          background: linear-gradient(135deg, #c9a84c 0%, #dbb65c 100%);
          color: #06080f;
          border: none;
          border-radius: 2px;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .shin-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(201, 168, 76, 0.3);
        }

        .shin-btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .shin-message {
          padding: 1rem;
          background: rgba(201, 168, 76, 0.1);
          border-left: 2px solid #c9a84c;
          color: #c9a84c;
          font-size: 0.9rem;
          border-radius: 2px;
          animation: slideIn 0.3s ease;
        }

        /* Filtres */
        .shin-filtres {
          display: flex;
          gap: 0.8rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .shin-filtre-btn {
          padding: 0.6rem 1.2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 168, 76, 0.2);
          color: #6b6a70;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          transition: all 0.3s ease;
        }

        .shin-filtre-btn:hover {
          border-color: #c9a84c;
          color: #c9a84c;
        }

        .shin-filtre-btn.active {
          background: rgba(201, 168, 76, 0.2);
          border-color: #c9a84c;
          color: #c9a84c;
        }

        /* Liste d'avis */
        .shin-avis-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .shin-avis-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(201, 168, 76, 0.1);
          border-radius: 2px;
          padding: 1.5rem;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .shin-avis-item:hover {
          border-color: rgba(201, 168, 76, 0.3);
          background: rgba(201, 168, 76, 0.03);
        }

        .shin-avis-header-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .shin-avis-pseudo {
          font-family: Georgia, serif;
          font-size: 1rem;
          color: #e8e4df;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .shin-avis-stars-display {
          display: flex;
          gap: 0.3rem;
        }

        .shin-star-display {
          font-size: 0.9rem;
          color: rgba(201, 168, 76, 0.3);
        }

        .shin-star-display.filled {
          color: #c9a84c;
        }

        .shin-avis-date {
          font-size: 0.75rem;
          color: #6b6a70;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .shin-avis-texte {
          color: #a8a4a0;
          line-height: 1.8;
          font-size: 0.95rem;
          font-family: Georgia, serif;
        }

        .shin-loading,
        .shin-empty {
          text-align: center;
          color: #6b6a70;
          font-size: 1rem;
          padding: 3rem;
          font-style: italic;
        }

        /* Animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
          from {
            opacity: 0;
            transform: translateY(10px);
          }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .shin-avis-section {
            padding: 3rem 15px;
          }

          .shin-avis-form {
            padding: 1.5rem;
          }

          .shin-avis-title {
            font-size: clamp(1.4rem, 3vw, 2rem);
          }

          .shin-stars-container {
            flex-direction: column;
            align-items: flex-start;
          }

          .shin-avis-header-item {
            flex-direction: column;
          }

          .shin-filtres {
            justify-content: flex-start;
            gap: 0.6rem;
          }
        }

        @media (max-width: 768px) and (min-width: 481px) {
          .shin-avis-section {
            padding: 4rem 20px;
          }

          .shin-avis-form {
            padding: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
