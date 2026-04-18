export const TimelineCard = ({ record, isSelected, onClick, onBadgeClick }) => {
  // involvedPeople'ı çıkarmaya çalış - farklı formatlarda olabilir
  const getPeople = () => {
    const people = [];

    // Direct involvedPeople array
    if (Array.isArray(record.involvedPeople)) {
      people.push(
        ...record.involvedPeople.filter(
          (p) => typeof p === "string" && p.trim(),
        ),
      );
    }

    // İçerikte ad geçiyorsa çıkar (basit heuristic)
    if (typeof record.content === "string") {
      const nameMatch = record.content.match(/İsim[:\s]+([^,\n]+)/i);
      if (nameMatch && nameMatch[1]) {
        people.push(nameMatch[1].trim());
      }
    }

    return [...new Set(people)]; // Duplicates'i kaldır
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      Kritik: "border-l-red-600 bg-red-50",
      Yüksek: "border-l-orange-500 bg-orange-50",
      Orta: "border-l-yellow-500 bg-yellow-50",
      Düşük: "border-l-green-500 bg-green-50",
      Normal: "border-l-gray-500 bg-gray-50",
    };
    return colors[urgency] || "border-l-gray-500 bg-gray-50";
  };

  const getUrgencyBadgeColor = (urgency) => {
    const colors = {
      Kritik: "bg-red-600",
      Yüksek: "bg-orange-500",
      Orta: "bg-yellow-500",
      Düşük: "bg-green-500",
      Normal: "bg-gray-500",
    };
    return colors[urgency] || "bg-gray-500";
  };

  const people = getPeople();
  const timestamp = record.createdAt || record.timestamp || "Zaman bilinmiyor";

  // Answers alanından content ve location'ı çıkar
  const answers = record.answers || {};
  const answerValues = Object.values(answers).filter(
    (v) => v && typeof v === "string",
  );
  const contentText = answerValues.join(" - ") || "İçerik yok";

  const location = "Konum: " + (answerValues[0] || "Bilinmiyor");
  const urgency = record.urgency || record.priority || "Normal";
  const confidence = record.confidence || "Orta";

  return (
    <div
      onClick={onClick}
      className={`
        border-l-4 rounded-lg p-4 mb-3 cursor-pointer transition-all duration-300
        ${getUrgencyColor(urgency)}
        ${
          isSelected
            ? "border-2 border-blue-500 shadow-lg"
            : "border border-gray-300 shadow hover:shadow-md hover:translate-x-1"
        }
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <span className="inline-block bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {record.type}
          </span>
          <span
            className={`inline-block text-white text-xs font-semibold px-2 py-1 rounded ${getUrgencyBadgeColor(urgency)}`}
          >
            {urgency}
          </span>
        </div>
        {(() => {
          const dateObj = new Date(timestamp);
          const isValid = !isNaN(dateObj.getTime());
          return isValid ? (
            <span className="text-xs text-gray-600">
              {dateObj.toLocaleString("tr-TR")}
            </span>
          ) : null;
        })()}
      </div>

      {/* Lokasyon */}
      <div className="mb-3 text-sm text-gray-700">
        <span className="font-medium">📍 </span>
        {location}
      </div>

      {/* İçerik Özeti */}
      <div className="mb-3 text-sm text-gray-600 leading-relaxed">
        {contentText
          ? contentText.substring(0, 150) +
            (contentText.length > 150 ? "..." : "")
          : "İçerik yok"}
      </div>

      {/* İlgili Kişiler */}
      {people.length > 0 && (
        <div className="mb-3">
          <span className="text-xs text-gray-600 block mb-2">
            👥 İlgili Kişiler:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {people.map((person, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onBadgeClick(person);
                }}
                className="bg-blue-100 hover:bg-blue-500 text-blue-800 hover:text-white border border-blue-300 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
              >
                {person}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Göstergesi */}
      <div className="text-xs text-gray-600">
        <span className="font-medium">🎯 Güvenirlik: </span>
        {confidence}
      </div>
    </div>
  );
};
