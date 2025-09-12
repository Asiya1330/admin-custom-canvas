export const convertImageToJpeg = async (file: File) => {
  return new Promise((resolve, reject) => {
    if (file.type.includes("jpeg")) {
      reject(new Error("File is already in JPEG format"));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            resolve(
              new File(
                [blob || ""],
                file.name.replace(/\.[^.]+$/, ".jpeg"), // replace extension with .jpeg
                { type: "image/jpeg" }
              )
            );
          },
          "image/jpeg",
          0.9 // quality (0–1)
        );
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
