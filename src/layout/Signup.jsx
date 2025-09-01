import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { IoClose } from "react-icons/io5";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { toast } from "react-toastify";
import interceptor from "../middleware/AxiosInstance";
import { setToken } from "../reduxStates/userSlice";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);


export default function Signup({ isLightTheme }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    const [data, setData] = useState({ name: '', email: '', password: '' });
    // Forgot password modal states
    const [showModal, setShowModal] = useState(false);
    const [invalidEmailError, setInvalidEmailError] = useState(false);
    const [isMailSent, setIsMailSent] = useState(false);


    // Stop body scrolling
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [showModal]);

    // Theme styles
    const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
    const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
    const modalStyle = isLightTheme ? "bg-gray-50" : "bg-neutral-900 shadow-sm shadow-zinc-800 text-white";
    const alertColor = isLightTheme ? "text-red-700" : "text-red-500";
    const labelColor = isLightTheme ? "#374151" : "#99a1af";
    const grayText = isLightTheme ? "text-[#374151]" : "text-[#99a1af]";
    const gridColor = isLightTheme ? "#e5e7eb" : "#374151";
    const inputBg = isLightTheme ? "bg-gray-200/60" : "bg-zinc-800/70";

    // Chart dummy data
    const chartData = {
        labels: ['Food', 'Travel', 'Cinema', 'Billing'],
        datasets: [
            { label: 'Expense', data: [12, 19, 3, 7], backgroundColor: ['#60a5fe', '#60a5fa', '#60b5fe', '#7fa5f3'], },
            { label: 'Income', data: [14, 17, 6, 9], backgroundColor: ['#7fa5f3', '#bfdbfe', '#60a5fe', '#60a9fe'], },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: labelColor,
                }
            },
            tooltip: {
                titleColor: labelColor,
                bodyColor: labelColor,
            }
        },
        scales: {
            x: {
                ticks: {
                    color: labelColor,
                },
                grid: {
                    color: gridColor,
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: labelColor,
                },
                grid: {
                    color: gridColor,
                }
            },
        },
    };

    // Submit function
    async function handleSubmit() {
        try {
            let url;
            let body;

            if (form === "login") {
                if (!data.email.trim() || !data.password.trim()) return toast.error("Email & Password are required.");
                url = "/api/user/login";
                body = { email: data.email, password: data.password };

            } else {
                if (!data.name.trim() || !data.email.trim() || !data.password.trim()) return toast.error("Name, Email & Password are required.");
                url = "/api/user/register";
                body = data;
            }

            const res = await interceptor.post(url, body);
            dispatch(setToken(res.data?.accessToken));
            navigate('/dashboard', { replace: true });

        } catch (error) {
            console.error(error);
            // Zod validation error
            if (error.response?.status === 400 && error.response.data.details) {
                const fieldErrors = error.response.data.details;
                const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

                Object.entries(fieldErrors).forEach(([field, messages]) => {
                    if (messages?.[0]) toast.error(`${capitalize(field)}: ${messages[0]}`);
                });

                // Other server errors
            } else if (error.response?.status === 400 && error.response.data?.error) {
                toast.error(error.response.data.error);
            } else if (error.response?.status === 409) {
                toast.error("Email already in use.");
            } else if (error.response?.status === 404) {
                toast.error("No user found with this email.");
            } else {
                toast.error("Something went wrong.");
            }
        }
    }

    // Send forgot password link
    async function sendForgotPasswordLink() {
        if (!data.email.trim()) {
            toast.error("Email is required.");
            return;
        }
        try {
            await interceptor.post('/api/user/send-password-reset-link', { email: data.email });
            setIsMailSent(true);
            setData({ name: '', email: '', password: '' });
            setInvalidEmailError(false);

        } catch (error) {
            console.log("Error sending password link:", error);
            if (error.response?.status === 404) {
                setInvalidEmailError(true);
                return;
            }
            toast.error("Error generating link");
        }
    }


    return (
        <>
            <main className={`w-screen h-dvh px-10 max-md:px-3 pt-10 overflow-hidden ${bgColor} flex gap-20 *:w-full *:h-full *:overflow-y-auto *:px-4`}>
                {/* Aside */}
                <article className="max-md:hidden">
                    <h1 className="font-bold tracking-wide text-3xl mb-4">Money management made easy.</h1>
                    <p className={`${grayText}`}>Your personal money assistant — track expenses, set budgets, and analyze spending like never before.</p>

                    <ul className={`mt-4 mb-5 *:leading-relaxed ${grayText} text-sm`}>
                        <li>‣ Stay in control of every rupee</li>
                        <li>‣ Visualize where your money goes</li>
                        <li>‣ Set saving goals and hit them</li>
                        <li>‣ Get weekly spending insights</li>
                    </ul>

                    <Bar data={chartData} options={options} />
                </article>

                {/* Form */}
                <article className="flex flex-col items-center">
                    <form className="flex flex-col items-start w-full">
                        <h1 className="text-2xl font-bold mb-6">{form === 'login' ? "Login" : "Sign up"}</h1>

                        {form === 'signup' && <label className={`font-semibold tracking-wide mt-3 ${grayText}`} htmlFor="name">Name</label>}
                        {form === 'signup' && <input type="text" id="name" className={`border ${borderColor} ${inputBg} mt-2 mb-3 w-full rounded-lg p-2`} value={data.name} name="name" onChange={e => setData(prev => ({ ...prev, [e.target.name]: e.target.value }))} />}

                        <label className={`font-semibold tracking-wide" htmlFor="email ${grayText}`}>Email</label>
                        <input type="email" id="email" className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} value={data.email} name="email" onChange={e => setData(prev => ({ ...prev, [e.target.name]: e.target.value }))} />

                        <label className={`font-semibold tracking-wide mt-3 ${grayText}`} htmlFor="password">Password</label>
                        <input type={showPassword ? "text" : "password"} id="password" className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} value={data.password} name="password" onChange={e => setData(prev => ({ ...prev, [e.target.name]: e.target.value }))} />

                        <div className="w-full flex items-center mt-1">
                            {form === 'login' && <span className="font-semibold text-sm text-red-600 cursor-pointer" onClick={() => { setShowModal(true); setData({ name: '', email: '', password: '' }); }}>Forgot password?</span>}

                            <div className="flex gap-1 items-center *:cursor-pointer ml-auto">
                                <input type="checkbox" className="w-3.5 aspect-square accent-black" id="show" onChange={e => setShowPassword(e.target.checked ? true : false)} />
                                <label htmlFor="show" className="text-sm font-semibold">Show password</label>
                            </div>
                        </div>

                        <button type="button" aria-label="Submit" onClick={handleSubmit} className={`bg-blue-500 text-white border-none not-focus:outline-none font-semibold cursor-pointer w-full rounded-lg py-2 mt-8`}>{form === "login" ? "Log in" : "Sign up"}</button>
                    </form>

                    {/* Switch form */}
                    <p className="w-full text-center mt-5 font-semibold">{form === 'login' ? "Don't have an account?" : "Already have an account."}</p>
                    <button className="cursor-pointer py-1 px-3 rounded-lg font-semibold text-blue-600 place-self-center" onClick={() => { setData({ name: '', email: '', password: '' }); setShowPassword(false); setForm(prev => prev === "login" ? "signup" : "login") }}>{form === "login" ? "Sign up" : "Login"}</button>
                </article>
            </main>




            {/* Forgot password modal */}
            <AnimatePresence>
                {
                    showModal && <motion.article
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center"
                        onClick={(e) => { e.stopPropagation(); setShowModal(false); setIsMailSent(false) }}
                    >
                        <motion.section
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`w-full max-w-xl min-h-65 ${modalStyle} relative p-4 rounded-xl *:flex *:flex-col *:items-center`} onClick={e => e.stopPropagation()}
                        >
                            <button type="button" aria-label="Close" onClick={() => { setShowModal(false); setIsMailSent(false) }} className={`${alertColor} text-2xl absolute top-0.5 right-1 p-1 cursor-pointer`}><IoClose /></button>

                            {
                                isMailSent ?
                                    <div>
                                        <h1 className="text-xl mb-1 font-semibold">Password Reset Link Sent</h1>
                                        <img src="/success.png" alt="" className="w-20 aspect-square rounded-full object-cover" />

                                        <div className='w-full *:w-full *:text-center *:leading-relaxed'>
                                            <p>An Password reset link has been sent to your email address.</p>
                                            <p>Please check your inbox (and spam folder, just in case) to proceed.</p>
                                            <p className='text-sm mt-2'>Do not share this email with anyone.</p>
                                            <p className='text-sm'>The link will remain valid for 15 minutes only.</p>
                                        </div>
                                    </div>
                                    :
                                    <form>
                                        <h1 className="text-xl mb-1 font-semibold">Forgot password?</h1>
                                        <label htmlFor="modalEmail" className="mb-5">Enter your email to get the reset link.</label>
                                        <input className={`border ${borderColor} w-full rounded-lg p-2`} type="email" id="modalEmail" placeholder="Email" value={data.email} name="email" onChange={(e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }))} />

                                        <button type="button" aria-label="Send link" onClick={sendForgotPasswordLink} className={`py-2 px-4 rounded-lg bg-blue-500 text-white border-none not-focus:outline-none font-semibold cursor-pointer mt-5`}>Send link</button>

                                        {
                                            invalidEmailError && <p className={`text-sm font-semibold ${alertColor} mt-2`}>No user exists with this email.</p>
                                        }
                                    </form>
                            }
                        </motion.section>
                    </motion.article>
                }
            </AnimatePresence>
        </>
    )
}
