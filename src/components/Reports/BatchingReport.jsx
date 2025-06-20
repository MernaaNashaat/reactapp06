
import React, { useEffect, useState } from "react";
import { fetchDynamoData } from "../../DynamoService";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Reports.css";


const TABLE_NAME = "SmartBatchReports_PT";


export default function BatchingReport() {
    const [rows, setRows] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [highlightedRow, setHighlightedRow] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");


    useEffect(() => {
        fetchDynamoData(TABLE_NAME).then((data) => {
            setRows(data);
            setFiltered(data);
        });
    }, []);

    const applyFilter = () => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const result = rows.filter((row) => {
            const date = new Date(row.BatchStartDate);
            return (!fromDate || date >= from) && (!toDate || date <= to);
        });
        setFiltered(result);
    };

    const sortByStartDate = () => {
        const sortedData = [...filtered].sort((a, b) => {
            const dateA = new Date(a.BatchStartDate);
            const dateB = new Date(b.BatchStartDate);

            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        setFiltered(sortedData);
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    };




    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filtered);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Batching Report");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buffer]), "BatchingReport.xlsx");
    };

const exportPDF = () => {
    const report = rows.find((r) => r.batch_id === selectedBatchId);
    if (!report) {
        alert("Batch ID not found.");
        return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const val = (v) => (v !== null && v !== undefined ? v.toString() : "---");
    const toNum = (v) => {
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
    };
    let y = 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);

    const drawInfoBox = (leftLabel, leftVal, rightLabel, rightVal) => {
        doc.text(`${leftLabel}: ${val(leftVal)}`, 10, y);
        doc.text(`${rightLabel}: ${val(rightVal)}`, 110, y);
        y += 6;
    };

    // Header fields
    drawInfoBox("Batch Start Date", report.BatchStartDate, "Batch Start Time", report.BatchStartTime);
    drawInfoBox("Batch End Date", report.BatchEndDate, "Batch End Time", report.BatchEndTime);
    drawInfoBox("Customer", report.ClientID, "Concrete Use Time", `${val(report.ConcreteUseTime)} hrs`);
    drawInfoBox("Mix ID", report.MixID, "Destination", report.Destination);
    drawInfoBox("Order ID", report.batch_id, "Number of Batches", report.NumberOfBatches);
    drawInfoBox("Truck", report.TruckID, "Mixer Capacity", `${val(report.MixerCapacity)} m3`);

    const renderMaterialSection = (title, labels, dataRows) => {
        doc.setFont("helvetica", "bold");
        doc.text(title, 15, y + 4);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);

        autoTable(doc, {
            margin: { top: 2, left: 2, right: 2 },
            startY: y + 6,
            head: [["", "Set Quantity (Kg)", "Actual Quantity (Kg)", "Set Tolerance (%)", "Actual Tolerance (%)"]],
            body: dataRows.map((r, i) => [labels[i], ...r.map(val)]),
            theme: "plain",
            styles: {
                fontSize: 6,
                cellPadding: 1,
                lineColor: 0,
                lineWidth: 0.1,
            },
            headStyles: { minCellHeight: 3 },
            bodyStyles: { minCellHeight: 3 },
            margin: { left: 10, right: 10 },
            didDrawCell: function (data) {
                const { cell } = data;
                if (data.section === 'body' || data.section === 'head') {
                    doc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
                    doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
                    doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
                    doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
                }
            }
        });

        y = doc.lastAutoTable.finalY + 4;
    };

    // Aggregates
    renderMaterialSection("Aggregates",
        ["Aggregate 1", "Aggregate 2", "Aggregate 3", "Aggregate 4", "Aggregate 5", "Aggregate 6", "Total Dosed Quantity"],
        [
            [report.Aggregate1SetQuantity, report.Aggregate1ActualQuantity, report.Aggregate1SetTolerance, report.Aggregate1ActualTolerance],
            [report.Aggregate2SetQuantity, report.Aggregate2ActualQuantity, report.Aggregate2SetTolerance, report.Aggregate2ActualTolerance],
            [report.Aggregate3SetQuantity, report.Aggregate3ActualQuantity, report.Aggregate3SetTolerance, report.Aggregate3ActualTolerance],
            [report.Aggregate4SetQuantity, report.Aggregate4ActualQuantity, report.Aggregate4SetTolerance, report.Aggregate4ActualTolerance],
            [report.Aggregate5SetQuantity, report.Aggregate5ActualQuantity, report.Aggregate5SetTolerance, report.Aggregate5ActualTolerance],
            [report.Aggregate6SetQuantity, report.Aggregate6ActualQuantity, report.Aggregate6SetTolerance, report.Aggregate6ActualTolerance],
            [
                (toNum(report.Aggregate1SetQuantity) + toNum(report.Aggregate2SetQuantity) + toNum(report.Aggregate3SetQuantity) +
                toNum(report.Aggregate4SetQuantity) + toNum(report.Aggregate5SetQuantity) + toNum(report.Aggregate6SetQuantity)).toFixed(1),
                (toNum(report.Aggregate1ActualQuantity) + toNum(report.Aggregate2ActualQuantity) + toNum(report.Aggregate3ActualQuantity) +
                toNum(report.Aggregate4ActualQuantity) + toNum(report.Aggregate5ActualQuantity) + toNum(report.Aggregate6ActualQuantity)).toFixed(1),
                "---", "---"
            ],
        ]
    );

    // Cements
    renderMaterialSection("Cement",
        ["Cement 1", "Cement 2", "Cement 3", "Cement 4", "Total Dosed Quantity"],
        [
            [report.Cement1SetQuantity, report.Cement1ActualQuantity, report.Cement1SetTolerance, report.Cement1ActualTolerance],
            [report.Cement2SetQuantity, report.Cement2ActualQuantity, report.Cement2SetTolerance, report.Cement2ActualTolerance],
            [report.Cement3SetQuantity, report.Cement3ActualQuantity, report.Cement3SetTolerance, report.Cement3ActualTolerance],
            [report.Cement4SetQuantity, report.Cement4ActualQuantity, report.Cement4SetTolerance, report.Cement4ActualTolerance],
            [
                (toNum(report.Cement1SetQuantity) + toNum(report.Cement2SetQuantity) +
                toNum(report.Cement3SetQuantity) + toNum(report.Cement4SetQuantity)).toFixed(1),
                (toNum(report.Cement1ActualQuantity) + toNum(report.Cement2ActualQuantity) +
                toNum(report.Cement3ActualQuantity) + toNum(report.Cement4ActualQuantity)).toFixed(1),
                "---", "---"
            ],
        ]
    );

    // Admixtures
    renderMaterialSection("Admixtures", [
        "Admix 1", "Admix 2", "Admix 3", "Total Dosed Quantity"
    ], [
        [report.Admix1SetQuantity, report.Admix1ActualQuantity, report.Admix1SetTolerance, report.Admix1ActualTolerance],
        [report.Admix2SetQuantity, report.Admix2ActualQuantity, report.Admix2SetTolerance, report.Admix2ActualTolerance],
        [report.Admix3SetQuantity, report.Admix3ActualQuantity, report.Admix3SetTolerance, report.Admix3ActualTolerance],
        [
            (toNum(report.Admix1SetQuantity) + toNum(report.Admix2SetQuantity) + toNum(report.Admix3SetQuantity)).toFixed(1),
            (toNum(report.Admix1ActualQuantity) + toNum(report.Admix2ActualQuantity) + toNum(report.Admix3ActualQuantity)).toFixed(1),
            "---", "---"
        ]
    ]);

    // Water
    renderMaterialSection("Water Dosed Quantity (Kg)", [
        "Water"
    ], [
        [report.WaterSetQuantity, report.WaterActualQuantity, report.WaterSetTolerance, report.WaterActualTolerance],
    ]);

    // Ice
    renderMaterialSection("Ice Dosed Quantity (Kg)", [
        "Ice"
    ], [
        [report.IceSetQuantity, report.IceActualQuantity, report.IceSetTolerance, report.IceActualTolerance]
    ]);

    // Colors
    renderMaterialSection("Colors Dosed Quantity (Kg)", [
        "Colors"
    ], [
        [report.ColorsSetQuantity, report.ColorsActualQuantity, report.ColorsSetTolerance, report.ColorsActualTolerance]
    ]);

    // Mix Design Sections - Corrected field mappings
    const mixHeaders = [
        "Quantity (m3)",
        "Strength Class",
        "Slump Class",
        "Exposure Class",
        "W/C Ratio",
        "W/C Ratio Tol %",
        "Aggregate Max Diameter (mm)"
    ];

    // Requested Mix Design - Using main fields
    const requestedMix = [
        val(report.Quantity),
        val(report.StrengthClass),
        val(report.SlumpClass),
        val(report.ExposureClass),
        val(report.Wc_Ratio),
        val(report.Wc_RatioTolPercent),
        val(report.AggregateMaxDiameter)
    ];

    // Actual Mix Design - Using Actual-prefixed fields
    const actualMix = [
        val(report.ActualQuantity),
        val(report.ActualStrengthClass),
        val(report.ActualSlumpClass),
        val(report.ActualExposureClass),
        val(report.ActualWC_Ratio),
        val(report.ActualWC_RatioTolPercent),
        val(report.ActualAggregateMaxDiameter)
    ];

    // Requested Mix Design Table
    doc.setFont("helvetica", "bold");
    doc.text("Requested Mix Design", 105, y, { align: "center" });
    doc.setFont("helvetica", "normal");

    autoTable(doc, {
        startY: y + 2,
        head: [mixHeaders],
        body: [requestedMix],
        theme: "grid",
        styles: {
            fontSize: 6,
            cellPadding: 3,
            lineColor: 0,
            lineWidth: 0.3,
            halign: "center"
        },
        margin: { left: 10, right: 10 },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Actual Mix Design Table
    doc.setFont("helvetica", "bold");
    doc.text("Actual Mix Design", 105, y, { align: "center" });
    doc.setFont("helvetica", "normal");

    autoTable(doc, {
        startY: y + 2,
        head: [mixHeaders],
        body: [actualMix],
        theme: "grid",
        styles: {
            fontSize: 6,
            cellPadding: 3,
            lineColor: 0,
            lineWidth: 0.3,
            halign: "center"
        },
        margin: { left: 10, right: 10 },
    });

    y = doc.lastAutoTable.finalY + 5;

    // Footer (Generation info)
    const generationDate = new Date();
    doc.text(`Generation Date       : ${generationDate.toLocaleDateString()}`, 10, y + 5);
    doc.text(`Generation Time       : ${generationDate.toLocaleTimeString()}`, 10, y + 11);

    // Final Title at bottom center
    doc.setFontSize(12).setFont(undefined, "bold");
    doc.text("Smart Batch Concrete Batching Plant - Batching Report", 105, 292, { align: "center" });

    doc.save(`${report.batch_id}_BatchingReport.pdf`);
    doc.setPage(1); // Ensure it stays on first page
};




    const handleRowClick = (batchId) => {
        setSelectedBatchId(batchId);
        setHighlightedRow(batchId);
    };

    return (
        <div className="reports-container">
            {/* Add this image div at the top */}
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
                        <label htmlFor="fromDate">From</label>
                        <input
                            id="fromDate"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="toDate">To</label>
                        <input
                            id="toDate"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    <button onClick={applyFilter} className="filter-btn">Filter</button>
                    <button onClick={exportExcel} className="excel-btn">Export Excel</button>
                </div>

                <div className="pdf-export-row">
                    <label htmlFor="batchInput" style={{ fontWeight: "bold" }}>Enter Batch ID to export PDF</label>
                    <input
                        id="batchInput"
                        type="text"
                        placeholder="e.g. Order1"
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                    />
                    <button onClick={exportPDF} className="excel-btn">Export PDF</button>
                </div>
            </div>

            <div className="report-table-wrapper">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Batch ID</th>
                            <th>Client</th>
                            <th>Start Date</th>
                            {/* <th>End Time</th> */}
                            {/* <th>Mix ID</th>
                            <th>Batches</th> */}
                            <th>Qty (m³)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row, i) => (
                            <tr
                                key={i}
                                onClick={() => handleRowClick(row.batch_id)}
                                className={highlightedRow === row.batch_id ? "selected" : ""}
                            >
                                <td>{row.batch_id}</td>
                                <td>{row.ClientID}</td>
                                <td>{row.BatchStartDate}</td>
                                {/* <td>{row.BatchEndTime}</td> */}
                                {/* <td>{row.MixID}</td>
                                <td>{row.NumberOfBatches}</td> */}
                                <td>{row.Quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                    <th onClick={sortByStartDate} style={{ cursor: "pointer" }}>
                        Start Date {sortOrder === "asc" ? "▲" : "▼"}
                        
                    </th>

                </table>
            </div>
        </div>
    );
}