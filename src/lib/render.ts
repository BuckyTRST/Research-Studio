import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { VIDEO_DIR, ensureDataDirs } from "./paths";

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
      else reject(new Error(`${cmd} failed (${code}): ${stderr.slice(-1200)}`));
    });
  });
}

function probeDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
      { stdio: ["ignore", "pipe", "pipe"] }
    );
    let out = "";
    child.stdout.on("data", (d) => {
      out += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error("ffprobe failed"));
      resolve(parseFloat(out.trim()) || 0);
    });
  });
}

function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\u2019")
    .replace(/%/g, "\\%")
    .replace(/\n/g, " ");
}

function chunkWords(text: string, size = 5): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(" "));
  }
  return chunks.length ? chunks : [text];
}

function buildAssSubtitles(chunks: string[], duration: number): string {
  const per = duration / chunks.length;
  const lines = [
    "[Script Info]",
    "ScriptType: v4.00+",
    "PlayResX: 1080",
    "PlayResY: 1920",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    "Style: Default,DejaVu Sans,68,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,5,0,2,70,70,280,1",
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ];

  const toTs = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const cs = Math.floor((sec % 1) * 100);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };

  chunks.forEach((chunk, i) => {
    const start = i * per;
    const end = Math.min(duration, (i + 1) * per);
    const text = chunk.replace(/\n/g, "\\N");
    lines.push(`Dialogue: 0,${toTs(start)},${toTs(end)},Default,,0,0,0,,${text}`);
  });
  return lines.join("\n");
}

const BG_COLORS = ["0x10231c", "0x0d1b2a", "0x1a1415", "0x0f2422", "0x1b2a22"];

export async function renderVerticalVideo(opts: {
  id: string;
  voiceoverPath: string;
  hook: string;
  fullText: string;
}): Promise<{ videoPath: string; thumbnailPath: string; durationSec: number }> {
  ensureDataDirs();
  const duration = await probeDuration(opts.voiceoverPath);
  const safeDuration = Math.max(3, duration || 12);
  const bg = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
  const videoPath = path.join(VIDEO_DIR, `${opts.id}.mp4`);
  const thumbnailPath = path.join(VIDEO_DIR, `${opts.id}.jpg`);
  const assPath = path.join(VIDEO_DIR, `${opts.id}.ass`);

  const chunks = chunkWords(opts.fullText, 5);
  fs.writeFileSync(assPath, buildAssSubtitles(chunks, safeDuration), "utf8");

  const hook = escapeDrawtext(opts.hook.slice(0, 64));
  // Escape path for ffmpeg filter (Windows-safe style)
  const assEscaped = assPath.replace(/\\/g, "/").replace(/:/g, "\\:");

  await run("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=${bg}:s=1080x1920:d=${safeDuration.toFixed(2)}`,
    "-i",
    opts.voiceoverPath,
    "-vf",
    `drawbox=x=72:y=150:w=936:h=5:color=0x3dd6c6:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${hook}':fontsize=46:fontcolor=0xE8F5F0:x=(w-text_w)/2:y=190,ass=${assEscaped}`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    "-movflags",
    "+faststart",
    videoPath,
  ]);

  await run("ffmpeg", ["-y", "-i", videoPath, "-ss", "0.4", "-vframes", "1", "-q:v", "3", thumbnailPath]);
  if (fs.existsSync(assPath)) fs.unlinkSync(assPath);

  return { videoPath, thumbnailPath, durationSec: safeDuration };
}
