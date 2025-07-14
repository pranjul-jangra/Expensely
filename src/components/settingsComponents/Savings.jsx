import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { savingMethods } from '../../utils/savingMethods';
import { toast } from 'react-toastify';
import { fetchUser } from '../../utils/commonFetchers';
import interceptor from '../../middleware/AxiosInstance';
import { setUser } from '../../reduxStates/userSlice';


export default function Savings({ isLightTheme }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [savings, setSavings] = useState(savingMethods);
  const user = useSelector((state) => state.user.user);

  // Fetch data if not present
  useEffect(() => {
    const savingsLen = Object.values(user?.savings?.[0]?.savings || {})?.flat()?.length;
    setSavings(savingsLen > 0 ? user?.savings?.[0]?.savings : savingMethods);

    if (!user?.name || !user?.email) {
      (async () => {
        try {
          await fetchUser();

        } catch (error) {
          console.error("Error gettinguser on savings page:", error);
          navigate("/signup", { replace: true });
        }
      })()
    }
  }, [user]);

  // Update value on input change
  function handleAmountChange(category, method, value) {
    setSavings(prev => ({
      ...prev,
      [category]: prev[category]?.map(item =>
        item.method === method ? { ...item, amount: value } : item
      )
    }));
  }

  // Submit savings
  async function handleSubmit() {
    try {
      await interceptor.post("/api/expense/upsert-savings", { savings });
      dispatch(setUser({ ...user, savings: [{ ...user?.savings?.[0], savings: savings }] }));
      toast.success("Savings updated.");

    } catch (error) {
      console.log("Error updating savings:", error);
      toast.error("Failed to update savings.");
    }
  }

  // Theme style
  const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
  const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
  const grayText = isLightTheme ? "text-gray-700" : "text-gray-400";
  const inputBg = isLightTheme ? "bg-gray-200/60" : "bg-zinc-800/70";
  const hoverShadow = isLightTheme ? "hover:shadow-gray-300" : "hover:shadow-gray-600";


  return (
    <main className={`min-h-dvh px-10 max-md:px-3 ${bgColor} pt-6 pb-12`}>
      <h1 className='text-2xl font-bold tracking-wide mb-6'>Savings</h1>

      {/* Inputs */}
      {
        Object.entries(savings)?.map(([category, values]) => (
          <section key={category} className={`px-4 py-6 border ${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150 rounded-3xl mb-6 w-full max-w-3xl`}>
            <h2 className='text-xl mb-4 tracking-wide font-semibold'>{category}</h2>

            <ul className='list-none'>
              {
                values?.length > 0 && values?.map(({ method, label, amount }) => (
                  <li key={method} className='flex flex-col items-start'>
                    <label htmlFor={method} className={` ${grayText} mt-4 mb-1 font-semibold text-sm tracking-wide flex gap-1 items-center`}>{label}</label>
                    <input type="Number" id={method} min={"0"} value={amount ?? ""} onChange={(e) => handleAmountChange(category, method, parseFloat(e.target.value) || 0)} className={`w-full px-2 py-2.5 h-full border rounded-lg ${borderColor} ${inputBg}`} />
                  </li>
                ))
              }
            </ul>
          </section>
        ))
      }

      {/* Submit button */}
      <button type='button' aria-label='Save' onClick={handleSubmit} className={`w-24 py-2 border ${borderColor} rounded-xl cursor-pointer bg-blue-500 text-white font-semibold tracking-wide`}>Save</button>
    </main>
  )
}
