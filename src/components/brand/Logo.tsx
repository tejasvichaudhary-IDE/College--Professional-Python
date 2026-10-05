export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#14172E" stroke="#8A7BBB" strokeWidth="1.2" />
      <path d="M24.5 11.2a9 9 0 1 0 .2 13.7" fill="none" stroke="#57F0EE" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="25.2" cy="18" r="1.7" fill="#BBBCDE" />
    </svg>
  );
}
