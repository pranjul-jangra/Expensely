import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const NotFound = ({ isLightTheme }) => {

    // Theme style
    const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
    const textColor = isLightTheme ? "text-zinc-700" : "text-zinc-200";


    return (
        <div className={`min-h-screen flex flex-col items-center justify-center text-center px-6 max-md:px-3 ${bgColor}`}>
            <h1 className="text-6xl font-bold text-red-600">404</h1>

            <p className={`mt-4 text-2xl font-semibold ${textColor}`}>
                Page not found
            </p>

            <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-md">
                Oops! The page you're looking for doesn’t exist.
            </p>

            <Link to="/" className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all" >
                <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
        </div>
    );
};

export default NotFound;
