interface ShareButtonProps {
  href: string;
  label: string;
  icon: string;
  bgColor: string;
}

export function ShareButton({ href, label, icon, bgColor }: ShareButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${bgColor} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2`}
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}
