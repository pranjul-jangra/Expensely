import { AnimatePresence, motion } from "motion/react"
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TbLockPassword } from "react-icons/tb";
import { MdOutlineMail } from "react-icons/md";
import { CgLogOut } from "react-icons/cg";
import { BiLogOutCircle } from "react-icons/bi";
import { AiOutlineUserDelete } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router";
import interceptor from "../../middleware/AxiosInstance";
import { clearUser } from "../../reduxStates/userSlice";
import { toast } from "react-toastify";
import { fetchUser } from "../../utils/commonFetchers";



export default function AccountAndPrivacy({ isLightTheme }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector((state) => state.user.user);

    const [modalType, setModalType] = useState("none");
    const [isMailSent, setIsMailSent] = useState(false);
    const [error, setError] = useState({ type: "", error: "" });
    // Password states
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    // Email state
    const [email, setEmail] = useState("");
    // Account deletion OTP
    const [otp, setOtp] = useState("");

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

    // Stop body scrolling
    useEffect(() => {
        if (modalType !== "none") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [modalType]);

    // Close modal
    function handleCloseModal(e) {
        e.stopPropagation();
        setModalType("none");
        setIsMailSent(false);
        setPassword("");
        setNewPassword("");
        setEmail("");
        setError({ type: "", error: "" });
    }

    // Change password
    async function handleChangePassword() {
        if (!password.trim() || !newPassword.trim()) return toast.error("Both current and new passwords are required.");
        try {
            await interceptor.post('/api/user/change-password', { password, newPassword });
            setModalType("none");
            toast.success("Password changed successfully.");
            setPassword("");
            setNewPassword("");
            setError({ type: "", error: "" });

        } catch (error) {
            console.error("Error changing password:", error);
            if (error.response?.status === 404) return toast.error("User does not exists or the session has expired.");

            if (error.response?.data?.error === "Invalid password") {
                setError({ type: "password error", error: "Invalid password. Please enter your current password." });
                return;
            }
            toast.error("Error changing password. Please try again later.");
        }
    }

    // Send forgot password link
    async function sendForgotPasswordLink() {
        if (!email.trim()) return toast.error("Email is required.");
        try {
            await interceptor.post('/api/user/send-password-reset-link', { email });
            setIsMailSent(true);
            setEmail("");
            setError({ type: "", error: "" });

        } catch (error) {
            console.log("Error sending password link:", error);
            if (error.response?.data?.error === "Validation failed") return setError({ type: "email error", error: "Invalid email structure." });
            if (error.response?.status === 404) return setError({ type: "email error", error: "No user exists with this email." });
            toast.error("Error generating link");
        }
    }

    // Send email updation link
    async function sendEmailUpdationLink() {
        if (!user?.email) await fetchUser();
        try {
            await interceptor.post('/api/user/send-email-updation-link', { email: user?.email });
            setIsMailSent(true);
            setModalType("showEmail");
            setEmail("");

        } catch (error) {
            console.log("Error generating email updation link:", error);
            if (error.response?.data?.error === "Invalid email structure") return toast.error("Invalid email.");
            toast.error("Error generating link. Please try again later.");
        }
    }

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

    // Logout from all devices
    async function handleLogoutAll() {
        if (!password.trim()) return toast.error("Password is required to logout from all devices.");
        try {
            await interceptor.post('/api/user/logout-all', { password });
            dispatch(clearUser());
            navigate('/signup', { replace: true });
            setError({ type: "", error: "" });

        } catch (error) {
            console.log("Error logging out from all devices:", error);
            if (error.response?.status === 404) return toast.error("User does not exists or the session has expired.");

            if (error.response?.data?.error === "Invalid password") {
                setError({ type: "password error", error: "Invalid password. Please enter your current password." });
                return;
            }
            toast.error("Error logging out. Please try again later.");
        }
    }

    // Send OTP for account deletion
    async function sendAccountDeletionOTP(generateForcely = false) {
        if (!generateForcely) {
            const otpGenerationTime = parseInt(localStorage.getItem("otpGenerationTime"), 10);
            const currentTime = Date.now();

            if (otpGenerationTime && currentTime - otpGenerationTime < 15 * 60 * 1000) {
                toast.info("Enter the OTP.")
                return setModalType("accountDeletion");
            }
        }

        localStorage.removeItem("otpGenerationTime");
        if (!user?.email) await fetchUser();

        try {
            await interceptor.post('/api/user/send-account-deletion-otp', { email: user?.email });
            toast.success("OTP sent to your email. Please check your inbox.");
            localStorage.setItem("otpGenerationTime", Date.now());
            setModalType("accountDeletion");

        } catch (error) {
            console.log("Error sending account deletion OTP:", error);
            if (error.response?.data?.error === "Validation failed") return toast.error("Invalid email.");
            toast.error("Error generating OTP. Please try again later.");
        }
    }

    // Delete account
    async function handleDeleteAccount() {
        if (!otp.trim()) return toast.error("OTP is required to delete account.");
        if (otp.length !== 8) return toast.error("OTP must be 8 digits");

        try {
            await interceptor.post('/api/user/delete-account', { otp });
            dispatch(clearUser());
            localStorage.removeItem('otpGenerationTime');
            navigate('/signup', { replace: true });

        } catch (error) {
            console.log("Error deleting account:", error);
            if (error.response?.status === 404 || error.response?.data?.error === "Invalid or expired OTP") {
                return setError({ type: "accountDeletion", error: "The OTP is invalid or has expired." })
            }
        }
    }

    // Theme style
    const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
    const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
    const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";
    const modalStyle = isLightTheme ? "bg-gray-50" : "bg-neutral-900 shadow-sm shadow-zinc-800 text-white";
    const inputBg = isLightTheme ? "bg-gray-200/60" : "bg-zinc-800/70";
    const alertColor = isLightTheme ? "text-red-700" : "text-red-500";
    const hoverShadow = isLightTheme ? "hover:shadow-gray-300" : "hover:shadow-gray-600";


    return (
        <>
            <main className={`min-h-dvh px-10 max-md:px-3 ${bgColor} pt-6 pb-12`}>
                <h1 className='text-2xl font-bold tracking-wide'>Account & Privacy</h1>

                {/* Security settings */}
                <h2 className='text-xl tracking-wide mt-6 mb-4 font-semibold'>Security Settings</h2>

                <div className={`hover:shadow ${hoverShadow} transition-shadow duration-150 w-full max-w-2xl border rounded-xl ${borderColor} cursor-pointer flex justify-between items-center mb-4 p-4`} onClick={() => setModalType("changePassword")}>
                    <div>
                        <p className="font-semibold">Change Password</p>
                        <p className={`${grayText} text-sm`}>Update your account password to keep your information secure.</p>
                    </div>
                    <TbLockPassword className={`text-2xl ${grayText} shrink-0`} />
                </div>

                <div className={`hover:shadow ${hoverShadow} transition-shadow duration-150 w-full max-w-2xl border rounded-xl ${borderColor} cursor-pointer flex justify-between items-center p-4`} onClick={() => setModalType("forgotPassword")}>
                    <div>
                        <p className="font-semibold">Forgot Password</p>
                        <p className={`${grayText} text-sm`}>Reset your password if you've forgotten it.</p>
                    </div>
                    <TbLockPassword className={`text-2xl ${grayText} shrink-0`} />
                </div>

                {/* Account Information */}
                <h2 className='text-xl mt-6 mb-4 tracking-wide font-semibold'>Account Information</h2>

                <div className={`hover:shadow ${hoverShadow} transition-shadow duration-150 w-full max-w-2xl border rounded-xl ${borderColor} cursor-pointer flex justify-between items-center p-4`} onClick={sendEmailUpdationLink}>
                    <div>
                        <p className="font-semibold">Change Email Address</p>
                        <p className={`${grayText} text-sm`}>Update the email address linked to your account.</p>
                    </div>
                    <MdOutlineMail className={`text-2xl ${grayText} shrink-0`} />
                </div>

                {/* Session Control */}
                <h2 className='text-xl mt-6 mb-4 tracking-wide font-semibold'>Session Control</h2>

                <div className={`hover:shadow ${hoverShadow} transition-shadow duration-150 w-full max-w-2xl border rounded-xl ${borderColor} cursor-pointer flex justify-between items-center mb-4 p-4`} onClick={handleLogout}>
                    <div>
                        <p className="font-semibold">Logout (Current Device)</p>
                        <p className={`${grayText} text-sm`}>Sign out from this device only.</p>
                    </div>
                    <CgLogOut className={`text-2xl ${grayText} shrink-0`} />
                </div>

                <div className={`hover:shadow ${hoverShadow} transition-shadow duration-150 w-full max-w-2xl border rounded-xl ${borderColor} cursor-pointer flex justify-between items-center p-4`} onClick={() => setModalType("logoutAll")}>
                    <div>
                        <p className="font-semibold">Logout From All Devices</p>
                        <p className={`${grayText} text-sm`}>Sign out from all devices where your account is active.</p>
                    </div>
                    <BiLogOutCircle className={`text-2xl ${grayText} shrink-0`} />
                </div>

                {/* Delete Account */}
                <h2 className='text-xl mt-6 mb-4 tracking-wide font-semibold'>Delete Account</h2>

                <div className={`hover:shadow ${hoverShadow} transition-shadow duration-150 w-full max-w-2xl border rounded-xl ${borderColor} cursor-pointer flex justify-between items-center p-4`} onClick={() => sendAccountDeletionOTP(false)}>
                    <div>
                        <p className="font-semibold text-red-500">Delete Account</p>
                        <p className={`${grayText} text-sm`}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <AiOutlineUserDelete className={`text-2xl ${grayText} shrink-0`} />
                </div>
            </main>


            <AnimatePresence>
                {modalType !== "none" && <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/40 px-3 flex justify-center items-center" onClick={handleCloseModal}
                >
                    <motion.article
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`w-full max-w-xl min-h-65 ${modalStyle} relative p-4 rounded-xl *:flex *:flex-col`} onClick={e => e.stopPropagation()}
                    >
                        <button type="button" aria-label="Close" onClick={handleCloseModal} className={`${alertColor} text-2xl absolute top-0.5 right-1 p-1 cursor-pointer`}><IoClose /></button>

                        {/* Mail sent confirm */}
                        {isMailSent && <div className="items-center">
                            <h1 className="text-xl mb-1 font-semibold">{modalType === "showEmail" ? "Email updation Link Sent" : "Password Reset Link Sent"}</h1>
                            <img src="/success.png" alt="" className="w-20 aspect-square rounded-full object-cover" />

                            <div className='w-full *:w-full *:text-center *:leading-relaxed'>
                                <p>An {modalType === "showEmail" ? "email updation" : "password reset"} link has been sent to your email address.</p>
                                <p>Please check your inbox (and spam folder, just in case) to proceed.</p>
                                <p className='text-sm mt-2'>Do not share this email with anyone.</p>
                                <p className='text-sm'>The link will remain valid for 15 minutes only.</p>
                            </div>
                        </div>}

                        {/* Change password | Logout all */}
                        {(modalType === "changePassword" || modalType === "logoutAll") && !isMailSent && <form className="items-start">
                            <h1 className="text-xl mb-1 font-semibold place-self-center">{modalType === "changePassword" ? "Change Password" : "Logout From All Devices"}</h1>

                            <label htmlFor="password" className={`mt-2 font-semibold tracking-wide" htmlFor="email ${grayText}`}>Password</label>
                            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} id="password" className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} />

                            {modalType === "changePassword" && <label htmlFor="newPassword" className={`mt-2 font-semibold tracking-wide" htmlFor="email ${grayText}`}>New password</label>}
                            {modalType === "changePassword" && <input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} id="newPassword" className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} />}

                            <div className="flex gap-1 items-center *:cursor-pointer mt-1.5 ml-auto">
                                <input type="checkbox" className="w-3.5 aspect-square accent-black" id="show" onChange={e => setShowPassword(e.target.checked ? true : false)} />
                                <label htmlFor="show" className="text-sm font-semibold">Show password</label>
                            </div>

                            <button type="button" onClick={modalType === "changePassword" ? handleChangePassword : handleLogoutAll} className={`bg-blue-500 text-white border-none not-focus:outline-none font-semibold cursor-pointer rounded-lg py-2 px-3 place-self-center mt-8`} aria-label={modalType === "changePassword" ? "Update Password" : "Confirm & Logout"}>{modalType === "changePassword" ? "Update Password" : "Confirm & Logout"}</button>

                            {error?.type === "password error" && <p className="mt-2 text-sm text-red-500 place-self-center">Invalid password. Please enter your current password.</p>}
                        </form>}

                        {/* Forgot password link | OTP for account deletion */}
                        {(modalType === "forgotPassword" || modalType === "accountDeletion") && !isMailSent && <form className="items-start">
                            <h1 className="text-xl mb-1 font-semibold place-self-center">{modalType === "forgotPassword" ? "Forgot password?" : "Delete Account"}</h1>

                            <label htmlFor="modalEmail" className={`mt-2 place-self-center font-semibold tracking-wide" htmlFor="email ${grayText}`}>{modalType === "forgotPassword" ? "Enter your email to get the reset link" : "Enter the confirmation OTP sent to your email"}.</label>
                            {modalType === "forgotPassword" && <p className={`text-sm place-self-center mt-2 ${grayText} text-center`}>You’ll receive an email with instructions to reset your password.</p>}
                            {modalType === "accountDeletion" && <p className={`text-sm place-self-center mt-2 ${grayText} text-center`}>Warning: This action is permanent and cannot be undone. All your progress will be lost forever.</p>}

                            {
                                modalType === "forgotPassword"
                                    ?
                                    <input className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} type="email" id="modalEmail" value={email} onChange={e => setEmail(e.target.value)} />
                                    :
                                    <input className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} type="text" id="modalEmail" value={otp} onChange={e => setOtp(e.target.value)} />
                            }

                            <button type="button" aria-label={modalType === "forgotPassword" ? "Send link" : "Confirm & Delete"} onClick={modalType === "forgotPassword" ? sendForgotPasswordLink : handleDeleteAccount} className={`py-2 px-4 place-self-center rounded-lg bg-blue-500 text-white border-none not-focus:outline-none font-semibold cursor-pointer mt-5`}>{modalType === "forgotPassword" ? "Send link" : "Confirm & Delete"}</button>

                            {error?.type === "email error" && <p className={`text-sm font-semibold place-self-center ${alertColor} mt-2`}>{error?.error}</p>}
                            {error?.type === "accountDeletion" && <div className="w-full flex flex-col items-start border border-red-700 bg-red-500/50 px-3 py-4 rounded-lg mt-4">
                                <p className={`text-sm`}>{error.error || "The OTP is invalid or has expired."}</p>

                                <button type="button" aria-label="Generate new OTP" onClick={() => sendAccountDeletionOTP(true)} className="text-sm mt-3 cursor-pointer px-3 py-2 backdrop-blur-3xl border border-red-900 rounded-lg bg-red-800/80">Want to request a new OTP?</button>
                            </div>}
                        </form>}

                    </motion.article>
                </motion.section>}
            </AnimatePresence>
        </>
    )
}

