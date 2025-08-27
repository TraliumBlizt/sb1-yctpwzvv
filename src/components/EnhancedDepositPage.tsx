import React, { useState } from 'react';
import { ArrowLeft, Upload, CheckCircle, Copy, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountryBanks } from '../hooks/useCountryBanks';

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
    'Argentina': { currency: 'ARS', symbol: '$' },
    'Bolivia': { currency: 'BOB', symbol: 'Bs' },
    'Brasil': { currency: 'BRL', symbol: 'R$' },
    'Chile': { currency: 'CLP', symbol: '$' }
  };
  
  return currencyMap[country] || { currency: 'USD', symbol: '$' };
};

interface EnhancedDepositPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdate: (newBalance: number) => void;
}

export const EnhancedDepositPage: React.FC<EnhancedDepositPageProps> = ({ 
  user, 
  onBack, 
  onBalanceUpdate 
}) => {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<string>(user.country || 'Colombia');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [senderAccountName, setSenderAccountName] = useState<string>('');
  const [senderAccountNumber, setSenderAccountNumber] = useState<string>('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string>('');
  
  // Use real-time country banks data
  const { banks, isLoading: banksLoading, error: banksError, getCountries, getBanksByCountry } = useCountryBanks();

  const countries = getCountries();
  const countryBanks = getBanksByCountry(selectedCountry);
  const selectedBankInfo = countryBanks.find(bank => bank.bank_name === selectedBank);
  const countryCurrency = getCurrencyByCountry(selectedCountry);

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue.split('.').length <= 2) {
      setAmount(numericValue);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProofImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProofImageUrl(previewUrl);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('deposit-proofs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('deposit-proofs')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const generateReferenceId = () => {
    return 'DEP' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const handleSubmitDeposit = async () => {
    if (!selectedBank || !amount || !senderAccountName || !senderAccountNumber || !selectedBankInfo) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    const refId = generateReferenceId();
    setReferenceId(refId);

    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (proofImage) {
        try {
          imageUrl = await uploadImageToSupabase(proofImage);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          alert('Image upload failed, but continuing with deposit request without image.');
        }
      }

      // Create transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: parseFloat(amount),
          payment_method: selectedBank,
          reference_id: refId,
          status: 'pending', // Deposits need admin approval
          notes: `Deposit via ${selectedBank} from ${selectedCountry}`
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create deposit proof record
      const { error: proofError } = await supabase
        .from('deposit_proofs')
        .insert({
          user_id: user.id,
          transaction_id: transactionData.id,
          country: selectedCountry,
          bank_name: selectedBank,
          sender_account_name: senderAccountName,
          sender_account_number: senderAccountNumber,
          receiver_account_name: selectedBankInfo.account_name,
          receiver_account_number: selectedBankInfo.account_number,
          amount: parseFloat(amount),
          proof_image_url: imageUrl,
          status: 'pending'
        });

      if (proofError) throw proofError;

      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setAmount('');
        setSelectedBank('');
        setSenderAccountName('');
        setSenderAccountNumber('');
        setProofImage(null);
        setProofImageUrl('');
        setShowSuccess(false);
        setReferenceId('');
      }, 5000);

    } catch (error) {
      console.error('Deposit submission error:', error);
      alert('Failed to submit deposit request. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('deposit.success')}</h2>
          <p className="text-gray-600 mb-6">
            Your deposit request of <span className="font-bold text-yellow-600">{countryCurrency.symbol}{amount}</span> has been submitted for review.
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
          <p className="text-sm text-gray-500 mb-6">
            Your deposit will be processed within 24 hours after verification.
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
          <h1 className="text-2xl font-bold text-white">{t('deposit.title')}</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="text-white/80 text-sm mb-2">{t('deposit.currentBalance')}</p>
          <h3 className="text-3xl font-bold text-white">{user.currencySymbol || '$'}{user.balance.toFixed(2)}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-t-3xl min-h-screen px-6 py-8">
        {/* Country Selection */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            {t('deposit.selectCountry')}
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
              <p className="text-red-600 text-sm">{t('common.error')}: {banksError}</p>
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

        {/* Bank Selection */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            {t('deposit.selectBank')}
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
              <p className="text-gray-600 text-center">{t('deposit.noBanksAvailable', { country: selectedCountry })}</p>
            </div>
          ) : (
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-500 focus:outline-none"
          >
            <option value="">Select a bank...</option>
            {countryBanks.map((bank) => (
              <option key={bank.id} value={bank.bank_name}>
                {bank.bank_name} ({bank.bank_type})
              </option>
            ))}
          </select>
          )}
        </div>

        {/* Bank Details Display */}
        {selectedBankInfo && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
            <h4 className="font-bold text-yellow-800 mb-3">Transfer to this account:</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-yellow-700">Bank:</span>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">{selectedBankInfo.bank_name}</span>
                  <button
                    onClick={() => copyToClipboard(selectedBankInfo.bank_name)}
                    className="p-1 hover:bg-yellow-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-yellow-600" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-700">{t('deposit.accountName')}:</span>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">{selectedBankInfo.account_name}</span>
                  <button
                    onClick={() => copyToClipboard(selectedBankInfo.account_name)}
                    className="p-1 hover:bg-yellow-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-yellow-600" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-700">{t('deposit.accountNumber')}:</span>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">{selectedBankInfo.account_number}</span>
                  <button
                    onClick={() => copyToClipboard(selectedBankInfo.account_number)}
                    className="p-1 hover:bg-yellow-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-yellow-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            {t('deposit.depositAmount')} ({countryCurrency.currency})
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
            {t('deposit.currency', { currency: countryCurrency.currency, symbol: countryCurrency.symbol })}
          </p>
        </div>

        {/* Sender Information */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('deposit.yourAccountInfo')}</h4>
          <div className="space-y-4">
            <input
              type="text"
              value={senderAccountName}
              onChange={(e) => setSenderAccountName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-500 focus:outline-none"
              placeholder={t('deposit.accountName')}
            />
            <input
              type="text"
              value={senderAccountNumber}
              onChange={(e) => setSenderAccountNumber(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-500 focus:outline-none"
              placeholder={t('deposit.accountNumber')}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            {t('deposit.uploadTransferProof')} ({t('general.optional')})
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
            {proofImageUrl ? (
              <div className="space-y-4">
                <img
                  src={proofImageUrl}
                  alt="Transfer proof"
                  className="max-w-full h-48 object-contain mx-auto rounded-lg"
                />
                <button
                  onClick={() => {
                    setProofImage(null);
                    setProofImageUrl('');
                  }}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div>
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{t('deposit.uploadTransferReceipt')}</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="proof-upload"
                />
                <label
                  htmlFor="proof-upload"
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 cursor-pointer"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {t('deposit.chooseImage')}
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitDeposit}
          disabled={!selectedBank || !amount || !senderAccountName || !senderAccountNumber || isProcessing}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isProcessing ? t('common.loading') : `${t('deposit.submitDepositRequest')} ${countryCurrency.symbol}${amount || '0.00'}`}
        </button>

        {/* Info Notice */}
        
      </div>
    </div>
  );
};