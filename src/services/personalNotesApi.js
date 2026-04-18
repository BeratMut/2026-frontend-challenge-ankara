/**
 * Jotform API'den Personal Notes form verilerini çeken fonksiyon
 * @returns {Promise} API yanıtı
 */
export const getFormData = async () => {
  try {
    const url = `https://api.jotform.com/form/261065509008958?apiKey=${import.meta.env.VITE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API hatası: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Form verisi alınırken hata oluştu:", error);
    throw error;
  }
};

/**
 * Personal Notes form gönderimlerini çeken fonksiyon
 * @returns {Promise} API yanıtı
 */
export const getFormSubmissions = async () => {
  try {
    const url = `https://api.jotform.com/form/261065509008958/submissions?apiKey=${import.meta.env.VITE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API hatası: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Form gönderim verisi alınırken hata oluştu:", error);
    throw error;
  }
};
