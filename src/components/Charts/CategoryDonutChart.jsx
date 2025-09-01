import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { getDonutData } from "../../utils/commonFetchers";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryDonutChart({ isLightTheme }) {
    const donutData = useSelector(state => state.user.donutData);

    useEffect(() => {
        const fetchData = async () => {
            if (donutData === null) {
                try {
                    await getDonutData();
                } catch (error) {
                    console.log("Error getting donut data:", error);
                }
            }
        };

        fetchData();
    }, [donutData]);


    const hasData = donutData?.length > 0;

    const data = {
        labels: donutData?.map(c => c.category),
        datasets: [
            {
                data: donutData?.map(c => c.amount),
                backgroundColor: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#bfd4fe"],
                cutout: "50%",
            },
        ],
    };

    const labelColor = isLightTheme ? "#a3a3a3" : "#99a1af";

    const options = {
        responsive: true,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'right',
                align: 'center',
                labels: {
                    color: labelColor,
                    usePointStyle: true,
                    boxWidth: 10,
                    boxHeight: 10,
                    padding: 20,
                    textAlign: 'left',
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                titleColor: labelColor,
                bodyColor: labelColor,
            }
        },
    };

    return (
        <div className="flex flex-col justify-between h-full">
            <div className="w-full flex justify-center items-center h-56">
                {hasData
                    ?
                    <Doughnut data={data} options={options} />
                    :
                    <p className={`text-sm ${isLightTheme ? "text-gray-400" : "text-gray-500"}`}>No expense for this month.</p>
                }
            </div>
            <p className="text-gray-500 text-sm pb-4 text-center w-full">Top 5 most expensed categories</p>
        </div>
    );
}
