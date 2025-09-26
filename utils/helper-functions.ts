export const convertImageToJpeg = async (file: File) => {
  return new Promise((resolve, reject) => {
    if (file.type.includes("jpeg")) {
      resolve(file);
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

export const getAspectRatio = (width: number, height: number) => {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
//width = 16, height=9 should return 1:2
// b!=0 gcd(9, 16 % 9(7)) = gcd(9, 7)
// b!=0 gcd(7, 9 % 7(2)) = gcd(7, 2)
// b!=0 gcd(2, 7 % 2(1)) = gcd(2, 1)
// b!=0 gcd(1, 2 % 1(0)) = gcd(1, 0) = 1
// return 1

