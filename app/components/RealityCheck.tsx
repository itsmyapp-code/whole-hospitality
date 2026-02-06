export default function RealityCheck() {
    return (
        <section className="py-20 px-8 bg-gray-50 text-gray-900">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The "Reality Check"</h2>
                    <p className="text-xl text-gray-600">Do These Problems Sound Familiar?</p>
                    <p className="text-gray-500 mt-2">You don't need another app. You need answers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-4xl mb-4">📉</div>
                        <h3 className="text-xl font-bold mb-3">The "Low GP" Mystery</h3>
                        <p className="text-gray-600">
                            You’re selling plenty, but the profit isn't there. Is it portion control? Waste? Supplier pricing?
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-4xl mb-4">👻</div>
                        <h3 className="text-xl font-bold mb-3">The Vanishing Stock</h3>
                        <p className="text-gray-600">
                            Alcohol and ingredients are disappearing, and your current spreadsheet isn't catching it.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-4xl mb-4">🌪️</div>
                        <h3 className="text-xl font-bold mb-3">The Operational Chaos</h3>
                        <p className="text-gray-600">
                            Missing room keys, lapsed compliance checks, and maintenance requests written on scraps of paper.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
