import { useState, useEffect } from "react";
import { getFormSubmissions as getCheckins } from "../services/checkinsApi";
import { getFormSubmissions as getMessages } from "../services/messagesApi";
import { getFormSubmissions as getSightings } from "../services/sightingsApi";
import { getFormSubmissions as getPersonalNotes } from "../services/personalNotesApi";
import { getFormSubmissions as getAnonymousTips } from "../services/anonymousTipsApi";

export const SearchPersonComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([
    "Checkins",
    "Messages",
    "Sightings",
    "Personal Notes",
    "Anonymous Tips",
  ]);
  const [allData, setAllData] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [checkins, messages, sightings, personalNotes, anonymousTips] =
          await Promise.all([
            getCheckins().catch(() => []),
            getMessages().catch(() => []),
            getSightings().catch(() => []),
            getPersonalNotes().catch(() => []),
            getAnonymousTips().catch(() => []),
          ]);

        const combined = [
          ...(Array.isArray(checkins)
            ? checkins.map((d) => ({
                ...d,
                type: "Checkins",
                icon: "📋",
                color: "blue",
              }))
            : []),
          ...(Array.isArray(messages)
            ? messages.map((d) => ({
                ...d,
                type: "Messages",
                icon: "💬",
                color: "green",
              }))
            : []),
          ...(Array.isArray(sightings)
            ? sightings.map((d) => ({
                ...d,
                type: "Sightings",
                icon: "👀",
                color: "amber",
              }))
            : []),
          ...(Array.isArray(personalNotes)
            ? personalNotes.map((d) => ({
                ...d,
                type: "Personal Notes",
                icon: "📝",
                color: "purple",
              }))
            : []),
          ...(Array.isArray(anonymousTips)
            ? anonymousTips.map((d) => ({
                ...d,
                type: "Anonymous Tips",
                icon: "🔒",
                color: "red",
              }))
            : []),
        ];

        setAllData(combined);
        setFilteredResults(combined);
      } catch (err) {
        setError(err.message);
        console.error("Arama verisi hatasıyla:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Formattı ve sorguyu kontrol ederek eşleşen kayıtları bul
  const matchesPersonCriteria = (record, query) => {
    const lowerQuery = query.toLowerCase();

    if (record.type === "Checkins") {
      // Checkins: Person Name field'ında ara
      if (record.answers && typeof record.answers === "object") {
        const personField = Object.values(record.answers).find(
          (field) =>
            field &&
            field.text &&
            field.text.toLowerCase().includes("person name"),
        );
        if (
          personField &&
          personField.answer &&
          personField.answer.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
      }
    } else if (record.type === "Messages") {
      // Messages: Sender veya Recipient Name field'larında ara
      if (record.answers && typeof record.answers === "object") {
        const senderField = Object.values(record.answers).find(
          (field) =>
            field && field.text && field.text.toLowerCase().includes("sender"),
        );
        const recipientField = Object.values(record.answers).find(
          (field) =>
            field &&
            field.text &&
            field.text.toLowerCase().includes("recipient"),
        );

        if (
          senderField &&
          senderField.answer &&
          senderField.answer.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
        if (
          recipientField &&
          recipientField.answer &&
          recipientField.answer.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
      }
    } else if (record.type === "Sightings") {
      // Sightings: personName veya seenWith field'larında ara
      if (record.answers && typeof record.answers === "object") {
        const personNameField = Object.values(record.answers).find(
          (field) =>
            field &&
            field.text &&
            (field.text.toLowerCase().includes("personname") ||
              field.text.toLowerCase().includes("person name")),
        );
        const seenWithField = Object.values(record.answers).find(
          (field) =>
            field &&
            field.text &&
            field.text.toLowerCase().includes("seenwith"),
        );

        if (
          personNameField &&
          personNameField.answer &&
          personNameField.answer.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
        if (
          seenWithField &&
          seenWithField.answer &&
          seenWithField.answer.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
      }
    } else if (record.type === "Personal Notes") {
      // Personal Notes: author name field'ında ara
      if (record.answers && typeof record.answers === "object") {
        const authorField = Object.values(record.answers).find(
          (field) =>
            field && field.text && field.text.toLowerCase().includes("author"),
        );
        if (
          authorField &&
          authorField.answer &&
          authorField.answer.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
      }
    } else if (record.type === "Anonymous Tips") {
      // Anonymous Tips: suspect name field'ında VEYA TIP içinde ara
      if (record.answers && typeof record.answers === "object") {
        const suspectField = Object.values(record.answers).find(
          (field) =>
            field && field.text && field.text.toLowerCase().includes("suspect"),
        );
        const tipField = Object.values(record.answers).find(
          (field) =>
            field && field.text && field.text.toLowerCase().includes("tip"),
        );

        if (
          suspectField &&
          suspectField.answer &&
          suspectField.answer.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
        if (
          tipField &&
          tipField.answer &&
          tipField.answer.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
      }
    }

    return false;
  };

  // Search function with all filters
  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedRecord(null);
    applyFilters(query, locationFilter, selectedTypes);
  };

  const handleLocationFilter = (location) => {
    setLocationFilter(location);
    setSelectedRecord(null);
    applyFilters(searchQuery, location, selectedTypes);
  };

  const handleTypeFilter = (type) => {
    let newTypes;
    if (selectedTypes.includes(type)) {
      newTypes = selectedTypes.filter((t) => t !== type);
      if (newTypes.length === 0) {
        newTypes = [type]; // En az bir tür seçili olmalı
      }
    } else {
      newTypes = [...selectedTypes, type];
    }
    setSelectedTypes(newTypes);
    setSelectedRecord(null);
    applyFilters(searchQuery, locationFilter, newTypes);
  };

  const applyFilters = (query, location, types) => {
    let results = allData;

    // Apply type filter
    results = results.filter((record) => types.includes(record.type));

    // Apply person search
    if (query.trim()) {
      results = results.filter((record) =>
        matchesPersonCriteria(record, query),
      );
    }

    // Apply location filter
    if (location.trim()) {
      results = results.filter((record) => {
        if (record.answers && typeof record.answers === "object") {
          const locationText = Object.values(record.answers)
            .map((field) => (field?.answer || "").toString().toLowerCase())
            .join(" ");
          return locationText.includes(location.toLowerCase());
        }
        return false;
      });
    }

    setFilteredResults(results);
  };

  // Seçilen kayıtla ilgili diğer kayıtları bul
  const findRelatedRecords = (record) => {
    if (!record) return [];

    const lowerQuery = (query) => query?.toString().toLowerCase() || "";
    const related = [];

    // Seçilen kayıttan kişi ismini çıkar
    let personName = "";
    if (record.type === "Checkins") {
      const field = Object.values(record.answers || {}).find((f) =>
        f?.text?.toLowerCase().includes("person name"),
      );
      personName = field?.answer || "";
    } else if (record.type === "Messages") {
      const field = Object.values(record.answers || {}).find(
        (f) =>
          f?.text?.toLowerCase().includes("sender") ||
          f?.text?.toLowerCase().includes("recipient"),
      );
      personName = field?.answer || "";
    } else if (record.type === "Sightings") {
      const field = Object.values(record.answers || {}).find(
        (f) =>
          f?.text?.toLowerCase().includes("personname") ||
          f?.text?.toLowerCase().includes("seenwith"),
      );
      personName = field?.answer || "";
    } else if (record.type === "Personal Notes") {
      const field = Object.values(record.answers || {}).find((f) =>
        f?.text?.toLowerCase().includes("author"),
      );
      personName = field?.answer || "";
    } else if (record.type === "Anonymous Tips") {
      const field = Object.values(record.answers || {}).find((f) =>
        f?.text?.toLowerCase().includes("suspect"),
      );
      personName = field?.answer || "";
    }

    if (personName) {
      allData.forEach((r) => {
        if (r.id !== record.id && matchesPersonCriteria(r, personName)) {
          related.push(r);
        }
      });
    }

    return related;
  };

  const getColorClass = (color) => {
    const colors = {
      blue: "border-blue-500 bg-blue-50",
      green: "border-green-500 bg-green-50",
      amber: "border-amber-500 bg-amber-50",
      purple: "border-purple-500 bg-purple-50",
      red: "border-red-500 bg-red-50",
    };
    return colors[color] || "border-gray-500 bg-gray-50";
  };

  const getCategoryButtonClass = (color, isSelected) => {
    const selectedClasses = {
      blue: "bg-blue-500 text-white border-blue-500",
      green: "bg-green-500 text-white border-green-500",
      amber: "bg-amber-500 text-white border-amber-500",
      purple: "bg-purple-500 text-white border-purple-500",
      red: "bg-red-500 text-white border-red-500",
    };
    const unselectedClasses = {
      blue: "bg-white text-blue-700 border-blue-300 hover:border-blue-500",
      green: "bg-white text-green-700 border-green-300 hover:border-green-500",
      amber: "bg-white text-amber-700 border-amber-300 hover:border-amber-500",
      purple:
        "bg-white text-purple-700 border-purple-300 hover:border-purple-500",
      red: "bg-white text-red-700 border-red-300 hover:border-red-500",
    };
    return isSelected ? selectedClasses[color] : unselectedClasses[color];
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center space-y-3">
          <p className="text-4xl animate-spin">⏳</p>
          <p className="text-lg font-semibold text-gray-800">
            Tüm veriler yükleniyor...
          </p>
          <p className="text-sm text-gray-600">
            5 formdan veriler API'den çekiliyor
          </p>
          <div className="mt-4 flex gap-1 justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-red-50 rounded-lg p-8 shadow-lg border-2 border-red-300 space-y-3 max-w-md">
          <p className="text-4xl">❌</p>
          <p className="text-lg font-semibold text-red-800">Hata Oluştu</p>
          <p className="text-sm text-red-700">
            Veriler yüklenirken bir hata oluştu:
          </p>
          <p className="text-xs text-red-600 bg-red-100 p-2 rounded font-mono">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 Sayfayı Yenile
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🔍 Arama ve Filtreleme Yap
        </h2>
        <p className="text-gray-600 mb-4">
          Tüm API verilerinde kişi, konum ve kategoriye göre filtreleme yapın
        </p>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg p-4 shadow-md space-y-3">
          {/* Person Search */}
          <input
            type="text"
            placeholder="🔍 Kişi adı ile ara (ör: Podo, John, Ahmed...)..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
          />

          {/* Location Filter */}
          <input
            type="text"
            placeholder="📍 Konum ile filtrele..."
            value={locationFilter}
            onChange={(e) => handleLocationFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none transition-colors"
          />

          {/* Category Filter */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📂 Kategoriye Göre Filtrele:
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { name: "Checkins", icon: "📋", color: "blue" },
                { name: "Messages", icon: "💬", color: "green" },
                { name: "Sightings", icon: "👀", color: "amber" },
                { name: "Personal Notes", icon: "📝", color: "purple" },
                { name: "Anonymous Tips", icon: "🔒", color: "red" },
              ].map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleTypeFilter(category.name)}
                  className={`px-3 py-1.5 rounded-lg border-2 font-semibold text-sm transition-all ${getCategoryButtonClass(
                    category.color,
                    selectedTypes.includes(category.name),
                  )}`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {filteredResults.length}
                </p>
                <p className="text-xs text-gray-600">Sonuç</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {allData.length}
                </p>
                <p className="text-xs text-gray-600">Toplam</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {selectedTypes.length}
                </p>
                <p className="text-xs text-gray-600">Kategoriler</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            📋 Checkins: Person Name | 💬 Messages: Sender/Recipient | 👀
            Sightings: personName/seenWith | 📝 Notes: Author | 🔒 Tips:
            Suspect/Tip
          </p>
        </div>
      </div>

      {/* Main Content - 2 Panel Layout */}
      <div className="flex gap-6 h-[calc(100vh-280px)]">
        {/* Left Panel: Results List */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📋 Arama Sonuçları
          </h3>

          {filteredResults.length > 0 ? (
            <div className="space-y-3">
              {filteredResults.map((record, idx) => (
                <div
                  key={record.id || idx}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                    selectedRecord?.id === record.id
                      ? `${getColorClass(record.color)} ring-2 ring-blue-500`
                      : `${getColorClass(record.color)} hover:shadow-md`
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-lg">{record.icon}</span>
                      <span className="font-semibold text-gray-800">
                        {record.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">#{record.id}</span>
                  </div>

                  {/* Preview */}
                  <div className="text-sm text-gray-700 truncate">
                    {record.answers
                      ? Object.values(record.answers)
                          .slice(0, 2)
                          .map((f) => f?.answer || "")
                          .filter(Boolean)
                          .join(" • ")
                      : "Veri yok"}
                  </div>

                  {(() => {
                    const dateObj = new Date(
                      record.createdAt || record.timestamp,
                    );
                    const isValid = !isNaN(dateObj.getTime());
                    return isValid ? (
                      <span className="text-xs text-gray-400 mt-1 block">
                        {dateObj.toLocaleString("tr-TR")}
                      </span>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-lg font-semibold mb-2">Sonuç bulunamadı</p>
              <p className="text-sm">
                {searchQuery
                  ? "Aranan kişi adı bulunamadı"
                  : locationFilter
                    ? "Belirtilen konum bulunamadı"
                    : "Seçili kategorilerde veri yok"}
              </p>
              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p>Aktif Filtreler:</p>
                <p>
                  🔍{" "}
                  {searchQuery ? `Kişi: "${searchQuery}"` : "Kişi filtresi yok"}
                </p>
                <p>
                  📍{" "}
                  {locationFilter
                    ? `Konum: "${locationFilter}"`
                    : "Konum filtresi yok"}
                </p>
                <p>📂 Kategoriler: {selectedTypes.length} seçili</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Detail View */}
        {selectedRecord ? (
          <div className="w-96 bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {selectedRecord.icon} {selectedRecord.type}
                </h3>
                <p className="text-sm text-gray-500">ID: {selectedRecord.id}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-2xl hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {/* Record Details */}
            <div className="space-y-4 pb-4 border-b-2 border-gray-200">
              {/* Timestamp */}
              {(() => {
                const dateObj = new Date(
                  selectedRecord.createdAt || selectedRecord.timestamp,
                );
                const isValid = !isNaN(dateObj.getTime());
                return isValid ? (
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                      ⏰ Tarih
                    </p>
                    <p className="text-sm text-gray-800">
                      {dateObj.toLocaleString("tr-TR")}
                    </p>
                  </div>
                ) : null;
              })()}

              {/* All Fields */}
              {selectedRecord.answers &&
              Object.entries(selectedRecord.answers).length > 0 ? (
                Object.entries(selectedRecord.answers).map(([key, field]) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                      {field.text || key}
                    </p>
                    <p className="text-sm text-gray-800 break-words">
                      {typeof field.answer === "object"
                        ? JSON.stringify(field.answer)
                        : field.answer || "—"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Veri yok</p>
              )}
            </div>

            {/* Related Records */}
            {(() => {
              const relatedRecords = findRelatedRecords(selectedRecord);
              return relatedRecords.length > 0 ? (
                <div className="mt-4">
                  <h4 className="font-bold text-gray-800 mb-3">
                    🔗 İlgili Kayıtlar ({relatedRecords.length})
                  </h4>
                  <div className="space-y-2">
                    {relatedRecords.slice(0, 5).map((related) => (
                      <div
                        key={related.id}
                        onClick={() => setSelectedRecord(related)}
                        className="p-2 bg-gray-50 rounded border-l-2 border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors text-sm"
                      >
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          {related.icon} {related.type}
                        </div>
                        <p className="text-xs text-gray-600">#{related.id}</p>
                      </div>
                    ))}
                    {relatedRecords.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{relatedRecords.length - 5} daha fazla...
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    🔗 İlişkili kayıt bulunamadı
                  </p>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="w-96 bg-white rounded-lg shadow-lg p-6 flex items-center justify-center">
            <div className="text-center text-gray-500 space-y-3">
              <p className="text-5xl">👈</p>
              <p className="text-lg font-semibold">Kayıt Seçilmedi</p>
              <p className="text-sm">
                Sol panelden bir kayıt seçerek detaylarını ve ilişkili bilgileri
                görebilirsiniz
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                💡 Arama sonuçlarından herhangi bir kartı tıkla
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
