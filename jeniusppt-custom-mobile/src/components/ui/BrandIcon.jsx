const brands = {
  whatsapp: ["whatsapp", "25D366"],
  facebook: ["facebook", "1877F2"],
  telegram: ["telegram", "26A5E4"],
  x: ["x", "000000"],
  gmail: ["gmail", "EA4335"],
  instagram: ["instagram", "E4405F"],
};
export default function BrandIcon({ name, size = 19 }) {
  const item = brands[name];
  if (!item) return null;
  return (
    <img
      className="brand-social-icon"
      src={`https://cdn.simpleicons.org/${item[0]}/${item[1]}`}
      width={size}
      height={size}
      alt={`${name} logo`}
    />
  );
}
