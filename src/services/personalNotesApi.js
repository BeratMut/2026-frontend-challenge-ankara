/**
 * Personal Notes form gönderimlerini çeken fonksiyon
 * @returns {Promise} API yanıtı (content)
 */
export const getFormSubmissions = async () => {
  try {
    const url = `https://api.jotform.com/form/261065509008958/submissions?apiKey=${import.meta.env.VITE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API hatası: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Form gönderim verisi alınırken hata oluştu:", error);
    throw error;
  }
};

try {
  const submissions = await getFormSubmissions();
  console.log("Form Gönderim Verileri PersonalNotesApi:", submissions);
} catch (error) {
  console.error("Hata:", error.message);
}
