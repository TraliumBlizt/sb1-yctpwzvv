import React, { useState } from 'react';
import { ArrowLeft, Building2, DollarSign, AlertCircle, CheckCircle, Copy, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountryBanks } from '../hooks/useCountryBanks';
import { useBankAccounts } from '../hooks/useBankAccounts';

// Currency mapping by country
const getCurrencyByCountry = (country: string) => {
  const currencyMap: { [key: string]: { currency: string; symbol: string } } = {
    'Colombia': { currency: 'COP', symbol: '$' },
    'Costa Rica': { currency: 'CRC', symbol: '₡' },
    'Dominican Republic': { currency: 'DOP', symbol: 'RD$' },
    'Ecuador': { currency: 'USD', symbol: '$' },
    'Guatemala': { currency: 'GTQ', symbol: 'Q' },
    'Honduras': { currency: 'HNL', symbol: 'L' },
    'Mexico': { currency: 'MXN', symbol: '$' },
    'Nicaragua': { currency: 'NIO', symbol: 'C$' },
    'Panama': { currency: 'PAB', symbol: 'B/.' },
    'Paraguay': { currency: 'PYG', symbol: '₲' },
    'Peru': { currency: 'PEN', symbol: 'S/' },
    'El Salvador': { currency: 'USD', symbol: '$' },
    'Uruguay': { currency: 'UYU', symbol: '$U' },
    'Venezuela': { currency: 'VES', symbol: 'Bs.S' },
    'United States': { currency: 'USD', symbol: '$' },
    'China': { currency: 'CNY', symbol: '¥' },
    'France': { currency: 'EUR', symbol: '€' },
    'India': { currency: 'INR', symbol: '₹' },
    'United Kingdom': { currency: 'GBP', symbol: '£' },
    'Myanmar': { currency: 'MMK', symbol: 'K' },
    'Argentina': { currency: 'ARS', symbol: '$' },
    'Bolivia': { currency: 'BOB', symbol: 'Bs' },
    'Brasil': { currency: 'BRL', symbol: 'R$' },
    'Chile': { currency: 'CLP', symbol: '$' }
  };
  
  return currencyMap[country] || { currency: 'USD', symbol: '$' };
};

interface EnhancedWithdrawalPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

export const EnhancedWithdrawalPage: React.FC<EnhancedWithdrawalPageProps> = ({ 
  user, 
  onBack, 
  onBalanceUpdate 
}) => {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<string>(user.country || 'Colombia');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string>('');
  const [selectedSavedAccount, setSelectedSavedAccount] = useState<string>('');
  const [useNewAccount, setUseNewAccount] = useState(false);

  // Use real-time country banks data
  const { banks, isLoading: banksLoading, error: banksError, getCountries, getBanksByCountry } = useCountryBanks();
  
  // Use saved bank accounts
  const { bankAccounts, isLoading: accountsLoading, getPrimaryAccount, getAccountsByCountry } = useBankAccounts(user.id);
  
  const countries = getCountries();
  const countryBanks = getBanksByCountry(selectedCountry);
  const selectedBankInfo = countryBanks.find(bank => bank.bank_name === selectedBank);
  const countryCurrency = getCurrencyByCountry(selectedCountry);
  const savedAccountsForCountry = getAccountsByCountry(selectedCountry);
  const selectedSavedAccountData = bankAccounts.find(acc => acc.id === selectedSavedAccount);

  // Auto-select primary account on load
  React.useEffect(() => {
    if (!accountsLoading && bankAccounts.length > 0 && !selectedSavedAccount && !useNewAccount) {
      const primaryAccount = getPrimaryAccount();
      if (primaryAccount) {
        setSelectedSavedAccount(primaryAccount.id);
        setSelectedCountry(primaryAccount.country);
        setSelectedBank(primaryAccount.bank_name);
        setAccountName(primaryAccount.account_name);
        setAccountNumber(primaryAccount.account_number);
      }
    }
  }, [accountsLoading, bankAccounts, selectedSavedAccount, useNewAccount, getPrimaryAccount]);

  // Update form when saved account is selected
  React.useEffect(() => {
    if (selectedSavedAccountData && !useNewAccount) {
      setSelectedCountry(selectedSavedAccountData.country);
      setSelectedBank(selectedSavedAccountData.bank_name);
      setAccountName(selectedSavedAccountData.account_name);
      setAccountNumber(selectedSavedAccountData.account_number);
    }
  }, [selectedSavedAccountData, useNewAccount]);

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue.split('.').length <= 2) {
      setAmount(numericValue);
    }
  };

  const generateReferenceId = () => {
    return 'WTH' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const canWithdraw = () => {
    const amountNum = parseFloat(amount) || 0;
    return (
      (selectedBank || selectedSavedAccountData) &&
      amount &&
      amountNum > 0 &&
      amountNum <= user.balance &&
      (accountName.trim() || selectedSavedAccountData?.account_name) &&
      (accountNumber.trim() || selectedSavedAccountData?.account_number) &&
      amountNum >= 10 // Minimum withdrawal amount
    );
  };

  const handleWithdrawal = async () => {
    if (!canWithdraw()) return;

    setIsProcessing(true);
    const refId = generateReferenceId();
    setReferenceId(refId);

    try {
      const withdrawalAmount = parseFloat(amount);
      
      // Create transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: withdrawalAmount,
          payment_method: selectedBank,
          reference_id: refId,
          status: 'pending', // Withdrawals need processing
          notes: `Withdrawal to ${selectedBank} (${selectedCountry}) - ${accountName}`
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create withdrawal request record
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          transaction_id: transactionData.id,
          country: selectedSavedAccountData?.country || selectedCountry,
          bank_name: selectedSavedAccountData?.bank_name || selectedBank,
          account_name: selectedSavedAccountData?.account_name || accountName,
          account_number: selectedSavedAccountData?.account_number || accountNumber,
          amount: withdrawalAmount,
          status: 'pending'
        });

      if (withdrawalError) throw withdrawalError;

      // Update user balance (deduct immediately for demo)
      const newBalance = user.balance - withdrawalAmount;
      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      onBalanceUpdate(newBalance);
      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setAmount('');
        if (useNewAccount) {
          setSelectedBank('');
          setAccountName('');
          setAccountNumber('');
        }
        setSelectedSavedAccount('');
        setUseNewAccount(false);
        setShowSuccess(false);
        setReferenceId('');
      }, 5000);

    } catch (error) {
      console.error('Withdrawal submission error:', error);
      alert('Failed to submit withdrawal request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Withdrawal Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your withdrawal of <span className="font-bold text-yellow-600">{getCurrencyByCountry(selectedSavedAccountData?.country || selectedCountry).symbol}{amount}</span> to {selectedSavedAccountData?.bank_name || selectedBank} has been submitted for processing.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Reference ID:</p>
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <span className="font-mono text-sm">{referenceId}</span>
              <button
                onClick={() => copyToClipboard(referenceId)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-6">
            <p><strong>Bank:</strong> {selectedSavedAccountData?.bank_name || selectedBank}</p>
            <p><strong>Account:</strong> {selectedSavedAccountData?.account_name || accountName}</p>
            <p><strong>Country:</strong> {selectedSavedAccountData?.country || selectedCountry}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Processing time: 1-3 business days
          </p>
          <button
            onClick={onBack}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl font-semibold"
          >
            {t('general.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-yellow-600">
      {/* Header */}
      <div className="px-6 py-4 pt-12">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">{t('withdrawal.title')}</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="text-white/80 text-sm mb-2">{t('withdrawal.availableBalance')}</p>
          <h3 className="text-3xl font-bold text-white">{user.currencySymbol || '$'}{user.balance.toFixed(2)}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-t-3xl min-h-screen px-6 py-8">
        {/* Saved Accounts Section */}
        {!accountsLoading && bankAccounts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-800">
                {t('withdrawal.withdrawalMethod')}
              </label>
              <button
                onClick={() => {
                  setUseNewAccount(!useNewAccount);
                  if (!useNewAccount) {
                    // Switching to new account
                    setSelectedSavedAccount('');
                    setSelectedBank('');
                    setAccountName('');
                    setAccountNumber('');
                  } else {
                    // Switching back to saved account
                    const primaryAccount = getPrimaryAccount();
                    if (primaryAccount) {
                      setSelectedSavedAccount(primaryAccount.id);
                    }
                  }
                }}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                {useNewAccount ? t('withdrawal.useSavedAccount') : t('withdrawal.addNewAccount')}
              </button>
            </div>

            {!useNewAccount && (
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600 mb-3">{t('withdrawal.selectFromSavedAccounts')}</p>
                {savedAccountsForCountry.length > 0 ? (
                  <div className="space-y-2">
                    {savedAccountsForCountry.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => setSelectedSavedAccount(account.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedSavedAccount === account.id
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-800">{account.bank_name}</h3>
                              {account.is_primary && (
                                <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{account.account_name}</p>
                            <p className="text-sm text-gray-500">****{account.account_number.slice(-4)}</p>
                            <p className="text-xs text-gray-400">{account.country}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedSavedAccount === account.id
                              ? 'border-yellow-500 bg-yellow-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedSavedAccount === account.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No saved accounts for {selectedCountry}</p>
                    <button
                      onClick={() => setUseNewAccount(true)}
                      className="text-yellow-600 hover:text-yellow-700 font-medium mt-2"
                    >
                      {t('withdrawal.addNewAccount')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Country Selection */}
        {(useNewAccount || bankAccounts.length === 0) && (
          <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            <Globe className="w-5 h-5 inline mr-2" />
            {t('withdrawal.selectCountry')}
          </label>
          {banksLoading ? (
            <div className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-gray-50">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-2"></div>
                <span className="text-gray-600">Loading countries...</span>
              </div>
            </div>
          ) : banksError ? (
            <div className="w-full p-4 border-2 border-red-200 rounded-2xl bg-red-50">
              <p className="text-red-600 text-sm">Error loading countries: {banksError}</p>
            </div>
          ) : (
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedBank(''); // Reset bank selection
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-500 focus:outline-none"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          )}
        </div>
        )}

        {/* Bank Selection */}
        {(useNewAccount || bankAccounts.length === 0) && (
          <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            <Building2 className="w-5 h-5 inline mr-2" />
            {t('withdrawal.selectBank')}
          </label>
          {banksLoading ? (
            <div className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-gray-50">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-2"></div>
                <span className="text-gray-600">Loading banks...</span>
              </div>
            </div>
          ) : countryBanks.length === 0 ? (
            <div className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-gray-50">
              <p className="text-gray-600 text-center">{t('withdrawal.noBanksAvailable', { country: selectedCountry })}</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
            {countryBanks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => setSelectedBank(bank.bank_name)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedBank === bank.bank_name
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{bank.bank_name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{bank.bank_type}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedBank === bank.bank_name
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedBank === bank.bank_name && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          )}
        </div>
        )}

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            {t('withdrawal.withdrawalAmount', { currency: countryCurrency.currency })}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-2xl font-bold text-gray-400">
              {countryCurrency.symbol}
            </span>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full pl-16 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-yellow-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {t('withdrawal.minimumAmount', { symbol: countryCurrency.symbol, currency: countryCurrency.currency })}
          </p>
        </div>

        {/* Account Details */}
        {(useNewAccount || bankAccounts.length === 0) && (
          <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('withdrawal.accountDetails')}</h4>
          <div className="space-y-4">
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-500 focus:outline-none"
              placeholder={t('withdrawal.accountHolderName')}
            />
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-500 focus:outline-none"
              placeholder={t('withdrawal.accountNumber')}
            />
          </div>
        </div>
        )}

        {/* Warning for insufficient funds */}
        {amount && parseFloat(amount) > user.balance && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700 text-sm">
              {t('orders.insufficientBalance')}. {t('withdrawal.availableBalance')}: {user.currencySymbol || '$'}{user.balance.toFixed(2)}.
            </p>
          </div>
        )}

        {/* Withdrawal Summary */}
        {amount && (selectedBank || selectedSavedAccountData) && canWithdraw() && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-3">{t('withdrawal.title')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-700">{t('withdrawal.amount')}:</span>
                <span className="font-semibold">{countryCurrency.symbol}{parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">{t('deposit.bank')}:</span>
                <span className="font-semibold">{selectedSavedAccountData?.bank_name || selectedBank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">{t('profile.country')}:</span>
                <span className="font-semibold">{selectedSavedAccountData?.country || selectedCountry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">{t('deposit.accountName')}:</span>
                <span className="font-semibold">{selectedSavedAccountData?.account_name || accountName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Button */}
        <button
          onClick={handleWithdrawal}
          disabled={!canWithdraw() || isProcessing}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isProcessing ? t('common.loading') : t('withdrawal.withdraw', { symbol: countryCurrency.symbol, amount: amount || '0.00' })}
        </button>

        {/* Security Notice */}
       
      </div>
    </div>
  );
};