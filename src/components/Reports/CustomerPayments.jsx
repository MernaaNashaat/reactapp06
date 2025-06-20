import React, { useState, useEffect } from "react";
import { fetchDynamoData } from "../../DynamoService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Reports.css";

const TABLE_NAME = "SmartBatchCustomerPayments";

export default function CustomerPayments() {
    const [rows, setRows] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");

    useEffect(() => {
        fetchDynamoData(TABLE_NAME).then((data) => {
            const normalized = data.map((item) => ({
                ...item,
                timestamp: item.timestamp || item["Time Stamp"],
            }));
            setRows(normalized);
            setFiltered(normalized);
        });
    }, []);

    const applyFilter = () => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const result = rows.filter((row) => {
            const date = new Date(row.timestamp);
            return (!fromDate || date >= from) && (!toDate || date <= to);
        });
        setFiltered(result);
    };

    const sortByTimestamp = () => {
        const sortedData = [...filtered].sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        setFiltered(sortedData);
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Smart Batch Concrete Batching Plant - Customer Payments", 105, 15, null, null, 'center');

        const headers = [["Timestamp", "Customer Name", "Current Balance", "Paid Amount"]];

        const data = filtered.map(item => [
            item.timestamp || "N/A",
            item.customerName || "N/A",
            item.currentBalance || "N/A",
            item.paidAmount || "N/A",
        ]);

        autoTable(doc, {
            startY: 25,
            head: headers,
            body: data,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: 25 },
        });

        const currentDate = new Date();
        const pageHeight = doc.internal.pageSize.height;

        doc.setFontSize(10);
        doc.text(`Generation Date: ${currentDate.toISOString().slice(0, 10)}`, 14, pageHeight - 20);
        doc.text(`Generation Time: ${currentDate.toTimeString().slice(0, 8)}`, 14, pageHeight - 15);

        doc.save("CustomerPayments.pdf");
    };

    const exportExcel = () => {
        const exportData = filtered.map(item => ({
            "Timestamp": item.timestamp,
            "Customer Name": item.customerName,
            "Current Balance": item.currentBalance,
            "Paid Amount": item.paidAmount
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Payments");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buffer]), "CustomerPayments.xlsx");
    };

    return (
        <div className="reports-container">
            <div className="header-image">
                <img 
                    src="https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/Screenshot+2025-06-14+033134.png" 
                    alt="Batching Report Header"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
                 </div>
            <div className="filter-export-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>From</label>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>To</label>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <button onClick={applyFilter} className="filter-btn">Filter</button>
                    <button onClick={exportExcel} className="excel-btn">Export Excel</button>
                    <button onClick={exportPDF} className="excel-btn">Export PDF</button>
                </div>
            </div>

            <div className="report-table-wrapper">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th onClick={sortByTimestamp} style={{ cursor: "pointer" }}>Timestamp {sortOrder === "asc" ? "▲" : "▼"}</th>
                            <th>Customer Name</th>
                            <th>Current Balance</th>
                            <th>Paid Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row, i) => (
                            <tr key={i}>
                                <td>{row.timestamp}</td>
                                <td>{row.customerName}</td>
                                <td>{row.currentBalance}</td>
                                <td>{row.paidAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
