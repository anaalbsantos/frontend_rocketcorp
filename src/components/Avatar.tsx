interface AvatarProps {
  name: string;
  size?: string; // ex: "w-12 h-12"
}

function getInitials(name: string) {
  const names = name.trim().split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

const Avatar = ({ name, size = "w-10 h-10" }: AvatarProps) => (
  <div
    className={`rounded-full bg-gray-200 flex items-center justify-center font-normal text-lg text-teal-800 select-none w- ${size}`}
  >
    {getInitials(name)}
  </div>
);

export default Avatar;
