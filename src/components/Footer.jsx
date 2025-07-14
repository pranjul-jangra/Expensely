export default function Footer({ isLightTheme }) {

    // Theme style
    const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
    const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
    const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";


  return (
    <footer className={`w-full border-t ${borderColor} py-6 px-4 ${bgColor} text-sm flex flex-col md:flex-row justify-between items-center gap-4`}>
      
      {/* App Tagline */}
      <div className="font-semibold">
        Expensely — Manage your money effortlessly.
      </div>

      <div className={`text-xs ${grayText} text-center md:text-right`}>
        Designed for simplicity and control over your finances.
      </div>
    </footer>
  );
}
