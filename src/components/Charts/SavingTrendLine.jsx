import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale } from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);


function generateDeterministicTrend(income, expense, goal) {
  const base = income - expense;
  const seed = `${income}-${expense}-${goal}`;
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const trend = Array(8).fill(0).map((_, i) => {
    const offset = ((hash + i * 17) % 21 - 10) / 100;
    return Math.round(base / 7 + base / 7 * offset);
  });

  return trend;
}

export function SavingsTrendLine() {
  const { income = 0, expense = 0, goal = 0 } = useSelector((state) => state.user.user);

  const trendData = generateDeterministicTrend(income, expense, goal);

  const data = {
    labels: Array(8).fill(""),
    datasets: [
      {
        data: trendData,
        borderColor: "#3b82f6",
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      line: { borderJoinStyle: "round" },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return <Line data={data} options={options} height={50} />;
}
