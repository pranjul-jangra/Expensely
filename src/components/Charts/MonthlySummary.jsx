import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Colors } from "chart.js";
import { getExpensesPerMonth } from "../../utils/commonFetchers";

ChartJS.register(BarElement, CategoryScale, LinearScale, Colors);

export default function MonthlySummary({ isLightTheme }) {
    const expensesPerMonth = useSelector((state) => state.user.expensesPerMonth);

    useEffect(() => {
        const fetchData = async () => {
            if (!expensesPerMonth || expensesPerMonth.length !== 12) {
                try {
                    await getExpensesPerMonth(new Date().getFullYear());
                } catch (error) {
                    console.log("Error getting expenses per month:", error);
                }
            }
        };

        fetchData();
    }, [expensesPerMonth]);

    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Expenses",
                data: expensesPerMonth && expensesPerMonth.length === 12
                    ? expensesPerMonth
                    : new Array(12).fill(0),
                backgroundColor: "#3b82f6",
                borderRadius: 6,
                barPercentage: 0.6,
            },
        ],
    };

    const labelColor = isLightTheme ? "#a3a3a3" : "#99a1af";
    const gridColor = isLightTheme ? "#e5e7eb" : "#374151";

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: labelColor },
            },
            tooltip: {
                titleColor: labelColor,
                bodyColor: labelColor,
            },
        },
        scales: {
            x: {
                ticks: { color: labelColor },
                grid: { color: gridColor },
            },
            y: {
                beginAtZero: true,
                ticks: { color: labelColor },
                grid: { color: gridColor },
            },
        },
    };

    return (
        <div className="w-full h-56">
            <Bar data={data} options={options} />
        </div>
    );
}
