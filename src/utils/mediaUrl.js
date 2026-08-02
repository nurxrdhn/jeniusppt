export function getYouTubeId(value = "") {
  try {
    const url = new URL(String(value).trim());
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be")
      return url.pathname.split("/").filter(Boolean)[0] || "";
    if (host.endsWith("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v") || "";
      const parts = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(parts[0])) return parts[1] || "";
    }
  } catch {
    return "";
  }
  return "";
}

export function normalizeVideoUrl(value = "") {
  const id = getYouTubeId(value);
  if (!id) return String(value).trim();
  return `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&modestbranding=1`;
}

export function isYouTubeUrl(value = "") {
  return Boolean(getYouTubeId(value));
}
