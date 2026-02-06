export default function Solution() {
    return (
        <section className="py-20 px-8 bg-white text-gray-900">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The Solution: The "Whole" Approach</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We don't just send you a login. We guide you through the fix.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="bg-gray-900 text-white p-10 rounded-2xl md:translate-x-4 z-10 shadow-xl">
                        <h3 className="text-2xl font-bold mb-4 text-blue-400">Phase 1: The Audit</h3>
                        <p className="text-lg leading-relaxed text-gray-300">
                            <strong className="text-white">We come to you.</strong> We review your physical setup, your workflows, and your books. We identify exactly where you are losing money or time.
                        </p>
                    </div>

                    <div className="bg-gray-100 p-10 rounded-2xl md:-translate-x-4 z-0">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">Phase 2: The System</h3>
                        <p className="text-lg leading-relaxed text-gray-600">
                            We deploy our <strong className="text-gray-900">unified backend solution</strong>, tailored to fix the specific issues we found during the audit.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
