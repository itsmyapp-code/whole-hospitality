"use client";

import Image from "next/image";

export default function Hero() {
    const handleExploreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const element = document.getElementById("room-inventory");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="relative h-screen flex items-center justify-center bg-slate-700 text-white overflow-hidden font-sans">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-black/50 z-0">
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                {/* Logo */}
                <div className="mb-8 relative w-48 h-48 sm:w-64 sm:h-64 hidden lg:block">
                    <Image
                        src="/logo.png"
                        alt="Whole Hospitality Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white leading-tight">
                    Stop Guessing Your Margins.<br />
                    <span className="text-blue-400">Fix Your Hospitality Backend.</span>
                </h1>
                
                <p className="text-lg md:text-xl lg:text-2xl mb-12 text-slate-200 max-w-3xl mx-auto leading-relaxed">
                    The only hospitality platform that starts with an on-site physical audit and backs it with an airtight, client-side software ecosystem.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={handleExploreClick}
                        className="bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                    >
                        Explore the Software
                    </button>
                </div>
            </div>
        </section>
    );
}
