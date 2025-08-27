import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Building2, DollarSign, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface DepositPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express',
    fees: '2.9% + $0.30',
    processingTime: 'Instant'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: Building2,
    description: 'Direct bank transfer',
    fees: 'Free',
    processingTime: '1-3 business days'
  },
  {
    id: 'mobile',
    name: 'Mobile Payment',
    icon: Smartphone,
    description: 'Apple Pay, Google Pay, Samsung Pay',
    fees: '1.5%',
    processingTime: 'Instant'
  }
];

export const DepositPage: React.FC<DepositPageProps> = ({ user, onBack, onBalanceUpdate }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string>('');

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue.split('.').length <= 2) {
      setAmount(numericValue);
    }
  };

  const generateReferenceId = () => {
    return 'DEP' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const handleDeposit = async () => {
    if (!selectedMethod || !amount || parseFloat(amount) <= 0) return;

    setIsProcessing(true);
    const refId = generateReferenceId();
    setReferenceId(refId);

    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: parseFloat(amount),
          payment_method: selectedMethod,
          reference_id: refId,
          status: 'completed', // For demo purposes, marking as completed immediately
          notes: `Deposit via ${paymentMethods.find(m => m.id === selectedMethod)?.name}`
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const newBalance = user.balance + parseFloat(amount);
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
        setShowSuccess(false);
        setReferenceId('');
      }, 3000);

    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Deposit Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your deposit of <span className="font-bold text-yellow-600">${amount}</span> has been processed successfully.
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
          <h1 className="text-2xl font-bold text-white">Deposit Funds</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="text-white/80 text-sm mb-2">Current Balance</p>
          <h3 className="text-3xl font-bold text-white">${user.balance.toFixed(2)}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-t-3xl min-h-screen px-6 py-8">
        {/* Amount Input */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Deposit Amount
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
          <div className="flex gap-2 mt-4">
            {['50', '100', '500', '1000'].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className="flex-1 py-2 px-4 bg-yellow-50 text-yellow-600 rounded-xl font-semibold hover:bg-yellow-100 transition-colors"
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Payment Method
          </label>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
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
                      <span className="text-xs text-gray-400">{method.processingTime}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={!selectedMethod || !amount || parseFloat(amount) <= 0 || isProcessing}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isProcessing ? 'Processing...' : `Deposit $${amount || '0.00'}`}
        </button>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700">
            Your payment information is encrypted and secure. We never store your payment details.
          </p>
        </div>
      </div>
    </div>
  );
};