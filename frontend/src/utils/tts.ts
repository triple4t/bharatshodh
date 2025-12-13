
// below is an alternative that returns the Blob instead of playing it directly

// export async function getSpeechAudio(text: string): Promise<Blob> {
//   const res = await fetch("http://localhost:8010/api/tts", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ text }),
//   });

//   if (!res.ok) throw new Error("TTS failed");
//   return await res.blob(); // return Blob instead of playing it here
// }


export async function getSpeechAudio(
  text: string,
  voice_id = "JBFqnCBsd6RMkjVDRZzb",
  model_id = "eleven_multilingual_v2"
): Promise<Blob> {
  const res = await fetch("http://localhost:8010/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id, model_id }),
  });

  if (!res.ok) throw new Error("TTS failed: " + res.statusText);
  return await res.blob();
}