import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import { accounts } from '../utils/transactionUtil';
import "./z.css"
import { toast } from "react-toastify";
import interceptor from "../middleware/AxiosInstance";


export default function Transaction({ isLightTheme }) {
    const user = useSelector(state => state.user.user);

    const [transactions, setTransactions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [chosedAccounts, setChoosedAccounts] = useState([]);
    const [page, setPage] = useState(1);
    const [filterQueryLength, setFilterQueryLength] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [totalPages, setTotalPages] = useState(1);

    // Update transactions
    useEffect(() => {
        setTransactions(user.transactions || []);
        setTotalPages(Math.max(0, Math.ceil(user?.totalTransaction / 12)));
    }, [user]);

    // Body lock
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
    }, [showModal]);

    // Format amount
    const formatAmount = (type, amount) => {
        const formatted = `₹${amount.toLocaleString()}`;
        return type === "income"
            ? <span className="text-green-600 font-semibold">+{formatted}</span>
            : <span className="text-red-500 font-semibold">-{formatted}</span>;
    };

    // Toggle account selection
    function toggleAccountSelection(acc) {
        if (chosedAccounts?.includes(acc)) {
            setChoosedAccounts(chosedAccounts.filter(item => item !== acc));
        } else {
            setChoosedAccounts(prev => ([...prev, acc]));
        }
    }

    // Handle transaction filter
    async function handleTransactionFilter() {
        if (chosedAccounts?.length === 0) return toast.error("Please select at least one account");

        setFilterQueryLength(chosedAccounts?.length);
        setShowModal(false);
        await fetchFilteredTransactions(1);
    }

    // Fetch filtered transactions
    const fetchFilteredTransactions = async (pageNumber = 1, forcedAccountReset = false) => {
        try {
            // Create query 
            const query = new URLSearchParams({
                page: pageNumber,
                search: searchQuery,
                filter: filterType,
            });
            if (!forcedAccountReset && chosedAccounts.length > 0) {
                query.append("accounts", chosedAccounts.join(","));
            }

            // Making request
            const res = await interceptor.get(`/api/user/filtered-tnx?${query.toString()}`);
            setTransactions(res.data.transactions || []);
            setPage(pageNumber);
            setTotalPages(res.data.pages || 1);

        } catch (error) {
            console.error("Error fetching filtered transactions:", error);
            toast.error("Failed to fetch transactions.");
        }
    };

    // Theme styles
    const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
    const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";
    const textColor = isLightTheme ? "text-black" : "text-white/90";
    const bgHover = isLightTheme ? "hover:bg-gray-100" : "hover:bg-zinc-800";
    const activeBtnBg = isLightTheme ? "bg-gray-100" : "bg-zinc-800";
    const hoverShadow = isLightTheme ? "hover:shadow-gray-300" : "hover:shadow-gray-600";
    const headingColor = isLightTheme ? "text-black" : "text-white";
    const modalStyle = isLightTheme ? "bg-gray-50" : "bg-neutral-900 shadow-sm shadow-zinc-800 text-white";

    const selectedAccountBorder = (acc) => {
        if (chosedAccounts?.includes(acc)) {
            return isLightTheme ? "border-black" : "border-white";
        } else {
            return isLightTheme ? "border-gray-300" : "border-white/8";
        }
    }


    return (
        <>
            <section className="pb-6">
                <div className='w-full flex justify-between items-center flex-wrap gap-2'>
                    <h2 className={`text-3xl font-bold mb-8 mt-4 ${headingColor}`}>Transactions</h2>
                    <div className='*:pb-2 *:pt-1.5 *:px-2 *:rounded-lg *:border space-x-2 *:cursor-pointer flex'>
                        <button type='button' aria-label='All' className={`${borderColor} ${bgHover} ${filterType === "all" && activeBtnBg} transition-colors duration-150`} onClick={() => { setFilterType("all"); fetchFilteredTransactions(1); }}>All</button>
                        <button type='button' aria-label='This month' className={`${borderColor} ${bgHover} ${filterType === "month" && activeBtnBg} transition-colors duration-150`} onClick={() => { setFilterType("month"); fetchFilteredTransactions(1); }}>This Month</button>
                        <button type='button' aria-label='Account' onClick={() => setShowModal(true)} className={`${borderColor} ${bgHover} transition-colors duration-150`}>{filterQueryLength !== 0 ? `Account (${filterQueryLength})` : "Account"}</button>
                    </div>
                </div>

                <div className='w-full flex items-center *:h-full mt-5 h-11'>
                    <button type="button" aria-label="Search" onClick={() => fetchFilteredTransactions(1)} className={`text-gray-500 border-y border-l ${borderColor} rounded-l-lg h-full aspect-square flex justify-center items-center cursor-pointer`}><FaSearch /></button>
                    <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchFilteredTransactions(1)} className={`border-y border-r ${borderColor} rounded-r-lg w-full pl-1 pr-2 focus:-outline-offset-2`} placeholder='Search...' />
                </div>

                {/* Desktop Table */}
                <div className="overflow-x-auto mt-5 hidden md:block">
                    <table className={`w-full table-auto border-collapse ${borderColor}`}>
                        <thead>
                            <tr className={`${grayText} text-left text-sm font-semibold `}>
                                <th className="p-2">Type</th>
                                <th className="p-2">Category</th>
                                <th className="p-2">Account</th>
                                <th className="p-2">Amount</th>
                                <th className="p-2">Date</th>
                                <th className="p-2">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {transactions?.length > 0 ? (
                                transactions?.map((txn, i) => (
                                    <tr key={i} className={`${textColor} ${bgHover} border-t ${borderColor} transition`}>
                                        <td className="p-2 capitalize">{txn.type || "-"}</td>
                                        <td className="p-2">{txn.category}</td>
                                        <td className="p-2">{txn.account}</td>
                                        <td className="p-2">{formatAmount(txn.type, txn.amount)}</td>
                                        <td className="p-2">{new Date(txn.date).toLocaleDateString()}</td>
                                        <td className="p-2">
                                            {txn.receiptUrl
                                                ? <a href={txn.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">View</a>
                                                : <span className="text-xs text-gray-400">—</span>
                                            }
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-sm text-gray-400">No transactions yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Card style) */}
                <div className="mt-5 flex flex-col gap-4 md:hidden">
                    {transactions?.length > 0 ? (
                        transactions?.map((txn, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${borderColor} ${bgHover} hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                                <div className="flex justify-between">
                                    <p className="capitalize font-medium">{txn.type}</p>
                                    <p>{formatAmount(txn.type, txn.amount)}</p>
                                </div>
                                <p className="text-sm mt-1"><span className="font-semibold">Category:</span> {txn.category}</p>
                                <p className="text-sm"><span className="font-semibold">Account:</span> {txn.account}</p>
                                <p className="text-sm"><span className="font-semibold">Date:</span> {new Date(txn.date).toLocaleDateString()}</p>
                                {txn.receiptUrl ? (
                                    <a href={txn.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm mt-1 inline-block">View Receipt</a>
                                ) : (
                                    <p className="text-sm text-gray-400">No receipt</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-gray-400">No transactions found.</p>
                    )}
                </div>

                {/* Pagination buttons */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                        <button disabled={page === 1} onClick={() => fetchFilteredTransactions(page - 1)} className={`${borderColor} ${bgHover} px-3 py-1 rounded-lg text-sm disabled:opacity-50`}>Prev</button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                            .map(p => (
                                <button key={p} onClick={() => fetchFilteredTransactions(p)} className={`px-3 py-1 rounded-lg text-sm ${borderColor} ${p === page ? "bg-blue-500 text-white" : bgHover}`}>
                                    {p}
                                </button>
                            ))
                        }

                        {(page < totalPages - 1) && <span className="px-2 text-gray-400">...</span>}

                        <button disabled={page === totalPages} onClick={() => fetchFilteredTransactions(page + 1)} className={`${borderColor} ${bgHover} px-3 py-1 rounded-lg text-sm disabled:opacity-50`}>Next</button>
                    </div>
                )}
            </section>


            <AnimatePresence>
                {
                    showModal && <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 px-3 z-50 bg-black/40 flex justify-center items-center"
                        onClick={(e) => { setShowModal(false) }}
                    >
                        <motion.section
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`w-full max-w-3xl min-h-65 max-h-[90%] ${modalStyle} relative p-4 rounded-4xl flex flex-col`} onClick={e => e.stopPropagation()}
                        >
                            <h1 className={`text-xl w-full text-center font-bold mb-8 ${headingColor}`}>Choose Your Filter Account</h1>
                            <ul data-lenis-prevent className="w-full h-full overflow-y-auto tnx-grid *:px-2 *:py-2 *:rounded-lg *:border">
                                {
                                    accounts?.map((a, i) => (
                                        <li className={`${selectedAccountBorder(a)} cursor-default`} onClick={() => toggleAccountSelection(a)} key={`account-${i}`}>{a}</li>
                                    ))
                                }
                            </ul>

                            <div className="w-full mt-4 grid grid-cols-2 gap-2 *:rounded-md *:py-2 *:border">
                                <button type="button" aria-label="Reset" onClick={() => { fetchFilteredTransactions(1, true); setChoosedAccounts([]); setFilterQueryLength(0); setShowModal(false); }} className={`${borderColor} ${bgHover} cursor-pointer`}>Reset</button>
                                <button type="button" aria-label="Filter" onClick={handleTransactionFilter} className={`${borderColor} ${bgHover} cursor-pointer`}>Filter</button>
                            </div>
                        </motion.section>
                    </motion.section>
                }
            </AnimatePresence>
        </>
    );
}
