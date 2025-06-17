import React, { useState } from "react";
import BatchingReport from "./BatchingReport";
import InventoryReport from "./InventoryReport";
import CustomerPayments from "./CustomerPayments";
import "./Reports.css";

export default function ReportsPage() {
    const [tab, setTab] = useState("batching");

    return (
        <div className="reports-container">
            <div className="tab-bar">
                <button
                    className={`tab-btn ${tab === "batching" ? "active" : ""}`}
                    onClick={() => setTab("batching")}
                >
                    Batching Report
                </button>
                <button
                    className={`tab-btn ${tab === "inventory" ? "active" : ""}`}
                    onClick={() => setTab("inventory")}
                >
                    Inventory Report
                </button>
                <button
                    className={`tab-btn ${tab === "payments" ? "active" : ""}`}
                    onClick={() => setTab("payments")}
                >
                    Customer Payments
                </button>
            </div>

            {tab === "batching" && <BatchingReport />}
            {tab === "inventory" && <InventoryReport />}
            {tab === "payments" && <CustomerPayments />}
        </div>
    );
}