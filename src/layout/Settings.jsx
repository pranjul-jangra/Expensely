import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoSettingsSharp } from "react-icons/io5";
import { PiMoneyFill } from "react-icons/pi";
import { MdOutlineManageAccounts, MdOutlinePrivateConnectivity, MdLooks } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { toast } from "react-toastify";
import interceptor from "../middleware/AxiosInstance";
import { clearUser } from "../reduxStates/userSlice";
import { fetchUser } from "../utils/commonFetchers";


export default function Settings({ isLightTheme }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);

  // Fetch user if page refreshed
  useEffect(() => {
    if (!user?.name || !user?.email) {
      (async () => {
        try {
          await fetchUser();

        } catch (error) {
          console.error("Error gettinguser on profile page:", error);
          navigate("/signup", { replace: true });
        }
      })()
    }
  }, [user]);

  // Logout user
  async function handleLogout() {
    try {
      await interceptor.post('/api/user/logout');
      dispatch(clearUser());
      navigate('/signup', { replace: true });

    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again later.");
    }
  }

  // Theme style
  const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
  const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";
  const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
  const hoverShadow = isLightTheme ? "hover:shadow-gray-300" : "hover:shadow-gray-600";


  return (
    <main className={`min-h-dvh ${bgColor} px-10 max-md:px-3 pt-6 pb-12`}>
      <h1 className='text-2xl font-semibold tracking-wide flex gap-2 items-center mb-6'><IoSettingsSharp className="text-blue-500" /> Settings</h1>

      <article className="flex flex-col gap-6 *:border *:rounded-xl *:px-6 *:py-4 *:cursor-pointer">
        <div className={`${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150`} onClick={() => navigate("/settings/profile")}>
          <MdOutlineManageAccounts className="text-4xl mb-2 text-blue-500 shrink-0" />
          <p className="font-semibold text-sm tracking-wide">Profile</p>
          <p className={`${grayText}`}>Manage your profile</p>
        </div>

        <div className={`${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150`} onClick={() => navigate("/settings/savings")}>
          <PiMoneyFill className="text-4xl mb-2 text-blue-500 shrink-0" />
          <p className="font-semibold text-sm tracking-wide">Savings</p>
          <p className={`${grayText}`}>Keep track of your savings</p>
        </div>

        <div className={`${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150`} onClick={() => navigate("/settings/manage-transaction")}>
          <GrTransaction className="text-4xl mb-2 text-blue-500 shrink-0" />
          <p className="font-semibold text-sm tracking-wide">Transactions</p>
          <p className={`${grayText}`}>Manage your transactions</p>
        </div>

        <div className={`${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150`} onClick={() => navigate("/settings/account")}>
          <MdOutlinePrivateConnectivity className="text-4xl mb-2 text-blue-500 shrink-0" />
          <p className="font-semibold text-sm tracking-wide">Account & Privacy</p>
          <p className={`${grayText}`}>Manage your account</p>
        </div>

        <div className={`${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150`} onClick={() => navigate("/settings/theme")}>
          <MdLooks className="text-4xl mb-2 text-blue-500 shrink-0" />
          <p className="font-semibold text-sm tracking-wide">Appearance</p>
          <p className={`${grayText}`}>Switch the app's look</p>
        </div>
      </article>

      <div className="flex justify-center mt-6">
        <button type="button" aria-label="Logout" onClick={handleLogout} className="text-xl font-semibold tracking-wide text-red-500 cursor-pointer">Logout</button>
      </div>
    </main>
  )
}
