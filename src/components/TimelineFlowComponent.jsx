import { useState, useEffect } from "react";
import { getFormSubmissions as getCheckins } from "../services/checkinsApi";
import { getFormSubmissions as getMessages } from "../services/messagesApi";
import { getFormSubmissions as getSightings } from "../services/sightingsApi";
import { getFormSubmissions as getPersonalNotes } from "../services/personalNotesApi";
import { getFormSubmissions as getAnonymousTips } from "../services/anonymousTipsApi";

export const TimelineFlowComponent = () => {
  const [personName, setPersonName] = useState("Podo");
  const [allData, setAllData] = useState([]);
  const [timelineRecords, setTimelineRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse various date formats
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);

    // Try ISO format first
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    // Try DD-MM-YYYY HH:MM format
    const match = dateStr.match(
      /(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})/,
    );
    if (match) {
      const [, day, month, year, hour, minute] = match;
      date = new Date(year, month - 1, day, hour, minute);
      if (!isNaN(date.getTime())) return date;
    }

    // Try DD.MM.YYYY HH:MM format
    const match2 = dateStr.match(
      /(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})/,
    );
    if (match2) {
      const [, day, month, year, hour, minute] = match2;
      date = new Date(year, month - 1, day, hour, minute);
      if (!isNaN(date.getTime())) return date;
    }

    return new Date(0);
  };

  // Extract person name from record
  const extractPersonFromRecord = (record) => {
    if (record.type === "Checkins") {
      const field = Object.values(record.answers || {}).find((f) =>
        f?.text?.toLowerCase().includes("person name"),
      );
      return field?.answer || "";
    } else if (record.type === "Messages") {
      const senderField = Object.values(record.answers || {}).find((f) =>
        f?.text?.toLowerCase().includes("sender"),
      );
      const recipientField = Object.values(record.answers || {}).find((f) =>
        f?.text?.toLowerCase().includes("recipient"),
      );
      return senderField?.answer || recipientField?.answer || "";
    } else if (record.type === "Sightings") {
      const field = Object.values(record.answers || {}).find(
        (f) =>
          f?.text?.toLowerCase().includes("personname") ||
          f?.text?.toLowerCase().includes("person name"),
      );
      return field?.answer || "";
    } else if (record.type === "Personal Notes") {
      const field = Object.values(record.answers || {}).find((f) =>
        f?.text?.toLowerCase().includes("author"),
      );
      return field?.answer || "";
    } else if (record.type === "Anonymous Tips") {
      const field = Object.values(record.answers || {}).find((f) =>
        f?.text?.toLowerCase().includes("suspect"),
      );
      return field?.answer || "";
    }
    return "";
  };

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
        filterByPerson(combined, "Podo");
      } catch (err) {
        setError(err.message);
        console.error("Timeline Hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter records by person name
  const filterByPerson = (data, name) => {
    if (!name.trim()) {
      setTimelineRecords([]);
      return;
    }

    const lowerName = name.toLowerCase();
    const filtered = data
      .filter((record) => {
        const recordPerson = extractPersonFromRecord(record);
        return recordPerson.toLowerCase().includes(lowerName);
      })
      .sort((a, b) => {
        const timestampA = a.createdAt || a.timestamp || "";
        const timestampB = b.createdAt || b.timestamp || "";

        const dateA = parseDate(timestampA);
        const dateB = parseDate(timestampB);

        return dateA.getTime() - dateB.getTime(); // Oldest first for timeline
      });

    setTimelineRecords(filtered);
  };

  const handleSearch = (name) => {
    setPersonName(name);
    filterByPerson(allData, name);
  };

  const getColorDot = (color) => {
    const colors = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      amber: "bg-amber-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
    };
    return colors[color] || "bg-gray-500";
  };

  const getColorBorder = (color) => {
    const colors = {
      blue: "border-blue-300",
      green: "border-green-300",
      amber: "border-amber-300",
      purple: "border-purple-300",
      red: "border-red-300",
    };
    return colors[color] || "border-gray-300";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center space-y-3">
          <p className="text-4xl animate-spin">⏳</p>
          <p className="text-lg font-semibold text-gray-800">
            Veriler yükleniyor...
          </p>
          <p className="text-sm text-gray-600">Timeline hazırlanıyor</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-red-50 rounded-lg p-8 shadow-lg border-2 border-red-300 space-y-3 max-w-md">
          <p className="text-4xl">❌</p>
          <p className="text-lg font-semibold text-red-800">Hata Oluştu</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">
          ⏱️ Zaman Akışı
        </h2>
        <p className="text-gray-600">
          Seçilen kişinin tüm kayıtlarının kronolojik zaman çizelgesi
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 mb-2 block">
              👤 Kişi Adı Gir:
            </span>
            <input
              type="text"
              placeholder="Örn: Podo, John, Ahmed..."
              value={personName}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors text-lg"
            />
          </label>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">📊 Sonuç:</span>{" "}
            {timelineRecords.length} kayıt bulundu
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {timelineRecords.length > 0 ? (
          <div className="space-y-6">
            {/* Vertical line background */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-200 via-purple-200 to-indigo-200"></div>

            {/* Timeline items */}
            {timelineRecords.map((record, idx) => {
              const dateObj = new Date(record.createdAt || record.timestamp);
              const isValid = !isNaN(dateObj.getTime());

              return (
                <div key={record.id || idx} className="relative pl-20">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 w-14 h-14 rounded-full border-4 border-white ${getColorDot(
                      record.color,
                    )} shadow-lg flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform`}
                    title={record.type}
                  >
                    {record.icon}
                  </div>

                  {/* Card */}
                  <div
                    className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${getColorBorder(
                      record.color,
                    )} hover:shadow-lg transition-shadow`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {record.icon} {record.type}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {record.id}
                        </p>
                      </div>
                      {isValid && (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700">
                            {dateObj.toLocaleDateString("tr-TR")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dateObj.toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
                      {record.answers &&
                      Object.entries(record.answers).length > 0 ? (
                        Object.entries(record.answers).map(([key, field]) => (
                          <div key={key} className="bg-gray-50 p-2 rounded">
                            <p className="text-xs font-semibold text-indigo-600 uppercase">
                              {field.text || key}
                            </p>
                            <p className="text-gray-700">
                              {typeof field.answer === "object"
                                ? JSON.stringify(field.answer).substring(0, 100)
                                : (field.answer || "—").substring(0, 100)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 italic">Veri yok</p>
                      )}
                    </div>

                    {/* Timeline index */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-400">
                        📍 Etkinlik #{idx + 1} / {timelineRecords.length}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End marker */}
            <div className="relative pl-20">
              <div className="absolute left-0 w-14 h-14 rounded-full border-4 border-white bg-indigo-600 shadow-lg flex items-center justify-center text-xl text-white">
                ✓
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-300 text-center">
                <p className="font-semibold text-indigo-900">Timeline Sonu</p>
                <p className="text-sm text-indigo-700">
                  {personName} için {timelineRecords.length} etkinlik gösterildi
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 shadow-md text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {personName ? "Sonuç Bulunamadı" : "Kişi Adı Girin"}
            </p>
            <p className="text-gray-600">
              {personName
                ? `"${personName}" adlı kişiye ait kayıt bulunamadı`
                : "Yukarıdaki input'a bir kişi adı yazarak o kişinin zaman çizelgesini görebilirsiniz"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
