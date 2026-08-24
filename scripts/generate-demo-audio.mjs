import fs from "node:fs";
import path from "node:path";
import lamejs from "@breezystack/lamejs";

function readWave(filePath) {
  const buffer = fs.readFileSync(filePath);
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let offset = 12;
  let channels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let pcmOffset = 0;
  let pcmLength = 0;
  while (offset + 8 <= buffer.byteLength) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = view.getUint32(offset + 4, true);
    if (id === "fmt ") {
      channels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    }
    if (id === "data") { pcmOffset = offset + 8; pcmLength = size; break; }
    offset += 8 + size + (size % 2);
  }
  if (!pcmOffset || channels !== 1 || bitsPerSample !== 16) throw new Error(`Expected 16-bit mono PCM WAV: ${filePath}`);
  return { sampleRate, samples: new Int16Array(buffer.buffer, buffer.byteOffset + pcmOffset, pcmLength / 2) };
}

const [inputDirectory, outputDirectory] = process.argv.slice(2);
if (!inputDirectory || !outputDirectory) throw new Error("Usage: node generate-demo-audio.mjs <wav-directory> <mp3-directory>");
fs.mkdirSync(outputDirectory, { recursive: true });
for (const name of fs.readdirSync(inputDirectory).filter((entry) => entry.endsWith(".wav"))) {
  const { sampleRate, samples } = readWave(path.join(inputDirectory, name));
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 96);
  const chunks = [];
  for (let index = 0; index < samples.length; index += 1152) {
    const encoded = encoder.encodeBuffer(samples.subarray(index, index + 1152));
    if (encoded.length) chunks.push(Buffer.from(encoded));
  }
  const flushed = encoder.flush();
  if (flushed.length) chunks.push(Buffer.from(flushed));
  const output = path.join(outputDirectory, name.replace(/\.wav$/i, ".mp3"));
  fs.writeFileSync(output, Buffer.concat(chunks));
  console.log(`${path.basename(output)}|${fs.statSync(output).size}`);
}
