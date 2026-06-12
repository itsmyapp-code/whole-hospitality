export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 px-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                    <h3 className="text-2xl font-bold text-white mb-2">Whole Hospitality</h3>
                    <p className="text-sm">Powered by Whole Hospitality</p>
                </div>

                <div className="flex flex-wrap gap-6 text-sm">
                    <a href="/#contact" className="hover:text-white transition-colors">Contact</a>
                    <a href="/legal/compliance-framework" className="hover:text-white transition-colors">Legal & Compliance</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="/audit/bar" className="hover:text-white text-slate-700 transition-colors">ADMIN</a>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 flex flex-col items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-3">
                    <img src="/itsmyapp_logo.png" alt="ItsMyApp" className="h-5 w-auto opacity-50" />
                    <span>Developed by <a href="https://itsmyapp.co.uk" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white underline underline-offset-2 transition-colors">itsmyapp.co.uk</a></span>
                </div>
                <p>&copy; 2026 All rights reserved.</p>
            </div>
        </footer>
    );
}
