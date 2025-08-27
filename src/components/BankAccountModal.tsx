import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { banksByCountry } from '../data/bankData';

interface BankAccount {
  id: string;
  country: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  account_type: string;
  is_primary: boolean;
}

interface BankAccountModalProps {
  userId: string;
  userCountry: string;
  onClose: () => void;
}

export const BankAccountModal: React.FC<BankAccountModalProps> = ({ 
  userId, 
  userCountry, 
  onClose 
}) => {
  const { t } = useLanguage();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({
    country: userCountry,
    bank_name: '',
    account_name: '',
    account_number: '',
    account_type: 'checking'
  });

  const countries = Object.keys(banksByCountry);
  const banks = banksByCountry[newAccount.country] || [];

  useEffect(() => {
    fetchBankAccounts();
  }, [userId]);

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAccount.bank_name || !newAccount.account_name || !newAccount.account_number) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: userId,
          country: newAccount.country,
          bank_name: newAccount.bank_name,
          account_name: newAccount.account_name,
          account_number: newAccount.account_number,
          account_type: newAccount.account_type,
          is_primary: bankAccounts.length === 0 // First account is primary
        });

      if (error) throw error;

      await fetchBankAccounts();
      setIsAdding(false);
      setNewAccount({
        country: userCountry,
        bank_name: '',
        account_name: '',
        account_number: '',
        account_type: 'checking'
      });
    } catch (error) {
      console.error('Error adding bank account:', error);
      alert('Failed to add bank account. Please try again.');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      await fetchBankAccounts();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      alert('Failed to delete bank account. Please try again.');
    }
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      // First, set all accounts to non-primary
      await supabase
        .from('bank_accounts')
        .update({ is_primary: false })
        .eq('user_id', userId);

      // Then set the selected account as primary
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_primary: true })
        .eq('id', accountId);

      if (error) throw error;
      await fetchBankAccounts();
    } catch (error) {
      console.error('Error setting primary account:', error);
      alert('Failed to set primary account. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{t('profile.bankAccount')}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Existing Bank Accounts */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Your Bank Accounts</h4>
              {bankAccounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No bank accounts added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        account.is_primary
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h5 className="font-semibold text-gray-800">{account.bank_name}</h5>
                            {account.is_primary && (
                              <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{account.account_name}</p>
                          <p className="text-sm text-gray-500">{account.account_number}</p>
                          <p className="text-xs text-gray-400">{account.country}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!account.is_primary && (
                            <button
                              onClick={() => handleSetPrimary(account.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
                              title="Set as primary"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                            title="Delete account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Account */}
            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-yellow-500 hover:text-yellow-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Bank Account</span>
              </button>
            ) : (
              <form onSubmit={handleAddAccount} className="space-y-4 p-4 bg-gray-50 rounded-xl">
                <h5 className="font-semibold text-gray-800">Add New Bank Account</h5>
                
                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={newAccount.country}
                    onChange={(e) => setNewAccount({ ...newAccount, country: e.target.value, bank_name: '' })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bank Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank
                  </label>
                  <select
                    value={newAccount.bank_name}
                    onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="">Select a bank...</option>
                    {banks.map((bank) => (
                      <option key={bank.name} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={newAccount.account_name}
                    onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter account holder name"
                    required
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={newAccount.account_number}
                    onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter account number"
                    required
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    value={newAccount.account_type}
                    onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="mobile">Mobile Wallet</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    {t('general.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Add Account
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};