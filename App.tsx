const handleGenerate = async () => {
  if (!isLoggedIn || isProcessing) return;

  setIsProcessing(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const toBase64 = (file: File | Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
  try {
    // Kiểm tra và chỉ convert nếu biến là File/Blob hợp lệ
    const processImage = async (img: any) => {
      if (img instanceof File || img instanceof Blob) {
        return await toBase64(img);
      }
      return img; // Nếu đã là base64 hoặc string thì giữ nguyên
    };

    const payload = {
      image1: refImage ? await processImage(refImage) : null,
      image2: refImage2 ? await processImage(refImage2) : null,
      //prompt: settings.charPrompt,
      settings: {
        charPrompt: settings.charPrompt,
        contextPrompt: settings.contextPrompt,
        accuracy: settings.accuracy,
        aspectRatio: settings.aspectRatio,
        resolution: settings.resolution,
        style: settings.style,
        numberOfImages: settings.numberOfImages
      } 
    };

    // Tiếp tục gọi API...
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // ... logic xử lý kết quả
    const data = await response.json();
/*    if (data.images && Array.isArray(data.images)) {
      // Thêm tiền tố data:image/png;base64, nếu chuỗi trả về chưa có
      const formattedImages = data.images.map((img: string) => 
        img.startsWith('data:') ? img : `data:image/png;base64,${img}`
      );
      setResultImages(formattedImages);
    } else {
      throw new Error("Không nhận được dữ liệu ảnh từ server");
    } */
  } catch (error: any) {
    alert("Lỗi: " + error.message);
  } finally {
    setIsProcessing(false);
  }
};
