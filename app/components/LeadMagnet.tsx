export default function LeadMagnet() {
    return (
        <section className="py-20 px-4 bg-blue-600 text-white">
            <div className="max-w-4xl mx-auto bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2">The Operational Health Check</h2>
                        <p className="text-lg text-gray-600">Is Your Backend Broken? Take the 5-Minute Check.</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-blue-600 uppercase tracking-wider">The Money (Stock & Margins)</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 w-5 h-5 accent-blue-600" />
                                    <span className="text-gray-700"><strong>The "Grey Goose" Test:</strong> If a bottle goes missing, would you know by midday?</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 w-5 h-5 accent-blue-600" />
                                    <span className="text-gray-700"><strong>Live GP Tracking:</strong> Can you see your Kitchen GP in real-time right now?</span>
                                </li>
                            </ul>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-blue-600 uppercase tracking-wider">The Assets & Efficiency</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 w-5 h-5 accent-blue-600" />
                                    <span className="text-gray-700"><strong>Key Control:</strong> Do you know who holds every master key right now?</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 w-5 h-5 accent-blue-600" />
                                    <span className="text-gray-700"><strong>The "Silo" Count:</strong> Can you see Rotas, Stock, and Compliance in one app?</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 bg-gray-50 p-6 rounded-xl text-center">
                        <p className="font-medium text-gray-800 mb-4">Checked fewer than 3 boxes? You have leaks.</p>
                        <button className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-lg transition-colors">
                            Book My Free Discovery Call
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
