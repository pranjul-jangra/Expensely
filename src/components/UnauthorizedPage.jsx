import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setIsAuthorized } from "../reduxStates/userSlice";

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Disable back/forward navigation
    useEffect(() => {
        // Push current route to history
        window.history.pushState(null, document.title, window.location.href);

        const handlePopState = () => {
            // Re-push the current URL to effectively block back/forward
            window.history.pushState(null, document.title, window.location.href);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    const handleLoginRedirect = () => {
        navigate("/signup", { replace: true });
        dispatch(setIsAuthorized(true));
    };


    return (
        <div className={`flex flex-col items-center justify-center h-dvh w-screen fixed inset-0 bg-black/20 backdrop-blur-sm px-4 text-center`}>
            <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
            <p className="text-lg text-red-600 mb-8">You are not authorized to access this page.</p>

            <button onClick={handleLoginRedirect} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer">
                Go to Login Page
            </button>
        </div>
    );
};

export default UnauthorizedPage;
