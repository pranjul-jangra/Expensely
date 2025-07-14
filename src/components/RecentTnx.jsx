import { useSelector } from "react-redux"


export default function RecentTnx({ isLightTheme }) {
  const user = useSelector(state => state.user.user);
  const recentTnx = user?.transactions?.slice(0, 4);

  // Theme style
  const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
  const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";
  const hoverEffect = isLightTheme ? "hover:bg-gray-100" : "hover:bg-zinc-800";


  return (
    <section>
      <h2 className="font-semibold mb-3">Recent Transactions</h2>
      {
        recentTnx?.length !== 0
          ?
          recentTnx?.map((tnx, i) => (
            <div key={`recent-tnx-${i}`} className={`border px-2 py-2 rounded-xl mb-3 ${borderColor} ${hoverEffect} transition-all duration-300`}>
              <p><span className="capitalize">{tnx.type}</span>: <span className={tnx.type === "income" ? "text-green-600" : "text-red-500"}>{tnx.type === "income" ? "+" : "-"}₹{tnx.amount.toLocaleString()}</span></p>
              <p className={`text-[13px] ${grayText}`}>{new Date(tnx.date).toLocaleDateString()}</p>
              <p className={`text-[13px] ${grayText}`}>Mode of transaction: {tnx.account}</p>
            </div>
          ))
          :
          <div className={`flex justify-center items-center ${grayText}`}>No recent transactions</div>
      }
    </section>
  )
}
