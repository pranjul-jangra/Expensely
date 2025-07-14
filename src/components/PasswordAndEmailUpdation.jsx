import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLocation, useSearchParams } from 'react-router';
import { toast } from 'react-toastify';
import interceptor from '../middleware/AxiosInstance';
import { setUser } from '../reduxStates/userSlice';


export default function PasswordAndEmailUpdation({ isLightTheme }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pageType, setPageType] = useState("reset-password");
  const [token, setToken] = useState("");
  const user = useSelector(state => state.user.user);

  useEffect(() => {
    // Extract token from URL
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
    } else {
      setToken("");
    }

    // Extract page type from URL
    if (location.pathname.includes("reset-password")) {
      setPageType("reset-password");
    } else if (location.pathname.includes("update-email")) {
      setPageType("update-email");
    }
  }, [location.pathname, searchParams]);

  // Reset password
  async function handlePasswordReset() {
    try {
      if (!newPassword.trim()) return toast.error("New password is required");
      await interceptor.post('/api/user/reset-password', { newPassword, token });
      toast.success("Password reset successfully");
      navigate("/signup", { replace: true });

    } catch (error) {
      console.log("Error to reset password:", error);
      setError(error.response?.data?.error || "Something went wrong");
    }
  }

  // Uppdtae email
  async function handleEmailUpdate() {
    try {
      if (!newEmail.trim()) return toast.error("New email is required");
      await interceptor.post('/api/user/update-email', { token, newEmail });
      toast.success("Email updated successfully");
      navigate("/dashboard", { replace: true });
      dispatch(setUser({ ...user, email: newEmail }));

    } catch (error) {
      console.log("Error updating email:", error);
      setError(error.response?.data?.error || "Something went wrong");
    }
  }

  // Theme styles
  const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
  const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
  const modalStyle = isLightTheme ? "bg-gray-50" : "bg-neutral-900 shadow-sm shadow-zinc-800 text-white";
  const grayText = isLightTheme ? "text-[#374151]" : "text-[#99a1af]";
  const inputBg = isLightTheme ? "bg-gray-200/60" : "bg-zinc-800/70";

  return (
    <main className={`w-screen h-dvh overflow-hidden ${bgColor} flex justify-center items-center px-10 *:px-4 *:py-6 *:w-full *:max-w-xl *:flex *:flex-col *:items-center *:rounded-xl`}>
      {
        pageType === "reset-password"
          ?
          // Password reset form
          <form className={`${modalStyle}`}>
            <h2 className="text-xl mb-1 font-semibold place-self-center">Reset Password</h2>

            <label className={`font-semibold tracking-wide mt-1 ${grayText}`} htmlFor='newPassword'>Please enter your new password.</label>
            <input className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} id='newPassword' type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} />

            <div className="flex gap-1 items-center *:cursor-pointer ml-auto mt-1.5">
              <input type="checkbox" className="w-3.5 aspect-square accent-black" id="show" onChange={e => setShowPassword(e.target.checked ? true : false)} />
              <label htmlFor="show" className="text-sm font-semibold">Show password</label>
            </div>

            <button type='button' aria-label='Reset password' onClick={handlePasswordReset} className={`bg-blue-500 text-white border-none not-focus:outline-none font-semibold cursor-pointer rounded-lg py-2 px-3 mt-4`}>Reset Password</button>

            {error && <div className={`w-full rounded-xl border border-red-500 bg-red-700/30 px-2 py-4 mt-4 text-red-100`}>
              {error}
            </div>}
          </form>
          :
          // Email update form
          <form className={`${modalStyle}`}>
            <h2 className="text-xl mb-1 font-semibold place-self-center">Update Email</h2>

            <label className={`font-semibold tracking-wide mt-1 ${grayText}`} htmlFor='newEmail'>Please enter your new email address.</label>
            <input className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} id='newEmail' type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />

            <button type='button' aria-label='Update email' onClick={handleEmailUpdate} className={`bg-blue-500 text-white border-none not-focus:outline-none font-semibold cursor-pointer rounded-lg py-2 px-3 mt-4`}>Update Email</button>

            {error && <div className={`w-full rounded-xl border border-red-500 bg-red-700/30 px-2 py-4 mt-4 text-red-100`}>
              {error}
            </div>}
          </form>
      }
    </main>
  )
}
