export default function JeniusMark({ className = "", inverse = false, title = "Logo JP" }) {
  return (
    <svg
      className={`jenius-mark ${inverse ? "jenius-mark-inverse" : ""} ${className}`.trim()}
      viewBox="0 0 512 512"
      role="img"
      aria-label={title}
    >
      <g fill="currentColor">
        <rect x="151" y="62" width="22" height="48" rx="11" />
        <rect x="105" y="82" width="22" height="46" rx="11" transform="rotate(-45 116 105)" />
        <rect x="197" y="82" width="22" height="46" rx="11" transform="rotate(45 208 105)" />
        <circle cx="162" cy="154" r="34" />
        <path d="M130 211h64v137c0 72-42 111-116 111H58v-62h18c36 0 54-17 54-52V211Z" />
        <path fillRule="evenodd" d="M246 128h106a102 102 0 1 1 0 204h-42v127h-64V128Zm106 58a44 44 0 1 0 0 88 44 44 0 0 0 0-88Z" />
        <rect x="321" y="215" width="27" height="8" rx="4" />
        <rect x="321" y="232" width="27" height="8" rx="4" />
        <rect x="321" y="249" width="27" height="8" rx="4" />
        <circle cx="380" cy="236" r="25" />
      </g>
      <path className="jenius-mark-play" d="M374 223.5 393 236l-19 12.5v-25Z" />
    </svg>
  );
}
