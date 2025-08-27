import React from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, login, register, logout, updateBalance, isLoading } = useAuth();

  if (user) {
    return <Dashboard user={user} onLogout={logout} onBalanceUpdate={updateBalance} />;
  }

  return (
    <AuthForm
      onLogin={login}
      onRegister={register}
      isLoading={isLoading}
    />
  );
}

export default App;