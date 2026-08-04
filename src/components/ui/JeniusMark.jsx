export default function JeniusMark({ className = "", inverse = false, title = "Logo JP" }) {
  return (
    <span
      className={`jenius-mark ${inverse ? "jenius-mark-inverse" : ""} ${className}`.trim()}
      role="img"
      aria-label={title}
    />
  );
}
