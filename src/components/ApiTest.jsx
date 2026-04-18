import { useState, useEffect } from "react";
import { getFormSubmissions as getCheckinsSubmissions } from "../services/checkinsApi";
import { getFormSubmissions as getMessagesSubmissions } from "../services/messagesApi";
import { getFormSubmissions as getSightingsSubmissions } from "../services/sightingsApi";
import { getFormSubmissions as getPersonalNotesSubmissions } from "../services/personalNotesApi";
import { getFormSubmissions as getAnonymousTipsSubmissions } from "../services/anonymousTipsApi";

export const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testApis = async () => {
      try {
        const allResults = {};

        // Checkins API
        const checkins = await getCheckinsSubmissions();
        allResults.checkins = checkins;

        // Messages API
        const messages = await getMessagesSubmissions();
        allResults.messages = messages;

        // Sightings API
        const sightings = await getSightingsSubmissions();
        allResults.sightings = sightings;

        // Personal Notes API
        const personalNotes = await getPersonalNotesSubmissions();
        allResults.personalNotes = personalNotes;

        // Anonymous Tips API
        const anonymousTips = await getAnonymousTipsSubmissions();
        allResults.anonymousTips = anonymousTips;

        setResults(allResults);
      } catch (err) {
        setError(err.message);
        console.error("API Test Hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    testApis();
  }, []);

  if (loading) {
    return (
      <div className="api-test-container">
        <p>API'ler test ediliyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-test-container error">
        <p>Hata: {error}</p>
      </div>
    );
  }

  return (
    <div className="api-test-container">
      <h1>Jotform API Test Sonuçları</h1>

      <div className="api-results">
        {/* Checkins */}
        <div className="api-card">
          <h2>✅ Checkins</h2>
          <div className="api-info">
            <p>
              <strong>Form ID:</strong> {results.checkins?.id}
            </p>
            <p>
              <strong>Başlık:</strong> {results.checkins?.title}
            </p>
            <p>
              <strong>Durum:</strong> {results.checkins?.status}
            </p>
            <p>
              <strong>Oluşturma Tarihi:</strong> {results.checkins?.created_at}
            </p>
            <p>
              <strong>Gönderim Sayısı:</strong> {results.checkins?.count}
            </p>
            <p>
              <strong>URL:</strong>{" "}
              <a href={results.checkins?.url} target="_blank" rel="noreferrer">
                {results.checkins?.url}
              </a>
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="api-card">
          <h2>✅ Messages</h2>
          <div className="api-info">
            <p>
              <strong>Form ID:</strong> {results.messages?.id}
            </p>
            <p>
              <strong>Başlık:</strong> {results.messages?.title}
            </p>
            <p>
              <strong>Durum:</strong> {results.messages?.status}
            </p>
            <p>
              <strong>Oluşturma Tarihi:</strong> {results.messages?.created_at}
            </p>
            <p>
              <strong>Gönderim Sayısı:</strong> {results.messages?.count}
            </p>
          </div>
        </div>

        {/* Sightings */}
        <div className="api-card">
          <h2>✅ Sightings</h2>
          <div className="api-info">
            <p>
              <strong>Form ID:</strong> {results.sightings?.id}
            </p>
            <p>
              <strong>Başlık:</strong> {results.sightings?.title}
            </p>
            <p>
              <strong>Durum:</strong> {results.sightings?.status}
            </p>
            <p>
              <strong>Oluşturma Tarihi:</strong> {results.sightings?.created_at}
            </p>
            <p>
              <strong>Gönderim Sayısı:</strong> {results.sightings?.count}
            </p>
          </div>
        </div>

        {/* Personal Notes */}
        <div className="api-card">
          <h2>✅ Personal Notes</h2>
          <div className="api-info">
            <p>
              <strong>Form ID:</strong> {results.personalNotes?.id}
            </p>
            <p>
              <strong>Başlık:</strong> {results.personalNotes?.title}
            </p>
            <p>
              <strong>Durum:</strong> {results.personalNotes?.status}
            </p>
            <p>
              <strong>Oluşturma Tarihi:</strong>{" "}
              {results.personalNotes?.created_at}
            </p>
            <p>
              <strong>Gönderim Sayısı:</strong> {results.personalNotes?.count}
            </p>
          </div>
        </div>

        {/* Anonymous Tips */}
        <div className="api-card">
          <h2>✅ Anonymous Tips</h2>
          <div className="api-info">
            <p>
              <strong>Form ID:</strong> {results.anonymousTips?.id}
            </p>
            <p>
              <strong>Başlık:</strong> {results.anonymousTips?.title}
            </p>
            <p>
              <strong>Durum:</strong> {results.anonymousTips?.status}
            </p>
            <p>
              <strong>Oluşturma Tarihi:</strong>{" "}
              {results.anonymousTips?.created_at}
            </p>
            <p>
              <strong>Gönderim Sayısı:</strong> {results.anonymousTips?.count}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .api-test-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .api-test-container h1 {
          color: #333;
          margin-bottom: 30px;
        }

        .api-results {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .api-card {
          background: #f5f5f5;
          border: 2px solid #007bff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .api-card h2 {
          color: #007bff;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1.3em;
        }

        .api-info p {
          margin: 8px 0;
          font-size: 0.95em;
          color: #555;
        }

        .api-info strong {
          color: #333;
        }

        .api-info a {
          color: #007bff;
          text-decoration: none;
        }

        .api-info a:hover {
          text-decoration: underline;
        }

        .error {
          background: #f8d7da;
          border: 2px solid #f5c6cb;
          color: #721c24;
        }
      `}</style>
    </div>
  );
};
