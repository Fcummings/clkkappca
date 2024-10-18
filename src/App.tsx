import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { DollarSign, Clock, UserCircle, Menu } from 'lucide-react';
import Header from './components/Header';
import Balance from './components/Balance';
import Actions from './components/Actions';
import TransactionHistory from './components/TransactionHistory';
import Profile from './components/Profile';
import Settings from './components/Settings';
import SignIn from './components/SignIn';

function App() {
  const [balance, setBalance] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setBalance(doc.data()?.balance || 0);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const renderActiveSection = () => {
    if (!user) return null;
    
    switch (activeSection) {
      case 'home':
        return (
          <>
            <Balance balance={balance} />
            <Actions onSend={() => {}} onRequest={() => {}} currentUserEmail={user.email} />
            <TransactionHistory userId={user.uid} />
          </>
        );
      case 'activity':
        return <TransactionHistory userId={user.uid} />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route
              path="/"
              element={
                user ? (
                  renderActiveSection()
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
          </Routes>
        </main>
        {user && (
          <nav className="bg-gray-900 p-4">
            <ul className="flex justify-around">
              <li>
                <button onClick={() => setActiveSection('home')} className={`p-2 rounded ${activeSection === 'home' ? 'bg-primary' : ''}`}>
                  <DollarSign />
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('activity')} className={`p-2 rounded ${activeSection === 'activity' ? 'bg-primary' : ''}`}>
                  <Clock />
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('profile')} className={`p-2 rounded ${activeSection === 'profile' ? 'bg-primary' : ''}`}>
                  <UserCircle />
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('settings')} className={`p-2 rounded ${activeSection === 'settings' ? 'bg-primary' : ''}`}>
                  <Menu />
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </Router>
  );
}

export default App;