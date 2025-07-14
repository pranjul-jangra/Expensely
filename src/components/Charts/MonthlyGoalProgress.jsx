import { useSelector } from "react-redux";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { IoWarningSharp } from "react-icons/io5";


export default function MonthlyGoalProgress({ isLightTheme }) {
  const { income = 0, expense = 0, goal = 0 } = useSelector((state) => state.user.user);

  const currentSaved = income - expense;
  const percentIncome = 100;
  const percentExpense = income > 0 ? (expense / income) * 100 : 0;
  const percentGoal = income > 0 ? (goal / income) * 100 : 0;

  // Conditions to show warnings
  const showGoalExceeded = expense > goal;
  const showExpenseOverIncome = expense > income;

  // Theme style
  const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";
  const bgColor = isLightTheme ? "bg-gray-200" : "bg-gray-700";


  return (
    <div className="w-full mb-4 text-sm sm:text-base font-medium">
      {/* Labels with legend */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-2 text-sm" data-tooltip-id="incomeTip">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
          Income: <span className="text-blue-500 font-semibold">₹{income.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm" data-tooltip-id="expenseTip">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          Expense: <span className="text-red-500 font-semibold">₹{expense.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm" data-tooltip-id="goalTip">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
          Goal: <span className="text-green-500 font-semibold">₹{goal.toLocaleString()}</span>
        </div>
      </div>

      {/* Multi-bar Progress */}
      <div className={`relative w-full ${bgColor} rounded-full h-3 overflow-hidden`}>
        {/* Income (background layer) */}
        <div className="absolute left-0 top-0 h-full bg-blue-300" style={{ width: `${percentIncome}%` }} />
        {/* Expense overlay */}
        <div className="absolute left-0 top-0 h-full bg-red-400" style={{ width: `${Math.min(percentExpense, 100)}%` }} />
        {/* Goal marker */}
        <div className="absolute top-0 bottom-0 w-1 bg-green-500" style={{ left: `${Math.min(percentGoal, 100)}%` }} />
      </div>


      {/* Text summary below */}
      <div className={`text-xs mt-2 mb-2 ${grayText}`}>
        You’ve saved <span className="text-blue-500 font-semibold">₹{currentSaved.toLocaleString()}</span> out of your income of ₹{income.toLocaleString()}.
        Your savings goal is ₹{goal.toLocaleString()}.
      </div>

      {/* Warnings */}
      {showGoalExceeded && <p className="text-xs mt-1 text-yellow-500 flex items-center gap-1 mb-1 tracking-wide font-semibold"><IoWarningSharp/> You’ve spent more than your savings goal.</p>}
      {showExpenseOverIncome && <p className="text-xs mt-1 text-orange-600 flex items-center gap-1 mb-1 tracking-wide font-semibold"><IoWarningSharp/> You’re spending more than your income.</p>}


      {/* Tooltips */}
      <Tooltip id="incomeTip" place="top" style={{ fontSize: "0.75rem" }}>
        Total income: ₹{income.toLocaleString()} <br />
        Remaining: ₹{(income - expense).toLocaleString()}
      </Tooltip>

      <Tooltip id="expenseTip" place="top" style={{ fontSize: "0.75rem" }}>
        You’ve spent ₹{expense.toLocaleString()} out of your income of ₹{income.toLocaleString()}
      </Tooltip>

      <Tooltip id="goalTip" place="top" style={{ fontSize: "0.75rem" }}>
        Monthly savings goal: ₹{goal.toLocaleString()} <br />
        {expense > goal ? "You've exceeded your goal" : "You're under your goal"}
      </Tooltip>
    </div>
  );
}
