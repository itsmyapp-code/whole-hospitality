import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative h-screen flex items-center justify-center bg-gray-900 text-white overflow-hidden">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-black/50 z-0">
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                {/* Logo */}
                <div className="mb-8 relative w-48 h-48 sm:w-64 sm:h-64">
                    {/* Using standard img for now if next/image has issues with local files in some envs, 
              but planning for next/image. 
              Assuming public/logo.png is available at /logo.png */}
                    <Image
                        src="/logo.png"
                        alt="Whole Hospitality Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    The Software Helps.<br />
                    <span className="text-gray-300">The Experience Saves You.</span>
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto">
                    The only hospitality platform that starts with an on-site audit. We find the leaks in your GP, stock, and operations, then give you the tools to plug them for good.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105">
                        Book a Systems Audit
                    </button>
                    <button className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105">
                        Explore the Software
                    </button>
                </div>
            </div>
        </section>
    );
}
