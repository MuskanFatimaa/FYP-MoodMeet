import React from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const data = {
  labels: ["Accuracy", "Precision", "Recall"],
  datasets: [
    {
      label: "Model Performance",
      data: [91, 89, 95],
      backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
    },
  ],
};

const BarChart = () => {
  return <Bar data={data} />;
};

export default BarChart;
