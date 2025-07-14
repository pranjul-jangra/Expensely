import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams } from "react-router"
import { AnimatePresence, motion } from "motion/react"
import { incomeCategories, expenseCategories, accounts } from "../utils/transactionUtil.js"
import interceptor from "../middleware/AxiosInstance.jsx"
import { toast } from "react-toastify"
import { refreshAllSummaryData } from "../utils/commonFetchers.js"
import { setTransactionToEdit } from "../reduxStates/userSlice.js"
import { BiMinus } from "react-icons/bi"


export default function UpsertTransaction({ isLightTheme }) {
    const dispatch = useDispatch();
    const transactionToEdit = useSelector(state => state.user.transactionToEdit);
    const { id } = useParams();

    const [transactionData, setTransactionData] = useState({
        type: "income",
        category: "",
        account: "",
        amount: 0,
        date: null,
        description: "",
        receipt: ""
    })
    const [showCustomInputModal, setShowCustomInputModal] = useState({ category: false, account: false })
    const [showSyncExpenseModal, setShowSyncExpenseModal] = useState(false)
    const [syncExpense, setSyncExpense] = useState(false)
    const [customInput, setCustomInput] = useState("")
    const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null)
    const [removeReceipt, setRemoveReceipt] = useState(false);

    const categories = transactionData.type === "income" ? incomeCategories : expenseCategories
    const [customCategories, setCustomCategories] = useState([])
    const [customAccounts, setCustomAccounts] = useState([])

    // Body lock
    useEffect(() => {
        document.body.style.overflow = (showCustomInputModal.account || showCustomInputModal.category || showSyncExpenseModal) ? 'hidden' : 'auto'
    }, [showCustomInputModal, showSyncExpenseModal]);

    // Cleanup url object
    useEffect(() => {
        return () => receiptPreviewUrl && URL.revokeObjectURL(receiptPreviewUrl)
    }, [receiptPreviewUrl]);

    // Date formating function
    function formatDateForInput(date) {
        if (!date) return "";

        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            dateObj = new Date(date);
        } else {
            return "";
        }

        if (isNaN(dateObj.getTime())) return "";

        // Format as YYYY-MM-DD
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Set transaction data when editing 
    useEffect(() => {
        if (transactionToEdit && Object.keys(transactionToEdit)?.length !== 0) {
            setTransactionData(transactionToEdit);
            setSyncExpense(transactionToEdit?.syncExpense || false);

            if (transactionToEdit.receipt) {
                setReceiptPreviewUrl(transactionToEdit.receipt);
            }
        }
    }, [transactionToEdit]);

    // Clear transactionToEdit when component unmounts
    useEffect(() => {
        return () => {
            dispatch(setTransactionToEdit({}));
        };
    }, [dispatch]);

    // onChange handler
    function handleChange(e) {
        const { name, value } = e.target
        if (value === "add") {
            setShowCustomInputModal(prev => ({ ...prev, [name]: true }))
            return
        }
        setTransactionData(prev => ({ ...prev, [name]: value }))

        if (name === "type" && value === "expense") {
            setShowSyncExpenseModal(true)
        }
    }

    // File input handler
    function handleFileChange(e) {
        const file = e.target.files[0]
        if (file) {
            if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl)
            const newPreviewUrl = URL.createObjectURL(file)
            setReceiptPreviewUrl(newPreviewUrl)
            setTransactionData(prev => ({ ...prev, receipt: file }))
            setRemoveReceipt(false);
        }
    }

    // Add this function to handle receipt removal
    function handleRemoveReceipt() {
        if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
        setReceiptPreviewUrl(null);
        setTransactionData(prev => ({ ...prev, receipt: "" }));
        setRemoveReceipt(true);

        // Clear the file input
        const fileInput = document.getElementById('receipt');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    const capitalizeWords = str => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')

    // Add user defined values
    function handleAddInput() {
        const capitalizedInput = capitalizeWords(customInput.trim())
        if (!capitalizedInput) return
        if (showCustomInputModal.category) {
            setCustomCategories(prev => [...prev, capitalizedInput])
            setTransactionData(prev => ({ ...prev, category: capitalizedInput }))
        } else {
            setCustomAccounts(prev => [...prev, capitalizedInput])
            setTransactionData(prev => ({ ...prev, account: capitalizedInput }))
        }
        setCustomInput("")
        setShowCustomInputModal({ category: false, account: false })
    }

    // Sync expense with income
    function handleSyncExpenseResponse(shouldSync) {
        setSyncExpense(shouldSync)
        setShowSyncExpenseModal(false)
    }

    // Submit handler
    async function handleSubmit() {
        const { category, account, amount } = transactionData
        if (!category || !account) return toast.error("Category and Account are required.")
        if (!amount || amount === 0) return toast.error("Enter the amount of transaction.")

        try {
            const formData = new FormData()
            for (const key in transactionData) {
                if (key === "receipt" && transactionData.receipt && transactionData.receipt !== transactionToEdit.receipt) {
                    formData.append("receipt", transactionData.receipt)
                } else if (key === "date") {
                    formData.append("date", transactionData.date || new Date());
                } else {
                    formData.append(key, transactionData[key])
                }
            }

            if (transactionData.type === "expense") formData.append("syncExpense", syncExpense)
            if(id) formData.append("transactionId", id);
            if(removeReceipt) formData.append("removeReceipt", removeReceipt);

            // Making request
            await interceptor.post('/api/expense/upsert-transaction', formData)
            if(id){
                toast.success("Transaction updated!")
            }else{
                toast.success("Transaction added!");
            }
            setTransactionData({ type: "income", category: "", account: "", amount: 0, date: null, description: "", receipt: "" });
            dispatch(setTransactionToEdit({}));
            setReceiptPreviewUrl(null);
            setSyncExpense(false);
            setRemoveReceipt(false);

            // Refresh all fresh data after adding transaction
            try {
                await refreshAllSummaryData(new Date().getFullYear());
            } catch (error) {
                console.log("Error refreshing data's:", error);
            }

        } catch (error) {
            console.error("Error submitting transaction:", error);
            toast.error("Failed to add transaction.");
        }
    }

    const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85"
    const borderColor = isLightTheme ? "border-gray-300" : "border-white/8"
    const inputBg = isLightTheme ? "bg-gray-200/60" : "bg-zinc-800/70"
    const optionsBg = isLightTheme ? "bg-gray-200/60" : "bg-black/60"
    const grayText = isLightTheme ? "text-gray-800" : "text-gray-300"

    return (
        <main className={`w-screen min-h-dvh px-10 relative max-2xl:px-7 max-xl:px-5 max-lg:px-3 pt-10 ${bgColor} flex gap-7 max-xl:gap-4 max-lg:gap-2 *:w-full *:overflow-y-auto *:px-4 *:max-lg:px-2 flex-col md:flex-row`}>

            {/* Add transaction */}
            <form className="flex flex-col items-start w-full pb-16">
                <h1 className="font-bold tracking-wide text-3xl mb-4">Add Transaction</h1>

                {/* Type */}
                <p className={`font-semibold tracking-wide mt-3 ${grayText}`}>Type</p>
                <small className={`${grayText} mt-0.5`}>Select whether this transaction is an income or an expense.</small>
                <div className="flex justify-start items-center gap-12 mt-3 *:flex *:items-center *:gap-2">
                    <div className="*:cursor-pointer">
                        <input type="radio" name="type" id="income" value="income" checked={transactionData.type === "income"} onChange={handleChange} />
                        <label htmlFor="income">Income</label>
                    </div>
                    <div className="*:cursor-pointer">
                        <input type="radio" name="type" id="expense" value="expense" checked={transactionData.type === "expense"} onChange={handleChange} />
                        <label htmlFor="expense">Expense</label>
                    </div>
                </div>

                {/* Amount */}
                <label htmlFor="amount" className={`font-semibold tracking-wide mt-3 ${grayText}`}>Amount*</label>
                <small className={`${grayText} mt-0.5`}>Specify the amount of this transaction.</small>
                <input type="number" name="amount" id="amount" value={transactionData.amount} onChange={handleChange} className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} />

                {/* Category */}
                <label htmlFor="category" className={`font-semibold tracking-wide mt-3 ${grayText}`}>Category*</label>

                <small className={`${grayText} mt-0.5`}>
                    {transactionData.type === "income" ? "Select the source of this income (e.g., Salary, Freelance, Refund)." : "Select the purpose of this expense (e.g., Food, Bills, Transport)."}
                </small>

                <select name="category" id="category" value={transactionData.category} onChange={handleChange} className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg px-2 py-2.5`}>
                    <option className={`${optionsBg}`} value="" disabled></option>
                    <option value="add" className={`text-green-500 font-semibold ${optionsBg}`}>Add your own</option>
                    {[...categories, ...customCategories].sort().map((cat, i) => (
                        <option key={`category-${i}`} value={cat} className={`${optionsBg}`}>{cat}</option>
                    ))}
                </select>

                {/* Account */}
                <label htmlFor="account" className={`font-semibold tracking-wide mt-3 ${grayText}`}>Account*</label>

                <small className={`${grayText} mt-0.5`}>
                    {transactionData.type === "income" ? "Choose where you received this income (e.g., Bank, Wallet, Cash)." : "Choose the payment method used (e.g., Credit Card, UPI, Cash)."}
                </small>

                <select name="account" id="account" value={transactionData.account} onChange={handleChange} className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg px-2 py-2.5`}>
                    <option className={`${optionsBg}`} value="" disabled></option>
                    <option value="add" className={`text-green-500 font-semibold ${optionsBg}`}>Add your own</option>
                    {[...accounts, ...customAccounts].sort().map((acc, i) => (
                        <option key={`account-${i}`} value={acc} className={`${optionsBg}`}>{acc}</option>
                    ))}
                </select>

                {/* Date */}
                <label htmlFor="date" className={`font-semibold tracking-wide mt-3 ${grayText}`}>Date</label>
                <small className={`${grayText} mt-0.5`}>Select the date of the transaction. (default to today)</small>
                <input type="date" name="date" id="date" value={formatDateForInput(transactionData.date)} onChange={handleChange} className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} />

                {/* Description */}
                <label htmlFor="description" className={`font-semibold tracking-wide mt-3 ${grayText}`}>Description</label>
                <small className={`${grayText} mt-0.5`}>Write a note about this transaction (optional).</small>
                <textarea name="description" id="description" onChange={handleChange} value={transactionData.description} className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2 h-24 shrink-0`}></textarea>

                {/* Receipt */}
                <label htmlFor="receipt" className={`font-semibold tracking-wide mt-3 ${grayText}`}>Attach Receipt</label>
                <small className={`${grayText} mt-0.5`}>Upload an image file for your receipt (optional).</small>
                <input type="file" name="receipt" accept="image/*" id="receipt" onChange={handleFileChange} className={`border ${borderColor} ${inputBg} mt-2 w-full rounded-lg p-2`} />

                {/* Show sync expense status if expense type is selected */}
                {transactionData.type === "expense" && (
                    <div className={`mt-4 p-3 rounded-lg ${isLightTheme ? "bg-blue-50 border border-blue-200" : "bg-blue-900/20 border border-blue-800"}`}>
                        <p className={`text-sm font-medium ${isLightTheme ? "text-blue-800" : "text-blue-300"}`}>
                            Monthly Expense Sync: {syncExpense ? "Enabled" : "Disabled"}
                        </p>
                        <p className={`text-xs mt-1 ${isLightTheme ? "text-blue-600" : "text-blue-400"}`}>
                            {syncExpense ? "This expense will be deducted from your monthly salary." : "This expense will not affect your monthly salary."}
                        </p>
                        <button type="button" onClick={() => setShowSyncExpenseModal(true)} className={`text-xs mt-2 px-2 py-1 rounded ${isLightTheme ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-blue-800 text-blue-200 hover:bg-blue-700"} transition-colors`}>
                            Change Setting
                        </button>
                    </div>
                )}

                <button type="button" aria-label="Add" className={`bg-blue-500 text-white border-none not-focus:outline-none font-semibold cursor-pointer w-full rounded-lg py-2 mt-8`} onClick={handleSubmit}>Add</button>
            </form>

            {/* Receipt preview */}
            <article className="pb-10 sticky top-5 h-[96dvh]">
                <div className="border-3 border-dashed border-blue-400 relative w-full h-full flex justify-center items-center p-2">
                    {
                        receiptPreviewUrl
                            ?
                            <>
                                <img src={receiptPreviewUrl} alt="" className="w-full h-full object-contain" />
                                <button
                                    type="button"
                                    onClick={handleRemoveReceipt}
                                    className="absolute top-3 right-3 text-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1 transition-colors shadow-lg z-10 cursor-pointer px-2 py-1.5 rounded-lg"
                                    aria-label="Remove receipt"
                                >
                                    <BiMinus/> Remove receipt
                                </button>
                            </>
                            :
                            <p className="text-gray-400 font-semibold tracking-wide text-center">
                                Receipt preview<br />
                                <span className="text-sm">Upload an image to see preview</span>
                            </p>
                    }
                </div>
            </article>

            {/* Custom category input */}
            <AnimatePresence>
                {(showCustomInputModal.category || showCustomInputModal.account) && (
                    <motion.article initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center"
                        onClick={() => setShowCustomInputModal({ category: false, account: false })}
                    >
                        <motion.section initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`w-full max-w-xl ${isLightTheme ? "bg-gray-50" : "bg-neutral-900 shadow-sm shadow-zinc-800 text-white"} relative px-6 py-8 rounded-xl flex flex-col items-center`}
                            onClick={e => e.stopPropagation()}
                        >
                            <h1 className="text-xl font-semibold">Add Your {showCustomInputModal.category ? "Category" : "Account"}</h1>
                            {
                                showCustomInputModal.category
                                    ?
                                    <p className="mb-4">Select a reason or destination for the transaction.</p>
                                    :
                                    <p className="mb-4">Choose the payment method or destination involved.</p>
                            }
                            <input placeholder={showCustomInputModal.category ? "Category" : "Account"} className={`border ${borderColor} w-full rounded-lg p-2`} type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} />

                            <div className="flex gap-4 w-full mt-6">
                                <button type="button" aria-label="Add" onClick={handleAddInput} className="flex-1 py-2 px-4 rounded-lg bg-green-500 text-white border-none font-semibold cursor-pointer hover:bg-green-600 transition-colors">
                                    Add
                                </button>
                                <button type="button" aria-label="Cancel" onClick={() => setShowCustomInputModal({ category: false, account: false })} className={`flex-1 py-2 px-4 rounded-lg border-2 font-semibold cursor-pointer transition-colors ${isLightTheme ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-gray-600 text-gray-300 hover:bg-gray-800"}`}>
                                    Cancel
                                </button>
                            </div>
                        </motion.section>
                    </motion.article>
                )}
            </AnimatePresence>

            {/* Sync Expense Modal */}
            <AnimatePresence>
                {showSyncExpenseModal && (
                    <motion.article initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center"
                        onClick={() => setShowSyncExpenseModal(false)}
                    >
                        <motion.section initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`w-full max-w-lg ${isLightTheme ? "bg-gray-50" : "bg-neutral-900 shadow-sm shadow-zinc-800 text-white"} relative px-6 py-8 rounded-xl flex flex-col items-center`}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <h1 className="text-xl font-semibold mb-3">Monthly Expense Sync</h1>
                                <p className={`text-sm ${grayText} leading-relaxed`}>
                                    Do you want to reduce this expense amount from your monthly salary and add it to your monthly expenses?
                                </p>
                            </div>

                            <div className="flex gap-4 w-full mt-6">
                                <button type="button" aria-label="Sync" onClick={() => handleSyncExpenseResponse(true)} className="flex-1 py-2 px-4 rounded-lg bg-green-500 text-white border-none font-semibold cursor-pointer hover:bg-green-600 transition-colors">
                                    Yes, Sync
                                </button>
                                <button type="button" aria-label="Skip" onClick={() => handleSyncExpenseResponse(false)} className={`flex-1 py-2 px-4 rounded-lg border-2 font-semibold cursor-pointer transition-colors ${isLightTheme ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-gray-600 text-gray-300 hover:bg-gray-800"}`}>
                                    No, Skip
                                </button>
                            </div>
                        </motion.section>
                    </motion.article>
                )}
            </AnimatePresence>
        </main>
    )
}