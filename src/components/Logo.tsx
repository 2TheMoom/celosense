export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CeloSense logo"
    >
      {/* Outer diamond */}
      <polygon points="60,8 102,50 60,92 18,50" fill="none" stroke="#1F3A8F" strokeWidth="5"/>
      {/* Inner filled diamond */}
      <polygon points="60,20 90,50 60,80 30,50" fill="#1F3A8F"/>
      {/* Eye white */}
      <ellipse cx="60" cy="50" rx="20" ry="12" fill="#E9E6DF"/>
      {/* Green pupil */}
      <circle cx="60" cy="50" r="6" fill="#1A6B3C"/>

      {/* Circuit trace top */}
      <line x1="60" y1="8" x2="60" y2="2" stroke="#1F3A8F" strokeWidth="4" strokeLinecap="round"/>
      <line x1="48" y1="2" x2="72" y2="2" stroke="#1F3A8F" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="48" cy="2" r="4" fill="#1A6B3C"/>
      <circle cx="72" cy="2" r="4" fill="#1A6B3C"/>

      {/* Circuit trace bottom */}
      <line x1="60" y1="92" x2="60" y2="98" stroke="#1F3A8F" strokeWidth="4" strokeLinecap="round"/>
      <line x1="48" y1="98" x2="72" y2="98" stroke="#1F3A8F" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="48" cy="98" r="4" fill="#1A6B3C"/>
      <circle cx="72" cy="98" r="4" fill="#1A6B3C"/>

      {/* Scan lines */}
      <line x1="2" y1="50" x2="15" y2="50" stroke="#1F3A8F" strokeWidth="4" strokeLinecap="round"/>
      <line x1="105" y1="50" x2="118" y2="50" stroke="#1F3A8F" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}