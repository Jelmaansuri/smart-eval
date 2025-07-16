import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight, Plus, User, Building, ChevronsRight, FileJson, Menu } from 'lucide-react';

// --- SUPABASE SETUP ---
const supabaseUrl = 'https://mhhkmownhwfzzudgfwws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oaGttb3duaHdmenp1ZGdmd3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mjg0OTcsImV4cCI6MjA2ODIwNDQ5N30.0gcK97vPkFqL-XWmbAfdgc6UTVjF1iyKfTVM9Y80LoU';
let supabase = null;

// --- MOCK DATA (For GUI demonstration) ---
const MOCK_ACTIVE_TENDERS = [
    { id: 1, sr_no: "SR-2025-0451", description: "PROPOSED REPLACEMENT OF 33KV GIS FOR PMU BUKIT RAJA", status: "Evaluating", vendors: 3 },
    { id: 2, sr_no: "SR-2025-0448", description: "CIVIL WORKS FOR NEW SUBSTATION AT CYBERJAYA", status: "New", vendors: 0 },
    { id: 3, sr_no: "SR-2025-0432", description: "PROCUREMENT OF FLEET VEHICLES", status: "Completed", vendors: 5 },
];

// --- LAYOUT COMPONENTS ---
const Sidebar = ({ user, onSignOut, isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen }) => {
    const navItems = [
        { icon: <LayoutDashboard size={20} />, name: "Dashboard" },
        { icon: <FileText size={20} />, name: "Tenders" },
        { icon: <CheckSquare size={20} />, name: "Templates" },
        { icon: <Settings size={20} />, name: "Settings" },
    ];

    const sidebarClasses = `
        flex flex-col bg-gray-800 text-gray-300 transition-all duration-300 ease-in-out
        fixed lg:relative inset-y-0 left-0 z-40
        ${isExpanded ? 'w-64' : 'w-20'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
    `;

    return (
        <>
            {/* Overlay for mobile */}
            {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"></div>}
            
            <aside className={sidebarClasses}>
                <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16 flex-shrink-0">
                    {isExpanded && <span className="text-xl font-bold text-white">SmartEval</span>}
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-lg hover:bg-gray-700 hidden lg:block">
                        {isExpanded ? <ChevronLeft /> : <ChevronRight />}
                    </button>
                </div>
                <nav className="flex-grow pt-4">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.name} className="px-4 py-2">
                                <a href="#" className="flex items-center p-2 space-x-4 rounded-lg hover:bg-blue-600 hover:text-white">
                                    {item.icon}
                                    {isExpanded && <span className="font-medium">{item.name}</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-700 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <User className="bg-gray-700 p-2 rounded-full w-10 h-10" />
                        {isExpanded && (
                            <div>
                                <p className="font-semibold text-white text-sm">{user.email.split('@')[0]}</p>
                                <button onClick={onSignOut} className="flex items-center text-xs text-gray-400 hover:text-red-400">
                                    <LogOut size={14} className="mr-1" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

const Header = ({ title, onMenuClick }) => (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200 h-16 flex items-center justify-between lg:justify-start">
        <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 lg:hidden mr-4">
            <Menu />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    </header>
);

const LoadingScreen = ({ text }) => (
    <div className="text-center p-12 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center items-center mb-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        <h2 className="text-2xl font-bold text-gray-800">{text}</h2>
        <p className="text-gray-600 mt-2">This may take a few moments...</p>
    </div>
);

// --- AUTHENTICATION COMPONENT ---
const Auth = ({ onLogin, supabase }) => {
    const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isLogin, setIsLogin] = useState(true); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
    const handleAuth = async (e) => { e.preventDefault(); setLoading(true); setError(''); const { data, error } = isLogin ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password }); if (error) { setError(error.message); } else if (data.user) { onLogin(data.user); } else if (!isLogin) { alert("Sign up successful! Please check your email to verify your account."); } setLoading(false); };
    return ( <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border"><h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isLogin ? 'Sign In' : 'Create Account'}</h2>{error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}<form onSubmit={handleAuth} className="space-y-6"><div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required /></div><button type="submit" disabled={loading} className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</button><p className="text-center text-sm">{isLogin ? "Don't have an account?" : "Already have an account?"}<button type="button" onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-600 hover:underline ml-1">{isLogin ? 'Sign Up' : 'Sign In'}</button></p></form></div></div> );
}

// --- DASHBOARD & WORKFLOW COMPONENTS ---
const Dashboard = ({ onStartTender }) => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border"><h3 className="text-gray-500 font-semibold">Active Tenders</h3><p className="text-3xl font-bold text-blue-600">1</p></div>
            <div className="bg-white p-6 rounded-lg shadow border"><h3 className="text-gray-500 font-semibold">Completed This Month</h3><p className="text-3xl font-bold text-green-600">4</p></div>
            <div className="bg-white p-6 rounded-lg shadow border"><h3 className="text-gray-500 font-semibold">Pending Approval</h3><p className="text-3xl font-bold text-yellow-600">2</p></div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-700">Tender Overview</h2>
            <button onClick={onStartTender} className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"><Plus size={18} className="mr-2"/> New Tender</button>
        </div>
        {/* Desktop Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border hidden md:block">
            <table className="w-full text-left">
                <thead className="bg-gray-50"><tr><th className="p-4 font-semibold text-sm">SR No.</th><th className="p-4 font-semibold text-sm">Description</th><th className="p-4 font-semibold text-sm">Status</th><th className="p-4 font-semibold text-sm">Vendors</th></tr></thead>
                <tbody>
                    {MOCK_ACTIVE_TENDERS.map(tender => (
                        <tr key={tender.id} className="border-b hover:bg-gray-50"><td className="p-4 font-medium text-gray-600">{tender.sr_no}</td><td className="p-4 text-gray-800">{tender.description}</td><td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full ${tender.status === 'Evaluating' ? 'bg-yellow-100 text-yellow-800' : tender.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{tender.status}</span></td><td className="p-4 text-gray-600">{tender.vendors}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
        {/* Mobile Card List */}
        <div className="space-y-4 md:hidden">
            {MOCK_ACTIVE_TENDERS.map(tender => (
                <div key={tender.id} className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex justify-between items-start">
                        <p className="font-bold text-gray-800">{tender.description}</p>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${tender.status === 'Evaluating' ? 'bg-yellow-100 text-yellow-800' : tender.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{tender.status}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-4">
                        <span>{tender.sr_no}</span>
                        <span>{tender.vendors} Vendors</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const CreateTender = ({ onNext }) => {
    const [tenderDetails, setTenderDetails] = useState({ sr_no: "SR-2025-0452", description: "ANNUAL MAINTENANCE FOR FIRE FIGHTING SYSTEM", plant_name: "HQ, BANGSAR", procurement_mode: "Tender Two Envelope", });
    const handleChange = (e) => setTenderDetails({ ...tenderDetails, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onNext(tenderDetails); };
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl mx-auto border">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">1. Tender Setup</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FileJson size={14} className="mr-2"/>SR No.</label><input type="text" name="sr_no" value={tenderDetails.sr_no} onChange={handleChange} className="w-full p-3 border rounded-lg"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Building size={14} className="mr-2"/>Plant Name</label><input type="text" name="plant_name" value={tenderDetails.plant_name} onChange={handleChange} className="w-full p-3 border rounded-lg"/></div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FileText size={14} className="mr-2"/>SR Description</label><textarea name="description" value={tenderDetails.description} onChange={handleChange} rows="3" className="w-full p-3 border rounded-lg"></textarea></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><ChevronsRight size={14} className="mr-2"/>Procurement Mode</label><select name="procurement_mode" value={tenderDetails.procurement_mode} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white"><option>Tender Two Envelope</option><option>Tender Single Envelope</option><option>Quotation</option></select></div>
                <div className="pt-4 flex justify-end"><button type="submit" className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105">Next <ChevronRight className="ml-2" size={20} /></button></div>
            </form>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [user, setUser] = useState(null);
    const [clientInitialized, setClientInitialized] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');

    useEffect(() => {
        const timer = setInterval(() => {
            if (window.supabase) {
                supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
                setClientInitialized(true);
                clearInterval(timer);
            }
        }, 100);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!clientInitialized || !supabase) return;
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        checkSession();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, [clientInitialized]);

    const handleSignOut = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        setUser(null);
        setCurrentView('dashboard');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'new_tender':
                return <><Header title="Create New Tender" onMenuClick={() => setIsMobileOpen(true)} /><div className="p-4 sm:p-8"><CreateTender onNext={() => setCurrentView('dashboard')} /></div></>;
            case 'dashboard':
            default:
                return <><Header title="Dashboard" onMenuClick={() => setIsMobileOpen(true)} /><div className="p-4 sm:p-8"><Dashboard onStartTender={() => setCurrentView('new_tender')} /></div></>;
        }
    };

    if (!clientInitialized) return <div className="flex items-center justify-center h-screen"><LoadingScreen text="Initializing Application..." /></div>;
    if (!user) return <Auth onLogin={setUser} supabase={supabase} />;

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar user={user} onSignOut={handleSignOut} isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
            <main className="flex-1 flex flex-col overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
}
