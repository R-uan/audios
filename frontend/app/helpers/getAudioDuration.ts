export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);

    audio.addEventListener("loadedmetadata", () => {
      // Return duration in seconds (rounded to nearest integer)
      resolve(Math.floor(audio.duration));
    });

    audio.addEventListener("error", (error) => {
      console.error("Failed to load audio metadata:", error);
      // Resolve with 0 instead of rejecting to prevent blocking the submission
      resolve(0);
    });

    // Set a timeout in case metadata never loads
    setTimeout(() => {
      console.warn("Audio metadata loading timeout");
      resolve(0);
    }, 10000); // 10 second timeout
  });
}
