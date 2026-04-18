import { useState, useEffect } from "react";
import { getFormSubmissions } from "../services/checkinsApi";

export const CheckinsComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getFormSubmissions();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error("Checkins Hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-5 rounded-lg bg-gray-100">
        <p className="text-gray-600">⏳ Yükleniyor...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-5 rounded-lg bg-red-100 border-2 border-red-300">
        <p className="text-red-700">❌ Hata: {error}</p>
      </div>
    );

  const submissions = Array.isArray(data)
    ? data.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.timestamp).getTime();
        const dateB = new Date(b.createdAt || b.timestamp).getTime();
        return dateB - dateA;
      })
    : [];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📋 Checkins</h2>
        <p className="text-gray-600">Toplam {submissions.length} gönderim</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {submissions.length > 0 ? (
          submissions.map((submission, idx) => (
            <div
              key={submission.id || idx}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-l-4 border-blue-500"
            >
              {/* Card Header */}
              <div className="mb-4 pb-4 border-b-2 border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    #{submission.id}
                  </span>
                  {(() => {
                    const dateObj = new Date(
                      submission.createdAt || submission.timestamp,
                    );
                    const isValid = !isNaN(dateObj.getTime());
                    return isValid ? (
                      <span className="text-xs text-gray-500">
                        {dateObj.toLocaleString("tr-TR")}
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Card Content - Answers */}
              <div className="space-y-3">
                {submission.answers &&
                Object.entries(submission.answers).length > 0 ? (
                  Object.entries(submission.answers).map(
                    ([key, field], idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                          {field.text || key}
                        </div>
                        <div className="text-sm text-gray-800 font-medium">
                          {typeof field.answer === "object"
                            ? JSON.stringify(field.answer)
                            : field.answer || "—"}
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="text-gray-400 text-sm italic">Veri yok</div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-4 border-t-2 border-gray-100">
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    ✓ Gönderildi
                  </span>
                  {submission.status && (
                    <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {submission.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-lg">📭 Henüz veri bulunmamaktadır</p>
          </div>
        )}
      </div>
    </div>
  );
};
