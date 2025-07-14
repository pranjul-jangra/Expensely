import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRateLimitExceeds } from "../reduxStates/userSlice";



export default function RateLimiter({ isLightTheme }) {
    const dispatch = useDispatch();
    const retryAfter = useSelector(state => state.user.retryAfter);
    const [seconds, setSeconds] = useState(retryAfter || 60);

    // Set retry seconds
    useEffect(() => {
        setSeconds(retryAfter);
    }, [retryAfter]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Theme style
    const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
    const grayText = isLightTheme ? "text-gray-700" : "text-gray-400";

    return (
        <div className={`flex flex-col items-center justify-center h-screen text-center ${bgColor}`}>
            <h1 className="text-2xl font-semibold mb-4 text-yellow-600">You're sending too many requests</h1>
            <p className={`mb-4 ${grayText}`}>
                Please wait <strong>{seconds}</strong> seconds before retrying.
            </p>
            <button disabled={seconds > 0} className={`px-4 py-2 rounded cursor-pointer ${seconds > 0 ? "bg-gray-400" : "bg-green-600 text-white"}`} onClick={() => { dispatch(setRateLimitExceeds(false)); window.location.reload() }}>
                {seconds > 0 ? "Please wait..." : "Reload Now"}
            </button>
        </div>
    );
}
