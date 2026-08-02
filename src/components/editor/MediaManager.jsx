import { useRef, useState } from "react";
import { Link, Mic, Square, Upload, Video, Volume2 } from "lucide-react";
import { normalizeVideoUrl } from "../../utils/mediaUrl";

export default function MediaManager({ material, updateMaterial }) {
  const [slideIndex, setSlideIndex] = useState(material.activeSlide || 0);
  const [type, setType] = useState("video");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const input = useRef(null);
  const recorder = useRef(null);
  const chunks = useRef([]);

  function add(src, fileName, mediaType = type) {
    const slides = (material.slides || []).map((slide, index) =>
      index === Number(slideIndex)
        ? {
            ...slide,
            elements: [
              ...(slide.elements || []),
              {
                id: crypto.randomUUID(),
                type: mediaType,
                src: mediaType === "video" ? normalizeVideoUrl(src) : src,
                fileName,
                x: 18,
                y: 32,
                w: mediaType === "video" ? 58 : 55,
                h: mediaType === "video" ? 42 : 14,
              },
            ],
          }
        : slide,
    );
    updateMaterial(material.id, { slides, activeSlide: Number(slideIndex) });
    setUrl("");
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const detected = file.type.startsWith("video/") ? "video" : "audio";
    setType(detected);
    setLoading(true);
    setMessage("");
    try {
      const source =
        file.size <= 2.5 * 1024 * 1024
          ? await readFile(file)
          : URL.createObjectURL(file);
      add(source, file.name, detected);
      setMessage(
        file.size <= 2.5 * 1024 * 1024
          ? "Media sudah masuk dan dapat langsung diputar."
          : "Media besar dapat langsung diputar pada sesi ini. Jangan refresh sebelum selesai mengedit.",
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Berkas tidak dapat dibaca. Coba format MP4, MP3, M4A, WAV, atau OGG.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleRecording() {
    if (recording) return recorder.current?.stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      recorder.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) =>
        event.data.size && chunks.current.push(event.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        add(
          URL.createObjectURL(blob),
          `voice-note-${Date.now()}.webm`,
          "audio",
        );
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        setMessage("Voice note selesai dan dapat langsung diputar.");
      };
      mediaRecorder.start();
      setRecording(true);
      setMessage("Sedang merekam. Tekan Stop jika sudah selesai.");
    } catch (error) {
      console.error(error);
      setMessage("Izin mikrofon ditolak. Aktifkan izin mikrofon pada browser.");
    }
  }

  return (
    <div className="media-manager">
      <div className="media-intro">
        <span className="eyebrow">Media Slide</span>
        <h1>Tambah Video & Audio</h1>
        <p>
          Media dari tautan maupun folder dapat langsung diputar di editor dan
          Preview.
        </p>
      </div>
      <div className="media-form">
        <label>
          <span>Tempatkan pada Slide</span>
          <select
            value={slideIndex}
            onChange={(e) => setSlideIndex(e.target.value)}
          >
            {(material.slides || []).map((slide, index) => (
              <option key={index} value={index}>
                {index + 1}. {slide.title}
              </option>
            ))}
          </select>
        </label>
        <div className="media-type">
          <button
            className={type === "video" ? "active" : ""}
            onClick={() => setType("video")}
          >
            <Video />
            Video
          </button>
          <button
            className={type === "audio" ? "active" : ""}
            onClick={() => setType("audio")}
          >
            <Volume2 />
            Audio
          </button>
        </div>
        <label>
          <span>
            Link{" "}
            {type === "video"
              ? "video langsung atau YouTube"
              : "audio langsung"}
          </span>
          <div className="media-url">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                type === "video"
                  ? "YouTube atau tautan video.mp4"
                  : "https://domain.com/audio.mp3"
              }
            />
            <button disabled={!url.trim()} onClick={() => add(url.trim())}>
              <Link size={16} />
              Tambahkan
            </button>
          </div>
        </label>
        <div className="media-or">
          <span />
          atau
          <span />
        </div>
        <button
          disabled={loading}
          className="media-upload"
          onClick={() => input.current?.click()}
        >
          <Upload />
          {loading
            ? "Menyiapkan media..."
            : "Pilih Video, Audio, atau Voice Note dari Folder"}
        </button>
        <button
          className={`voice-record ${recording ? "recording" : ""}`}
          onClick={toggleRecording}
        >
          {recording ? <Square size={18} /> : <Mic size={18} />}
          {recording
            ? "Stop dan Masukkan Voice Note"
            : "Rekam Voice Note Langsung"}
        </button>
        <input
          ref={input}
          hidden
          type="file"
          accept="video/*,audio/*,.mp4,.webm,.mov,.mp3,.m4a,.wav,.ogg"
          onChange={upload}
        />
        {message && <p className="result-message success">{message}</p>}
        <small>
          MP4 (H.264) dan MP3 paling kompatibel untuk laptop, Android, dan
          iPhone.
        </small>
      </div>
    </div>
  );
}
