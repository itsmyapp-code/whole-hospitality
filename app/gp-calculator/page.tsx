"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Copy, Pencil, Trash2, Upload, Download, Plus, FileSpreadsheet, Info, AlertTriangle, Zap, ShoppingBag, Beer, Wine as WineIcon, Coffee, Percent, Printer, FileText, ChevronRight } from "lucide-react";

// --- Utility Functions ---

const smartRound = (price: number) => {
    // Python: math.ceil(price * 10) / 10
    return Math.ceil(price * 10) / 10;
};

type ProductGroup = "Draught" | "Spirits" | "Wine" | "Soft Drinks" | "Post Mix" | "Packed" | "Snacks";

const CSV_TEMPLATES: Record<ProductGroup, { headers: string[], sampleRow: string[] }> = {
    Draught: {
        headers: ["Product Name", "Size", "Basis", "Cost Ex-VAT", "Target GP", "Half Surcharge", "Current Pint Price", "Increase Type", "Increase Value", "Extra Duty", "Ullage"],
        sampleRow: ["Example Lager", "11 Gal", "Per Barrel", "150.00", "60", "0.10", "5.50", "Percentage (%)", "5", "0", "1"]
    },
    Spirits: {
        headers: ["Product Name", "Size", "Cost Ex-VAT", "Target GP", "Current 25ml Price", "Increase Type", "Increase Value"],
        sampleRow: ["Example Gin", "70cl", "20.00", "72", "4.50", "Fixed £ Bottle", "1.50"]
    },
    Wine: {
        headers: ["Product Name", "Cost Ex-VAT", "Target GP", "Current Bottle Price", "Current 250ml", "Current 175ml", "Current 125ml", "Increase Type", "Increase Value"],
        sampleRow: ["House White", "7.50", "68", "18.00", "6.50", "5.50", "4.50", "Percentage (%)", "3"]
    },
    "Soft Drinks": {
        headers: ["Product Name", "Case Size", "Unit Size", "Case Cost Ex-VAT", "Target GP", "Current Price"],
        sampleRow: ["Cola Bottle", "24", "330ml", "18.00", "75", "3.50"]
    },
    "Post Mix": {
        headers: ["Product Name", "BIB Size Litres", "BIB Cost Ex-VAT", "Ratio", "Target GP", "Current Pint Price"],
        sampleRow: ["Pepsi BIB", "7", "65.00", "5", "85", "3.20"]
    },
    Packed: {
        headers: ["Product Name", "Pack Size", "Unit Size", "Pack Cost Ex-VAT", "Target GP", "Current Price"],
        sampleRow: ["Cider Can", "24", "500ml", "24.00", "70", "4.50"]
    },
    Snacks: {
        headers: ["Product Name", "Pack Size", "Category", "Pack Cost Ex-VAT", "Target GP", "Current Price"],
        sampleRow: ["Sea Salt Crisps", "24", "Standard Crisps", "12.00", "65", "1.50"]
    }
};

const parseCSV = (text: string) => {
    const lines = text.split("\n").filter(l => l.trim() !== "");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    return lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ""; });
        return obj;
    });
};

const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

const downloadTemplate = (group: ProductGroup) => {
    const tmpl = CSV_TEMPLATES[group];
    downloadCSV(`gp_template_${group.toLowerCase().replace(/ /g, "_")}.csv`, tmpl.headers, [tmpl.sampleRow]);
};

const exportHistoryToCSV = (history: CalculationItem[]) => {
    const headers = ["Product", "Type", "Target GP", "Recommended Price", "Current Price", "Current GP", "Timestamp"];
    const rows = history.map(item => {
        const d = item.details;
        let recPrice = "-";
        let currPrice = "-";
        let currentGP = d["Current GP"] || d["Current GP (Btl)"] || d["Current GP (Pint)"] || "-";

        if (item.type === "Draught") { recPrice = d["Recommended Pint"] || "-"; currPrice = d["Current Pint Price (Inc)"] || "-"; }
        else if (item.type === "Spirits") { recPrice = d["Recommended 25ml"] || "-"; currPrice = d["Current 25ml Price"] || "-"; }
        else if (item.type === "Wine") { recPrice = d["Recommended Bottle"] || "-"; currPrice = d["Current Bottle Price"] || "-"; }
        else if (item.type === "Soft Drinks") { recPrice = d["Recommended Price"] || "-"; currPrice = d["Current Sell Price"] || "-"; }
        else if (item.type === "Post Mix") { recPrice = d["Recommended Pint"] || "-"; currPrice = d["Current Price"] || "-"; }
        else if (item.type === "Packed") { recPrice = d["Recommended Price"] || "-"; currPrice = d["Current Sell Price"] || "-"; }
        else if (item.type === "Snacks") { recPrice = d["Recommended Price"] || "-"; currPrice = d["Current Sell Price"] || "-"; }

        return [item.product, item.type, d["Target GP"] || "-", recPrice, currPrice, currentGP, new Date(item.timestamp).toLocaleString()];
    });
    downloadCSV("gp_session_history.csv", headers, rows);
};

type UploadResult = {
    product: string;
    group: ProductGroup;
    details: Record<string, string>;
    calculationItem: CalculationItem;
};

// --- Types ---

type CalculationItem = {
    id: string;
    type: "Draught" | "Spirits" | "Wine" | "Soft Drinks" | "Post Mix" | "Packed" | "Snacks";
    product: string;
    details: Record<string, string>;
    timestamp: string;
};

// --- Constants & Config ---

type Sector = "Pub" | "Hotel";
type Tier = "Low" | "Mid" | "High";

const GPTargets: Record<Sector, Record<Tier, Record<string, number>>> = {
    Pub: {
        Low: { Draught: 55, Spirits: 68, Wine: 65, "Soft Drinks": 70, "Post Mix": 80, Packed: 70, Snacks: 60 },
        Mid: { Draught: 60, Spirits: 72, Wine: 68, "Soft Drinks": 75, "Post Mix": 85, Packed: 75, Snacks: 65 },
        High: { Draught: 65, Spirits: 75, Wine: 72, "Soft Drinks": 80, "Post Mix": 90, Packed: 80, Snacks: 70 },
    },
    Hotel: {
        Low: { Draught: 65, Spirits: 70, Wine: 68, "Soft Drinks": 72, "Post Mix": 82, Packed: 72, Snacks: 65 },
        Mid: { Draught: 68, Spirits: 75, Wine: 70, "Soft Drinks": 78, "Post Mix": 85, Packed: 78, Snacks: 70 },
        High: { Draught: 72, Spirits: 78, Wine: 74, "Soft Drinks": 82, "Post Mix": 90, Packed: 82, Snacks: 75 },
    },
};

// --- Reusable UI Helpers ---

const InputField = ({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
    </div>
);

const SelectField = ({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-white"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

// --- Sub-Calculators ---

const Header = () => (
    <header className="print:hidden bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="relative h-10 w-10">
                <Image
                    src="/logo.png"
                    alt="Whole Hospitality Logo"
                    fill
                    className="object-contain"
                />
            </div>
            <h1 className="text-2xl font-bold text-slate-700 tracking-tight">GP CALCULATOR <span className="text-blue-500">PRO</span></h1>
        </div>
        <div className="flex gap-4">
            <a
                href="https://wholehospitality.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-bold hover:underline"
            >
                VISIT WHOLEHOSPITALITY.CO.UK
            </a>
        </div>
    </header>
);

// --- Sub-Calculators ---

// 1. Draught Calculator
const DraughtCalc = ({ onSave, initialData, defaultGP }: { onSave: (data: CalculationItem) => void, initialData?: CalculationItem | null, defaultGP: number }) => {
    const [name, setName] = useState("");
    const [size, setSize] = useState("11 Gal");
    const [basis, setBasis] = useState("Per Barrel");
    const [cost, setCost] = useState("");
    const [gp, setGp] = useState("");

    // Reality Check Inputs
    const [currentPrice, setCurrentPrice] = useState("");


    const [incType, setIncType] = useState("Percentage (%)");
    const [incVal, setIncVal] = useState("");
    const [duty, setDuty] = useState("");
    const [halfPrem, setHalfPrem] = useState("0.10");

    const [ullage, setUllage] = useState("0");

    useEffect(() => {
        if (initialData && initialData.type === "Draught") {
            setName(initialData.product || "");
            const d = initialData.details;
            if (d["Unit Size"]) setSize(d["Unit Size"]);
            if (d["Cost Basis"]) setBasis(d["Cost Basis"]);
            if (d["Current Cost (Ex-VAT)"]) setCost(d["Current Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));
            if (d["Half Surcharge"]) setHalfPrem(d["Half Surcharge"].replace(/[£,]/g, ""));
            if (d["Forecast Increase Type"]) setIncType(d["Forecast Increase Type"]);
            if (d["Forecast Increase Value"]) setIncVal(d["Forecast Increase Value"]);
            if (d["Extra Duty (Ex-VAT)"]) setDuty(d["Extra Duty (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Ullage (%)"]) setUllage(d["Ullage (%)"]);
            // New fields
            if (d["Current Pint Price (Inc)"]) setCurrentPrice(d["Current Pint Price (Inc)"].replace(/[£,]/g, ""));
        }
    }, [initialData]);

    // Constructive/Destructive? If user has manually typed a GP, this overwrites it if global setting changes.
    // This is "Industry Standard" toggle behavior.
    useEffect(() => {
        setGp(defaultGP.toString());
    }, [defaultGP]);

    const [result, setResult] = useState<{
        newTotal: number;
        pint: number;
        half: number;
        currentGP: number | null;
        marginUplift: number | null;
    } | null>(null);

    const calculate = () => {
        const prodName = name.trim() || "Draught";
        const targetGp = parseFloat(gp);
        const hPrem = parseFloat(halfPrem) || 0.10;
        const currCost = parseFloat(cost);
        const increaseValue = parseFloat(incVal) || 0;
        const extraDuty = parseFloat(duty) || 0;

        if (isNaN(targetGp) || isNaN(currCost)) {
            alert("Please enter valid Cost and Target GP.");
            return;
        }

        let gals = 0;
        if (size.includes("Gal")) {
            gals = parseFloat(size.split(" ")[0]);
        } else if (size === "20 Ltr") {
            gals = 20 / 4.546;
        } else if (size === "30 Ltr") {
            gals = 30 / 4.546;
        } else if (size === "50 Ltr") {
            gals = 50 / 4.546;
        }

        // Apply Ullage
        const ullageVal = parseFloat(ullage) || 0;
        const effectiveGals = gals * (1 - ullageVal / 100);

        // 1 Gallon = 8 Pints (approx, using 4.546L/gal and 568ml/pint? 
        // Python code: pints = (gals * 4.546 * 1000) / 568  => This is exact conversion.
        const pints = (effectiveGals * 4.546 * 1000) / 568;

        const totalCost = basis === "Per Barrel" ? currCost : currCost * gals;

        let increaseAmt = 0;
        if (incType === "Percentage (%)") {
            increaseAmt = totalCost * (increaseValue / 100);
        } else if (incType === "Fixed £ Barrel") {
            increaseAmt = increaseValue;
        } else {
            // Fixed £ Gallon (Assumed, though Python says 'Fixed £ Gallon' logic is actually usually per gallon if not barrel)
            // python: else: increase_amt = inc_val * gals
            increaseAmt = increaseValue * gals;
        }

        const dutyTotal = basis === "Per Barrel" ? extraDuty : extraDuty * gals;
        const forecastTotal = totalCost + increaseAmt + dutyTotal;

        // Formula: ( (TotalCost / Pints) / (1 - GP/100) ) * 1.2 (VAT)
        // Then Smart Round
        const costPerMl = (forecastTotal / pints) / 568;
        const calcPrice = (ml: number) => smartRound(((costPerMl * ml) / (1 - targetGp / 100)) * 1.20);

        const recommPint = calcPrice(568);
        const recommHalf = calcPrice(284);

        // --- Reality Check & Analytics ---
        const currSell = parseFloat(currentPrice) || 0;


        let currentGP = null;

        let marginUplift = null;

        if (currSell > 0) {
            const costPerPint = costPerMl * 568;
            const netSales = currSell / 1.2;
            currentGP = ((netSales - costPerPint) / netSales) * 100;

            // Margin Uplift (Cash) per keg
            marginUplift = (recommPint - currSell);
        }

        setResult({
            newTotal: forecastTotal,
            pint: recommPint,
            half: recommHalf,
            currentGP: currentGP,
            marginUplift: marginUplift
        });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Draught",
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "Unit Size": size,
                "Cost Basis": basis,
                "Ullage (%)": `${ullage}%`,
                "Current Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
                "Target GP": `${targetGp}%`,
                "Half Surcharge": `£${hPrem.toFixed(2)}`,
                "Forecast Increase Type": incType,
                "Forecast Increase Value": `${incVal}`,
                "Forecast Increase Amount": `£${increaseAmt.toFixed(2)}`,
                "Extra Duty (Ex-VAT)": `£${dutyTotal.toFixed(2)}`,
                "New Total Cost (Ex-VAT)": `£${forecastTotal.toFixed(2)}`,
                "Current Pint Price (Inc)": currSell > 0 ? `£${currSell.toFixed(2)}` : "-",
                "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
                "Recommended Pint": `£${recommPint.toFixed(2)}`,
                "Recommended Half": `£${recommHalf.toFixed(2)}`,
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Product Details</h3>
                    <button
                        onClick={calculate}
                        className="bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
                    >
                        CALCULATE
                    </button>
                </div>
                <div className="space-y-4">
                    <InputField label="Product Name" value={name} onChange={setName} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="Keg Size" value={size} onChange={setSize} options={["22 Gal", "11 Gal", "9 Gal", "50 Ltr", "30 Ltr", "20 Ltr", "10 Ltr"]} />
                        <SelectField label="Cost Basis" value={basis} onChange={setBasis} options={["Per Barrel", "Per Gallon"]} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Unit Cost £ (Ex-VAT)" value={cost} onChange={setCost} type="number" />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600 flex justify-between">
                                <span>Ullage (Wastage)</span>
                                <span className="text-blue-600 font-bold">{ullage}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={ullage}
                                onChange={(e) => setUllage(e.target.value)}
                                className="h-10 cursor-pointer accent-slate-700 w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Targets & Reality</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                            <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                            <InputField label="Current Pint (Inc-VAT)" value={currentPrice} onChange={setCurrentPrice} type="number" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Price Forecast</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <SelectField label="Increase Type" value={incType} onChange={setIncType} options={["Percentage (%)", "Fixed £ Barrel", "Fixed £ Gallon"]} />
                            <InputField label="Increase (Ex-VAT)" value={incVal} onChange={setIncVal} type="number" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Extra Duty (Ex-VAT)" value={duty} onChange={setDuty} type="number" />
                            <InputField label="Half Surcharge £" value={halfPrem} onChange={setHalfPrem} type="number" />
                        </div>
                    </div>
                </div>
            </div>



            {
                result && (
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                        <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                        <p className="text-lg">New Total Barrel Cost: <strong>£{result.newTotal.toFixed(2)}</strong></p>
                        <div className="flex flex-col md:flex-row justify-center gap-8 mt-4 text-2xl font-bold text-slate-800">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Pint</span>
                                <span>£{result.pint.toFixed(2)}</span>
                                {result.currentGP !== null && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1">
                                        Target: {gp}%
                                    </span>
                                )}
                            </div>
                            <div className="hidden md:block w-px bg-slate-200"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Half</span>
                                <span>£{result.half.toFixed(2)}</span>
                            </div>
                            <div className="hidden md:block w-px bg-slate-200"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Current Pint</span>
                                <span className={`${result.currentGP !== null ? "text-slate-600" : "text-slate-300"}`}>
                                    {currentPrice ? `£${parseFloat(currentPrice).toFixed(2)}` : "-"}
                                </span>
                                {result.currentGP !== null && (
                                    <span className={`text-xs px-2 py-1 rounded mt-1 ${result.currentGP < parseFloat(gp) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                        Actual: {result.currentGP.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>


                    </div>
                )
            }
        </div >
    );
};

// 2. Spirits Calculator
const SpiritsCalc = ({ onSave, initialData, defaultGP }: { onSave: (data: CalculationItem) => void, initialData?: CalculationItem | null, defaultGP: number }) => {
    const [name, setName] = useState("");
    const [size, setSize] = useState("70cl");
    const [cost, setCost] = useState("");
    const [gp, setGp] = useState("");

    const [incType, setIncType] = useState("Percentage (%)");
    const [incVal, setIncVal] = useState("");

    // Reality Check
    const [glassSize, setGlassSize] = useState("25"); // ml
    const [currentPriceGlass, setCurrentPriceGlass] = useState("");

    useEffect(() => {
        if (initialData && initialData.type === "Spirits") {
            setName(initialData.product || "");
            const d = initialData.details;
            if (d["Bottle Size"]) setSize(d["Bottle Size"]);
            if (d["Glass Size"]) setGlassSize(d["Glass Size"].replace("ml", ""));
            // See note in previous version about stored cost
            if (d["New Bottle Cost (Ex-VAT)"]) setCost(d["New Bottle Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));
            if (d["Increase Type"]) setIncType(d["Increase Type"]);
            if (d["Increase Value"]) setIncVal(d["Increase Value"]);
            // New fields
            if (d["Current Price"]) setCurrentPriceGlass(d["Current Price"].replace(/[£,]/g, ""));
        }
    }, [initialData]);

    useEffect(() => {
        setGp(defaultGP.toString());
    }, [defaultGP]);

    const [result, setResult] = useState<null | {
        newCost: number;
        priceGlass: number;
        priceDouble: number;
        currentGP: number | null;
    }>(null);

    const calculate = () => {
        const prodName = name.trim() || "Spirit";
        const targetGp = parseFloat(gp);
        let currCost = parseFloat(cost);
        const increaseValue = parseFloat(incVal) || 0;

        if (isNaN(targetGp) || isNaN(currCost)) {
            alert("Please enter valid Cost and Target GP.");
            return;
        }

        if (incType === "Percentage (%)") {
            currCost *= (1 + increaseValue / 100);
        } else {
            currCost += increaseValue;
        }

        const cl = parseFloat(size.replace("cl", ""));
        const mlTotal = cl * 10;
        const gSize = parseFloat(glassSize) || 25;

        // Cost per glass
        const costGlass = (currCost / mlTotal) * gSize;

        // Sell Glass = (CostGlass / (1 - GP)) * 1.2
        const saleGlass = smartRound((costGlass / (1 - targetGp / 100)) * 1.20);
        const saleDouble = saleGlass * 2; // Simple double

        // --- Reality Check ---
        const currPrice = parseFloat(currentPriceGlass) || 0;


        let currentGP = null;


        if (currPrice > 0) {
            const netSalesGlass = currPrice / 1.2;
            currentGP = ((netSalesGlass - costGlass) / netSalesGlass) * 100;
        }

        setResult({
            newCost: currCost,
            priceGlass: saleGlass,
            priceDouble: saleDouble,
            currentGP: currentGP,
        });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Spirits",
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "Bottle Size": size,
                "Glass Size": `${gSize}ml`,
                "Current Btl Cost (Ex-VAT)": `£${(incType === "Percentage (%)" ? currCost / (1 + increaseValue / 100) : currCost - increaseValue).toFixed(2)}`,
                "Target GP": `${targetGp}%`,
                "Increase Type": incType,
                "Increase Value": `${incVal}`,
                "New Bottle Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
                "Current Price": currPrice > 0 ? `£${currPrice.toFixed(2)}` : "-",
                "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
                [`Recommended ${gSize}ml`]: `£${saleGlass.toFixed(2)}`,
                [`Recommended ${gSize * 2}ml`]: `£${saleDouble.toFixed(2)}`,
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Product Details</h3>
                    <button
                        onClick={calculate}
                        className="bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
                    >
                        CALCULATE
                    </button>
                </div>
                <div className="space-y-4">
                    <InputField label="Product Name" value={name} onChange={setName} />
                    <div className="grid grid-cols-4 gap-4">
                        <SelectField label="Size" value={size} onChange={setSize} options={["70cl", "75cl", "100cl", "150cl"]} />
                        <SelectField label="Measure (ml)" value={glassSize} onChange={setGlassSize} options={["25", "35", "50"]} />
                        <InputField label="Btl Cost (Ex-VAT) £" value={cost} onChange={setCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <InputField label={`Current ${glassSize}ml Price (Inc-VAT) £`} value={currentPriceGlass} onChange={setCurrentPriceGlass} type="number" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Increase</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <SelectField label="Increase Type" value={incType} onChange={setIncType} options={["Percentage (%)", "Fixed £ Bottle"]} />
                            <InputField label="Increase (Ex-VAT)" value={incVal} onChange={setIncVal} type="number" />
                        </div>
                    </div>
                </div>
            </div>



            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">New Bottle Cost: <strong>£{result.newCost.toFixed(2)}</strong></p>
                    <div className="flex flex-col md:flex-row justify-center gap-8 mt-4 text-2xl font-bold text-slate-800">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Recommended {glassSize}ml</span>
                            <span>£{result.priceGlass.toFixed(2)}</span>
                            {result.currentGP !== null && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1">
                                    Target: {gp}%
                                </span>
                            )}
                        </div>
                        <div className="hidden md:block w-px bg-slate-200"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Recommended {parseFloat(glassSize) * 2}ml</span>
                            <span>£{result.priceDouble.toFixed(2)}</span>
                        </div>
                        <div className="hidden md:block w-px bg-slate-200"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Current {glassSize}ml</span>
                            <span className={`${result.currentGP !== null ? "text-slate-600" : "text-slate-300"}`}>
                                {currentPriceGlass ? `£${parseFloat(currentPriceGlass).toFixed(2)}` : "-"}
                            </span>
                            {result.currentGP !== null && (
                                <span className={`text-xs px-2 py-1 rounded mt-1 ${result.currentGP < parseFloat(gp) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                    Actual: {result.currentGP.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>


                </div>
            )}
        </div>
    );
};

// 3. Wine Calculator
const WineCalc = ({ onSave, initialData, defaultGP }: { onSave: (data: CalculationItem) => void, initialData?: CalculationItem | null, defaultGP: number }) => {
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [gp, setGp] = useState("");

    const [incType, setIncType] = useState("Percentage (%)");
    const [incVal, setIncVal] = useState("");

    // Reality Check
    const [currentPriceBtl, setCurrentPriceBtl] = useState("");
    const [currentPrice250, setCurrentPrice250] = useState("");
    const [currentPrice175, setCurrentPrice175] = useState("");
    const [currentPrice125, setCurrentPrice125] = useState("");


    useEffect(() => {
        if (initialData && initialData.type === "Wine") {
            setName(initialData.product || "");
            const d = initialData.details;
            // "New Btl Cost (Ex-VAT)" corresponds to the input 'currCost'
            if (d["New Btl Cost (Ex-VAT)"]) setCost(d["New Btl Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));
            if (d["Increase Type"]) setIncType(d["Increase Type"]);
            if (d["Increase Value"]) setIncVal(d["Increase Value"]);
            // New fields
            if (d["Current Bottle Price"]) setCurrentPriceBtl(d["Current Bottle Price"].replace(/[£,]/g, ""));
            if (d["Current 250ml Price"]) setCurrentPrice250(d["Current 250ml Price"].replace(/[£,]/g, ""));
            if (d["Current 175ml Price"]) setCurrentPrice175(d["Current 175ml Price"].replace(/[£,]/g, ""));
            if (d["Current 125ml Price"]) setCurrentPrice125(d["Current 125ml Price"].replace(/[£,]/g, ""));
        }
    }, [initialData]);

    useEffect(() => {
        setGp(defaultGP.toString());
    }, [defaultGP]);

    const [result, setResult] = useState<null | {
        btlPrice: number;
        m250: number;
        m175: number;
        m125: number;
        currentGP: number | null;
    }>(null);

    const calculate = () => {
        const prodName = name.trim() || "Wine";
        const targetGp = parseFloat(gp);
        let currCost = parseFloat(cost);
        const increaseValue = parseFloat(incVal) || 0;

        if (isNaN(targetGp) || isNaN(currCost)) {
            alert("Please enter valid Cost and Target GP.");
            return;
        }

        if (incType === "Percentage (%)") {
            currCost *= (1 + increaseValue / 100);
        } else {
            currCost += increaseValue;
        }

        // Bottle Sell
        const btlPrice = smartRound((currCost / (1 - targetGp / 100)) * 1.20);

        // Glasses
        const costPerMl = currCost / 750;

        // 250ml (Large) -> Standard GP
        const m250 = smartRound((costPerMl * 250 / (1 - targetGp / 100)) * 1.20);

        // 175ml (Medium) -> GP + 2%
        const m175 = smartRound((costPerMl * 175 / (1 - (targetGp + 2) / 100)) * 1.20);

        // 125ml (Small) -> GP + 4%
        const m125 = smartRound((costPerMl * 125 / (1 - (targetGp + 4) / 100)) * 1.20);

        // --- Reality Check ---
        const currBtl = parseFloat(currentPriceBtl) || 0;


        let currentGP = null;


        if (currBtl > 0) {
            const netSalesBtl = currBtl / 1.2;
            currentGP = ((netSalesBtl - currCost) / netSalesBtl) * 100;
        }

        setResult({
            btlPrice, m250, m175, m125,
            currentGP: currentGP,
        });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Wine",
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "Current Btl Cost (Ex-VAT)": `£${(incType === "Percentage (%)" ? currCost / (1 + increaseValue / 100) : currCost - increaseValue).toFixed(2)}`,
                "Target GP": `${targetGp}%`,
                "Increase Type": incType,
                "Increase Value": `${incVal}`,
                "New Btl Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
                "Current Bottle Price": currBtl > 0 ? `£${currBtl.toFixed(2)}` : "-",
                "Current 250ml Price": currentPrice250 ? `£${parseFloat(currentPrice250).toFixed(2)}` : "-",
                "Current 175ml Price": currentPrice175 ? `£${parseFloat(currentPrice175).toFixed(2)}` : "-",
                "Current 125ml Price": currentPrice125 ? `£${parseFloat(currentPrice125).toFixed(2)}` : "-",
                "Current GP (Btl)": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
                "Recommended Bottle": `£${btlPrice.toFixed(2)}`,
                "Recommended 250ml": `£${m250.toFixed(2)}`,
                "Recommended 175ml": `£${m175.toFixed(2)}`,
                "Recommended 125ml": `£${m125.toFixed(2)}`,
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Product Details</h3>
                    <button
                        onClick={calculate}
                        className="bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
                    >
                        CALCULATE
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <InputField label="Product Name" value={name} onChange={setName} />
                        <InputField label="Btl Cost (Ex-VAT) £" value={cost} onChange={setCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <InputField label="Current Bottle Price (Inc-VAT)" value={currentPriceBtl} onChange={setCurrentPriceBtl} type="number" />
                        <div className="grid grid-cols-3 gap-2">
                            <InputField label="250ml" value={currentPrice250} onChange={setCurrentPrice250} type="number" />
                            <InputField label="175ml" value={currentPrice175} onChange={setCurrentPrice175} type="number" />
                            <InputField label="125ml" value={currentPrice125} onChange={setCurrentPrice125} type="number" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Increase Forecast</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <SelectField label="Increase Type" value={incType} onChange={setIncType} options={["Percentage (%)", "Fixed £ Bottle"]} />
                            <InputField label="Increase (Ex-VAT)" value={incVal} onChange={setIncVal} type="number" />
                        </div>
                    </div>
                </div>
            </div>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">New Bottle Price: <strong>£{result.btlPrice.toFixed(2)}</strong></p>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-4 text-xl font-bold text-slate-800">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 font-normal">250ml</span>
                            <span>£{result.m250.toFixed(2)}</span>
                            {currentPrice250 && <span className="text-xs text-slate-400 mt-1">Curr: £{currentPrice250}</span>}
                        </div>
                        <span className="text-slate-300">|</span>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 font-normal">175ml</span>
                            <span>£{result.m175.toFixed(2)}</span>
                            {currentPrice175 && <span className="text-xs text-slate-400 mt-1">Curr: £{currentPrice175}</span>}
                        </div>
                        <span className="text-slate-300">|</span>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 font-normal">125ml</span>
                            <span>£{result.m125.toFixed(2)}</span>
                            {currentPrice125 && <span className="text-xs text-slate-400 mt-1">Curr: £{currentPrice125}</span>}
                        </div>
                    </div>

                    {result.currentGP !== null && (
                        <div className="mt-4 flex justify-center gap-4 text-xs font-bold">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Target GP: {gp}%</span>
                            <span className={`${result.currentGP < parseFloat(gp) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"} px-2 py-1 rounded`}>Actual GP: {result.currentGP.toFixed(1)}%</span>
                        </div>
                    )}


                </div>
            )}
        </div>
    );
};

// 4. Soft Drinks Calculator (Packaged)
const SoftDrinksCalc = ({ onSave, initialData, defaultGP }: { onSave: (data: CalculationItem) => void, initialData?: CalculationItem | null, defaultGP: number }) => {
    const [name, setName] = useState("");
    const [caseSize, setCaseSize] = useState("24");
    const [unitSize, setUnitSize] = useState("330ml");
    const [caseCost, setCaseCost] = useState("");
    const [gp, setGp] = useState("");

    // Reality Check
    const [currentPrice, setCurrentPrice] = useState("");

    useEffect(() => {
        if (initialData && initialData.type === "Soft Drinks") {
            setName(initialData.product || "");
            const d = initialData.details;
            if (d["Case Size"]) setCaseSize(d["Case Size"]);
            if (d["Unit Size"]) setUnitSize(d["Unit Size"]);
            if (d["Case Cost (Ex-VAT)"]) setCaseCost(d["Case Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));

            if (d["Current Sell Price"]) setCurrentPrice(d["Current Sell Price"].replace(/[£,]/g, ""));
        }
    }, [initialData]);

    useEffect(() => {
        setGp(defaultGP.toString());
    }, [defaultGP]);

    const [result, setResult] = useState<null | {
        unitCost: number;
        unitRRP: number;
        currentGP: number | null;
    }>(null);

    const calculate = () => {
        const prodName = name.trim() || "Soft Drink";
        const cSize = parseFloat(caseSize) || 24;
        const cCost = parseFloat(caseCost) || 0;
        const targetGp = parseFloat(gp);

        if (isNaN(targetGp) || isNaN(cCost) || cCost === 0) {
            alert("Please enter valid Case Cost and Target GP.");
            return;
        }

        const unitCost = cCost / cSize;
        const rawRRP = (unitCost / (1 - targetGp / 100)) * 1.20;
        const unitRRP = smartRound(rawRRP);

        // --- Reality Check ---
        const currSell = parseFloat(currentPrice) || 0;

        let currentGP = null;

        if (currSell > 0) {
            const netSales = currSell / 1.2;
            currentGP = ((netSales - unitCost) / netSales) * 100;
        }

        setResult({
            unitCost,
            unitRRP,
            currentGP,
        });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Soft Drinks" as any,
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "Case Size": `${cSize}`,
                "Unit Size": unitSize,
                "Case Cost (Ex-VAT)": `£${cCost.toFixed(2)}`,
                "Unit Cost (Ex-VAT)": `£${unitCost.toFixed(2)}`,
                "Target GP": `${targetGp}%`,
                "Recommended Price": `£${unitRRP.toFixed(2)}`,
                "Current Sell Price": currSell > 0 ? `£${currSell.toFixed(2)}` : "-",
                "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Product Details</h3>
                    <button
                        onClick={calculate}
                        className="bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
                    >
                        CALCULATE
                    </button>
                </div>
                <div className="space-y-4">
                    <InputField label="Product Name" value={name} onChange={setName} />
                    <div className="grid grid-cols-4 gap-4">
                        <InputField label="Case Size" value={caseSize} onChange={setCaseSize} type="number" />
                        <InputField label="Unit Size" value={unitSize} onChange={setUnitSize} />
                        <InputField label="Case Cost £" value={caseCost} onChange={setCaseCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <InputField label="Current Unit Price (Inc-VAT)" value={currentPrice} onChange={setCurrentPrice} type="number" />
                    </div>
                </div>
            </div>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">Unit Cost: <strong>£{result.unitCost.toFixed(2)}</strong></p>

                    <div className="flex flex-col md:flex-row justify-center gap-8 mt-4 text-2xl font-bold text-slate-800">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Recommended Price</span>
                            <span>£{result.unitRRP.toFixed(2)}</span>
                            {result.currentGP !== null && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1">
                                    Target: {gp}%
                                </span>
                            )}
                        </div>
                        <div className="hidden md:block w-px bg-slate-200"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Current Price</span>
                            <span className={`${result.currentGP !== null ? "text-slate-600" : "text-slate-300"}`}>
                                {currentPrice ? `£${parseFloat(currentPrice).toFixed(2)}` : "-"}
                            </span>
                            {result.currentGP !== null && (
                                <span className={`text-xs px-2 py-1 rounded mt-1 ${result.currentGP < parseFloat(gp) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                    Actual: {result.currentGP.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 5. Post Mix Calculator
const PostMixCalc = ({ onSave, initialData, defaultGP }: { onSave: (data: CalculationItem) => void, initialData?: CalculationItem | null, defaultGP: number }) => {
    const [name, setName] = useState("");
    const [bibSize, setBibSize] = useState("7");
    const [bibCost, setBibCost] = useState("");
    const [ratio, setRatio] = useState("5.4");
    const [gp, setGp] = useState("");
    const [customRatio, setCustomRatio] = useState(false);

    const standardRatios: Record<string, string> = {
        "Coca Cola": "5.4",
        "Coke Zero": "5.4",
        "Pepsi": "5",
        "Diet Pepsi": "5",
        "Schweppes Lemonade": "7.5",
        "Schweppes Tonic Water": "5.4",
        "Custom": ""
    };

    const handleProductChange = (val: string) => {
        setName(val);
        if (standardRatios[val] !== undefined) {
            if (val === "Custom") {
                setCustomRatio(true);
            } else {
                setCustomRatio(false);
                setRatio(standardRatios[val]);
            }
        }
    };

    // Reality Check
    const [currentPrice, setCurrentPrice] = useState("");
    const [currentPriceUnit, setCurrentPriceUnit] = useState("Pint");

    useEffect(() => {
        if (initialData && initialData.type === "Post Mix") {
            setName(initialData.product || "");
            const d = initialData.details;
            if (d["BIB Size (Litres)"]) setBibSize(d["BIB Size (Litres)"]);
            if (d["BIB Cost (Ex-VAT)"]) setBibCost(d["BIB Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Dilution Ratio"]) setRatio(d["Dilution Ratio"].replace(/:1/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));

            if (d["Current Price"]) setCurrentPrice(d["Current Price"].replace(/[£,]/g, ""));
        }
    }, [initialData]);

    useEffect(() => {
        setGp(defaultGP.toString());
    }, [defaultGP]);

    const [result, setResult] = useState<null | {
        costPerMl: number;
        pint: number;
        p16oz: number;
        p12oz: number;
        half: number;
        dash: number;
        currentGP: number | null;
    }>(null);

    const calculate = () => {
        const prodName = name.trim() || "Post Mix";
        const sizeL = parseFloat(bibSize) || 7;
        const cost = parseFloat(bibCost) || 0;
        const r = parseFloat(ratio) || 5;
        const targetGp = parseFloat(gp);

        if (isNaN(targetGp) || isNaN(cost) || cost === 0) {
            alert("Please enter valid BIB Cost and Target GP.");
            return;
        }

        const totalLiquidMl = sizeL * (r + 1) * 1000;
        const costPerMl = cost / totalLiquidMl;

        // Measures
        const mlPint = 568;
        const ml16oz = 454;
        const ml12oz = 341;
        const mlHalf = 284;
        const mlDash = 50;

        // Prices
        const calcPrice = (ml: number) => smartRound(((costPerMl * ml) / (1 - targetGp / 100)) * 1.20);

        const pPint = calcPrice(mlPint);
        const p16oz = calcPrice(ml16oz);
        const p12oz = calcPrice(ml12oz);
        const pHalf = calcPrice(mlHalf);
        const pDash = calcPrice(mlDash);

        // --- Reality Check ---
        const currPrice = parseFloat(currentPrice) || 0;

        let currentGP = null;

        if (currPrice > 0) {
            const volMap: Record<string, number> = { "Pint": 568, "16oz": 454, "12oz": 341, "1/2 Pint": 284 };
            const unitVol = volMap[currentPriceUnit] || 568;
            const netSales = currPrice / 1.2;
            const costPerUnit = costPerMl * unitVol;
            currentGP = ((netSales - costPerUnit) / netSales) * 100;
        }

        setResult({
            costPerMl,
            pint: pPint,
            p16oz: p16oz,
            p12oz: p12oz,
            half: pHalf,
            dash: pDash,
            currentGP
        });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Post Mix" as any,
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "BIB Size (Litres)": `${sizeL}`,
                "BIB Cost (Ex-VAT)": `£${cost.toFixed(2)}`,
                "Dilution Ratio": `${r}:1`,
                "Target GP": `${targetGp}%`,
                "Recommended Pint": `£${pPint.toFixed(2)}`,
                "Recommended 16oz": `£${p16oz.toFixed(2)}`,
                "Recommended 12oz": `£${p12oz.toFixed(2)}`,
                "Recommended Half": `£${pHalf.toFixed(2)}`,
                "Recommended Dash": `£${pDash.toFixed(2)}`,
                "Current Price": currPrice > 0 ? `£${currPrice.toFixed(2)}` : "-",
                "Current Price Unit": currentPriceUnit,
                "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Product Details</h3>
                    <button
                        onClick={calculate}
                        className="bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
                    >
                        CALCULATE
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                            label="Product / Standard Ratios"
                            value={standardRatios[name] !== undefined ? name : (customRatio ? "Custom" : "")}
                            onChange={handleProductChange}
                            options={Object.keys(standardRatios)}
                        />
                        {customRatio && <InputField label="Custom Product Name" value={name} onChange={setName} />}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <InputField label="BIB Size (L)" value={bibSize} onChange={setBibSize} type="number" />
                        <InputField
                            label="Ratio (X:1)"
                            value={ratio}
                            onChange={setRatio}
                            type="number"
                        />
                        <InputField label="BIB Cost £" value={bibCost} onChange={setBibCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                            <InputField label="Current Price (Inc)" value={currentPrice} onChange={setCurrentPrice} type="number" />
                            <SelectField label="Unit" value={currentPriceUnit} onChange={setCurrentPriceUnit} options={["Pint", "16oz", "12oz", "1/2 Pint"]} />
                        </div>
                    </div>
                </div>
            </div>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg text-slate-500 mb-4">Cost per 100ml: £{(result.costPerMl * 100).toFixed(3)}</p>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-2 text-lg font-bold text-slate-800">
                        <div className="flex flex-col items-center p-2 bg-white rounded border border-slate-100">
                            <span className="text-xs text-slate-400 font-normal">Pint</span>
                            <span>£{result.pint.toFixed(2)}</span>
                            {result.currentGP !== null && (
                                <span className={`text-[10px] mt-1 ${result.currentGP < parseFloat(gp) ? "text-red-500" : "text-green-500"}`}>
                                    Act: {result.currentGP.toFixed(1)}%
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white rounded border border-slate-100">
                            <span className="text-xs text-slate-400 font-normal">16oz</span>
                            <span>£{result.p16oz.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white rounded border border-slate-100">
                            <span className="text-xs text-slate-400 font-normal">12oz</span>
                            <span>£{result.p12oz.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white rounded border border-slate-100">
                            <span className="text-xs text-slate-400 font-normal">Half</span>
                            <span>£{result.half.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white rounded border border-slate-100">
                            <span className="text-xs text-slate-400 font-normal">Dash</span>
                            <span>£{result.dash.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 7. Snacks Calculator
const SnacksCalc = ({ onSave, initialData, defaultGP }: { onSave: (data: CalculationItem) => void, initialData?: CalculationItem | null, defaultGP: number }) => {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Standard Crisps");
    const [packSize, setPackSize] = useState("24");
    const [packCost, setPackCost] = useState("");
    const [gp, setGp] = useState("");
    const [currentPrice, setCurrentPrice] = useState("");

    const snackConfigs: Record<string, { gp: number, strategy: string }> = {
        "Standard Crisps": { gp: 65, strategy: "High volume, low maintenance. Price sensitivity is higher here." },
        "Premium Crisps": { gp: 72, strategy: "People expect to pay a premium for 'hand-cooked' or unique flavors." },
        "Loose Nuts": { gp: 80, strategy: "Highest margin if bought in bulk, but requires strict portion control." },
        "Luxury Nuts": { gp: 75, strategy: "High perceived value in hotel bars; justifies a much higher price point." },
        "Jerky/Biltong": { gp: 55, strategy: "Higher COGS usually results in a lower percentage, but higher cash margin." },
    };

    useEffect(() => {
        if (initialData && initialData.type === "Snacks") {
            setName(initialData.product || "");
            const d = initialData.details;
            if (d["Category"]) setCategory(d["Category"]);
            if (d["Pack Size"]) setPackSize(d["Pack Size"]);
            if (d["Pack Cost (Ex-VAT)"]) setPackCost(d["Pack Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));
            if (d["Current Sell Price"]) setCurrentPrice(d["Current Sell Price"].replace(/[£,]/g, ""));
        }
    }, [initialData]);

    useEffect(() => {
        // When category changes, update GP target
        setGp(snackConfigs[category].gp.toString());
    }, [category]);

    const [result, setResult] = useState<null | {
        unitCost: number;
        unitRRP: number;
        currentGP: number | null;
    }>(null);

    const calculate = () => {
        const prodName = name.trim() || category;
        const pSize = parseFloat(packSize) || 1;
        const pCost = parseFloat(packCost) || 0;
        const targetGp = parseFloat(gp);

        if (isNaN(targetGp) || isNaN(pCost) || pCost === 0) {
            alert("Please enter valid Pack Cost and Target GP.");
            return;
        }

        const unitCost = pCost / pSize;
        const rawRRP = (unitCost / (1 - targetGp / 100)) * 1.20;
        const unitRRP = smartRound(rawRRP);
        const currSell = parseFloat(currentPrice) || 0;
        let currentGP = null;
        if (currSell > 0) {
            const netSales = currSell / 1.2;
            currentGP = ((netSales - unitCost) / netSales) * 100;
        }

        setResult({ unitCost, unitRRP, currentGP });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Snacks",
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "Category": category,
                "Pack Size": packSize,
                "Pack Cost (Ex-VAT)": `£${pCost.toFixed(2)}`,
                "Unit Cost (Ex-VAT)": `£${unitCost.toFixed(2)}`,
                "Target GP": `${targetGp}%`,
                "Recommended Price": `£${unitRRP.toFixed(2)}`,
                "Current Sell Price": currSell > 0 ? `£${currSell.toFixed(2)}` : "-",
                "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
                "Strategy": snackConfigs[category].strategy,
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Snack Details</h3>
                    <button
                        onClick={calculate}
                        className="bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
                    >
                        CALCULATE
                    </button>
                </div>

                <div className="mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Select Category</span>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(snackConfigs).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border
                                    ${category === cat
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <InputField label="Product Name" value={name} onChange={setName} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SelectField label="Pack Size" value={packSize} onChange={setPackSize} options={["12", "24", "10", "15", "20", "1"]} />
                        <InputField label="Pack Cost (Ex-VAT) £" value={packCost} onChange={setPackCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                        <InputField label="Current Price (Inc)" value={currentPrice} onChange={setCurrentPrice} type="number" />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                    <Info className="h-5 w-5 text-blue-500 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Strategy Tip</p>
                        <p className="text-sm text-blue-600/90 italic">"{snackConfigs[category].strategy}"</p>
                    </div>
                </div>
            </div>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">Unit Cost: <strong>£{result.unitCost.toFixed(2)}</strong></p>
                    <div className="flex flex-col md:flex-row justify-center gap-8 mt-4 text-2xl font-bold text-slate-800">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Recommended Price</span>
                            <span>£{result.unitRRP.toFixed(2)}</span>
                        </div>
                        <div className="hidden md:block w-px bg-slate-200"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Actual GP</span>
                            <span className={`${result.currentGP !== null ? (result.currentGP < parseFloat(gp) ? "text-red-600" : "text-green-600") : "text-slate-300"}`}>
                                {result.currentGP !== null ? `${result.currentGP.toFixed(1)}%` : "-"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 8. Packed Products Calculator
const PackedCalc = ({ onSave, initialData, defaultGP }: { onSave: (data: CalculationItem) => void, initialData?: CalculationItem | null, defaultGP: number }) => {
    const [name, setName] = useState("");
    const [packSize, setPackSize] = useState("24");
    const [unitSize, setUnitSize] = useState("330ml");
    const [packCost, setPackCost] = useState("");
    const [gp, setGp] = useState("");
    const [currentPrice, setCurrentPrice] = useState("");

    useEffect(() => {
        if (initialData && initialData.type === "Packed") {
            setName(initialData.product || "");
            const d = initialData.details;
            if (d["Pack Size"]) setPackSize(d["Pack Size"]);
            if (d["Unit Size"]) setUnitSize(d["Unit Size"]);
            if (d["Pack Cost (Ex-VAT)"]) setPackCost(d["Pack Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));
            if (d["Current Sell Price"]) setCurrentPrice(d["Current Sell Price"].replace(/[£,]/g, ""));
        }
    }, [initialData]);

    useEffect(() => {
        setGp(defaultGP.toString());
    }, [defaultGP]);

    const [result, setResult] = useState<null | {
        unitCost: number;
        unitRRP: number;
        currentGP: number | null;
    }>(null);

    const calculate = () => {
        const prodName = name.trim() || "Packed Drink";
        const pSize = parseFloat(packSize) || 24;
        const pCost = parseFloat(packCost) || 0;
        const targetGp = parseFloat(gp);

        if (isNaN(targetGp) || isNaN(pCost) || pCost === 0) {
            alert("Please enter valid Pack Cost and Target GP.");
            return;
        }

        const unitCost = pCost / pSize;
        const rawRRP = (unitCost / (1 - targetGp / 100)) * 1.20;
        const unitRRP = smartRound(rawRRP);
        const currSell = parseFloat(currentPrice) || 0;
        let currentGP = null;
        if (currSell > 0) {
            const netSales = currSell / 1.2;
            currentGP = ((netSales - unitCost) / netSales) * 100;
        }

        setResult({ unitCost, unitRRP, currentGP });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Packed",
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "Pack Size": `${pSize}`,
                "Unit Size": unitSize,
                "Pack Cost (Ex-VAT)": `£${pCost.toFixed(2)}`,
                "Unit Cost (Ex-VAT)": `£${unitCost.toFixed(2)}`,
                "Target GP": `${targetGp}%`,
                "Recommended Price": `£${unitRRP.toFixed(2)}`,
                "Current Sell Price": currSell > 0 ? `£${currSell.toFixed(2)}` : "-",
                "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Product Details</h3>
                    <button
                        onClick={calculate}
                        className="bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
                    >
                        CALCULATE
                    </button>
                </div>
                <div className="space-y-4">
                    <InputField label="Product Name" value={name} onChange={setName} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SelectField label="Pack Size" value={packSize} onChange={setPackSize} options={["12", "24", "6", "8", "4"]} />
                        <SelectField label="Unit Size" value={unitSize} onChange={setUnitSize} options={["330ml", "500ml", "275ml", "200ml", "440ml"]} />
                        <InputField label="Pack Cost (Ex-VAT) £" value={packCost} onChange={setPackCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <InputField label="Current Unit Price (Inc-VAT)" value={currentPrice} onChange={setCurrentPrice} type="number" />
                    </div>
                </div>
            </div>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">Unit Cost: <strong>£{result.unitCost.toFixed(2)}</strong></p>

                    <div className="flex flex-col md:flex-row justify-center gap-8 mt-4 text-2xl font-bold text-slate-800">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Recommended Price</span>
                            <span>£{result.unitRRP.toFixed(2)}</span>
                            {result.currentGP !== null && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1">
                                    Target: {gp}%
                                </span>
                            )}
                        </div>
                        <div className="hidden md:block w-px bg-slate-200"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Current Price</span>
                            <span className={`${result.currentGP !== null ? "text-slate-600" : "text-slate-300"}`}>
                                {currentPrice ? `£${parseFloat(currentPrice).toFixed(2)}` : "-"}
                            </span>
                            {result.currentGP !== null && (
                                <span className={`text-xs px-2 py-1 rounded mt-1 ${result.currentGP < parseFloat(gp) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                    Actual: {result.currentGP.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 6. Upload / Batch CSV Calculator
const UploadCalc = ({ onSave, defaultGPs, sector, tier, onResultsChange }: {
    onSave: (data: CalculationItem) => void,
    defaultGPs: Record<string, number>,
    sector: string,
    tier: string,
    onResultsChange?: (results: UploadResult[], group: ProductGroup) => void,
}) => {
    const [group, setGroup] = useState<ProductGroup>("Wine");
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<UploadResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (f: File) => {
        if (!f.name.endsWith(".csv")) {
            setError("Please upload a .csv file");
            return;
        }
        setFile(f);
        setError(null);
        setResults([]);
    };

    const calculateAll = () => {
        if (!file) { setError("Please select a CSV file first."); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = parseCSV(text);
            if (rows.length === 0) { setError("CSV is empty or invalid. Please check the format."); return; }
            try {
                const calcResults = rows.map((row, idx) => calculateRow(row, group, defaultGPs, idx));
                setResults(calcResults);
                onResultsChange?.(calcResults, group);
                setError(null);
            } catch (err: any) {
                setError(`Error processing CSV: ${err.message || err}`);
            }
        };
        reader.readAsText(file);
    };

    const exportResults = () => {
        if (results.length === 0) return;
        const allKeys = new Set<string>();
        allKeys.add("Product");
        allKeys.add("Group");
        results.forEach(r => Object.keys(r.details).forEach(k => allKeys.add(k)));
        const headers = Array.from(allKeys);
        const csvRows = results.map(r => {
            return headers.map(h => {
                if (h === "Product") return r.product;
                if (h === "Group") return r.group;
                return (r.details[h] || "").replace(/,/g, "");
            });
        });
        downloadCSV(`gp_${group.toLowerCase().replace(/ /g, "_")}_results.csv`, headers, csvRows);
    };

    const addAllToHistory = () => {
        results.forEach(r => onSave(r.calculationItem));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Group Selection & Template */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" /> CSV Batch Upload
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-600">Product Group</label>
                        <select
                            value={group}
                            onChange={e => { setGroup(e.target.value as ProductGroup); setResults([]); setError(null); }}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-white"
                        >
                            {(["Draught", "Spirits", "Wine", "Soft Drinks", "Post Mix", "Packed", "Snacks"] as ProductGroup[]).map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => downloadTemplate(group)}
                        className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold text-sm py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                        <Download className="h-4 w-4" /> Download Template
                    </button>
                    <div className="text-xs text-slate-400">
                        <p>Using <strong>{sector} / {tier}</strong> GP targets.</p>
                        <p>Target GP for {group}: <strong>{defaultGPs[group]}%</strong></p>
                    </div>
                </div>
            </div>

            {/* File Upload Zone */}
            <div
                className={`bg-white p-8 rounded-xl shadow-sm border-2 border-dashed transition-colors text-center cursor-pointer
                    ${dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); }}
                onClick={() => document.getElementById("csv-file-input")?.click()}
            >
                <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={e => { if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]); }}
                />
                <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                {file ? (
                    <p className="text-slate-700 font-medium">{file.name} <span className="text-slate-400 text-sm">({(file.size / 1024).toFixed(1)} KB)</span></p>
                ) : (
                    <p className="text-slate-400">Drag & drop a CSV file here, or <span className="text-blue-500 font-medium">click to browse</span></p>
                )}
            </div>

            {/* Calculate Button */}
            <div className="flex gap-3">
                <button
                    onClick={calculateAll}
                    disabled={!file}
                    className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-lg transition-all shadow-lg
                        ${file ? "bg-slate-700 text-white hover:bg-slate-600 shadow-slate-200" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}
                >
                    CALCULATE ALL
                </button>
                {file && (
                    <button
                        onClick={() => { setFile(null); setResults([]); setError(null); const inp = document.getElementById("csv-file-input") as HTMLInputElement; if (inp) inp.value = ""; }}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 font-bold transition-colors"
                    >
                        CLEAR
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Results Table */}
            {results.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{results.length}</span>
                            {group} Products Calculated
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={addAllToHistory}
                                className="flex items-center gap-1 bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-3 w-3" /> ADD ALL TO HISTORY
                            </button>
                            <button
                                onClick={exportResults}
                                className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="h-3 w-3" /> EXPORT CSV
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1 bg-slate-600 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                PRINT
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider bg-slate-50">
                                    <th className="py-3 px-4 font-medium">Product</th>
                                    {group === "Draught" && (
                                        <>
                                            <th className="py-3 px-3 font-medium text-right">Cost</th>
                                            <th className="py-3 px-3 font-medium text-right">Rec Pint</th>
                                            <th className="py-3 px-3 font-medium text-right">Rec Half</th>
                                            <th className="py-3 px-3 font-medium text-right">Current</th>
                                            <th className="py-3 px-3 font-medium text-right">GP</th>
                                        </>
                                    )}
                                    {group === "Spirits" && (
                                        <>
                                            <th className="py-3 px-3 font-medium text-right">Cost</th>
                                            <th className="py-3 px-3 font-medium text-right">Rec 25ml</th>
                                            <th className="py-3 px-3 font-medium text-right">Rec 50ml</th>
                                            <th className="py-3 px-3 font-medium text-right">Current</th>
                                            <th className="py-3 px-3 font-medium text-right">GP</th>
                                        </>
                                    )}
                                    {group === "Wine" && (
                                        <>
                                            <th className="py-3 px-3 font-medium text-right">Cost</th>
                                            <th className="py-3 px-3 font-medium text-right">Bottle</th>
                                            <th className="py-3 px-3 font-medium text-right">250ml</th>
                                            <th className="py-3 px-3 font-medium text-right">175ml</th>
                                            <th className="py-3 px-3 font-medium text-right">125ml</th>
                                            <th className="py-3 px-3 font-medium text-right">GP</th>
                                        </>
                                    )}
                                    {group === "Soft Drinks" && (
                                        <>
                                            <th className="py-3 px-3 font-medium text-right">Unit Cost</th>
                                            <th className="py-3 px-3 font-medium text-right">Rec Price</th>
                                            <th className="py-3 px-3 font-medium text-right">Current</th>
                                            <th className="py-3 px-3 font-medium text-right">GP</th>
                                        </>
                                    )}
                                    {group === "Post Mix" && (
                                        <>
                                            <th className="py-3 px-3 font-medium text-right">Cost/100ml</th>
                                            <th className="py-3 px-3 font-medium text-right">Pint</th>
                                            <th className="py-3 px-3 font-medium text-right">Half</th>
                                            <th className="py-3 px-3 font-medium text-right">Current</th>
                                            <th className="py-3 px-3 font-medium text-right">GP</th>
                                        </>
                                    )}
                                    {group === "Packed" && (
                                        <>
                                            <th className="py-3 px-3 font-medium text-right">Unit Cost</th>
                                            <th className="py-3 px-3 font-medium text-right">Rec Price</th>
                                            <th className="py-3 px-3 font-medium text-right">Current</th>
                                            <th className="py-3 px-3 font-medium text-right">GP</th>
                                        </>
                                    )}
                                    {group === "Snacks" && (
                                        <>
                                            <th className="py-3 px-3 font-medium text-right">Unit Cost</th>
                                            <th className="py-3 px-3 font-medium text-right">Rec Price</th>
                                            <th className="py-3 px-3 font-medium text-right">Current</th>
                                            <th className="py-3 px-3 font-medium text-right">GP</th>
                                        </>
                                    )}
                                    <th className="py-3 px-3 font-medium text-center">+</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results.map((r, idx) => {
                                    const d = r.details;
                                    const gpClass = (gpStr: string, targetStr: string) => {
                                        if (gpStr === "-") return "text-slate-400";
                                        const gpValue = parseFloat(gpStr);
                                        const tValue = parseFloat(targetStr);
                                        return gpValue < tValue ? "text-red-600 font-bold" : "text-green-600 font-bold";
                                    };
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 font-bold text-slate-800">{r.product}</td>
                                            {group === "Draught" && (
                                                <>
                                                    <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">{d["Current Cost (Ex-VAT)"]}</td>
                                                    <td className="py-3 px-3 text-right font-bold text-blue-600">{d["Recommended Pint"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-600">{d["Recommended Half"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-500">{d["Current Pint Price (Inc)"]}</td>
                                                    <td className={`py-3 px-3 text-right text-xs ${gpClass(d["Current GP"], d["Target GP"])}`}>{d["Current GP"]}</td>
                                                </>
                                            )}
                                            {group === "Spirits" && (
                                                <>
                                                    <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">{d["New Bottle Cost (Ex-VAT)"]}</td>
                                                    <td className="py-3 px-3 text-right font-bold text-blue-600">{d["Recommended 25ml"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-600">{d["Recommended 50ml"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-500">{d["Current 25ml Price"]}</td>
                                                    <td className={`py-3 px-3 text-right text-xs ${gpClass(d["Current GP"], d["Target GP"])}`}>{d["Current GP"]}</td>
                                                </>
                                            )}
                                            {group === "Wine" && (
                                                <>
                                                    <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">{d["New Btl Cost (Ex-VAT)"]}</td>
                                                    <td className="py-3 px-3 text-right font-bold text-blue-600">{d["Recommended Bottle"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-600">{d["Recommended 250ml"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-600">{d["Recommended 175ml"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-600">{d["Recommended 125ml"]}</td>
                                                    <td className={`py-3 px-3 text-right text-xs ${gpClass(d["Current GP (Btl)"], d["Target GP"])}`}>{d["Current GP (Btl)"]}</td>
                                                </>
                                            )}
                                            {group === "Soft Drinks" && (
                                                <>
                                                    <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">{d["Unit Cost (Ex-VAT)"]}</td>
                                                    <td className="py-3 px-3 text-right font-bold text-blue-600">{d["Recommended Price"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-500">{d["Current Sell Price"]}</td>
                                                    <td className={`py-3 px-3 text-right text-xs ${gpClass(d["Current GP"], d["Target GP"])}`}>{d["Current GP"]}</td>
                                                </>
                                            )}
                                            {group === "Post Mix" && (
                                                <>
                                                    <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">{d["Cost per 100ml"] || "-"}</td>
                                                    <td className="py-3 px-3 text-right font-bold text-blue-600">{d["Recommended Pint"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-600">{d["Recommended Half"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-500">{d["Current Price"]} ({d["Current Price Unit"]})</td>
                                                    <td className={`py-3 px-3 text-right text-xs ${gpClass(d["Current GP"], d["Target GP"])}`}>{d["Current GP"]}</td>
                                                </>
                                            )}
                                            {group === "Packed" && (
                                                <>
                                                    <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">{d["Unit Cost (Ex-VAT)"]}</td>
                                                    <td className="py-3 px-3 text-right font-bold text-blue-600">{d["Recommended Price"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-500">{d["Current Sell Price"]}</td>
                                                    <td className={`py-3 px-3 text-right text-xs ${gpClass(d["Current GP"], d["Target GP"])}`}>{d["Current GP"]}</td>
                                                </>
                                            )}
                                            {group === "Snacks" && (
                                                <>
                                                    <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">{d["Unit Cost (Ex-VAT)"]}</td>
                                                    <td className="py-3 px-3 text-right font-bold text-blue-600">{d["Recommended Price"]}</td>
                                                    <td className="py-3 px-3 text-right text-slate-500">{d["Current Sell Price"]}</td>
                                                    <td className={`py-3 px-3 text-right text-xs ${gpClass(d["Current GP"], d["Target GP"])}`}>{d["Current GP"]}</td>
                                                </>
                                            )}
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    onClick={() => onSave(r.calculationItem)}
                                                    className="text-slate-400 hover:text-green-600 transition-colors"
                                                    title="Add to Session History"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Row Calculator for Upload ---

const calculateRow = (row: Record<string, string>, group: ProductGroup, defaultGPs: Record<string, number>, idx: number): UploadResult => {
    const prodName = row["Product Name"]?.trim() || `Product ${idx + 1}`;
    const getNum = (key: string, fallback?: number) => {
        const v = parseFloat(row[key]?.replace(/[£%,]/g, "") || "");
        return isNaN(v) ? (fallback ?? 0) : v;
    };

    if (group === "Draught") {
        const sizeStr = row["Size"]?.trim() || "11 Gal";
        const basis = row["Basis"]?.trim() || "Per Barrel";
        const currCost = getNum("Cost Ex-VAT");
        const targetGp = getNum("Target GP", defaultGPs["Draught"]);
        const hPrem = getNum("Half Surcharge", 0.10);
        const currSell = getNum("Current Pint Price");
        const incType = row["Increase Type"]?.trim() || "";
        const incVal = getNum("Increase Value");
        const extraDuty = getNum("Extra Duty");

        const ullage = getNum("Ullage", 0);
        if (currCost === 0) throw new Error(`Row ${idx + 1} (${prodName}): Cost is required`);

        let gals = 0;
        if (sizeStr.includes("Gal")) gals = parseFloat(sizeStr.split(" ")[0]);
        else if (sizeStr === "20 Ltr") gals = 20 / 4.546;
        else if (sizeStr === "30 Ltr") gals = 30 / 4.546;
        else if (sizeStr === "50 Ltr") gals = 50 / 4.546;
        const pints = ((gals * 4.546 * 1000) / 568) * (1 - ullage / 100);
        const totalCost = basis === "Per Barrel" ? currCost : currCost * gals;

        let increaseAmt = 0;
        if (incType === "Percentage (%)") increaseAmt = totalCost * (incVal / 100);
        else if (incType === "Fixed £ Barrel") increaseAmt = incVal;
        else if (incVal > 0) increaseAmt = incVal;

        const dutyTotal = basis === "Per Barrel" ? extraDuty : extraDuty * gals;
        const forecastTotal = totalCost + increaseAmt + dutyTotal;
        const rawPintPrice = ((forecastTotal / pints) / (1 - targetGp / 100)) * 1.20;
        const recommPint = smartRound(rawPintPrice);
        const recomm16oz = smartRound((rawPintPrice / 568) * 454);
        const recomm12oz = smartRound((rawPintPrice / 568) * 341);
        const recommHalf = smartRound((recommPint / 2) + hPrem);
        const recommDash = smartRound((rawPintPrice / 568) * 50);

        let currentGP: number | null = null;
        if (currSell > 0) {
            const costPerPint = forecastTotal / pints;
            const netSales = currSell / 1.2;
            currentGP = ((netSales - costPerPint) / netSales) * 100;
        }

        const details: Record<string, string> = {
            "Unit Size": sizeStr,
            "Ullage (%)": `${ullage}%`,
            "Cost Basis": basis,
            "Current Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
            "Target GP": `${targetGp}%`,
            "Half Surcharge": `£${hPrem.toFixed(2)}`,
            "Forecast Increase Type": incType || "-",
            "Forecast Increase Value": incVal ? `${incVal}` : "-",
            "Forecast Increase Amount": `£${increaseAmt.toFixed(2)}`,
            "Extra Duty (Ex-VAT)": `£${dutyTotal.toFixed(2)}`,
            "New Total Cost (Ex-VAT)": `£${forecastTotal.toFixed(2)}`,
            "Current Pint Price (Inc)": currSell > 0 ? `£${currSell.toFixed(2)}` : "-",
            "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
            "Recommended Pint": `£${recommPint.toFixed(2)}`,
            "Recommended Half": `£${recommHalf.toFixed(2)}`,
        };

        return {
            product: prodName, group, details,
            calculationItem: { id: `${Date.now()}-${idx}`, type: "Draught", product: prodName, timestamp: new Date().toISOString(), details },
        };
    }

    if (group === "Spirits") {
        const sizeStr = row["Size"]?.trim() || "70cl";
        let currCost = getNum("Cost Ex-VAT");
        const targetGp = getNum("Target GP", defaultGPs["Spirits"]);
        const curr25 = getNum("Current 25ml Price");
        const incType = row["Increase Type"]?.trim() || "";
        const incVal = getNum("Increase Value");

        if (currCost === 0) throw new Error(`Row ${idx + 1} (${prodName}): Cost is required`);

        const origCost = currCost;
        if (incType === "Percentage (%)") currCost *= (1 + incVal / 100);
        else if (incVal > 0) currCost += incVal;

        const cl = parseFloat(sizeStr.replace("cl", ""));
        const mlTotal = cl * 10;
        const cost25 = (currCost / mlTotal) * 25;
        const sale25 = smartRound((cost25 / (1 - targetGp / 100)) * 1.20);
        const sale50 = sale25 * 2;

        let currentGP: number | null = null;
        if (curr25 > 0) {
            const netSales25 = curr25 / 1.2;
            currentGP = ((netSales25 - cost25) / netSales25) * 100;
        }

        const details: Record<string, string> = {
            "Bottle Size": sizeStr,
            "Current Btl Cost (Ex-VAT)": `£${origCost.toFixed(2)}`,
            "Target GP": `${targetGp}%`, "Increase Type": incType || "-", "Increase Value": incVal ? `${incVal}` : "-",
            "New Bottle Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
            "Current 25ml Price": curr25 > 0 ? `£${curr25.toFixed(2)}` : "-",
            "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
            "Recommended 25ml": `£${sale25.toFixed(2)}`,
            "Recommended 35ml": `£${(sale25 / 25 * 35).toFixed(2)}`,
            "Recommended 50ml": `£${sale50.toFixed(2)}`,
        };

        return {
            product: prodName, group, details,
            calculationItem: { id: `${Date.now()}-${idx}`, type: "Spirits", product: prodName, timestamp: new Date().toISOString(), details },
        };
    }

    if (group === "Wine") {
        let currCost = getNum("Cost Ex-VAT");
        const targetGp = getNum("Target GP", defaultGPs["Wine"]);
        const currBtl = getNum("Current Bottle Price");
        const curr250 = getNum("Current 250ml");
        const curr175 = getNum("Current 175ml");
        const curr125 = getNum("Current 125ml");
        const incType = row["Increase Type"]?.trim() || "";
        const incVal = getNum("Increase Value");

        if (currCost === 0) throw new Error(`Row ${idx + 1} (${prodName}): Cost is required`);

        const origCost = currCost;
        if (incType === "Percentage (%)") currCost *= (1 + incVal / 100);
        else if (incVal > 0) currCost += incVal;

        const btlPrice = smartRound((currCost / (1 - targetGp / 100)) * 1.20);
        const costPerMl = currCost / 750;
        const m250 = smartRound((costPerMl * 250 / (1 - targetGp / 100)) * 1.20);
        const m175 = smartRound((costPerMl * 175 / (1 - (targetGp + 2) / 100)) * 1.20);
        const m125 = smartRound((costPerMl * 125 / (1 - (targetGp + 4) / 100)) * 1.20);

        let currentGP: number | null = null;
        if (currBtl > 0) {
            const netSalesBtl = currBtl / 1.2;
            currentGP = ((netSalesBtl - currCost) / netSalesBtl) * 100;
        }

        const details: Record<string, string> = {
            "Current Btl Cost (Ex-VAT)": `£${origCost.toFixed(2)}`,
            "Target GP": `${targetGp}%`, "Increase Type": incType || "-", "Increase Value": incVal ? `${incVal}` : "-",
            "New Btl Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
            "Current Bottle Price": currBtl > 0 ? `£${currBtl.toFixed(2)}` : "-",
            "Current 250ml Price": curr250 > 0 ? `£${curr250.toFixed(2)}` : "-",
            "Current 175ml Price": curr175 > 0 ? `£${curr175.toFixed(2)}` : "-",
            "Current 125ml Price": curr125 > 0 ? `£${curr125.toFixed(2)}` : "-",
            "Current GP (Btl)": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
            "Recommended Bottle": `£${btlPrice.toFixed(2)}`,
            "Recommended 250ml": `£${m250.toFixed(2)}`,
            "Recommended 175ml": `£${m175.toFixed(2)}`,
            "Recommended 125ml": `£${m125.toFixed(2)}`,
        };

        return {
            product: prodName, group, details,
            calculationItem: { id: `${Date.now()}-${idx}`, type: "Wine", product: prodName, timestamp: new Date().toISOString(), details },
        };
    }

    if (group === "Soft Drinks") {
        const cSize = getNum("Case Size", 24);
        const unitSize = row["Unit Size"]?.trim() || "330ml";
        const cCost = getNum("Case Cost Ex-VAT");
        const targetGp = getNum("Target GP", defaultGPs["Soft Drinks"]);
        const currSell = getNum("Current Price");

        if (cCost === 0) throw new Error(`Row ${idx + 1} (${prodName}): Case Cost is required`);

        const unitCost = cCost / cSize;
        const rawRRP = (unitCost / (1 - targetGp / 100)) * 1.20;
        const unitRRP = smartRound(rawRRP);

        let currentGP: number | null = null;
        if (currSell > 0) {
            const netSales = currSell / 1.2;
            currentGP = ((netSales - unitCost) / netSales) * 100;
        }

        const details: Record<string, string> = {
            "Case Size": `${cSize}`, "Unit Size": unitSize,
            "Case Cost (Ex-VAT)": `£${cCost.toFixed(2)}`,
            "Unit Cost (Ex-VAT)": `£${unitCost.toFixed(2)}`,
            "Target GP": `${targetGp}%`,
            "Recommended Price": `£${unitRRP.toFixed(2)}`,
            "Current Sell Price": currSell > 0 ? `£${currSell.toFixed(2)}` : "-",
            "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
        };

        return {
            product: prodName, group, details,
            calculationItem: { id: `${Date.now()}-${idx}`, type: "Soft Drinks" as any, product: prodName, timestamp: new Date().toISOString(), details },
        };
    }

    if (group === "Packed") {
        const pSize = getNum("Pack Size", 24);
        const unitSize = row["Unit Size"]?.trim() || "330ml";
        const pCost = getNum("Pack Cost Ex-VAT");
        const targetGp = getNum("Target GP", defaultGPs["Packed"]);
        const currSell = getNum("Current Price");

        if (pCost === 0) throw new Error(`Row ${idx + 1} (${prodName}): Pack Cost is required`);

        const unitCost = pCost / pSize;
        const rawRRP = (unitCost / (1 - targetGp / 100)) * 1.20;
        const unitRRP = smartRound(rawRRP);

        let currentGP: number | null = null;
        if (currSell > 0) {
            const netSales = currSell / 1.2;
            currentGP = ((netSales - unitCost) / netSales) * 100;
        }

        const details: Record<string, string> = {
            "Pack Size": `${pSize}`, "Unit Size": unitSize,
            "Pack Cost (Ex-VAT)": `£${pCost.toFixed(2)}`,
            "Unit Cost (Ex-VAT)": `£${unitCost.toFixed(2)}`,
            "Target GP": `${targetGp}%`,
            "Recommended Price": `£${unitRRP.toFixed(2)}`,
            "Current Sell Price": currSell > 0 ? `£${currSell.toFixed(2)}` : "-",
            "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
        };

        return {
            product: prodName, group, details,
            calculationItem: { id: `${Date.now()}-${idx}`, type: "Packed", product: prodName, timestamp: new Date().toISOString(), details },
        };
    }

    if (group === "Snacks") {
        const pSize = getNum("Pack Size", 24);
        const cat = row["Category"]?.trim() || "Standard Crisps";
        const pCost = getNum("Pack Cost Ex-VAT");
        const targetGp = getNum("Target GP", defaultGPs["Snacks"]);
        const currSell = getNum("Current Price");

        if (pCost === 0) throw new Error(`Row ${idx + 1} (${prodName}): Pack Cost is required`);

        const unitCost = pCost / pSize;
        const rawRRP = (unitCost / (1 - targetGp / 100)) * 1.20;
        const unitRRP = smartRound(rawRRP);

        let currentGP: number | null = null;
        if (currSell > 0) {
            const netSales = currSell / 1.2;
            currentGP = ((netSales - unitCost) / netSales) * 100;
        }

        const details: Record<string, string> = {
            "Category": cat, "Pack Size": `${pSize}`,
            "Pack Cost (Ex-VAT)": `£${pCost.toFixed(2)}`,
            "Unit Cost (Ex-VAT)": `£${unitCost.toFixed(2)}`,
            "Target GP": `${targetGp}%`,
            "Recommended Price": `£${unitRRP.toFixed(2)}`,
            "Current Sell Price": currSell > 0 ? `£${currSell.toFixed(2)}` : "-",
            "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
        };

        return {
            product: prodName, group, details,
            calculationItem: { id: `${Date.now()}-${idx}`, type: "Snacks", product: prodName, timestamp: new Date().toISOString(), details },
        };
    }

    // Post Mix
    const sizeL = getNum("BIB Size Litres", 7);
    const cost = getNum("BIB Cost Ex-VAT");
    const r = getNum("Ratio", 5);
    const targetGp = getNum("Target GP", defaultGPs["Post Mix"]);
    const currPint = getNum("Current Pint Price");

    if (cost === 0) throw new Error(`Row ${idx + 1} (${prodName}): BIB Cost is required`);

    const totalLiquidMl = sizeL * (r + 1) * 1000;
    const costPerMl = cost / totalLiquidMl;
    const calcPrice = (ml: number) => smartRound(((costPerMl * ml) / (1 - targetGp / 100)) * 1.20);
    const pPint = calcPrice(568);
    const p16oz = calcPrice(454);
    const p12oz = calcPrice(341);
    const pHalf = calcPrice(284);
    const pDash = calcPrice(50);

    let currentGP: number | null = null;
    if (currPint > 0) {
        const netSalesPint = currPint / 1.2;
        const costPint = costPerMl * 568;
        currentGP = ((netSalesPint - costPint) / netSalesPint) * 100;
    }

    const details: Record<string, string> = {
        "BIB Size (Litres)": `${sizeL}`,
        "BIB Cost (Ex-VAT)": `£${cost.toFixed(2)}`,
        "Dilution Ratio": `${r}:1`,
        "Target GP": `${targetGp}%`,
        "Cost per 100ml": `£${(costPerMl * 100).toFixed(3)}`,
        "Recommended Pint": `£${pPint.toFixed(2)}`,
        "Recommended 16oz": `£${p16oz.toFixed(2)}`,
        "Recommended 12oz": `£${p12oz.toFixed(2)}`,
        "Recommended Half": `£${pHalf.toFixed(2)}`,
        "Recommended Dash": `£${pDash.toFixed(2)}`,
        "Current Price": currPint > 0 ? `£${currPint.toFixed(2)}` : "-",
        "Current Price Unit": "Pint",
        "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
    };

    return {
        product: prodName, group, details,
        calculationItem: { id: `${Date.now()}-${idx}`, type: "Post Mix" as any, product: prodName, timestamp: new Date().toISOString(), details },
    };
};

// --- Reusable UI Helpers ---

// --- Sub-Components ---
// (Defining sub-calculators inside so they have access to state if needed, but they are defined globally now)

// Moved InputField and SelectField to global scope above calculators.

// --- Main Page Component ---

export default function GPCalculatorPage() {
    const [activeTab, setActiveTab] = useState<"Instructions" | "Draught" | "Spirits" | "Wine" | "Soft Drinks" | "Post Mix" | "Packed" | "Snacks" | "Upload">("Instructions");

    // Global Settings
    const [sector, setSector] = useState<Sector>("Pub");
    const [tier, setTier] = useState<Tier>("Mid");

    const [history, setHistory] = useState<CalculationItem[]>([]);
    const [itemToLoad, setItemToLoad] = useState<CalculationItem | null>(null);

    const currentGlobalTarget = GPTargets[sector][tier];
    const [showRates, setShowRates] = useState(false);

    // Upload results state (lifted for print access)
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [uploadGroup, setUploadGroup] = useState<ProductGroup>("Wine");

    // Pro mode detection via URL param (?pro=1)
    const [isPro, setIsPro] = useState(false);
    const [showProModal, setShowProModal] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("pro") === "1") setIsPro(true);
    }, []);

    // Load history from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("gp_calc_history");
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("gp_calc_history", JSON.stringify(history));
    }, [history]);

    const addToHistory = (item: CalculationItem) => {
        setHistory(prev => [item, ...prev]);
    };

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear all history?")) {
            setHistory([]);
        }
    };

    const printHistory = () => {
        window.print();
    };

    const loadItem = (item: CalculationItem) => {
        setActiveTab(item.type);
        setItemToLoad(item);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Helper: Only pass loaded item if it matches the current calculator type
    const getInitialData = (type: string) => {
        return itemToLoad && itemToLoad.type === type ? itemToLoad : null;
    };

    return (
        <div className="min-h-screen bg-[#f5f5f7] font-sans pb-20">
            <Head>
                <title>GP Calculator Pro | Whole Hospitality</title>
            </Head>

            <Header />

            {/* Global Settings Bar */}
            <div className="bg-slate-800 text-white p-4 sticky top-0 z-20 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                        <span className="font-bold text-slate-300 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                            Venue Profile:
                        </span>

                        <div className="flex items-center gap-2">
                            <select
                                value={sector}
                                onChange={e => setSector(e.target.value as Sector)}
                                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="Pub">Pub</option>
                                <option value="Hotel">Hotel</option>
                            </select>
                            <span className="text-slate-500">/</span>
                            <select
                                value={tier}
                                onChange={e => setTier(e.target.value as Tier)}
                                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="Low">Low (High Vol)</option>
                                <option value="Mid">Mid-Market</option>
                                <option value="High">Premium</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50 relative">
                        <span className="text-sm font-medium text-slate-400">Target GP:</span>
                        <span className="text-2xl font-bold text-green-400">
                            {/* Average or Range? Let's show a "View" button instead of single number since it varies */}
                            <button onClick={() => setShowRates(!showRates)} className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white transition-colors">
                                View Rates
                            </button>
                        </span>
                        {showRates && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Target GP Rates ({sector} - {tier})</h4>
                                <div className="space-y-2 text-sm">
                                    {Object.entries(currentGlobalTarget).map(([cat, val]) => (
                                        <div key={cat} className="flex justify-between items-center">
                                            <span className="font-medium">{cat}</span>
                                            <span className="font-bold text-green-600">{val}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="print:hidden max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* Left Column: Calculator */}
                <div className="flex-1 space-y-6">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 md:gap-4 p-1 bg-white rounded-xl shadow-sm border border-gray-200">
                        {["Instructions", "Draught", "Spirits", "Wine", "Soft Drinks", "Packed", "Snacks", "Post Mix", "Upload"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    if (tab === "Upload" && !isPro) {
                                        setShowProModal(true);
                                        return;
                                    }
                                    setActiveTab(tab as any);
                                }}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                    ? "bg-slate-700 text-white shadow-md"
                                    : "text-slate-500 hover:bg-gray-50"
                                    } ${tab === "Upload" && !isPro ? "relative" : ""}`}
                            >
                                {tab}
                                {tab === "Upload" && !isPro && (
                                    <span className="ml-1 text-[10px] bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full font-bold uppercase">Pro</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[500px]">
                        {activeTab === "Instructions" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Welcome Card */}
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Zap className="h-32 w-32 text-white" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/30">
                                                <Info className="h-8 w-8" />
                                            </div>
                                            <h2 className="text-3xl font-bold text-white tracking-tight">GP Calculator <span className="text-blue-400">Pro</span></h2>
                                        </div>
                                        <p className="text-slate-300 text-xl leading-relaxed max-w-2xl">
                                            The industry-standard tool for hospitality operators to calculate perfect margins, forecast price hikes, and protect their profit.
                                        </p>
                                        <div className="mt-8 flex gap-4">
                                            <div className="bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600/50 text-slate-400 text-sm flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                Live Calculation Engine
                                            </div>
                                            <div className="bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600/50 text-slate-400 text-sm flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                VAT Compliant
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Golden Rules Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-3 text-amber-800">
                                            <AlertTriangle className="h-5 w-5" />
                                            <h3 className="font-bold text-lg">Rule #1: Net Figures</h3>
                                        </div>
                                        <p className="text-amber-900/80">
                                            All cost prices must be entered <strong>EX-VAT</strong> (Invoice price). The calculator handles all VAT logic for your sell prices automatically.
                                        </p>
                                    </div>
                                    <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-3 text-indigo-800">
                                            <Zap className="h-5 w-5" />
                                            <h3 className="font-bold text-lg">Rule #2: Smart Rounding</h3>
                                        </div>
                                        <p className="text-indigo-900/80">
                                            Sell prices are automatically rounded up to the nearest 10p. This subtle shift helps protect your GP against minor fluctuations.
                                        </p>
                                    </div>
                                </div>

                                {/* Category breakdown */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <ShoppingBag className="h-5 w-5 text-slate-500" />
                                            Product Categories
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        <div className="p-6 flex gap-4">
                                            <div className="h-10 w-10 shrink-0 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                                <Beer className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">Draught & Post Mix</h4>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Features an <strong>Ullage Slider</strong> (0-10%) to account for waste. Post Mix includes standard ratios for Cola, Lemonade, and Tonic.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6 flex gap-4">
                                            <div className="h-10 w-10 shrink-0 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                                <Coffee className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">Spirits & Soft Drinks</h4>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Calculates margins for 25ml, 35ml, and 50ml spirits measures. Soft drinks handle case and individual unit costs.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6 flex gap-4">
                                            <div className="h-10 w-10 shrink-0 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                                <WineIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">Wine & Packed Products</h4>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Standard 125/175/250ml wine measures. <strong>Packed Products</strong> is perfect for cases of bottles, cans, or snacks.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pro Tips & Footer Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                                            <Percent className="h-4 w-4" />
                                            Price Hikes
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Use 'Forecast Increase' to see the impact of supplier price rises before they hit your invoices.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                                            <FileText className="h-4 w-4" />
                                            Auto-Save
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            All calculations are saved to your Session History in the sidebar for quick editing.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                                            <Printer className="h-4 w-4" />
                                            Print Reports
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Use 'Quick Print' to generate a professional PDF report of your current session calculations.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveTab("Draught")}
                                    className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors shadow-lg"
                                >
                                    Get Started
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {activeTab === "Draught" && <DraughtCalc onSave={addToHistory} initialData={getInitialData("Draught")} defaultGP={currentGlobalTarget["Draught"]} />}
                        {activeTab === "Spirits" && <SpiritsCalc onSave={addToHistory} initialData={getInitialData("Spirits")} defaultGP={currentGlobalTarget["Spirits"]} />}
                        {activeTab === "Wine" && <WineCalc onSave={addToHistory} initialData={getInitialData("Wine")} defaultGP={currentGlobalTarget["Wine"]} />}
                        {activeTab === "Soft Drinks" && <SoftDrinksCalc onSave={addToHistory} initialData={getInitialData("Soft Drinks")} defaultGP={currentGlobalTarget["Soft Drinks"]} />}
                        {activeTab === "Post Mix" && <PostMixCalc onSave={addToHistory} initialData={getInitialData("Post Mix")} defaultGP={currentGlobalTarget["Post Mix"]} />}
                        {activeTab === "Packed" && <PackedCalc onSave={addToHistory} initialData={getInitialData("Packed")} defaultGP={currentGlobalTarget["Packed"]} />}
                        {activeTab === "Snacks" && <SnacksCalc onSave={addToHistory} initialData={getInitialData("Snacks")} defaultGP={currentGlobalTarget["Snacks"]} />}
                        {activeTab === "Upload" && <UploadCalc onSave={addToHistory} defaultGPs={currentGlobalTarget} sector={sector} tier={tier} onResultsChange={(results, group) => { setUploadResults(results); setUploadGroup(group); }} />}
                    </div>
                </div>

                {/* Right Column: Sidebar / History */}
                <aside className="w-full lg:w-96 flex flex-col gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[800px]">
                        <div className="bg-slate-100 p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">SESSION HISTORY</h3>
                            <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">{history.length} Saved</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[300px]">
                            {history.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 italic">
                                    No calculations saved yet.
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <span className="font-bold text-slate-800 mr-2">{item.product}</span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1 rounded">{item.type}</span>
                                            </div>
                                            <button
                                                onClick={() => loadItem(item)}
                                                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                                title="Load into Calculator"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="text-slate-500 text-xs space-y-1">
                                            {/* Smart Display based on Type */}
                                            {(() => {
                                                const d = item.details;
                                                const fields = [];

                                                if (item.type === "Draught") {
                                                    fields.push(["Rec Pint", d["Recommended Pint"]]);
                                                    fields.push(["Rec Half", d["Recommended Half"]]);
                                                    fields.push(["Target GP", d["Target GP"]]);
                                                    if (d["Current GP"]) fields.push(["Actual GP", d["Current GP"]]);
                                                } else if (item.type === "Spirits") {
                                                    fields.push(["Rec 25ml", d["Recommended 25ml"]]);
                                                    fields.push(["Rec 50ml", d["Recommended 50ml"]]);
                                                    fields.push(["Target GP", d["Target GP"]]);
                                                    if (d["Current GP"]) fields.push(["Actual GP", d["Current GP"]]);
                                                } else if (item.type === "Wine") {
                                                    fields.push(["Rec Bottle", d["Recommended Bottle"]]);
                                                    fields.push(["Rec 250ml", d["Recommended 250ml"]]);
                                                    fields.push(["Rec 175ml", d["Recommended 175ml"]]);
                                                    fields.push(["Rec 125ml", d["Recommended 125ml"]]);
                                                    fields.push(["Target GP", d["Target GP"]]);
                                                } else if (item.type === "Soft Drinks") {
                                                    fields.push(["Rec Price", d["Recommended Price"]]);
                                                    fields.push(["Target GP", d["Target GP"]]);
                                                    if (d["Current GP"]) fields.push(["Actual GP", d["Current GP"]]);
                                                } else if (item.type === "Post Mix") {
                                                    fields.push(["Rec Pint", d["Recommended Pint"]]);
                                                    fields.push(["Rec 16oz", d["Recommended 16oz"]]);
                                                    fields.push(["Rec 12oz", d["Recommended 12oz"]]);
                                                    fields.push(["Rec Half", d["Recommended Half"]]);
                                                    fields.push(["Rec Dash", d["Recommended Dash"]]);
                                                    fields.push(["Target GP", d["Target GP"]]);
                                                    if (d["Current GP"]) fields.push(["Actual GP", d["Current GP"]]);
                                                } else if (item.type === "Packed") {
                                                    fields.push(["Rec Price", d["Recommended Price"]]);
                                                    fields.push(["Target GP", d["Target GP"]]);
                                                    if (d["Current GP"]) fields.push(["Actual GP", d["Current GP"]]);
                                                } else if (item.type === "Snacks") {
                                                    fields.push(["Rec Price", d["Recommended Price"]]);
                                                    fields.push(["Target GP", d["Target GP"]]);
                                                    if (d["Current GP"]) fields.push(["Actual GP", d["Current GP"]]);
                                                }

                                                return fields.map(([k, v]) => (
                                                    <div key={k} className="flex justify-between">
                                                        <span>{k}:</span>
                                                        <span className="font-medium text-slate-700">{v}</span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white grid gap-3">
                            <button
                                onClick={printHistory}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                PRINT REPORT
                            </button>
                            <button
                                onClick={() => exportHistoryToCSV(history)}
                                disabled={history.length === 0}
                                className={`w-full flex items-center justify-center gap-2 font-bold py-2 rounded-lg transition ${history.length > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            >
                                <Download className="h-4 w-4" /> EXPORT CSV
                            </button>
                            <button
                                onClick={clearHistory}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-slate-600 font-bold py-2 rounded-lg hover:bg-gray-50 transition"
                            >
                                CLEAR HISTORY
                            </button>
                        </div>
                    </div>
                </aside>

            </main>



            {/* Hidden Print Area - Reality Check Report */}
            <div className="hidden print:block bg-white text-black absolute top-0 left-0 w-full min-h-screen z-[9999] p-8">
                {/* Header */}
                <div className="flex justify-between items-start border-b-4 border-slate-800 pb-6 mb-8">
                    <div className="flex items-center gap-6">
                        {/* Logo Placeholder - assuming logo.png exists, else text */}
                        <div className="relative h-20 w-20 grayscale">
                            <img src="/logo.png" alt="Whole Hospitality" className="object-contain h-full w-full" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black uppercase tracking-tight text-slate-900">GP Report</h1>
                            <p className="text-xl text-slate-500 font-medium tracking-widest uppercase mt-1">Profitability & Pricing</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block bg-slate-100 rounded-lg p-4 border border-slate-200">
                            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Venue Profile</div>
                            <div className="text-2xl font-bold text-slate-900">{sector} <span className="text-slate-300">|</span> {tier}</div>
                            <div className="text-sm text-slate-600 font-medium mt-1">
                                <div className="text-xs font-bold mb-1">Target GP Rates:</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    {Object.entries(currentGlobalTarget).map(([k, v]) => (
                                        <div key={k} className="flex justify-between w-24">
                                            <span>{k}:</span>
                                            <span className="font-bold">{v}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-mono">Generated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Content - Grouped by Type */}
                <div className="space-y-10">
                    {["Draught", "Spirits", "Wine", "Soft Drinks", "Packed", "Snacks", "Post Mix"].map(type => {
                        const items = history.filter(h => h.type === type);
                        if (items.length === 0) return null;

                        return (
                            <div key={type} className="break-inside-avoid">
                                <h3 className="text-2xl font-black text-slate-800 uppercase border-b-2 border-slate-200 mb-4 pb-2 flex justify-between items-end">
                                    {type}
                                    <span className="text-xs font-normal text-slate-400 mb-1">Ex-VAT Costs / Inc-VAT Prices</span>
                                </h3>

                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                                            <th className="py-2 font-medium">Product</th>
                                            <th className="py-2 font-medium">Measure</th>
                                            <th className="py-2 font-medium text-right">Cost (Ex)</th>
                                            <th className="py-2 font-medium text-right">Target GP</th>
                                            <th className="py-2 font-medium text-right">Current (Inc)</th>
                                            <th className="py-2 font-medium text-right text-blue-600">Rec (Inc)</th>
                                            <th className="py-2 font-medium text-right">Var</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map(item => {
                                            const d = item.details;
                                            const type = item.type;
                                            type ReportRow = { measure: string, rec: string, curr: string, cost: string, variance: string, varClass: string };
                                            const rows: ReportRow[] = [];

                                            // Helper to push row
                                            const addReportRow = (measure: string, rec: string, curr: string, cost: string) => {
                                                // Calc Variance
                                                let variance = "-";
                                                let varClass = "text-slate-400";
                                                if (curr && rec && curr !== "-" && rec !== "-") {
                                                    const c = parseFloat(curr.replace(/[£,]/g, ""));
                                                    const r = parseFloat(rec.replace(/[£,]/g, ""));
                                                    const v = r - c;
                                                    if (!isNaN(v)) {
                                                        variance = `${v > 0 ? "+" : ""}£${v.toFixed(2)}`;
                                                        varClass = v > 0 ? "text-green-600 font-bold" : (v < 0 ? "text-red-500" : "text-slate-400");
                                                    }
                                                }
                                                rows.push({ measure, rec, curr, cost, variance, varClass });
                                            };

                                            if (type === "Packed" || type === "Snacks") {
                                                addReportRow(d["Unit Size"] || "Unit", d["Recommended Price"], d["Current Sell Price"], d["Unit Cost (Ex-VAT)"]);
                                            }

                                            const getMetadata = () => {
                                                const meta = [];
                                                if (type === "Draught") {
                                                    meta.push(`Size: ${d["Unit Size"]}`);
                                                    meta.push(`Basis: ${d["Cost Basis"]}`);
                                                    const wastage = d["Ullage (%)"] || d["Ullage"];
                                                    if (wastage && wastage !== "0%") meta.push(`Wastage: ${wastage}`);
                                                    if (d["Forecast Increase Amount"] !== "£0.00") meta.push(`Inc: ${d["Forecast Increase Amount"]}`);
                                                } else if (type === "Spirits") {
                                                    meta.push(`Size: ${d["Bottle Size"]}`);
                                                    if (d["Increase Value"] && d["Increase Value"] !== "0") meta.push(`Inc: ${d["Increase Value"]}${d["Increase Type"] === "Percentage (%)" ? "%" : ""}`);
                                                } else if (type === "Wine") {
                                                    if (d["Increase Value"] && d["Increase Value"] !== "0") meta.push(`Inc: ${d["Increase Value"]}${d["Increase Type"] === "Percentage (%)" ? "%" : ""}`);
                                                } else if (type === "Soft Drinks") {
                                                    meta.push(`Case: ${d["Case Size"]}`);
                                                    meta.push(`Unit: ${d["Unit Size"]}`);
                                                } else if (type === "Post Mix") {
                                                    meta.push(`BIB: ${d["BIB Size (Litres)"]}L`);
                                                    meta.push(`Ratio: ${d["Dilution Ratio"]}`);
                                                } else if (type === "Packed" || type === "Snacks") {
                                                    if (d["Pack Size"]) meta.push(`Pack: ${d["Pack Size"]}`);
                                                    if (d["Unit Size"]) meta.push(`Unit: ${d["Unit Size"]}`);
                                                    if (d["Category"]) meta.push(`Cat: ${d["Category"]}`);
                                                }
                                                return meta.join(" | ");
                                            };

                                            if (type === "Draught") {
                                                addReportRow("Pint", d["Recommended Pint"], d["Current Pint Price (Inc)"], d["New Total Cost (Ex-VAT)"]);
                                                addReportRow("Half", d["Recommended Half"], "-", d["Half Surcharge"] && d["Half Surcharge"] !== "£0.00" ? `Sur: ${d["Half Surcharge"]}` : "-");
                                            } else if (type === "Spirits") {
                                                addReportRow("25ml", d["Recommended 25ml"], d["Current 25ml Price"], d["New Bottle Cost (Ex-VAT)"]);
                                                addReportRow("50ml", d["Recommended 50ml"], "-", "-");
                                            } else if (type === "Wine") {
                                                addReportRow("Bottle", d["Recommended Bottle"], d["Current Bottle Price"], d["New Btl Cost (Ex-VAT)"]);
                                                addReportRow("250ml", d["Recommended 250ml"], d["Current 250ml Price"], "-");
                                                addReportRow("175ml", d["Recommended 175ml"], d["Current 175ml Price"], "-");
                                                addReportRow("125ml", d["Recommended 125ml"], d["Current 125ml Price"], "-");
                                            } else if (type === "Soft Drinks") {
                                                addReportRow(d["Unit Size"] || "Unit", d["Recommended Price"], d["Current Sell Price"], d["Unit Cost (Ex-VAT)"]);
                                            } else if (type === "Post Mix") {
                                                const unit = d["Current Price Unit"] || "Pint";
                                                addReportRow("Pint", d["Recommended Pint"], unit === "Pint" ? d["Current Price"] : "-", d["BIB Cost (Ex-VAT)"]);
                                                addReportRow("Half", d["Recommended Half"], unit === "1/2 Pint" ? d["Current Price"] : "-", "-");
                                                addReportRow("16oz", d["Recommended 16oz"], unit === "16oz" ? d["Current Price"] : "-", "-");
                                                addReportRow("12oz", d["Recommended 12oz"], unit === "12oz" ? d["Current Price"] : "-", "-");
                                                addReportRow("Dash", d["Recommended Dash"], "-", "-");
                                            } else if (type === "Packed" || type === "Snacks") {
                                                addReportRow(d["Unit Size"] || "Unit", d["Recommended Price"], d["Current Sell Price"], d["Unit Cost (Ex-VAT)"]);
                                            }

                                            return rows.map((row, idx) => (
                                                <tr key={`${item.id}-${idx}`} className={idx === 0 ? "border-t border-slate-100" : ""}>
                                                    <td className="py-3 font-bold text-slate-800">
                                                        {idx === 0 ? (
                                                            <div>
                                                                <div>{item.product}</div>
                                                                <div className="text-[10px] font-normal text-slate-400 uppercase tracking-tight mt-1">{getMetadata()}</div>
                                                            </div>
                                                        ) : ""}
                                                    </td>
                                                    <td className="py-3 text-slate-500">{row.measure}</td>
                                                    <td className="py-3 text-right text-slate-600 font-mono text-xs">{row.cost}</td>
                                                    <td className="py-3 text-right text-slate-600">{idx === 0 ? (d["Target GP"] || "-") : ""}</td>
                                                    <td className="py-3 text-right font-medium text-slate-700">{row.curr}</td>
                                                    <td className="py-3 text-right font-bold text-blue-600">{row.rec}</td>
                                                    <td className={`py-3 text-right ${row.varClass}`}>{row.variance}</td>
                                                </tr>
                                            ));
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>

                {/* Upload Results Print Section */}
                {uploadResults.length > 0 && (
                    <div className="break-inside-avoid mt-10">
                        <h3 className="text-2xl font-black text-slate-800 uppercase border-b-2 border-slate-200 mb-4 pb-2 flex justify-between items-end">
                            CSV Upload — {uploadGroup}
                            <span className="text-xs font-normal text-slate-400 mb-1">{uploadResults.length} Products</span>
                        </h3>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="py-2 font-medium">Product</th>
                                    <th className="py-2 font-medium">Measure</th>
                                    <th className="py-2 font-medium text-right">Cost (Ex)</th>
                                    <th className="py-2 font-medium text-right">Target GP</th>
                                    <th className="py-2 font-medium text-right">Current (Inc)</th>
                                    <th className="py-2 font-medium text-right text-blue-600">Rec (Inc)</th>
                                    <th className="py-2 font-medium text-right">Var</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {uploadResults.map((item, pIdx) => {
                                    const d = item.details;
                                    const type = item.group;
                                    const rows: { measure: string, rec: string, curr: string, cost: string, variance: string, varClass: string }[] = [];

                                    const addReportRow = (measure: string, rec: string, curr: string, cost: string) => {
                                        let variance = "-";
                                        let varClass = "text-slate-400";
                                        if (curr && rec && curr !== "-" && rec !== "-") {
                                            const c = parseFloat(curr.replace(/[£,]/g, ""));
                                            const r = parseFloat(rec.replace(/[£,]/g, ""));
                                            const v = r - c;
                                            if (!isNaN(v)) {
                                                variance = `${v > 0 ? "+" : ""}£${v.toFixed(2)}`;
                                                varClass = v > 0 ? "text-green-600 font-bold" : (v < 0 ? "text-red-500" : "text-slate-400");
                                            }
                                        }
                                        rows.push({ measure, rec, curr, cost, variance, varClass });
                                    };

                                    const getMetadata = () => {
                                        const meta = [];
                                        if (type === "Draught") {
                                            meta.push(`Size: ${d["Unit Size"]}`);
                                            meta.push(`Basis: ${d["Cost Basis"]}`);
                                            const wastage = d["Ullage (%)"] || d["Ullage"];
                                            if (wastage && wastage !== "0%") meta.push(`Wastage: ${wastage}`);
                                            if (d["Forecast Increase Amount"] !== "£0.00") meta.push(`Inc: ${d["Forecast Increase Amount"]}`);
                                        } else if (type === "Spirits") {
                                            meta.push(`Size: ${d["Bottle Size"]}`);
                                            if (d["Increase Value"] && d["Increase Value"] !== "0") meta.push(`Inc: ${d["Increase Value"]}${d["Increase Type"] === "Percentage (%)" ? "%" : ""}`);
                                        } else if (type === "Wine") {
                                            if (d["Increase Value"] && d["Increase Value"] !== "0") meta.push(`Inc: ${d["Increase Value"]}${d["Increase Type"] === "Percentage (%)" ? "%" : ""}`);
                                        } else if (type === "Soft Drinks") {
                                            meta.push(`Case: ${d["Case Size"]}`);
                                            meta.push(`Unit: ${d["Unit Size"]}`);
                                        } else if (type === "Post Mix") {
                                            meta.push(`BIB: ${d["BIB Size (Litres)"]}L`);
                                            meta.push(`Ratio: ${d["Dilution Ratio"]}`);
                                        } else if (type === "Packed" || type === "Snacks") {
                                            if (d["Pack Size"]) meta.push(`Pack: ${d["Pack Size"]}`);
                                            if (d["Unit Size"]) meta.push(`Unit: ${d["Unit Size"]}`);
                                            if (d["Category"]) meta.push(`Cat: ${d["Category"]}`);
                                        }
                                        return meta.join(" | ");
                                    };

                                    if (type === "Draught") {
                                        addReportRow("Pint", d["Recommended Pint"], d["Current Pint Price (Inc)"], d["New Total Cost (Ex-VAT)"]);
                                        addReportRow("Half", d["Recommended Half"], "-", d["Half Surcharge"] && d["Half Surcharge"] !== "£0.00" ? `Sur: ${d["Half Surcharge"]}` : "-");
                                    } else if (type === "Spirits") {
                                        addReportRow("25ml", d["Recommended 25ml"], d["Current 25ml Price"], d["New Bottle Cost (Ex-VAT)"]);
                                        addReportRow("50ml", d["Recommended 50ml"], "-", "-");
                                    } else if (type === "Wine") {
                                        addReportRow("Bottle", d["Recommended Bottle"], d["Current Bottle Price"], d["New Btl Cost (Ex-VAT)"]);
                                        addReportRow("250ml", d["Recommended 250ml"], d["Current 250ml Price"], "-");
                                        addReportRow("175ml", d["Recommended 175ml"], d["Current 175ml Price"], "-");
                                        addReportRow("125ml", d["Recommended 125ml"], d["Current 125ml Price"], "-");
                                    } else if (type === "Soft Drinks") {
                                        addReportRow(d["Unit Size"] || "Unit", d["Recommended Price"], d["Current Sell Price"], d["Unit Cost (Ex-VAT)"]);
                                    } else if (type === "Post Mix") {
                                        const unit = d["Current Price Unit"] || "Pint";
                                        addReportRow("Pint", d["Recommended Pint"], unit === "Pint" ? d["Current Price"] : "-", d["BIB Cost (Ex-VAT)"]);
                                        addReportRow("Half", d["Recommended Half"], unit === "1/2 Pint" ? d["Current Price"] : "-", "-");
                                        addReportRow("16oz", d["Recommended 16oz"], unit === "16oz" ? d["Current Price"] : "-", "-");
                                        addReportRow("12oz", d["Recommended 12oz"], unit === "12oz" ? d["Current Price"] : "-", "-");
                                        addReportRow("Dash", d["Recommended Dash"], "-", "-");
                                    } else if (type === "Packed" || type === "Snacks") {
                                        addReportRow(d["Unit Size"] || "Unit", d["Recommended Price"], d["Current Sell Price"], d["Unit Cost (Ex-VAT)"]);
                                    }

                                    return rows.map((row, rIdx) => (
                                        <tr key={`${pIdx}-${rIdx}`} className={rIdx === 0 ? "border-t border-slate-100" : ""}>
                                            <td className="py-3 font-bold text-slate-800">
                                                {rIdx === 0 ? (
                                                    <div>
                                                        <div>{item.product}</div>
                                                        <div className="text-[10px] font-normal text-slate-400 uppercase tracking-tight mt-1">{getMetadata()}</div>
                                                    </div>
                                                ) : ""}
                                            </td>
                                            <td className="py-3 text-slate-500">{row.measure}</td>
                                            <td className="py-3 text-right text-slate-600 font-mono text-xs">{row.cost}</td>
                                            <td className="py-3 text-right text-slate-600">{rIdx === 0 ? (d["Target GP"] || "-") : ""}</td>
                                            <td className="py-3 text-right font-medium text-slate-700">{row.curr}</td>
                                            <td className="py-3 text-right font-bold text-blue-600">{row.rec}</td>
                                            <td className={`py-3 text-right ${row.varClass}`}>{row.variance}</td>
                                        </tr>
                                    ));
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer Totals / Disclaimer */}
                <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Notes</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Please ensure all input costs are accurate as they directly affect the target price.
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-4 w-full text-center text-[10px] text-slate-300 left-0">
                    Generated by Whole Hospitality GP Calculator
                </div>
            </div>

            <footer className="print:hidden text-center text-slate-400 text-sm mt-8 pb-6 space-y-2">
                <p>Powered by <strong className="text-slate-500">Whole Hospitality</strong> · Developed by <a href="https://itsmyapp.co.uk" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors">itsmyapp.co.uk</a></p>
                <div className="flex items-center justify-center gap-2">
                    <img src="/itsmyapp_logo.png" alt="ItsMyApp" className="h-5 w-auto opacity-60" />
                    <span>© 2026</span>
                </div>
            </footer>

            {/* Pro Modal */}
            {showProModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center" onClick={e => e.stopPropagation()}>
                        <div className="bg-amber-100 text-amber-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                            <Upload className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">GP Calculator Pro</h3>
                        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                            CSV Batch Upload is a <strong>Pro feature</strong>. Upload entire product lists, calculate prices in bulk, and export results — all in seconds.
                        </p>
                        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left text-sm space-y-2">
                            <div className="flex items-center gap-2 text-slate-700"><span className="text-green-500">✓</span> Batch upload via CSV</div>
                            <div className="flex items-center gap-2 text-slate-700"><span className="text-green-500">✓</span> All product groups supported</div>
                            <div className="flex items-center gap-2 text-slate-700"><span className="text-green-500">✓</span> Export & print results</div>
                            <div className="flex items-center gap-2 text-slate-700"><span className="text-green-500">✓</span> Add all to session history</div>
                        </div>
                        <a
                            href="mailto:info@wholehospitality.co.uk?subject=GP Calculator Pro Enquiry"
                            className="block w-full bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors mb-3"
                        >
                            Enquire About Pro
                        </a>
                        <button
                            onClick={() => setShowProModal(false)}
                            className="text-slate-400 text-sm hover:text-slate-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
