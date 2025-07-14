import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaIndianRupeeSign } from "react-icons/fa6";
import MonthlySummary from "./Charts/MonthlySummary";
import CategoryDonutChart from "./Charts/CategoryDonutChart";
import MonthlyGoalProgress from "./Charts/MonthlyGoalProgress";
import RecentTnx from "./RecentTnx";
import { SavingsTrendLine } from "./Charts/SavingTrendLine";


export default function MainBody({ isLightTheme }) {
    const user = useSelector((state) => state.user.user);

    const [cycleInfo, setCycleInfo] = useState({
        startDate: null,
        endDate: null,
        daysRemaining: 0,
        timeRemaining: ''
    });

    // Update budget cycle
    useEffect(() => {
        const updateCycleInfo = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();

            const start = new Date(year, month, 1);    // create a date of first day of the month - (year, month, date)
            const end = new Date(year, month + 1, 0, 23, 59, 59);
            const diffTime = end - now;
            const daysRemaining = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const hoursRemaining = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutesRemaining = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

            setCycleInfo({
                startDate: start.toDateString(),
                endDate: end.toDateString(),
                daysRemaining,
                timeRemaining: `${hoursRemaining}h ${minutesRemaining}m`
            });
        };

        updateCycleInfo();
        const intervalId = setInterval(updateCycleInfo, 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Theme style
    const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
    const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";
    const hoverShadow = isLightTheme ? "hover:shadow-gray-300" : "hover:shadow-gray-600";


    return (
        <section className="mb-6">
            <article className='w-full sm:min-w-[500px] grid body-header-grid gap-6 max-md:gap-2 mb-6 max-md:mb-2 *:border *:px-3 *:py-4 *:rounded-xl'>
                <div className={`${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                    <p className={`${grayText}`}>Total Income</p>
                    <p className="flex gap-1 items-center text-xl text-green-600 font-bold"><FaIndianRupeeSign /> {user?.income?.toLocaleString() || "Not specified"}</p>
                </div>
                <div className={`${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                    <p className={`${grayText}`}>Total Expense</p>
                    <p className="flex gap-1 items-center text-xl text-red-500 font-bold"><FaIndianRupeeSign />{user?.expense?.toLocaleString() || 0}</p>
                </div>
                <div className={`${borderColor} hover:shadow ${hoverShadow} max-sm:col-span-2 transition-shadow duration-150`}>
                    <p className={`${grayText}`}>Balance</p>
                    <p className="flex gap-1 items-center text-xl text-yellow-500 font-bold"><FaIndianRupeeSign />{user?.income ? (user?.income - user?.expense).toLocaleString() : 0}</p>
                </div>
            </article>

            <article className='w-full grid gap-6 max-md:gap-2 three-column-grid'>
                {/* Left side */}
                <div className="col-span-2">
                    <div className={`w-full h-fit border ${borderColor} rounded-xl px-6 pt-6 pb-2 mb-6 max-md:mb-2 hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                        <h2 className="font-semibold mb-2">Monthly Summary</h2>
                        <MonthlySummary isLightTheme={isLightTheme} />
                    </div>

                    <div className="w-full flex max-md:flex-col gap-6 max-md:gap-2 *:w-full items-stretch">
                        <div className={`w-full border ${borderColor} rounded-xl px-6 py-6 hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                            <h2 className="font-semibold">Top Expenses</h2>
                            <CategoryDonutChart isLightTheme={isLightTheme} />
                        </div>
                        <div className={`w-full overflow-x-hidden border ${borderColor} rounded-xl px-6 py-6 hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                            <h2 className="font-semibold mb-4">Monthly Goal</h2>
                            <MonthlyGoalProgress isLightTheme={isLightTheme} />
                            <SavingsTrendLine />
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col max-lg:flex-row max-sm:flex-col max-lg:col-span-2 gap-6 max-md:gap-2">
                    <div className={`border ${borderColor} rounded-xl px-4 py-4 max-lg:w-full hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                        <h2 className="font-semibold mb-2">Budget Cycle</h2>
                        <ul className={`text-sm space-y-1 ${grayText}`}>
                            <li><span className="font-semibold">Starts:</span> {cycleInfo.startDate}</li>
                            <li><span className="font-semibold">Ends:</span> {cycleInfo.endDate}</li>
                            <li><span className="font-semibold">Remaining:</span> {cycleInfo.daysRemaining} days, {cycleInfo.timeRemaining}</li>
                        </ul>
                    </div>

                    <div className={`w-full min-h-72 border ${borderColor} px-4 py-4 rounded-xl hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                        <RecentTnx isLightTheme={isLightTheme} />
                    </div>
                </div>
            </article>
        </section>
    );
}
