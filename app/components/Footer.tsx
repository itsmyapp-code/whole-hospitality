export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 px-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                    <h3 className="text-2xl font-bold text-white mb-2">Whole Hospitality</h3>
                    <p className="text-sm">© {new Date().getFullYear()} All rights reserved.</p>
                </div>

                <div className="flex gap-8 text-sm">
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}
