// api/generate.js
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ status: "error", message: "Only POST allowed" });
    }

    const { huggin_face_key, prompt } = req.body || {};

    if (!huggin_face_key || !prompt) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: huggin_face_key or prompt",
      });
    }

    // Hugging Face API isteği
    const response = await fetch(
      "https://router.huggingface.co/fal-ai/fal-ai/stable-diffusion-v35-medium",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${huggin_face_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          options: { wait_for_model: true },
        }),
      }
    );

    const data = await response.json();

    // Görsel URL’si var mı kontrol et
    if (data?.images?.[0]?.url) {
      const imageUrl = data.images[0].url;

      // Direkt indirme bağlantısı oluştur
      const downloadUrl = `${imageUrl}?download=generated-image.png`;

      return res.status(200).json({
        status: "success",
        image_url: imageUrl,
        download_url: downloadUrl,
        developer: "texastr",
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Image not found in response",
        response: data,
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}
