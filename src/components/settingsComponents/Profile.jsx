import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react"
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { MdDevices, MdOutlineCameraAlt, MdOutlineDelete } from "react-icons/md";
import { BsCurrencyRupee } from "react-icons/bs";
import { fetchUser } from "../../utils/commonFetchers";
import { setUser } from "../../reduxStates/userSlice";
import interceptor from "../../middleware/AxiosInstance";


// Profile, Income, Goal
export default function Profile({ isLightTheme }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const user = useSelector((state) => state.user?.user);
    const [showFileInputOptions, setShowFileInputOptions] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch data if not present
    useEffect(() => {
        setFormData(user);

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
        if (showFileInputOptions) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [showFileInputOptions]);

    // Change profile image
    async function handleImageChange(e) {
        try {
            const formData = new FormData();
            formData.append("image", e.target?.files[0]);
            await interceptor.post("/api/user/update-profile-image", formData);
            await fetchUser();

        } catch (error) {
            console.log("Error changing image:", error);
            toast.error("Failed to update image.");
        }
    }

    // Remove profile image
    async function removeProfileImage() {
        try {
            await interceptor.post('/api/user/update-profile-image', { removeProfileImage: true });
            dispatch(setUser({ ...user, profileImage: "/user.png" }));

        } catch (error) {
            console.log("Error removing profile image:", error);
            toast.error("Failed to remove profile image.")
        }
    }

    // Update profile info
    async function handleProfileUpdate(e) {
        if (e.target.textContent === "Edit") return setIsEditMode(true);
        try {
            await interceptor.patch("/api/user/update-profile", formData);
            dispatch(setUser({ ...user, name: formData?.name, income: Number(formData?.income), goal: Number(formData?.goal) }))
            toast.success("Profile updated");
            setIsEditMode(prev => !prev);

        } catch (error) {
            console.log("Error updating profile:", error);
            toast.error("Failed to update profile");
        }
    }

    // Theme style
    const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
    const modalStyle = isLightTheme ? "bg-gray-50" : "bg-neutral-900 shadow-sm shadow-zinc-800 text-white";
    const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
    const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";
    const inputBg = isLightTheme ? "bg-gray-200/60" : "bg-zinc-800/70";


    return (
        <>
            <main className={`min-h-dvh px-10 max-md:px-3 ${bgColor} pt-6 pb-12`}>
                <h1 className='text-2xl font-bold tracking-wide mb-6'>Profile</h1>

                {/* Image */}
                <div className="w-32 aspect-square rounded-full relative overflow-hidden" onClick={() => { isEditMode ? setShowFileInputOptions(true) : null }}>
                    <img src={user?.profileImage || "/user.png"} className='w-full aspect-square object-cover rounded-full' alt="" />
                    {
                        isEditMode && <div className="absolute w-full h-20 top-24 pt-1 bg-white/20 cursor-pointer">
                            <FaEdit className="text-xl mx-auto" />
                        </div>
                    }
                    <input type="file" id="profile-image" accept="image/*" capture={false} ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                </div>

                {/* Details */}
                {
                    !isEditMode && <section className={`mt-6 grid gap-4 text-sm sm:text-base max-w-xl w-full`}>
                        <div className={`flex items-center justify-between border-b pb-2 ${borderColor}`}>
                            <span className="text-gray-500">Name</span>
                            <span className="font-medium text-right">{user?.name}</span>
                        </div>

                        <div className={`flex items-center justify-between border-b pb-2 ${borderColor}`}>
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-right">{user?.email}</span>
                        </div>

                        <div className={`flex items-center justify-between border-b pb-2 ${borderColor}`}>
                            <span className="text-gray-500">Monthly Income</span>
                            <span className="font-medium text-right flex gap-1 items-center"><BsCurrencyRupee /> {user?.income ? user?.income?.toLocaleString("en-IN") : "Not specified"}</span>
                        </div>

                        <div className={`flex items-center justify-between border-b pb-2 ${borderColor}`}>
                            <span className="text-gray-500">Savings Goal</span>
                            <span className="font-medium text-right flex gap-1 items-center"><BsCurrencyRupee /> {user?.goal ? user?.goal?.toLocaleString("en-IN") : "Not specified"}</span>
                        </div>
                    </section>
                }

                {/* Form */}
                {
                    isEditMode && <section className="*:px-2 *:rounded-lg flex flex-col items-start">
                        <label htmlFor="name" className="mt-4 mb-1 font-semibold tracking-wide">Name</label>
                        <input type="text" id="name" value={formData?.name} name="name" onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`w-full max-w-xl px-2 py-2.5 h-full border rounded-lg ${borderColor} ${inputBg}`} placeholder="Name" />
                        <small className={`${grayText}`}>Your display name used throughout the app.</small>

                        <label htmlFor="email" className="mt-4 mb-1 font-semibold tracking-wide">Email</label>
                        <input type="email" id="email" value={formData?.email} name="email" className={`w-full max-w-xl px-2 py-2.5 h-full border rounded-lg ${borderColor} ${inputBg} brightness-110 contrast-125 cursor-not-allowed`} placeholder="Email" disabled aria-disabled />
                        <small className={`${grayText}`}>We'll use this to contact you and help you log in.</small>

                        <label htmlFor="income" className="mt-4 mb-1 font-semibold tracking-wide flex gap-1 items-center">Income (<BsCurrencyRupee />)</label>
                        <input type="number" id="income" value={formData?.income} name="income" onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`w-full max-w-xl px-2 py-2.5 h-full border rounded-lg ${borderColor} ${inputBg}`} placeholder="Income" />
                        <small className={`${grayText}`}>The Income you generate in a typical month.</small>

                        <label htmlFor="goal" className="mt-4 mb-1 font-semibold tracking-wide flex gap-1 items-center">Goal (<BsCurrencyRupee />)</label>
                        <input type="number" id="goal" value={formData?.goal} name="goal" onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`w-full max-w-xl px-2 py-2.5 h-full border rounded-lg ${borderColor} ${inputBg}`} placeholder="Goal" />
                        <small className={`${grayText}`}>How much do you want to save each month?</small>
                    </section>
                }

                {/* Edit & Submit button */}
                <div className="flex gap-6 mt-6 *:w-24 *:py-2 *:rounded-xl *:border *:cursor-pointer">
                    {isEditMode && <button type="button" className={`${borderColor} bg-zinc-700 text-white`} onClick={() => setIsEditMode(false)} aria-label="Cancel">Cancel</button>}
                    <button type="button" onClick={handleProfileUpdate} aria-label={isEditMode ? "Save" : "Edit"} className={`${borderColor} bg-blue-500 font-semibold text-white`}>{isEditMode ? "Save" : "Edit"}</button>
                </div>
            </main>


            {/* Image input options */}
            <AnimatePresence>
                {showFileInputOptions && <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/40 px-3 flex justify-center items-end"
                    onClick={(e) => { e.stopPropagation(); setShowFileInputOptions(false) }}
                >
                    <motion.section
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        role="dialog" aria-modal="true"
                        className={`w-fit h-fit ${modalStyle} relative py-4 px-6 rounded-t-xl`} onClick={e => e.stopPropagation()}
                    >

                        <div className="flex flex-col items-start *:py-1.5 *:cursor-pointer">
                            {user?.profileImage?.includes("cloudinary") && <button onClick={() => { removeProfileImage(); setShowFileInputOptions(false) }} aria-label="Remove profile image" type="button" className="flex gap-3 items-center text-red-500 hover:text-red-600 transition-colors">
                                <MdOutlineDelete className="text-xl" /> Remove profile image
                            </button>}

                            <button aria-label="Take photo" type="button" className="flex gap-3 items-center" onClick={() => { if (fileInputRef.current) { fileInputRef.current.setAttribute("capture", "user"); fileInputRef.current.click(); }; setShowFileInputOptions(false) }}>
                                <MdOutlineCameraAlt className="text-xl" /> Take photo
                            </button>

                            <button aria-label="Choose from device" type="button" className="flex gap-3 items-center" onClick={() => { if (fileInputRef.current) { fileInputRef.current.removeAttribute("capture"); fileInputRef.current.click(); }; setShowFileInputOptions(false) }}>
                                <MdDevices /> Choose from device
                            </button>
                        </div>
                    </motion.section>
                </motion.section>}
            </AnimatePresence >
        </>
    )
}
