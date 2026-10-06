import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { AUDIO_DIR, ensureDataDirs } from "./paths";
import { getOpenAI, hasOpenAI } from "./openai";

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} failed (${code}): ${stderr.slice(-800)}`));
    });
  });
}

async function synthesizeWithOpenAI(text: string, outPath: string): Promise<void> {
  const client = getOpenAI();
  if (!client) throw new Error("OpenAI not configured");
  const response = await client.audio.speech.create({
    model: process.env.OPENAI_TTS_MODEL || "tts-1",
    voice: (process.env.OPENAI_TTS_VOICE as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer") || "nova",
    input: text,
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
}

async function synthesizeWithEdge(text: string, outPath: string): Promise<void> {
  const voice = process.env.EDGE_TTS_VOICE || "en-US-JennyNeural";
  const tmpText = `${outPath}.txt`;
  fs.writeFileSync(tmpText, text, "utf8");
  const edgeBin = path.join(process.env.HOME || "/home/ubuntu", ".local/bin/edge-tts");
  const bin = fs.existsSync(edgeBin) ? edgeBin : "edge-tts";
  try {
    await run(bin, ["--voice", voice, "--file", tmpText, "--write-media", outPath]);
  } finally {
    if (fs.existsSync(tmpText)) fs.unlinkSync(tmpText);
  }
}

/** Generate a silent/beep fallback wav via ffmpeg if TTS fails */
async function synthesizeFallbackTone(text: string, outPath: string): Promise<void> {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const duration = Math.min(60, Math.max(8, Math.round(words / 2.4)));
  const wavPath = outPath.endsWith(".mp3") ? outPath.replace(/\.mp3$/, ".wav") : outPath;
  await run("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=220:duration=${duration}`,
    "-af",
    "volume=0.05",
    wavPath,
  ]);
  if (wavPath !== outPath) {
    await run("ffmpeg", ["-y", "-i", wavPath, "-codec:a", "libmp3lame", outPath]);
    fs.unlinkSync(wavPath);
  }
}

export async function synthesizeVoiceover(text: string, id: string): Promise<{ audioPath: string; provider: string }> {
  ensureDataDirs();
  const audioPath = path.join(AUDIO_DIR, `${id}.mp3`);
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) throw new Error("Empty voiceover text");

  if (hasOpenAI() && process.env.TTS_PROVIDER !== "edge") {
    try {
      // OpenAI speech API returns mp3 by default for gpt-4o-mini-tts in many setups;
      // if model fails, fall through.
      await synthesizeWithOpenAI(clean, audioPath);
      return { audioPath, provider: "openai" };
    } catch {
      // fall through to edge
    }
  }

  try {
    await synthesizeWithEdge(clean, audioPath);
    return { audioPath, provider: "edge-tts" };
  } catch {
    await synthesizeFallbackTone(clean, audioPath);
    return { audioPath, provider: "fallback-tone" };
  }
}
