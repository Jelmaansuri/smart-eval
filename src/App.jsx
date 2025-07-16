import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FileText, Plus, User, Building, ChevronsRight, FileJson, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';

// --- SUPABASE SETUP ---
const supabaseUrl = 'https://mhhkmownhwfzzudgfwws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oaGttb3duaHdmenp1ZGdmd3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mjg0OTcsImV4cCI6MjA2ODIwNDQ5N30.0gcK97vPkFqL-XWmbAfdgc6UTVjF1iyKfTVM9Y80LoU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- MOCK DATA ---
const MOCK_ACTIVE_TENDERS = [
    { id: 1, sr_no: "SR-2025-0451", description: "PROPOSED REPLACEMENT OF 33KV GIS FOR PMU BUKIT RAJA", status: "Evaluating", vendors: 3 },
    { id: 2, sr_no: "SR-2025-0448", description: "CIVIL WORKS FOR NEW SUBSTATION AT CYBERJAYA", status: "New", vendors: 0 },
    { id: 3, sr_no: "SR-2025-0432", description: "PROCUREMENT OF FLEET VEHICLES", status: "Completed", vendors: 5 },
];

// --- UI COMPONENTS ---
const Header = ({ user, onSignOut }) => (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck className="h-6 w-6 text-white" /></div>
                <h1 className="text-2xl font-bold text-gray-800">Smart Tender Evaluator</h1>
            </div>
            {user && (
                <div className="flex items-center space-x-3">
                     <div className="text-sm text-gray-500 text-right">
                        <p className="font-semibold truncate max-w-[150px]">{user.email}</p>
                        <p>Lead Evaluator</p>
                    </div>
                    <button onClick={onSignOut} className="p-2 rounded-lg hover:bg-gray-100" title="Sign Out">
                        <LogOut size={20} className="text-gray-600" />
                    </button>
                </div>
            )}
        </div>
    </header>
);

const LoadingScreen = ({ text }) => (
    <div className="flex items-center justify-center h-screen">
        <div className="text-center p-12">
            <div className="flex justify-center items-center mb-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
            <h2 className="text-xl font-bold text-gray-700">{text}</h2>
        </div>
    </div>
);

const Auth = ({ onLogin }) => {
    const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isLogin, setIsLogin] = useState(true); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
    const handleAuth = async (e) => { e.preventDefault(); setLoading(true); setError(''); const { data, error } = isLogin ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password }); if (error) { setError(error.message); } else if (data.user) { onLogin(data.user); } else if (!isLogin) { alert("Sign up successful! Please check your email to verify your account."); } setLoading(false); };
    return ( <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border"><h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isLogin ? 'Sign In' : 'Create Account'}</h2>{error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}<form onSubmit={handleAuth} className="space-y-6"><div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required /></div><button type="submit" disabled={loading} className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</button><p className="text-center text-sm">{isLogin ? "Don't have an account?" : "Already have an account?"}<button type="button" onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-600 hover:underline ml-1">{isLogin ? 'Sign Up' : 'Sign In'}</button></p></form></div></div> );
}

const Dashboard = ({ onStartTender }) => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border"><h3 className="text-gray-500 font-semibold">Active Tenders</h3><p className="text-3xl font-bold text-blue-600">{MOCK_ACTIVE_TENDERS.filter(t => t.status === 'Evaluating').length}</p></div>
            <div className="bg-white p-6 rounded-lg shadow border"><h3 className="text-gray-500 font-semibold">Completed This Month</h3><p className="text-3xl font-bold text-green-600">{MOCK_ACTIVE_TENDERS.filter(t => t.status === 'Completed').length}</p></div>
            <div className="bg-white p-6 rounded-lg shadow border"><h3 className="text-gray-500 font-semibold">New Tenders</h3><p className="text-3xl font-bold text-yellow-600">{MOCK_ACTIVE_TENDERS.filter(t => t.status === 'New').length}</p></div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-700">Tender Overview</h2>
            <button onClick={onStartTender} className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"><Plus size={18} className="mr-2"/> New Tender</button>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden border">
            <table className="w-full text-left">
                <thead className="bg-gray-50"><tr><th className="p-4 font-semibold text-sm">SR No.</th><th className="p-4 font-semibold text-sm">Description</th><th className="p-4 font-semibold text-sm">Status</th><th className="p-4 font-semibold text-sm">Vendors</th></tr></thead>
                <tbody>
                    {MOCK_ACTIVE_TENDERS.map(tender => (
                        <tr key={tender.id} className="border-b hover:bg-gray-50"><td className="p-4 font-medium text-gray-600">{tender.sr_no}</td><td className="p-4 text-gray-800">{tender.description}</td><td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full ${tender.status === 'Evaluating' ? 'bg-yellow-100 text-yellow-800' : tender.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{tender.status}</span></td><td className="p-4 text-gray-600">{tender.vendors}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const CreateTender = ({ onNext }) => {
    const [tenderDetails, setTenderDetails] = useState({ sr_no: "SR-2025-0452", description: "ANNUAL MAINTENANCE FOR FIRE FIGHTING SYSTEM", plant_name: "HQ, BANGSAR", procurement_mode: "Tender Two Envelope", });
    const handleChange = (e) => setTenderDetails({ ...tenderDetails, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onNext(tenderDetails); };
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl mx-auto border">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create New Tender</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FileJson size={14} className="mr-2"/>SR No.</label><input type="text" name="sr_no" value={tenderDetails.sr_no} onChange={handleChange} className="w-full p-3 border rounded-lg"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Building size={14} className="mr-2"/>Plant Name</label><input type="text" name="plant_name" value={tenderDetails.plant_name} onChange={handleChange} className="w-full p-3 border rounded-lg"/></div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FileText size={14} className="mr-2"/>SR Description</label><textarea name="description" value={tenderDetails.description} onChange={handleChange} rows="3" className="w-full p-3 border rounded-lg"></textarea></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><ChevronsRight size={14} className="mr-2"/>Procurement Mode</label><select name="procurement_mode" value={tenderDetails.procurement_mode} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white"><option>Tender Two Envelope</option><option>Tender Single Envelope</option><option>Quotation</option></select></div>
                <div className="pt-4 flex justify-end"><button type="submit" className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105">Save and Continue <ChevronRight className="ml-2" size={20} /></button></div>
            </form>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setCurrentView('dashboard');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'new_tender':
                return <CreateTender onNext={() => setCurrentView('dashboard')} />;
            case 'dashboard':
            default:
                return <Dashboard onStartTender={() => setCurrentView('new_tender')} />;
        }
    };

    if (loading) return <LoadingScreen text="Initializing Application..." />;
    if (!user) return <Auth onLogin={setUser} />;

    return (
        <div className="min-h-screen bg-gray-100">
            <Header user={user} onSignOut={handleSignOut} />
            <main className="p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
