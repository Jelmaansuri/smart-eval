import React, { useState, useEffect } from 'react';
import { FileText, UploadCloud, CheckCircle, XCircle, AlertTriangle, ChevronRight, Plus, Trash2, Lock, Clock, Eye, X, Download, ShieldCheck, FileSpreadsheet, FileJson, User, Building, ChevronsRight, Inbox, FileCheck2, DollarSign, ListOrdered, Award, Bot } from 'lucide-react';

// --- SUPABASE SETUP ---
// In a real project, these would be in a .env file.
const supabaseUrl = 'https://mhhkmownhwfzzudgfwws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oaGttb3duaHdmenp1ZGdmd3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mjg0OTcsImV4cCI6MjA2ODIwNDQ5N30.0gcK97vPkFqL-XWmbAfdgc6UTVjF1iyKfTVM9Y80LoU';

// Initialize supabase client as null. It will be created once the component mounts and the external script is loaded.
let supabase = null;


// --- UI COMPONENTS ---
const Header = ({ user, onSignOut }) => (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck className="h-6 w-6 text-white" /></div>
                <h1 className="text-xl font-bold text-gray-800">Smart Tender Evaluator</h1>
            </div>
            {user && (
                <div className="text-sm text-gray-500 text-right flex items-center space-x-3">
                    <User size={16}/>
                    <div>
                        <p className="font-semibold truncate max-w-[150px]">{user.email}</p>
                        <button onClick={onSignOut} className="text-xs text-blue-600 hover:underline">Sign Out</button>
                    </div>
                </div>
            )}
        </div>
    </header>
);

const StepIndicator = ({ currentStep }) => {
    const steps = ["Setup", "Base Docs", "Vendor Docs", "Evaluation"];
    return (
        <div className="flex justify-center items-center my-8 px-4">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${index + 1 <= currentStep ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300'} transition-all duration-500`}>
                            {index + 1 < currentStep ? <CheckCircle size={28} /> : index + 1}
                        </div>
                        <p className={`mt-2 text-sm font-medium w-24 ${index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-auto h-1 rounded-full mx-2 transition-all duration-500 ${index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

const LoadingScreen = ({ text }) => (
    <div className="text-center p-12 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center items-center mb-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        <h2 className="text-2xl font-bold text-gray-800">{text}</h2>
        <p className="text-gray-600 mt-2">This may take a few moments...</p>
    </div>
);


// --- AUTHENTICATION ---
const Auth = ({ onLogin, supabase }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const { data, error } = isLogin
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (error) {
            setError(error.message);
        } else if (data.user) {
            onLogin(data.user);
        } else if (!isLogin) {
            alert("Sign up successful! Please check your email to verify your account.");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto border mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isLogin ? 'Sign In' : 'Create Account'}</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
            <form onSubmit={handleAuth} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required />
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-b
