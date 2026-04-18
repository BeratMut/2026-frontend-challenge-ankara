import { useState, useEffect } from "react";
import { getFormSubmissions as getCheckinsSubmissions } from "../services/checkinsApi";
import { getFormSubmissions as getMessagesSubmissions } from "../services/messagesApi";
import { getFormSubmissions as getSightingsSubmissions } from "../services/sightingsApi";
import { getFormSubmissions as getPersonalNotesSubmissions } from "../services/personalNotesApi";
import { getFormSubmissions as getAnonymousTipsSubmissions } from "../services/anonymousTipsApi";
import { TimelineCard } from "./TimelineCard";

export const InvestigationDashboard = () => {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  // Verileri yükle
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

        // Timestamp'e göre sırala
        const sortedData = allDataArray.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
          const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
          return dateB - dateA;
        });

        setAllRecords(sortedData);
      } catch (err) {
        setError(err.message);
        console.error("Veri yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filtrelenmiş kayıtları al
  const getFilteredRecords = () => {
    if (!activeFilter) return allRecords;

    return allRecords.filter((record) => {
      const people = getPeopleFromRecord(record);
      return people.some((p) =>
        p.toLowerCase().includes(activeFilter.toLowerCase()),
      );
    });
  };

  // Kayıttan kişileri çıkar
  const getPeopleFromRecord = (record) => {
    const people = [];

    if (Array.isArray(record.involvedPeople)) {
      people.push(
        ...record.involvedPeople.filter(
          (p) => typeof p === "string" && p.trim(),
        ),
      );
    }

    if (typeof record.content === "string") {
      const nameMatch = record.content.match(/İsim[:\s]+([^,\n]+)/i);
      if (nameMatch && nameMatch[1]) {
        people.push(nameMatch[1].trim());
      }
    }

    return [...new Set(people)];
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        <p>Araştırma verileri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 bg-red-100 rounded-lg">
        <p>❌ Hata: {error}</p>
      </div>
    );
  }

  const filteredRecords = getFilteredRecords();

  return (
    <div className="flex h-screen gap-4 bg-slate-900 rounded-xl overflow-hidden">
      {/* Sol Panel - Master Timeline */}
      <div className="w-7/10 bg-slate-950 rounded-l-xl p-6 overflow-y-auto border-r-2 border-blue-500 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
        <h2 className="text-2xl font-bold text-indigo-200 mt-0 mb-2">
          🕐 Master Timeline
        </h2>

        {/* Aktif Filtre Göstergesi */}
        {activeFilter && (
          <div className="bg-blue-500 text-white p-3 rounded-lg mb-4 flex justify-between items-center">
            <span>
              🔍 <strong>{activeFilter}</strong> için filtrelenmiş (
              {filteredRecords.length} kayıt)
            </span>
            <button
              onClick={() => {
                setActiveFilter(null);
                setSelectedRecord(null);
              }}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-1 rounded transition-all"
            >
              ✕
            </button>
          </div>
        )}

        {/* Timeline Kartları */}
        <div>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record, index) => (
              <TimelineCard
                key={index}
                record={record}
                isSelected={selectedRecord === index}
                onClick={() => setSelectedRecord(index)}
                onBadgeClick={(person) => {
                  setActiveFilter(person);
                  setSelectedRecord(null);
                }}
              />
            ))
          ) : (
            <div className="text-gray-400 text-center py-10">
              <p>📭 Bu filtreye uygun kayıt bulunamadı</p>
            </div>
          )}
        </div>
      </div>

      {/* Sağ Panel - Investigation Detail */}
      <div className="w-3/10 bg-gray-50 rounded-r-xl p-6 overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        <h2 className="text-xl font-bold text-gray-900 mt-0 mb-6">
          🔍 İnceleme Detayı
        </h2>

        {selectedRecord !== null && filteredRecords[selectedRecord] ? (
          <div>
            {/* Kayıt Başlığı */}
            <div className="bg-blue-500 text-white p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold">
                  {filteredRecords[selectedRecord].type}
                </span>
                <span className="text-sm opacity-90">
                  {new Date(
                    filteredRecords[selectedRecord].createdAt ||
                      filteredRecords[selectedRecord].timestamp,
                  ).toLocaleString("tr-TR")}
                </span>
              </div>
            </div>

            {/* Detay Bölümü */}
            <div className="mb-4">
              <h3 className="text-gray-900 text-sm font-semibold mb-2">
                ⏰ Zaman
              </h3>
              <p className="text-gray-700 m-0 p-2.5 bg-white rounded">
                {new Date(
                  filteredRecords[selectedRecord].createdAt ||
                    filteredRecords[selectedRecord].timestamp,
                ).toLocaleString("tr-TR")}
              </p>
            </div>

            {/* Detay Bölümü */}
            <div className="mb-4">
              <h3 className="text-gray-900 text-sm font-semibold mb-2">
                📍 Konum
              </h3>
              <p className="text-gray-700 m-0 p-2.5 bg-white rounded">
                Submission ID: {filteredRecords[selectedRecord].id}
              </p>
            </div>

            {/* Urgency ve Confidence */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <h3 className="text-gray-900 text-sm font-semibold mb-2">
                  🚨 Aciliyet
                </h3>
                <p className="text-gray-700 m-0 p-2.5 bg-white rounded">
                  {filteredRecords[selectedRecord].urgency ||
                    filteredRecords[selectedRecord].priority ||
                    "Normal"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-900 text-sm font-semibold mb-2">
                  🎯 Güvenirlik
                </h3>
                <p className="text-gray-700 m-0 p-2.5 bg-white rounded">
                  {filteredRecords[selectedRecord].confidence || "Orta"}
                </p>
              </div>
            </div>

            {/* İçerik */}
            <div>
              <h3 className="text-gray-900 text-sm font-semibold mb-2">
                📝 Tam İçerik
              </h3>
              <pre className="bg-white text-gray-700 p-3 rounded text-xs max-h-80 overflow-y-auto font-mono m-0 whitespace-pre-wrap break-words scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                {JSON.stringify(
                  filteredRecords[selectedRecord].answers ||
                    filteredRecords[selectedRecord],
                  null,
                  2,
                )}
              </pre>
            </div>

            {/* İlgili Kişiler Listesi */}
            {getPeopleFromRecord(filteredRecords[selectedRecord]).length >
              0 && (
              <div className="mt-4">
                <h3 className="text-gray-900 text-sm font-semibold mb-2">
                  👥 İlgili Kişiler
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {getPeopleFromRecord(filteredRecords[selectedRecord]).map(
                    (person, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveFilter(person);
                          setSelectedRecord(null);
                        }}
                        className="bg-blue-100 hover:bg-blue-500 text-blue-800 hover:text-white border border-blue-300 px-3 py-1 rounded-full text-xs font-medium transition-all"
                      >
                        {person}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-400 text-center">
            <p className="text-4xl mb-3">🔎</p>
            <p>İncelemek için timeline'dan bir kayıt seçin</p>
          </div>
        )}
      </div>
    </div>
  );
};
