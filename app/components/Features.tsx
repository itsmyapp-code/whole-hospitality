const pillars = [
    {
        title: "Management Systems",
        description: "High-level dashboards to see the truth of your business instantly.",
        icon: "📊",
    },
    {
        title: "Sales & Stock",
        description: "Real-time inventory tracking to protect your margins.",
        icon: "📦",
    },
    {
        title: "Food & Beverage",
        description: "Recipe costing and menu engineering to ensure every dish makes money.",
        icon: "🍽️",
    },
    {
        title: "Room Systems",
        description: "Key tracking, housekeeping, and occupancy management.",
        icon: "🔑",
    },
    {
        title: "Operations",
        description: "Rotas, workflows, and SOPs to standardise staff performance.",
        icon: "⚙️",
    },
    {
        title: "Maintenance",
        description: "Track repairs and assets so small leaks don’t become flood damage.",
        icon: "🔧",
    },
    {
        title: "Compliance",
        description: "Digital logbooks to keep you legal, safe, and audit-ready.",
        icon: "✅",
    },
];

export default function Features() {
    return (
        <section className="py-20 px-8 bg-gray-900 text-white">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Features: 7 Pillars of Control</h2>
                <p className="text-gray-400 mb-16 max-w-2xl mx-auto">
                    One ecosystem covering all critical backend functions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pillars.map((pillar, index) => (
                        <div key={index} className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors text-left border border-gray-700">
                            <div className="text-3xl mb-4">{pillar.icon}</div>
                            <h3 className="text-lg font-bold mb-2 text-white">{pillar.title}</h3>
                            <p className="text-sm text-gray-400">{pillar.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
