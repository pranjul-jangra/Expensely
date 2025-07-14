import { useSelector } from 'react-redux';
import { getIcon } from '../utils/getIcons'
import { useNavigate } from 'react-router';
import { HiOutlinePlusCircle } from "react-icons/hi2";
import './z.css'


export default function RenderSavings({ isLightTheme = false }) {
  const user = useSelector(state => state.user.user);
  const navigate = useNavigate();

  // Theme styles
  const borderColor = isLightTheme ? "border-gray-300" : "border-white/10";
  const textColor = isLightTheme ? "text-black" : "text-white/90";
  const headingColor = isLightTheme ? "text-black" : "text-white";
  const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";
  const hoverShadow = isLightTheme ? "hover:shadow-gray-300" : "hover:shadow-gray-600";

  // Flatten savings into a list of cards
  const savingsList = Object.entries(user?.savings?.[0]?.savings || {})
    .flatMap(([category, entries]) =>
      entries
        .filter(e => typeof e.amount === "number" && e.amount > 0)
        .map(entry => ({
          ...entry,
          category,
        }))
    );

  return (
    <section className={`pb-8 ${textColor}`}>
      <h2 className={`text-3xl font-bold mb-8 mt-4 ${headingColor}`}>Savings</h2>

      {/* <div className="flex flex-wrap gap-4"> */}
      <div className="savings-overview-grid gap-4">
        {savingsList.map(({ category, method, label, amount }) => (
          <div key={`${category}-${method}`} className={`w-full border rounded-xl px-4 py-3 ${borderColor} flex flex-col justify-between hover:shadow ${hoverShadow} transition-shadow duration-150`}>
            <p className="text-xs font-semibold text-blue-400 tracking-wide mb-1">{category}</p>
            <div className="flex items-start gap-3 mb-2">
              <div className="text-xl text-blue-400">{getIcon(method)}</div>
              <div className="flex-1 text-sm font-medium leading-snug">{label}</div>
            </div>
            <span className="text-green-500 font-semibold text-sm">₹{amount.toLocaleString()}</span>
          </div>
        ))}
        {
          savingsList?.length === 0 && <div className={`${grayText} w-full flex justify-center items-center`}>
            <div onClick={() => navigate("/settings/savings")} className={`flex flex-col items-center justify-center text-center py-6 px-9 border border-dashed border-blue-300 rounded-xl shadow-sm transition hover:shadow-md hover:border-blue-400 max-w-sm mx-auto group`}>
              <p className="text-gray-400 mb-2 text-sm">No savings to display</p>
              <HiOutlinePlusCircle className="w-12 h-12 text-blue-400 group-hover:text-blue-500 transition-colors mb-2" />
              <p className="text-blue-300 font-medium text-sm group-hover:underline">
                Want to add savings?
              </p>
            </div>
          </div>
        }
      </div>
    </section>
  );
}
