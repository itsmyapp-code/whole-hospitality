"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Copy, Pencil, Trash2 } from "lucide-react";

// --- Utility Functions ---

const smartRound = (price: number) => {
    // Python: math.ceil(price * 10) / 10
    return Math.ceil(price * 10) / 10;
};

// --- Types ---

type CalculationItem = {
    id: string;
    type: "Draught" | "Spirits" | "Wine" | "Soft Drinks" | "Post Mix";
    product: string;
    details: Record<string, string>;
    timestamp: string;
};

// --- Constants & Config ---

type Sector = "Pub" | "Hotel";
type Tier = "Low" | "Mid" | "High";

const GPTargets: Record<Sector, Record<Tier, number>> = {
    Pub: { Low: 60, Mid: 65, High: 72 },
    Hotel: { Low: 68, Mid: 72, High: 78 },
};

// --- Components ---

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
            <h1 className="text-2xl font-bold text-slate-700 tracking-tight">GP CALCULATOR LITE</h1>
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
    const [volume, setVolume] = useState("");

    const [incType, setIncType] = useState("Percentage (%)");
    const [incVal, setIncVal] = useState("");
    const [duty, setDuty] = useState("");
    const [halfPrem, setHalfPrem] = useState("0.10");

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
            // New fields
            if (d["Current Sell Price"]) setCurrentPrice(d["Current Sell Price"].replace(/[£,]/g, ""));
            if (d["Weekly Volume"]) setVolume(d["Weekly Volume"]);
        }
    }, [initialData]);

    // Constructive/Destructive? If user has manually typed a GP, this overwrites it if global setting changes.
    // This is "Industry Standard" toggle behavior.
    useEffect(() => {
        if (!initialData) {
            setGp(defaultGP.toString());
        }
    }, [defaultGP, initialData]);

    const [result, setResult] = useState<null | {
        newTotal: number;
        pint: number;
        half: number;
        currentGP: number | null;
        profitLeak: number | null;
        marginUplift: number | null;
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

        // --- Reality Check & Analytics ---
        const currSell = parseFloat(currentPrice) || 0;
        const wkVol = parseFloat(volume) || 0;

        let currentGP = null;
        let profitLeak = null;
        let marginUplift = null;

        if (currSell > 0) {
            const costPerPint = forecastTotal / pints;
            const netSales = currSell / 1.2;
            currentGP = ((netSales - costPerPint) / netSales) * 100;

            // Profit Leak
            // Diff per pint (Ex VAT) that we are losing
            const potentialNet = recommPint / 1.2;
            const diffNet = potentialNet - netSales;

            // Leak = DiffNet * PintsInKeg * KegsPerWeek * 52
            // PintsInKeg = pints
            if (wkVol > 0) {
                profitLeak = diffNet * pints * wkVol * 52;
            }

            // Margin Uplift (Cash) per keg
            marginUplift = (recommPint - currSell); // Show price diff inc vat? Or GP% diff?
            // Usually "Margin Uplift" refers to GP%.
            // But let's calculate the price difference for the table: "Recommended - Current"
        }

        setResult({
            newTotal: forecastTotal,
            pint: recommPint,
            half: recommHalf,
            currentGP: currentGP,
            profitLeak: profitLeak,
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
                "Current Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
                "Target GP": `${targetGp}%`,
                "Half Surcharge": `£${hPrem.toFixed(2)}`,
                "Forecast Increase Type": incType,
                "Forecast Increase Value": `${incVal}`,
                "Forecast Increase Amount": `£${increaseAmt.toFixed(2)}`,
                "Extra Duty (Ex-VAT)": `£${dutyTotal.toFixed(2)}`,
                "New Total Cost (Ex-VAT)": `£${forecastTotal.toFixed(2)}`,
                "Current Sell Price": currSell > 0 ? `£${currSell.toFixed(2)}` : "-",
                "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
                "Recommended Pint": `£${recommPint.toFixed(2)}`,
                "Recommended Half": `£${recommHalf.toFixed(2)}`,
                "Weekly Volume": wkVol > 0 ? `${wkVol}` : "-",
                "Annualized Profit Leak": profitLeak !== null ? `£${profitLeak.toFixed(2)}` : "-",
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
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <InputField label="Current Pint Price (Inc-VAT) £" value={currentPrice} onChange={setCurrentPrice} type="number" />
                        <InputField label={`Weekly Volume (${size} units)`} value={volume} onChange={setVolume} type="number" />
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
                className="w-full bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
            >
                RUN CALCULATION LITE
            </button>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">New Total Barrel Cost: <strong>£{result.newTotal.toFixed(2)}</strong></p>
                    <div className="flex flex-col md:flex-row justify-center gap-8 mt-4 text-2xl font-bold text-slate-800">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Recommended Pint</span>
                            <span>£{result.pint.toFixed(2)}</span>
                            {result.currentGP !== null && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1">
                                    Target: {gp}%
                                </span>
                            )}
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

                    {result.profitLeak !== null && result.profitLeak > 0 && (
                        <div className="mt-6 bg-red-50 border border-red-100 p-4 rounded-lg">
                            <p className="text-red-600 font-bold uppercase text-xs tracking-wider mb-1">Annualized Profit Leak</p>
                            <p className="text-3xl font-black text-red-700">£{result.profitLeak.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-xs text-red-400 mt-1">Potential lost profit based on current volume</p>
                        </div>
                    )}
                </div>
            )}
        </div>
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
    const [currentPrice25, setCurrentPrice25] = useState("");
    const [volume, setVolume] = useState("");

    useEffect(() => {
        if (initialData && initialData.type === "Spirits") {
            setName(initialData.product || "");
            const d = initialData.details;
            if (d["Bottle Size"]) setSize(d["Bottle Size"]);
            // See note in previous version about stored cost
            if (d["New Bottle Cost (Ex-VAT)"]) setCost(d["New Bottle Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));
            if (d["Increase Type"]) setIncType(d["Increase Type"]);
            if (d["Increase Value"]) setIncVal(d["Increase Value"]);
            // New fields
            if (d["Current 25ml Price"]) setCurrentPrice25(d["Current 25ml Price"].replace(/[£,]/g, ""));
            if (d["Weekly Volume"]) setVolume(d["Weekly Volume"]);
        }
    }, [initialData]);

    useEffect(() => {
        if (!initialData) {
            setGp(defaultGP.toString());
        }
    }, [defaultGP, initialData]);

    const [result, setResult] = useState<null | {
        newCost: number;
        price25: number;
        price50: number;
        currentGP: number | null;
        profitLeak: number | null;
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

        // --- Reality Check ---
        const curr25 = parseFloat(currentPrice25) || 0;
        const wkVol = parseFloat(volume) || 0;

        let currentGP = null;
        let profitLeak = null;

        if (curr25 > 0) {
            const netSales25 = curr25 / 1.2;
            currentGP = ((netSales25 - cost25) / netSales25) * 100;

            // Profit Leak
            const potentialNet25 = sale25 / 1.2;
            const diffNet25 = potentialNet25 - netSales25;

            if (wkVol > 0) {
                // Measures per bottle
                const measuresPerBtl = mlTotal / 25;
                profitLeak = diffNet25 * measuresPerBtl * wkVol * 52;
            }
        }

        setResult({
            newCost: currCost,
            price25: sale25,
            price50: sale50,
            currentGP: currentGP,
            profitLeak: profitLeak
        });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Spirits",
            product: prodName,
            timestamp: new Date().toISOString(),
            details: {
                "Bottle Size": size,
                "Current Btl Cost (Ex-VAT)": `£${(incType === "Percentage (%)" ? currCost / (1 + increaseValue / 100) : currCost - increaseValue).toFixed(2)}`,
                "Target GP": `${targetGp}%`,
                "Increase Type": incType,
                "Increase Value": `${incVal}`,
                "New Bottle Cost (Ex-VAT)": `£${currCost.toFixed(2)}`,
                "Current 25ml Price": curr25 > 0 ? `£${curr25.toFixed(2)}` : "-",
                "Current GP": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
                "Recommended 25ml": `£${sale25.toFixed(2)}`,
                "Recommended 50ml": `£${sale50.toFixed(2)}`,
                "Weekly Volume": wkVol > 0 ? `${wkVol}` : "-",
                "Annualized Profit Leak": profitLeak !== null ? `£${profitLeak.toFixed(2)}` : "-",
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

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <InputField label="Current 25ml Price (Inc-VAT) £" value={currentPrice25} onChange={setCurrentPrice25} type="number" />
                        <InputField label="Weekly Volume (Bottles)" value={volume} onChange={setVolume} type="number" />
                    </div>
                </div>
            </div>

            <button
                onClick={calculate}
                className="w-full bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
            >
                RUN CALCULATION LITE
            </button>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg">New Bottle Cost: <strong>£{result.newCost.toFixed(2)}</strong></p>
                    <div className="flex flex-col md:flex-row justify-center gap-8 mt-4 text-2xl font-bold text-slate-800">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Recommended 25ml</span>
                            <span>£{result.price25.toFixed(2)}</span>
                            {result.currentGP !== null && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1">
                                    Target: {gp}%
                                </span>
                            )}
                        </div>
                        <div className="hidden md:block w-px bg-slate-200"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-normal mb-1">Current 25ml</span>
                            <span className={`${result.currentGP !== null ? "text-slate-600" : "text-slate-300"}`}>
                                {currentPrice25 ? `£${parseFloat(currentPrice25).toFixed(2)}` : "-"}
                            </span>
                            {result.currentGP !== null && (
                                <span className={`text-xs px-2 py-1 rounded mt-1 ${result.currentGP < parseFloat(gp) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                    Actual: {result.currentGP.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>

                    {result.profitLeak !== null && result.profitLeak > 0 && (
                        <div className="mt-6 bg-red-50 border border-red-100 p-4 rounded-lg">
                            <p className="text-red-600 font-bold uppercase text-xs tracking-wider mb-1">Annualized Profit Leak</p>
                            <p className="text-3xl font-black text-red-700">£{result.profitLeak.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    )}
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
    const [volume, setVolume] = useState("");

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
            if (d["Weekly Volume"]) setVolume(d["Weekly Volume"]);
        }
    }, [initialData]);

    useEffect(() => {
        if (!initialData) {
            setGp(defaultGP.toString());
        }
    }, [defaultGP, initialData]);

    const [result, setResult] = useState<null | {
        btlPrice: number;
        m250: number;
        m175: number;
        m125: number;
        currentGP: number | null;
        profitLeak: number | null;
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
        const wkVol = parseFloat(volume) || 0;

        let currentGP = null;
        let profitLeak = null;

        if (currBtl > 0) {
            const netSalesBtl = currBtl / 1.2;
            currentGP = ((netSalesBtl - currCost) / netSalesBtl) * 100;

            // Profit Leak (based on Bottle turnover)
            const potentialNetBtl = btlPrice / 1.2;
            const diffNetBtl = potentialNetBtl - netSalesBtl;

            if (wkVol > 0) {
                profitLeak = diffNetBtl * wkVol * 52;
            }
        }

        setResult({
            btlPrice, m250, m175, m125,
            currentGP: currentGP,
            profitLeak: profitLeak
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
                "Weekly Volume": wkVol > 0 ? `${wkVol}` : "-",
                "Annualized Profit Leak": profitLeak !== null ? `£${profitLeak.toFixed(2)}` : "-",
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

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <InputField label="Current Bottle Price (Inc-VAT)" value={currentPriceBtl} onChange={setCurrentPriceBtl} type="number" />
                        <div className="grid grid-cols-3 gap-2">
                            <InputField label="250ml" value={currentPrice250} onChange={setCurrentPrice250} type="number" />
                            <InputField label="175ml" value={currentPrice175} onChange={setCurrentPrice175} type="number" />
                            <InputField label="125ml" value={currentPrice125} onChange={setCurrentPrice125} type="number" />
                        </div>
                        <InputField label="Weekly Volume (Bottles)" value={volume} onChange={setVolume} type="number" />
                    </div>
                </div>
            </div>

            <button
                onClick={calculate}
                className="w-full bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
            >
                RUN CALCULATION LITE
            </button>

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

                    {result.profitLeak !== null && result.profitLeak > 0 && (
                        <div className="mt-6 bg-red-50 border border-red-100 p-4 rounded-lg">
                            <p className="text-red-600 font-bold uppercase text-xs tracking-wider mb-1">Annualized Profit Leak</p>
                            <p className="text-3xl font-black text-red-700">£{result.profitLeak.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-xs text-red-400 mt-1">Potential lost profit based on Bottle variance</p>
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
    const [volume, setVolume] = useState("");

    useEffect(() => {
        if (initialData && initialData.type === "Soft Drinks") {
            setName(initialData.product || "");
            const d = initialData.details;
            if (d["Case Size"]) setCaseSize(d["Case Size"]);
            if (d["Unit Size"]) setUnitSize(d["Unit Size"]);
            if (d["Case Cost (Ex-VAT)"]) setCaseCost(d["Case Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));

            if (d["Current Sell Price"]) setCurrentPrice(d["Current Sell Price"].replace(/[£,]/g, ""));
            if (d["Weekly Volume"]) setVolume(d["Weekly Volume"]);
        }
    }, [initialData]);

    useEffect(() => {
        if (!initialData) {
            setGp(defaultGP.toString());
        }
    }, [defaultGP, initialData]);

    const [result, setResult] = useState<null | {
        unitCost: number;
        unitRRP: number;
        currentGP: number | null;
        profitLeak: number | null;
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
        const wkVol = parseFloat(volume) || 0;

        let currentGP = null;
        let profitLeak = null;

        if (currSell > 0) {
            const netSales = currSell / 1.2;
            currentGP = ((netSales - unitCost) / netSales) * 100;

            // Profit Leak 
            const potentialNet = unitRRP / 1.2;
            const diffNet = potentialNet - netSales;

            if (wkVol > 0) {
                // Volume is units per week
                profitLeak = diffNet * wkVol * 52;
            }
        }

        setResult({
            unitCost,
            unitRRP,
            currentGP,
            profitLeak
        });

        const item: CalculationItem = {
            id: Date.now().toString(),
            type: "Soft Drinks" as any, // Cast because "Soft Drinks" is not yet in type definition
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
                "Weekly Volume": wkVol > 0 ? `${wkVol}` : "-",
                "Annualized Profit Leak": profitLeak !== null ? `£${profitLeak.toFixed(2)}` : "-",
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Costings</h3>
                    <div className="space-y-4">
                        <InputField label="Product Name" value={name} onChange={setName} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Case Size" value={caseSize} onChange={setCaseSize} type="number" />
                            <InputField label="Unit Size (e.g. 330ml)" value={unitSize} onChange={setUnitSize} />
                        </div>
                        <InputField label="Case Cost (Ex-VAT) £" value={caseCost} onChange={setCaseCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <InputField label="Current Unit Sell Price (Inc-VAT) £" value={currentPrice} onChange={setCurrentPrice} type="number" />
                        <InputField label="Weekly Volume (Units)" value={volume} onChange={setVolume} type="number" />
                    </div>
                </div>
            </div>

            <button
                onClick={calculate}
                className="w-full bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
            >
                RUN CALCULATION LITE
            </button>

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

                    {result.profitLeak !== null && result.profitLeak > 0 && (
                        <div className="mt-6 bg-red-50 border border-red-100 p-4 rounded-lg">
                            <p className="text-red-600 font-bold uppercase text-xs tracking-wider mb-1">Annualized Profit Leak</p>
                            <p className="text-3xl font-black text-red-700">£{result.profitLeak.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    )}
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
    const [ratio, setRatio] = useState("5");
    const [gp, setGp] = useState("");

    // Reality Check
    const [currentPintPrice, setCurrentPintPrice] = useState("");
    const [volume, setVolume] = useState(""); // BIBs per week

    useEffect(() => {
        if (initialData && initialData.type === "Post Mix") {
            setName(initialData.product || "");
            const d = initialData.details;
            if (d["BIB Size (Litres)"]) setBibSize(d["BIB Size (Litres)"]);
            if (d["BIB Cost (Ex-VAT)"]) setBibCost(d["BIB Cost (Ex-VAT)"].replace(/[£,]/g, ""));
            if (d["Dilution Ratio"]) setRatio(d["Dilution Ratio"].replace(/:1/g, ""));
            if (d["Target GP"]) setGp(d["Target GP"].replace(/[%]/g, ""));

            if (d["Current Pint Price"]) setCurrentPintPrice(d["Current Pint Price"].replace(/[£,]/g, ""));
            if (d["Weekly Volume"]) setVolume(d["Weekly Volume"]);
        }
    }, [initialData]);

    useEffect(() => {
        if (!initialData) {
            setGp(defaultGP.toString());
        }
    }, [defaultGP, initialData]);

    const [result, setResult] = useState<null | {
        costPerMl: number;
        pint: number;
        half: number;
        soda16oz: number;
        dash: number;
        currentGP: number | null;
        profitLeak: number | null;
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
        const mlHalf = 284;
        const ml16oz = 454; // Approx 16 Imperial oz
        const mlDash = 50;  // Standard dash/splash

        // Prices
        const calcPrice = (ml: number) => smartRound(((costPerMl * ml) / (1 - targetGp / 100)) * 1.20);

        const pPint = calcPrice(mlPint);
        const pHalf = calcPrice(mlHalf);
        const p16oz = calcPrice(ml16oz);
        const pDash = calcPrice(mlDash);

        // --- Reality Check ---
        const currPint = parseFloat(currentPintPrice) || 0;
        const wkVol = parseFloat(volume) || 0;

        let currentGP = null;
        let profitLeak = null;

        if (currPint > 0) {
            const netSalesPint = currPint / 1.2;
            const costPint = costPerMl * mlPint;
            currentGP = ((netSalesPint - costPint) / netSalesPint) * 100;

            // Profit Leak based on Pint yield
            const potentialNetPint = pPint / 1.2;
            const diffNetPint = potentialNetPint - netSalesPint;

            if (wkVol > 0) {
                // Volume is BIBs per week.
                // How many pints in a BIB?
                const pintsInBib = totalLiquidMl / mlPint;
                profitLeak = diffNetPint * pintsInBib * wkVol * 52;
            }
        }

        setResult({
            costPerMl,
            pint: pPint,
            half: pHalf,
            soda16oz: p16oz,
            dash: pDash,
            currentGP,
            profitLeak
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
                "Recommended Half": `£${pHalf.toFixed(2)}`,
                "Recommended 16oz": `£${p16oz.toFixed(2)}`,
                "Recommended Dash": `£${pDash.toFixed(2)}`,
                "Current Pint Price": currPint > 0 ? `£${currPint.toFixed(2)}` : "-",
                "Current GP (Pint)": currentGP !== null ? `${currentGP.toFixed(1)}%` : "-",
                "Weekly Volume (BIBs)": wkVol > 0 ? `${wkVol}` : "-",
                "Annualized Profit Leak": profitLeak !== null ? `£${profitLeak.toFixed(2)}` : "-",
            },
        };
        onSave(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Costings</h3>
                    <div className="space-y-4">
                        <InputField label="Product Name" value={name} onChange={setName} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="BIB Size (Litres)" value={bibSize} onChange={setBibSize} type="number" />
                            <InputField label="Dilution Ratio (X:1)" value={ratio} onChange={setRatio} type="number" />
                        </div>
                        <InputField label="BIB Cost (Ex-VAT) £" value={bibCost} onChange={setBibCost} type="number" />
                        <InputField label="Target GP %" value={gp} onChange={setGp} type="number" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">Reality Check</h3>
                    <div className="space-y-4">
                        <InputField label="Current Pint Price (Inc-VAT) £" value={currentPintPrice} onChange={setCurrentPintPrice} type="number" />
                        <InputField label="Weekly Volume (BIBs)" value={volume} onChange={setVolume} type="number" />
                    </div>
                </div>
            </div>

            <button
                onClick={calculate}
                className="w-full bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200"
            >
                RUN CALCULATION LITE
            </button>

            {result && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h4 className="text-slate-500 font-semibold mb-2">Results</h4>
                    <p className="text-lg text-slate-500 mb-4">Cost per 100ml: £{(result.costPerMl * 100).toFixed(3)}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-lg font-bold text-slate-800">
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
                            <span className="text-xs text-slate-400 font-normal">Half</span>
                            <span>£{result.half.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white rounded border border-slate-100">
                            <span className="text-xs text-slate-400 font-normal">16oz</span>
                            <span>£{result.soda16oz.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white rounded border border-slate-100">
                            <span className="text-xs text-slate-400 font-normal">Dash</span>
                            <span>£{result.dash.toFixed(2)}</span>
                        </div>
                    </div>

                    {result.profitLeak !== null && result.profitLeak > 0 && (
                        <div className="mt-6 bg-red-50 border border-red-100 p-4 rounded-lg">
                            <p className="text-red-600 font-bold uppercase text-xs tracking-wider mb-1">Annualized Profit Leak</p>
                            <p className="text-3xl font-black text-red-700">£{result.profitLeak.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-xs text-red-400 mt-1">Based on Pint yield variance</p>
                        </div>
                    )}
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
    const [activeTab, setActiveTab] = useState<"Instructions" | "Draught" | "Spirits" | "Wine" | "Soft Drinks" | "Post Mix">("Instructions");

    // Global Settings
    const [sector, setSector] = useState<Sector>("Pub");
    const [tier, setTier] = useState<Tier>("Mid");

    const [history, setHistory] = useState<CalculationItem[]>([]);
    const [itemToLoad, setItemToLoad] = useState<CalculationItem | null>(null);

    const currentGlobalTarget = GPTargets[sector][tier];

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

                    <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
                        <span className="text-sm font-medium text-slate-400">Target GP:</span>
                        <span className="text-2xl font-bold text-green-400">{currentGlobalTarget}%</span>
                    </div>
                </div>
            </div>

            <main className="print:hidden max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* Left Column: Calculator */}
                <div className="flex-1 space-y-6">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 md:gap-4 p-1 bg-white rounded-xl shadow-sm border border-gray-200">
                        {["Instructions", "Draught", "Spirits", "Wine", "Soft Drinks", "Post Mix"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                    ? "bg-slate-700 text-white shadow-md"
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
                                <h2 className="text-2xl font-bold text-slate-700 mb-4">Welcome to GP Calculator Lite</h2>
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

                        {activeTab === "Draught" && <DraughtCalc onSave={addToHistory} initialData={itemToLoad} defaultGP={currentGlobalTarget} />}
                        {activeTab === "Spirits" && <SpiritsCalc onSave={addToHistory} initialData={itemToLoad} defaultGP={currentGlobalTarget} />}
                        {activeTab === "Wine" && <WineCalc onSave={addToHistory} initialData={itemToLoad} defaultGP={currentGlobalTarget} />}
                        {activeTab === "Soft Drinks" && <SoftDrinksCalc onSave={addToHistory} initialData={itemToLoad} defaultGP={currentGlobalTarget} />}
                        {activeTab === "Post Mix" && <PostMixCalc onSave={addToHistory} initialData={itemToLoad} defaultGP={currentGlobalTarget} />}
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
                            <h1 className="text-5xl font-black uppercase tracking-tight text-slate-900">Reality Check</h1>
                            <p className="text-xl text-slate-500 font-medium tracking-widest uppercase mt-1">Margin Strategy Report</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block bg-slate-100 rounded-lg p-4 border border-slate-200">
                            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Venue Profile</div>
                            <div className="text-2xl font-bold text-slate-900">{sector} <span className="text-slate-300">|</span> {tier}</div>
                            <div className="text-sm text-slate-600 font-medium mt-1">Target GP: <span className="text-black font-bold">{currentGlobalTarget}%</span></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-mono">Generated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Content - Grouped by Type */}
                <div className="space-y-10">
                    {["Draught", "Spirits", "Wine", "Soft Drinks", "Post Mix"].map(type => {
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
                                            <th className="py-2 font-medium text-right">Current Price</th>
                                            <th className="py-2 font-medium text-right text-blue-600">Target Price</th>
                                            <th className="py-2 font-medium text-right">Variance</th>
                                            <th className="py-2 font-medium text-right text-red-600">Annual Leak</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map(item => {
                                            // Extract Comparison Data based on Type
                                            let measure = "-";
                                            let current = "-";
                                            let recommended = "-";
                                            const d = item.details;

                                            if (type === "Draught") {
                                                measure = "Pint";
                                                current = d["Current Sell Price"];
                                                recommended = d["Recommended Pint"];
                                            } else if (type === "Spirits") {
                                                measure = "25ml";
                                                current = d["Current 25ml Price"];
                                                recommended = d["Recommended 25ml"];
                                            } else if (type === "Wine") {
                                                measure = "Bottle";
                                                current = d["Current Bottle Price"];
                                                recommended = d["Recommended Bottle"];
                                                // Note: Could list glasses, but keeping it simple for summary
                                            } else if (type === "Soft Drinks") {
                                                measure = d["Unit Size"] || "Unit";
                                                current = d["Current Sell Price"];
                                                recommended = d["Recommended Price"];
                                            } else if (type === "Post Mix") {
                                                measure = "Pint";
                                                current = d["Current Pint Price"];
                                                recommended = d["Recommended Pint"];
                                            }

                                            // Calc Variance
                                            let variance = "-";
                                            let varClass = "text-slate-400";
                                            if (current && recommended && current !== "-" && recommended !== "-") {
                                                const c = parseFloat(current.replace(/[£,]/g, ""));
                                                const r = parseFloat(recommended.replace(/[£,]/g, ""));
                                                const v = r - c;
                                                if (!isNaN(v)) {
                                                    variance = `${v > 0 ? "+" : ""}£${v.toFixed(2)}`;
                                                    varClass = v > 0 ? "text-green-600 font-bold" : (v < 0 ? "text-red-500" : "text-slate-400");
                                                }
                                            }

                                            // GP Actual
                                            const actGp = d["Current GP"] || d["Current GP (Btl)"] || d["Current GP (Pint)"];

                                            // Leak
                                            const leak = d["Annualized Profit Leak"];

                                            return (
                                                <tr key={item.id} className="group">
                                                    <td className="py-3 font-bold text-slate-800">{item.product}</td>
                                                    <td className="py-3 text-slate-500">{measure}</td>
                                                    <td className="py-3 text-right">
                                                        <div className="font-medium text-slate-700">{current}</div>
                                                        {actGp && actGp !== "-" && <div className="text-[10px] text-slate-400">GP: {actGp}</div>}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <div className="font-bold text-blue-600">{recommended}</div>
                                                        <div className="text-[10px] text-blue-400">Target: {currentGlobalTarget}%</div>
                                                    </td>
                                                    <td className={`py-3 text-right ${varClass}`}>{variance}</td>
                                                    <td className={`py-3 text-right font-bold ${leak && leak !== "-" ? "text-red-600" : "text-slate-300"}`}>
                                                        {leak}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Totals / Disclaimer */}
                <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Notes</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            This report calculates potential revenue uplift based on the selected target GP of <strong>{currentGlobalTarget}%</strong>.
                            "Annualized Profit Leak" estimates the lost potential profit over 52 weeks based on current stated volumes and price variance.
                            All costs are Ex-VAT. All Sell Prices are Inc-VAT (20%).
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="inline-block">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Total Estimated Leak</p>
                            <p className="text-4xl font-black text-red-600">
                                £{history.reduce((acc, item) => {
                                    const leak = item.details["Annualized Profit Leak"];
                                    if (leak && leak !== "-") {
                                        return acc + parseFloat(leak.replace(/[£,]/g, ""));
                                    }
                                    return acc;
                                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-red-400 mt-1">Annual Potential Uplift</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 w-full text-center text-[10px] text-slate-300 left-0">
                    Generated by Whole Hospitality GP Calculator
                </div>
            </div>

            <footer className="print:hidden text-center text-slate-400 text-sm mt-8">
                © 2026 Whole Hospitality | Professional Backend Solutions
            </footer>
        </div>
    );
}
