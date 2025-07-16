import React, { useState, useEffect } from 'react';
import { FileText, UploadCloud, CheckCircle, XCircle, AlertTriangle, ChevronRight, Plus, Trash2, Lock, Clock, Eye, X, Download, ShieldCheck, FileSpreadsheet, FileJson, User, Building, ChevronsRight, Inbox, FileCheck2, DollarSign, ListOrdered, Award, Bot } from 'lucide-react';

// --- SUPABASE SETUP ---
const supabaseUrl = 'https://mhhkmownhwfzzudgfwws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oaGttb3duaHdmenp1ZGdmd3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mjg0OTcsImV4cCI6MjA2ODIwNDQ5N30.0gcK97vPkFqL-XWmbAfdgc6UTVjF1iyKfTVM9Y80LoU';

let supabase = null;

// --- MOCK DATA (to be replaced with DB data) ---
const MOCK_ITB_CHECKLIST = [
    { id: 'doc1', name: 'Sijil Pendaftaran Syarikat (SSM)' }, { id: 'doc2', name: 'Sijil Kementerian Kewangan (MOF)' },
    { id: 'doc3', name: 'Profil Syarikat (Company Profile)' }, { id: 'doc4', name: 'Cadangan Teknikal (Technical Proposal)' },
    { id: 'doc5', name: 'Jadual Harga (Price Schedule)' },
];
const MOCK_DETAILED_BQ = [
    { id: 'A', wbs: 'A', description: 'Supply of Main Equipment', type: 'header' }, { id: 'A1', wbs: 'A.1', description: '33kV GIS Switchgear', unit: 'Set', qty: 1, type: 'item' },
    { id: 'A2', wbs: 'A.2', description: '11kV MV Switchboard', unit: 'Set', qty: 1, type: 'item' }, { id: 'A3', wbs: 'A.3', description: 'Power Transformer 33/11kV', unit: 'Unit', qty: 2, type: 'item' },
    { id: 'B', wbs: 'B', description: 'Cabling Works', type: 'header' }, { id: 'B1', wbs: 'B.1', description: '33kV XLPE Power Cable', unit: 'meter', qty: 500, type: 'item' },
    { id: 'B2', wbs: 'B.2', description: 'Control & Monitoring Cable', unit: 'lot', qty: 1, type: 'item' }, { id: 'C', wbs: 'C', description: 'Installation & Services', type: 'header' },
    { id: 'C1', wbs: 'C.1', description: 'Installation & Erection Works', unit: 'L.S.', qty: 1, type: 'item' }, { id: 'C2', wbs: 'C.2', description: 'Testing & Commissioning', unit: 'L.S.', qty: 1, type: 'item' },
];
const MOCK_DETAILED_COMMERCIAL_DATA = {
    'Mega Engineering Sdn. Bhd.': { 'A1': 450000, 'A2': 320000, 'A3': 180000, 'B1': 350, 'B2': 75000, 'C1': 150000, 'C2': 80000 },
    'Maju Jaya Power': { 'A1': 465000, 'A2': 315000, 'A3': 175000, 'B1': 340, 'B2': 80000, 'C1': 140000, 'C2': 78000 },
};

// --- UI COMPONENTS ---
const Header = ({ user, onSignOut }) => ( <header className="bg-white shadow-sm p-4 border-b border-gray-200 sticky top-0 z-30"><div className="max-w-7xl mx-auto flex justify-between items-center"><div className="flex items-center space-x-3"><div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck className="h-6 w-6 text-white" /></div><h1 className="text-xl font-bold text-gray-800">Smart Tender Evaluator</h1></div>{user && (<div className="text-sm text-gray-500 text-right flex items-center space-x-3"><User size={16}/><div><p className="font-semibold truncate max-w-[150px]">{user.email}</p><button onClick={onSignOut} className="text-xs text-blue-600 hover:underline">Sign Out</button></div></div>)}</div></header> );
const StepIndicator = ({ currentStep }) => { const steps = ["Setup", "Base Docs", "Vendor Docs", "Evaluation"]; return ( <div className="flex justify-center items-center my-8 px-4">{steps.map((step, index) => (<React.Fragment key={step}><div className="flex flex-col items-center text-center"><div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${index + 1 <= currentStep ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300'} transition-all duration-500`}>{index + 1 < currentStep ? <CheckCircle size={28} /> : index + 1}</div><p className={`mt-2 text-sm font-medium w-24 ${index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>{step}</p></div>{index < steps.length - 1 && <div className={`flex-auto h-1 rounded-full mx-2 transition-all duration-500 ${index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}</React.Fragment>))}</div> );};
const LoadingScreen = ({ text }) => ( <div className="text-center p-12 bg-white rounded-xl shadow-lg"><div className="flex justify-center items-center mb-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div><h2 className="text-2xl font-bold text-gray-800">{text}</h2><p className="text-gray-600 mt-2">This may take a few moments...</p></div> );

// --- AUTHENTICATION ---
const Auth = ({ onLogin, supabase }) => { const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isLogin, setIsLogin] = useState(true); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const handleAuth = async (e) => { e.preventDefault(); setLoading(true); setError(''); const { data, error } = isLogin ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password }); if (error) { setError(error.message); } else if (data.user) { onLogin(data.user); } else if (!isLogin) { alert("Sign up successful! Please check your email to verify your account."); } setLoading(false); }; return ( <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto border mt-10"><h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isLogin ? 'Sign In' : 'Create Account'}</h2>{error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}<form onSubmit={handleAuth} className="space-y-6"><div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required /></div><button type="submit" disabled={loading} className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</button><p className="text-center text-sm">{isLogin ? "Don't have an account?" : "Already have an account?"}<button type="button" onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-600 hover:underline ml-1">{isLogin ? 'Sign Up' : 'Sign In'}</button></p></form></div> );}

// --- WORKFLOW STEPS ---
const CreateTenderStep = ({ onNext, user, supabase }) => { const [loading, setLoading] = useState(false); const [tenderDetails, setTenderDetails] = useState({ sr_no: "SR-2025-0451", description: "PROPOSED REPLACEMENT OF 33KV GIS FOR PMU BUKIT RAJA", plant_name: "PMU BUKIT RAJA, SELANGOR", procurement_mode: "Tender Two Envelope", }); const handleChange = (e) => setTenderDetails({ ...tenderDetails, [e.target.name]: e.target.value }); const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); const { data, error } = await supabase.from('tenders').insert([tenderDetails]).select(); if (error) { alert(`Error creating tender: ${error.message}`); setLoading(false); } else { onNext(data[0]); } }; return ( <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto border"><h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">1. Tender Setup</h2><form onSubmit={handleSubmit} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FileJson size={14} className="mr-2"/>SR No.</label><input type="text" name="sr_no" value={tenderDetails.sr_no} onChange={handleChange} className="w-full p-3 border rounded-lg"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Building size={14} className="mr-2"/>Plant Name</label><input type="text" name="plant_name" value={tenderDetails.plant_name} onChange={handleChange} className="w-full p-3 border rounded-lg"/></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FileText size={14} className="mr-2"/>SR Description</label><textarea name="description" value={tenderDetails.description} onChange={handleChange} rows="3" className="w-full p-3 border rounded-lg"></textarea></div><div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><ChevronsRight size={14} className="mr-2"/>Procurement Mode</label><select name="procurement_mode" value={tenderDetails.procurement_mode} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white"><option>Tender Two Envelope</option><option>Tender Single Envelope</option><option>Quotation</option></select></div><div className="pt-4 flex justify-end"><button type="submit" disabled={loading} className="flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-transform transform hover:scale-105">{loading ? 'Saving...' : 'Next: Upload Base Docs'} <ChevronRight className="ml-2" size={20} /></button></div></form></div> );};
const UploadBaseDocsStep = ({ onNext, activeTender, supabase }) => { const [uploads, setUploads] = useState({}); const [parsing, setParsing] = useState(false); const [checklist, setChecklist] = useState([]); const handleUpload = async (type, file) => { setUploads({ ...uploads, [type]: true }); if (type === 'itb') { setParsing(true); setTimeout(() => { setChecklist(MOCK_ITB_CHECKLIST); setParsing(false); }, 2000); } }; const allUploaded = uploads.sr && uploads.bq && uploads.notice && uploads.itb; return ( <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto border"><h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">2. Upload Base Documents</h2><div className="space-y-4">{[{id: 'sr', name: 'SR-Summary (PDF)'}, {id: 'bq', name: 'Price Estimation/BQ (Excel)'}, {id: 'notice', name: 'Tender Notice (PDF)'}, {id: 'itb', name: 'Instruction to Bidders (ITB) (PDF)'}].map(doc => (<div key={doc.id} className="border p-4 rounded-lg flex justify-between items-center"><span className="font-medium flex items-center">{uploads[doc.id] ? <CheckCircle size={18} className="text-green-500 mr-2"/> : <FileText size={18} className="text-gray-400 mr-2"/>}{doc.name}</span><button onClick={() => handleUpload(doc.id)} disabled={uploads[doc.id]} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold disabled:bg-green-100 disabled:text-green-700">{uploads[doc.id] ? 'Uploaded' : 'Upload'}</button></div>))}</div>{(parsing || checklist.length > 0) && (<div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500"><h3 className="font-bold text-blue-800 flex items-center"><Bot size={18} className="mr-2"/>AI-Powered ITB Analysis</h3>{parsing ? <p className="text-sm text-blue-700">AI is studying the ITB to generate a vendor checklist...</p> : <><p className="text-sm text-blue-700 mb-2">Checklist generated. The following documents will be required from each vendor:</p><ul className="list-disc list-inside text-sm text-blue-900">{checklist.map(item => <li key={item.id}>{item.name}</li>)}</ul></>}</div>)}<div className="pt-6 flex justify-end"><button onClick={() => onNext(checklist)} disabled={!allUploaded || parsing} className="flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-transform transform hover:scale-105">Next: Upload Vendor Docs <ChevronRight className="ml-2" size={20} /></button></div></div> );};
const UploadVendorDocsStep = ({ onNext, activeTender, checklist, supabase }) => { const [vendors, setVendors] = useState([]); useEffect(() => { if (activeTender) { const fetchVendors = async () => { const { data } = await supabase.from('vendors').select('*').eq('tender_id', activeTender.id); setVendors(data.map(v => ({...v, docs: checklist.map(c => ({...c, status: 'pending'})), isProcessing: false}))); }; fetchVendors(); } }, [activeTender]); const addVendor = async () => { const newName = prompt("Enter new vendor name:"); if (newName) { const { data } = await supabase.from('vendors').insert([{ name: newName, tender_id: activeTender.id }]).select(); setVendors([...vendors, {...data[0], docs: checklist.map(c => ({...c, status: 'pending'})), isProcessing: false}]); } }; const deleteVendor = async (vendorId) => { if (window.confirm("Are you sure?")) { await supabase.from('vendors').delete().eq('id', vendorId); setVendors(vendors.filter(v => v.id !== vendorId)); } }; const handleCombinedUpload = (vendorId) => { setVendors(vendors.map(v => v.id === vendorId ? { ...v, isProcessing: true } : v)); setTimeout(() => { setVendors(vendors.map(v => v.id === vendorId ? { ...v, isProcessing: false, docs: v.docs.map(d => ({...d, status: 'uploaded'})) } : v)); }, 2500); }; return ( <div className="bg-white p-8 rounded-xl shadow-lg max-w-6xl mx-auto border"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">3. Upload Vendor Documents</h2><button onClick={addVendor} className="flex items-center bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition text-sm"><Plus size={16} className="mr-2" /> Add Vendor</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{vendors.map(vendor => (<div key={vendor.id} className="border p-4 rounded-lg bg-gray-50 relative"><button onClick={() => deleteVendor(vendor.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button><h3 className="font-bold text-lg mb-4 pr-6">{vendor.name}</h3><div className="space-y-2"><button onClick={() => handleCombinedUpload(vendor.id)} disabled={vendor.isProcessing || vendor.docs.every(d => d.status === 'uploaded')} className="w-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold py-3 px-4 rounded-lg hover:bg-blue-200 transition text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"><UploadCloud size={16} className="mr-2"/> {vendor.isProcessing ? 'AI is Processing...' : 'Upload Combined PDF'}</button><div className="pt-2">{vendor.docs.map(doc => (<div key={doc.id} className="flex items-center text-sm p-1">{doc.status === 'uploaded' ? <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0"/> : <XCircle size={16} className="text-gray-300 mr-2 flex-shrink-0"/>}<span className={doc.status === 'uploaded' ? 'text-gray-700' : 'text-gray-400'}>{doc.name}</span></div>))}</div></div></div>))}</div><div className="pt-8 flex justify-end"><button onClick={onNext} className="flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105">Start Evaluation <ChevronRight className="ml-2" size={20} /></button></div></div> );};
const EvaluationDashboardStep = ({ activeTender, onRestart, supabase }) => { return <div className="text-center p-8 bg-white rounded-xl shadow-lg">The full evaluation dashboard would be built out here, connecting to Supabase to fetch and display evaluation data. <button onClick={onRestart} className="mt-4 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Start Over</button></div> };

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [clientInitialized, setClientInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = dashboard/home
  const [activeTender, setActiveTender] = useState(null);

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [clientInitialized]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setCurrentStep(0);
    setActiveTender(null);
  };

  const renderContent = () => {
    if (!clientInitialized) return <LoadingScreen text="Initializing Application..." />;
    if (!session) return <Auth onLogin={setUser} supabase={supabase} />;
    
    switch (currentStep) {
        case 1: return <CreateTenderStep onNext={(tender) => { setActiveTender(tender); setCurrentStep(2); }} user={user} supabase={supabase} />;
        case 2: return <UploadBaseDocsStep onNext={(checklist) => { setCurrentStep(3); }} activeTender={activeTender} supabase={supabase} />;
        case 3: return <UploadVendorDocsStep onNext={() => setCurrentStep(4)} activeTender={activeTender} checklist={MOCK_ITB_CHECKLIST} supabase={supabase} />;
        case 4: return <EvaluationDashboardStep onRestart={() => setCurrentStep(0)} activeTender={activeTender} supabase={supabase} />;
        default: return (
            <div className="text-center">
                <h2 className="text-3xl font-bold">Welcome, {user.email}</h2>
                <p className="text-gray-500 mt-2">Select an option to get started.</p>
                <button onClick={() => setCurrentStep(1)} className="mt-8 flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 mx-auto"><Plus size={20} className="mr-2"/> Create New Tender</button>
            </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header user={user} onSignOut={handleSignOut} />
      <main className="py-8 px-4">
        {user && currentStep > 0 && <StepIndicator currentStep={currentStep} />}
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Smart Tender Evaluator. For Live Deployment.</p>
      </footer>
    </div>
  );
}
