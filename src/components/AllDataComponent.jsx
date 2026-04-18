import { useState, useEffect } from "react";
import { getFormSubmissions as getCheckinsSubmissions } from "../services/checkinsApi";
import { getFormSubmissions as getMessagesSubmissions } from "../services/messagesApi";
import { getFormSubmissions as getSightingsSubmissions } from "../services/sightingsApi";
import { getFormSubmissions as getPersonalNotesSubmissions } from "../services/personalNotesApi";
import { getFormSubmissions as getAnonymousTipsSubmissions } from "../services/anonymousTipsApi";

export const AllDataComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [checkins, messages, sightings, personalNotes, anonymousTips] =
          await Promise.all([
            getCheckinsSubmissions(),
            getMessagesSubmissions(),
            getSightingsSubmissions(),
            getPersonalNotesSubmissions(),
            getAnonymousTipsSubmissions(),
          ]);

        // Verileri birleştir ve her birine tip ekle
        const allDataArray = [
          ...(Array.isArray(checkins)
            ? checkins.map((item) => ({ ...item, type: "Checkins" }))
            : []),
          ...(Array.isArray(messages)
            ? messages.map((item) => ({ ...item, type: "Messages" }))
            : []),
          ...(Array.isArray(sightings)
            ? sightings.map((item) => ({ ...item, type: "Sightings" }))
            : []),
          ...(Array.isArray(personalNotes)
            ? personalNotes.map((item) => ({ ...item, type: "Personal Notes" }))
            : []),
          ...(Array.isArray(anonymousTips)
            ? anonymousTips.map((item) => ({ ...item, type: "Anonymous Tips" }))
            : []),
        ];

        // Timestamp'e göre sırala (en yeniler önce)
        const sortedData = allDataArray.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
          const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
          return dateB - dateA;
        });

        setData(sortedData);
      } catch (err) {
        setError(err.message);
        console.error("Tüm Verileri Getirme Hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading)
    return (
      <div className="component-container">
        <p>Tüm veriler yükleniyor...</p>
      </div>
    );

  if (error)
    return (
      <div className="component-container error">
        <p>❌ Hata: {error}</p>
      </div>
    );

  return (
    <div className="component-container">
      <h2>📊 Tüm Veriler (Zaman Sırasına Göre)</h2>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        Toplam {data?.length || 0} kayıt bulundu
      </p>
      <div style={{ marginTop: "20px" }}>
        {data && data.length > 0 ? (
          <div>
            {data.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "15px",
                  borderLeft: "4px solid #667eea",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      backgroundColor: "#667eea",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                    }}
                  >
                    {item.type}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#999" }}>
                    {item.createdAt || item.timestamp || "Zaman bilgisi yok"}
                  </span>
                </div>
                <pre
                  style={{
                    backgroundColor: "white",
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    maxHeight: "200px",
                    overflow: "auto",
                    border: "1px solid #eee",
                  }}
                >
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p>Veri bulunamadı.</p>
        )}
      </div>
    </div>
  );
};
