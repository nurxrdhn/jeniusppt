import { isYouTubeUrl, normalizeVideoUrl } from "../../utils/mediaUrl";

export default function MediaPlayer({ item, title = "Media slide" }) {
  if (!item?.src) return null;

  if (item.type === "audio") {
    return <audio src={item.src} controls preload="metadata" playsInline />;
  }

  if (item.type !== "video") return null;

  if (isYouTubeUrl(item.src)) {
    return (
      <iframe
        src={normalizeVideoUrl(item.src)}
        title={title}
        loading="eager"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return <video src={item.src} controls preload="metadata" playsInline />;
}
