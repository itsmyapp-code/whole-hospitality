import React from "react";

const categories = [
    {
        name: "The Money",
        context: "Focus on margin protection, real-time kitchen GP tracking, and eliminating stock shrinkage.",
        color: "border-blue-500/30 text-blue-400 bg-blue-950/20",
        pillars: [
            {
                title: "Food & Beverage",
                description: "Recipe costing and menu engineering to ensure every dish makes money.",
                icon: "🍽️",
            },
            {
                title: "Sales & Stock",
                description: "Real-time inventory tracking to protect your margins.",
                icon: "📦",
            },
        ]
    },
    {
        name: "The Venue",
        context: "Focus on physical asset logs, key custody tracking, and rapid housekeeping turnover.",
        color: "border-emerald-500/30 text-emerald-400 bg-emerald-950/20",
        pillars: [
            {
                title: "Room Systems",
                description: "Key tracking, housekeeping, and occupancy management.",
                icon: "🔑",
            },
            {
                title: "Maintenance",
                description: "Track repairs and assets so small leaks don’t become flood damage.",
                icon: "🔧",
            },
        ]
    },
    {
        name: "The Team & Risk",
        context: "Focus on digital compliance logbooks, rotas, and high-level multi-module oversight.",
        color: "border-purple-500/30 text-purple-400 bg-purple-950/20",
        pillars: [
            {
                title: "Operations",
                description: "Rotas, workflows, and SOPs to standardise staff performance.",
                icon: "⚙️",
            },
            {
                title: "Compliance",
                description: "Digital logbooks to keep you legal, safe, and audit-ready.",
                icon: "✅",
            },
            {
                title: "Management Systems",
                description: "High-level dashboards to see the truth of your business instantly.",
                icon: "📊",
            },
        ]
    }
];

export default function Features() {
    return (
        <section className="py-24 px-6 md:px-12 bg-gray-950 text-white font-sans border-t border-gray-900" id="features">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                        The Features: 7 Pillars of Control
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                        One ecosystem covering all critical backend functions, grouped for clear operational scannability.
                    </p>
                </div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {categories.map((category, catIdx) => (
                        <div 
                            key={catIdx} 
                            className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col gap-6 h-full shadow-lg relative"
                        >
                            {/* Category Header */}
                            <div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${category.color}`}>
                                    {category.name}
                                </span>
                                <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                                    {category.context}
                                </p>
                            </div>

                            {/* Category Pillars */}
                            <div className="flex flex-col gap-4 mt-2">
                                {category.pillars.map((pillar, pilIdx) => (
                                    <div 
                                        key={pilIdx} 
                                        className="bg-gray-905/60 border border-gray-850 hover:border-gray-700 p-5 rounded-2xl flex items-start gap-4 transition-all duration-300 hover:bg-gray-800/20 group"
                                    >
                                        <div className="text-3xl p-2.5 rounded-xl bg-gray-900 border border-gray-800 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                            {pillar.icon}
                                        </div>
                                        <div className="space-y-1.5">
                                            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {pillar.title}
                                            </h3>
                                            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                                                {pillar.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
