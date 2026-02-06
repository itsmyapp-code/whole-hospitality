"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";

// --- Utility Functions ---

const smartRound = (price: number) => {
    // Python: math.ceil(price * 10) / 10
    return Math.ceil(price * 10) / 10;
};

// --- Types ---

type CalculationItem = {
    id: string;
    type: "Draught" | "Spirits" | "Wine";
    product: string;
    details: Record<string, string>;
    timestamp: string;
};

// --- Components ---

const Header = () => (
    <header className="bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            {/* Placeholder for Logo if available */}
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">GP CALCULATOR PRO</h1>
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
const DraughtCalc = ({ onSave }: { onSave: (data: CalculationItem) => void }) => {
    const [name, setName] = useState("");
    const [size, setSize] = useState("11 Gal");
    const [basis, setBasis] = useState("Per Barrel");
    const [cost, setCost] = useState("");
    const [gp, setGp] = useState("");

    const [incType, setIncType] = useState("Percentage (%)");
    const [incVal, setIncVal] = useState("");
    const [duty, setDuty] = useState("");
    const [halfPrem, setHalfPrem] = useState("0.10");

    const [result, setResult] = useState<null | {
        newTotal: number;
        pint: number;
        half: number;
    }>(null);

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
        } else if (size === "30 Ltr") {
            gals = 30 / 4.546;
        } else if (size === "50 Ltr") {
            gals = 50 / 4.546;
        }

        // 1 Gallon = 8 Pints (approx, using 4.546L/gal and 568ml/pint? 
        // Python code: pints = (gals * 4.546 * 1000) / 568  => This is exact conversion.
        const pints = (gals * 4.546 * 1000) / 568;

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
        const rawPintPrice = ((forecastTotal / pints) / (1 - targetGp / 100)) * 1.20;
        const recommPint = smartRound(rawPintPrice);

        // Half: (Pint/2) + Surcharge -> Round
        const recommHalf = smartRound((recommPint / 2) + hPrem);

        setResult({ newTotal: forecastTotal, pint: recommPint, half: recommHalf });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Draught",
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "Unit Size": size,
                "Cost Basis": basis,
                "Current Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
                "Target GP": `${targetGp}%`,
                "Half Surcharge": `£${hPrem.toFixed(2)}`,
                "Forecast Increase": `${increaseValue} (${incType})`,
                "New Total Cost (Ex-VAT)": `£${forecastTotal.toFixed(2)}`,
                "Recommended Pint": `£${recommPint.toFixed(2)}`,
                "Recommended Half": `£${recommHalf.toFixed(2)}`,
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Pricing</h3>
                    <div className="space-y-4">
                        <InputField label="Product Name" value={name} onChange={setName} />
                        <SelectField label="Size" value={size} onChange={setSize} options={["11 Gal", "22 Gal", "9 Gal", "1 Gal", "30 Ltr", "50 Ltr"]} />
                        <SelectField label="Basis" value={basis} onChange={setBasis} options={["Per Barrel", "Per Gallon"]} />
                        <InputField label="Cost (Ex-VAT) £" value={cost} onChange={setCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Price Forecast</h3>
                    <div className="space-y-4">
                        <SelectField label="Increase Type" value={incType} onChange={setIncType} options={["Percentage (%)", "Fixed £ Barrel", "Fixed £ Gallon"]} />
                        <InputField label="Increase (Ex-VAT)" value={incVal} onChange={setIncVal} type="number" />
                        <InputField label="Extra Duty (Ex-VAT) £" value={duty} onChange={setDuty} type="number" />
                        <InputField label="Half Surcharge £" value={halfPrem} onChange={setHalfPrem} type="number" />
                    </div>
                </div>
            </div>

            <button
                onClick={calculate}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
                RUN CALCULATION
            </button>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">New Total Barrel Cost: <strong>£{result.newTotal.toFixed(2)}</strong></p>
                    <div className="flex justify-center gap-8 mt-2 text-2xl font-bold text-slate-800">
                        <span>Pint: £{result.pint.toFixed(2)}</span>
                        <span className="text-slate-300">|</span>
                        <span>Half: £{result.half.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Spirits Calculator
const SpiritsCalc = ({ onSave }: { onSave: (data: CalculationItem) => void }) => {
    const [name, setName] = useState("");
    const [size, setSize] = useState("70cl");
    const [cost, setCost] = useState("");
    const [gp, setGp] = useState("");

    const [incType, setIncType] = useState("Percentage (%)");
    const [incVal, setIncVal] = useState("");

    const [result, setResult] = useState<null | {
        newCost: number;
        price25: number;
        price50: number;
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

        // Cost per 25ml
        const cost25 = (currCost / mlTotal) * 25;

        // Sell 25ml = (Cost25 / (1 - GP)) * 1.2
        const sale25 = smartRound((cost25 / (1 - targetGp / 100)) * 1.20);
        const sale50 = sale25 * 2; // Simple double

        setResult({ newCost: currCost, price25: sale25, price50: sale50 });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Spirits",
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "Bottle Size": size,
                "New Bottle Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
                "Recommended 25ml": `£${sale25.toFixed(2)}`,
                "Recommended 50ml": `£${sale50.toFixed(2)}`,
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Pricing</h3>
                    <div className="space-y-4">
                        <InputField label="Product Name" value={name} onChange={setName} />
                        <SelectField label="Size" value={size} onChange={setSize} options={["70cl", "75cl", "100cl", "150cl"]} />
                        <InputField label="Btl Cost (Ex-VAT) £" value={cost} onChange={setCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Increase</h3>
                    <div className="space-y-4">
                        <SelectField label="Increase Type" value={incType} onChange={setIncType} options={["Percentage (%)", "Fixed £ Bottle"]} />
                        <InputField label="Increase (Ex-VAT)" value={incVal} onChange={setIncVal} type="number" />
                    </div>
                </div>
            </div>

            <button
                onClick={calculate}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
                RUN CALCULATION
            </button>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">New Bottle Cost: <strong>£{result.newCost.toFixed(2)}</strong></p>
                    <div className="flex justify-center gap-8 mt-2 text-2xl font-bold text-slate-800">
                        <span>25ml: £{result.price25.toFixed(2)}</span>
                        <span className="text-slate-300">|</span>
                        <span>50ml: £{result.price50.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// 3. Wine Calculator
const WineCalc = ({ onSave }: { onSave: (data: CalculationItem) => void }) => {
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [gp, setGp] = useState("");

    const [incType, setIncType] = useState("Percentage (%)");
    const [incVal, setIncVal] = useState("");

    const [result, setResult] = useState<null | {
        btlPrice: number;
        m250: number;
        m175: number;
        m125: number;
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

        setResult({ btlPrice, m250, m175, m125 });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Wine",
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "New Btl Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Pricing</h3>
                    <div className="space-y-4">
                        <InputField label="Product Name" value={name} onChange={setName} />
                        <InputField label="Btl Cost (Ex-VAT) £" value={cost} onChange={setCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Increase</h3>
                    <div className="space-y-4">
                        <SelectField label="Increase Type" value={incType} onChange={setIncType} options={["Percentage (%)", "Fixed £ Bottle"]} />
                        <InputField label="Increase (Ex-VAT)" value={incVal} onChange={setIncVal} type="number" />
                    </div>
                </div>
            </div>

            <button
                onClick={calculate}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
                RUN CALCULATION
            </button>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">New Bottle Price: <strong>£{result.btlPrice.toFixed(2)}</strong></p>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-2 text-xl font-bold text-slate-800">
                        <span>250ml: £{result.m250.toFixed(2)}</span>
                        <span className="text-slate-300">|</span>
                        <span>175ml: £{result.m175.toFixed(2)}</span>
                        <span className="text-slate-300">|</span>
                        <span>125ml: £{result.m125.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
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

// --- Main Page Component ---

export default function GPCalculatorPage() {
    const [activeTab, setActiveTab] = useState<"Instructions" | "Draught" | "Spirits" | "Wine">("Instructions");
    const [history, setHistory] = useState<CalculationItem[]>([]);

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

    return (
        <div className="min-h-screen bg-[#f5f5f7] font-sans pb-20">
            <Head>
                <title>GP Calculator Pro | Whole Hospitality</title>
            </Head>

            <Header />

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* Left Column: Calculator */}
                <div className="flex-1 space-y-6">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 md:gap-4 p-1 bg-white rounded-xl shadow-sm border border-gray-200">
                        {["Instructions", "Draught", "Spirits", "Wine"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "text-slate-500 hover:bg-gray-50"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[500px]">
                        {activeTab === "Instructions" && (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 prose max-w-none animate-in fade-in duration-500">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to GP Calculator Pro</h2>
                                <p className="text-slate-600 mb-4">
                                    This tool is designed to calculate accurate sales pricing and forecast the impact of price hikes.
                                </p>
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                                    <p className="font-bold text-amber-800">IMPORTANT: ALL INPUT FIGURES MUST BE EX-VAT</p>
                                </div>

                                <h3 className="font-bold text-lg mb-2">Key Features</h3>
                                <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-6">
                                    <li><strong>Invoice Cost:</strong> Enter the price you pay to the supplier excluding VAT.</li>
                                    <li><strong>Target GP:</strong> Enter your desired margin (e.g., 65 for Draught).</li>
                                    <li><strong>Price Forecast:</strong> See how a % or fixed increase affects your till price.</li>
                                    <li><strong>Smart Rounding:</strong> 'Antigravity' logic rounds prices up to the nearest 10p automatically.</li>
                                    <li><strong>Measures:</strong> Calculates halves, singles/doubles, and UK legal wine measures (125/175/250ml).</li>
                                </ul>

                                <h3 className="font-bold text-lg mb-2">Saving & Printing</h3>
                                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                    <li>Calculations are automatically saved to your session history below.</li>
                                    <li>Use the <strong>Quick Print</strong> button in the sidebar to generate a report.</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === "Draught" && <DraughtCalc onSave={addToHistory} />}
                        {activeTab === "Spirits" && <SpiritsCalc onSave={addToHistory} />}
                        {activeTab === "Wine" && <WineCalc onSave={addToHistory} />}
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
                                            <span className="font-bold text-slate-800">{item.product}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1 rounded">{item.type}</span>
                                        </div>
                                        <div className="text-slate-500 text-xs space-y-1">
                                            {Object.entries(item.details).slice(0, 3).map(([k, v]) => (
                                                <div key={k} className="flex justify-between">
                                                    <span>{k}:</span>
                                                    <span className="font-medium text-slate-700">{v}</span>
                                                </div>
                                            ))}
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
                                onClick={clearHistory}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-slate-600 font-bold py-2 rounded-lg hover:bg-gray-50 transition"
                            >
                                CLEAR HISTORY
                            </button>
                        </div>
                    </div>
                </aside>

            </main>

            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          aside, aside * {
            visibility: visible;
          }
          aside {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          aside button {
            display: none !important;
          }
          header, footer, nav {
            display: none;
          }
          /* Custom Print Layout to look like the "Strategy Report" */
          #print-area {
             visibility: visible;
          }
        }
      `}</style>

            {/* Hidden Print Area that only shows on print */}
            <div className="hidden print:block p-8 bg-white text-black absolute top-0 left-0 w-full min-h-screen z-[9999]">
                <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-8">
                    <h1 className="text-4xl font-bold">STRATEGY REPORT</h1>
                    <div className="text-right">
                        <p className="text-sm italic">Whole Hospitality</p>
                        <p className="text-xs text-slate-500">Issued: {new Date().toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {history.map((item) => (
                        <div key={item.id} className="break-inside-avoid">
                            <div className="bg-slate-100 p-2 font-bold text-lg mb-2 uppercase border-l-4 border-slate-800">
                                PRODUCT: {item.product}
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm pl-4">
                                {Object.entries(item.details).map(([k, v]) => (
                                    <React.Fragment key={k}>
                                        <div className="text-slate-500">{k}:</div>
                                        <div className={`font-medium ${k.includes("Recommended") ? "font-bold text-black" : "text-slate-800"}`}>{v}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-xs text-slate-400 border-t pt-4">
                    © 2026 Whole Hospitality | Professional Backend Solutions
                </div>
            </div>

            <footer className="text-center text-slate-400 text-sm mt-8">
                © 2026 Whole Hospitality | Professional Backend Solutions
            </footer>
        </div>
    );
}
