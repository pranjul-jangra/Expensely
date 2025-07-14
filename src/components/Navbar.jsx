import { IoAdd, IoSettingsSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function Navbar({ isLightTheme }) {
    const navigate = useNavigate();

    // Theme style
    const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
    const bgHover = isLightTheme ? "hover:bg-gray-100" : "hover:bg-zinc-800";


    return (
        <nav className='w-full pt-6 pb-5 flex justify-between items-center'>
            <h1 className='text-3xl font-bold tracking-wide'>Expensely</h1>

            <div className="flex items-center *:not-focus:outline-none *:font-semibold *:cursor-pointer space-x-3">
                <button type="button" aria-label="Add transaction" className={`sm:bg-blue-500 sm:hover:bg-blue-600 text-white border ${borderColor} sm:border-none p-2 rounded-full sm:rounded-lg flex items-center gap-1 transition-colors duration-150`} onClick={() => navigate("/home/add-transaction")}>
                    <IoAdd className="text-xl font-bold" />
                    <span className="max-sm:hidden">Add Transaction</span>
                </button>

                <button type="button" aria-label="settings" className={`text-xl border ${borderColor} p-2 rounded-full ${bgHover} transition-colors duration-150`} onClick={() => navigate("/settings")}><IoSettingsSharp /></button>
            </div>
        </nav>
    )
}
