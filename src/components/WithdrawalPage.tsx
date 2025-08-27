import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Building2, DollarSign, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface WithdrawalPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

const withdrawalMethods = [
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: Building2,
    description: 'Direct transfer to your bank account',
    fees: '$2.50',
    processingTime: '1-3 business days',
    minAmount: 10
  }
];

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ user, onBack, onBalanceUpdate }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string>('');
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    accountName: ''
  });

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue.split('.').length <= 2) {
      setAmount(numericValue);
    }
  };

  const generateReferenceId = () => {
    return 'WTH' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const getSelectedMethodDetails = () => {
    return withdrawalMethods.find(m => m.id === selectedMethod);
  };

  const calculateFee = () => {
    const method = getSelectedMethodDetails();
    if (!method || !amount) return 0;
    
    if (method.fees.includes('%')) {
      const percentage = parseFloat(method.fees.replace('%', '')) / 100;
      return parseFloat(amount) * percentage;
    } else {
      return parseFloat(method.fees.replace('$', ''));
    }
  };

  const getNetAmount = () => {
    const amountNum = parseFloat(amount) || 0;
    const fee = calculateFee();
    return amountNum - fee;
  };

  const canWithdraw = () => {
    const amountNum = parseFloat(amount) || 0;
    const method = getSelectedMethodDetails();
    const netAmount = getNetAmount();
    
    return (
      selectedMethod &&
      amount &&
      amountNum > 0 &&
      method &&
      amountNum >= method.minAmount &&
      netAmount <= user.balance &&
      (selectedMethod === 'card' || (accountDetails.accountNumber && accountDetails.routingNumber && accountDetails.accountName))
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
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: withdrawalAmount,
          payment_method: selectedMethod,
          reference_id: refId,
          status: 'completed', // For demo purposes, marking as completed immediately
          notes: `Withdrawal via ${getSelectedMethodDetails()?.name}`
        });

      if (transactionError) throw transactionError;

      // Update user balance
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
        setSelectedMethod('');
        setAccountDetails({ accountNumber: '', routingNumber: '', accountName: '' });
        setShowSuccess(false);
        setReferenceId('');
      }, 3000);

    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Withdrawal failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyReferenceId = () => {
    navigator.clipboard.writeText(referenceId);
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
            Your withdrawal of <span className="font-bold text-yellow-600">${amount}</span> has been submitted for processing.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Reference ID:</p>
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <span className="font-mono text-sm">{referenceId}</span>
              <button
                onClick={copyReferenceId}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Processing time: {getSelectedMethodDetails()?.processingTime}
          </p>
          <button
            onClick={onBack}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl font-semibold"
          >
            Back to Dashboard
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
          <h1 className="text-2xl font-bold text-white">Withdraw Funds</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="text-white/80 text-sm mb-2">Available Balance</p>
          <h3 className="text-3xl font-bold text-white">${user.balance.toFixed(2)}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-t-3xl min-h-screen px-6 py-8">
        {/* Amount Input */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Withdrawal Amount
          </label>
          <div className="relative">
            <DollarSign className="w-6 h-6 text-gray-400 absolute left-4 top-4" />
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-yellow-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          
          {/* Amount Summary */}
          {amount && selectedMethod && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span>Withdrawal Amount:</span>
                <span>${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Processing Fee:</span>
                <span>-${calculateFee().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>You'll Receive:</span>
                <span className="text-green-600">${getNetAmount().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Withdrawal Methods */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Withdrawal Method
          </label>
          <div className="space-y-3">
            {withdrawalMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 rounded-2xl border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                    selectedMethod === method.id ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <method.icon className={`w-6 h-6 ${
                      selectedMethod === method.id ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-800">{method.name}</h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">Fee: {method.fees}</span>
                      <span className="text-xs text-gray-400">Min: ${method.minAmount}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Account Details for Bank Transfer */}
        {selectedMethod === 'bank' && (
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Bank Account Details
            </label>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Account Holder Name"
                value={accountDetails.accountName}
                onChange={(e) => setAccountDetails({...accountDetails, accountName: e.target.value})}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={accountDetails.accountNumber}
                onChange={(e) => setAccountDetails({...accountDetails, accountNumber: e.target.value})}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Routing Number"
                value={accountDetails.routingNumber}
                onChange={(e) => setAccountDetails({...accountDetails, routingNumber: e.target.value})}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Warning for insufficient funds */}
        {amount && parseFloat(amount) > user.balance && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700 text-sm">
              Insufficient funds. Your available balance is ${user.balance.toFixed(2)}.
            </p>
          </div>
        )}

        {/* Withdrawal Button */}
        <button
          onClick={handleWithdrawal}
          disabled={!canWithdraw() || isProcessing}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isProcessing ? 'Processing...' : `Withdraw $${amount || '0.00'}`}
        </button>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700">
            All withdrawals are processed securely. Processing times may vary based on your selected method.
          </p>
        </div>
      </div>
    </div>
  );
};