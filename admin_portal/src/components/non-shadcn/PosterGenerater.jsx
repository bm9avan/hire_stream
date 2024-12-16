import React, { useEffect, useRef } from "react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function PosterGenerater({
  baseImageUrl = "https://res.cloudinary.com/dw8dsa7ei/image/upload/v1733821552/fa6tudmufohcyfgu8bhd.jpg",
  companyName,
  jobTitle,
  list,
  gap = 20,
}) {
  const canvasRef = useRef(null);
  console.log(list);
  // Function to load an image from a URL and return a Promise
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Handle cross-origin
      img.onload = () => resolve(img);
      img.onerror = (e) => {
        console.error(`Failed to load image from ${url}`, e);
        reject(new Error(`Image load failed: ${url}`));
      };
      img.src = url;
    });
  };

  useEffect(() => {
    const createCollage = async ({
      imageSize = 200, // Default image size (can be adjusted)
      padding = 0, // Default padding around images
      borderColor = "cyan", // Border color
      borderWidth = 5, // Border width
      overlapAmount = 10, // Amount of overlap (default: 30px)
    } = {}) => {
      try {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
          console.error("Canvas context could not be initialized.");
          return;
        }

        const baseImage = await loadImage(baseImageUrl);
        const images = await Promise.all(
          list.map((item) =>
            loadImage(item.userimg).catch((err) => {
              console.warn("Skipping image due to load error:", err);
              return null; // Skip failed images
            })
          )
        ).then((imgs) => imgs.filter(Boolean)); // Filter out null values

        if (images.length === 0) {
          console.error("No valid images to render.");
          return;
        }

        const canvasWidth = baseImage.width;
        const canvasHeight = baseImage.height;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Define usable area for content
        const usableTop = canvasHeight * (6 / 12) - overlapAmount; // Adjust grid to overlap job title
        const usableBottom = canvasHeight * (10 / 12);
        const usableHeight = usableBottom - usableTop;

        // Draw base image
        context.drawImage(baseImage, 0, 0, canvasWidth, canvasHeight);

        // Draw company name and job title at the top of the usable area
        const titleY = usableTop - 70; // Position above usable area
        context.font = "bold 48px Georgia";
        context.fillStyle = "#FFD700"; // Gold color
        context.textAlign = "center";
        context.fillText(companyName, canvasWidth / 2, titleY);

        context.font = "italic 36px Arial";
        context.fillStyle = "#FFA500"; // Orange color
        context.fillText(jobTitle, canvasWidth / 2, titleY + 50);

        // Dynamically calculate the grid
        const maxColumns = Math.ceil(Math.sqrt(list.length));
        const maxRows = Math.ceil(list.length / maxColumns);
        const gridImageSize = imageSize + 2 * padding; // Image size with padding
        const gap = 20;

        // Calculate the total width of the grid for center alignment
        const totalGridWidth =
          maxColumns * gridImageSize + (maxColumns - 1) * gap;
        const gridStartX = (canvasWidth - totalGridWidth) / 2;

        // Render user images and details
        list.forEach((item, index) => {
          const row = Math.floor(index / maxColumns);
          const col = index % maxColumns;

          const x = gridStartX + col * (gridImageSize + gap);
          const y = usableTop + row * (gridImageSize + gap);

          // Draw circular image with border
          const img = images[index];
          if (img) {
            const centerX = x + gridImageSize / 2;
            const centerY = y + gridImageSize / 2;

            context.save();

            // Draw the circular border
            context.beginPath();
            context.arc(
              centerX,
              centerY,
              gridImageSize / 2,
              0,
              Math.PI * 2,
              true
            );
            context.closePath();
            context.fillStyle = borderColor;
            context.fill();

            // Draw the image inside the border
            context.beginPath();
            context.arc(
              centerX,
              centerY,
              (gridImageSize - borderWidth) / 2,
              0,
              Math.PI * 2,
              true
            );
            context.closePath();
            context.clip();
            context.drawImage(
              img,
              x + padding,
              y + padding,
              gridImageSize - 2 * padding,
              gridImageSize - 2 * padding
            );
            context.restore();
          }

          // Draw name below the image
          context.font = "bold 20px Arial";
          context.fillStyle = "#FFF"; // White color
          context.textAlign = "center";
          context.fillText(
            item.name || "Unknown",
            x + gridImageSize / 2,
            y + gridImageSize + 20
          );

          // Draw USN below the name
          context.font = "16px Courier New";
          context.fillStyle = "#FFD700"; // Gold color
          context.fillText(
            item.usn || "USN Missing",
            x + gridImageSize / 2,
            y + gridImageSize + 40
          );
        });
      } catch (err) {
        console.error("Error creating collage:", err);
      }
    };

    createCollage();
  }, [list, baseImageUrl, gap, companyName, jobTitle]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "collage.png";
    link.click();
  };

  return (
    <DropdownMenuItem onSelect={handleDownload}>
      Generate Poster
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </DropdownMenuItem>
  );
}
