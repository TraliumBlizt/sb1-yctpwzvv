import React, { useState } from 'react';
import { Phone, Lock, SquareUser, GitCompareArrows, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { LanguageSelector } from './LanguageSelector';

interface AuthFormProps {
  onLogin: (phone: string, password: string) => Promise<void>;
  onRegister: (data: {
    countryCode: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    inviteCode?: string;
    country: string;
    currency: string;
    currencySymbol: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const countryList = [
  { name: "Argentina", code: "+54", flag: "https://flagcdn.com/ar.svg", currency: "ARS", symbol: "$" },
  { name: "Colombia", code: "+57", flag: "https://flagcdn.com/co.svg", currency: "COP", symbol: "$" },
  { name: "Costa Rica", code: "+506", flag: "https://flagcdn.com/cr.svg", currency: "CRC", symbol: "₡" },
  { name: "Dominican Republic", code: "+1", flag: "https://flagcdn.com/do.svg", currency: "DOP", symbol: "$" },
  { name: "Ecuador", code: "+593", flag: "https://flagcdn.com/ec.svg", currency: "USD", symbol: "$" },
  { name: "El Salvador", code: "+503", flag: "https://flagcdn.com/sv.svg", currency: "USD", symbol: "$" },
  { name: "Guatemala", code: "+502", flag: "https://flagcdn.com/gt.svg", currency: "GTQ", symbol: "Q" },
  { name: "Honduras", code: "+504", flag: "https://flagcdn.com/hn.svg", currency: "HNL", symbol: "L" },
  { name: "Mexico", code: "+52", flag: "https://flagcdn.com/mx.svg", currency: "MXN", symbol: "$" },
  { name: "Nicaragua", code: "+505", flag: "https://flagcdn.com/ni.svg", currency: "NIO", symbol: "C$" },
  { name: "Panama", code: "+507", flag: "https://flagcdn.com/pa.svg", currency: "USD", symbol: "$" },
  { name: "Paraguay", code: "+595", flag: "https://flagcdn.com/py.svg", currency: "PYG", symbol: "₲" },
  { name: "Peru", code: "+51", flag: "https://flagcdn.com/pe.svg", currency: "PEN", symbol: "S/" },
  { name: "Uruguay", code: "+598", flag: "https://flagcdn.com/uy.svg", currency: "UYU", symbol: "$U" },
  { name: "Venezuela", code: "+58", flag: "https://flagcdn.com/ve.svg", currency: "VES", symbol: "Bs.S" },
];

 
export const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, isLoading }) => {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryList[0]);
  const [formData, setFormData] = useState({
    password: '',
    firstName: '',
    lastName: '',
    inviteCode: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [inviterInfo, setInviterInfo] = useState<{ username: string } | null>(null);

  // Validate invitation code in real-time
  React.useEffect(() => {
    if (!isSignUp || !formData.inviteCode || formData.inviteCode.length < 3) {
      setIsCodeValid(false);
      setInviterInfo(null);
      return;
    }

    const validateCode = async () => {
      setIsValidatingCode(true);
      try {
        const { data, error } = await supabase.rpc('validate_invitation_code', {
          p_invitation_code: formData.inviteCode
        });

        if (error) throw error;

        if (data && data.length > 0 && data[0].is_valid) {
          setIsCodeValid(true);
          setInviterInfo({ username: data[0].inviter_username });
        } else {
          setIsCodeValid(false);
          setInviterInfo(null);
        }
      } catch (error) {
        console.error('Error validating invitation code:', error);
        setIsCodeValid(false);
        setInviterInfo(null);
      } finally {
        setIsValidatingCode(false);
      }
    };

    const timeoutId = setTimeout(validateCode, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.inviteCode, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const firstName = formData.firstName || 'User';
      const lastName = formData.lastName || generateRandomId();

      const fullData = {
        countryCode: selectedCountry.code,
        phone,
        password: formData.password,
        firstName,
        lastName,
        inviteCode: formData.inviteCode,
        country: selectedCountry.name,
        currency: selectedCountry.currency,
        currencySymbol: selectedCountry.symbol
      };
      await onRegister(fullData);
    } else {
      const fullPhone = `${selectedCountry.code}${phone}`;
      await onLogin(fullPhone, formData.password);
    }
  };

  const generateRandomId = () => Math.random().toString(36).substr(2, 6).toUpperCase();
  const formatPhoneNumber = (value: string) => value.replace(/\D/g, '');
  const validatePassword = (password: string) => /^\d{6,22}$/.test(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <LanguageSelector />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-[300px] aspect-[2.05] bg-white rounded-lg shadow-lg mb-4 mx-auto overflow-hidden flex items-center justify-center">
  <img
    src="https://i.postimg.cc/MHkwxkw4/4922451504321900439-120.jpg"
    alt="Image"
    className="w-full h-full object-contain"
  />
</div>

          <h1 className="text-2xl font-bold text-white">Mercado Libre</h1>
          <p className="text-yellow-100 text-sm mt-2">
            {selectedCountry.currency} • {selectedCountry.symbol} • {selectedCountry.name}
          </p>
        </div> 

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isSignUp ? t('auth.createAccount') : t('auth.signIn')}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {isSignUp ? t('auth.joinPlatform') : t('auth.welcomeBack')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('auth.phoneNumber')}</label>
              <div className="relative mb-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={selectedCountry.flag} alt="flag" className="w-6 h-4 rounded-sm object-cover" />
                    <div className="text-left">
                      <div className="font-medium text-gray-800">{selectedCountry.name}</div>
                      <div className="text-sm text-gray-500">{selectedCountry.code} • {selectedCountry.currency}</div>
                    </div>
                  </div>
                  <div className="text-gray-400">▼</div>
                </button>

                {isOpen && (
                  <div className="absolute z-50 w-full bg-white border mt-1 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {countryList.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <img src={country.flag} alt={country.name} className="w-6 h-4 rounded-sm object-cover" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{country.name}</div>
                          <div className="text-sm text-gray-500">{country.code} • {country.currency}</div>
                        </div>
                        <div className="text-lg font-bold text-yellow-600">{country.symbol}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute left-3 top-3 flex items-center gap-2 text-gray-500">
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">{selectedCountry.code}</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  className="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder={t('auth.phoneNumber')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {isSignUp ? t('auth.createPassword') : t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 transition-colors ${
                    isSignUp && formData.password && !validatePassword(formData.password)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 focus:border-yellow-500'
                  }`}
                  placeholder={isSignUp ? t('auth.numbersOnly') : t('auth.password')}
                  pattern={isSignUp ? '\\d{6,22}' : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('auth.firstName')} ({t('common.optional')})</label>
                    <div className="relative">
                      <SquareUser className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder={t('auth.autoGenerated')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('auth.lastName')} ({t('common.optional')})</label>
                    <div className="relative">
                      <SquareUser className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder={t('auth.autoGenerated')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t('auth.inviteCode')} *</label>
                  <div className="relative">
                    <GitCompareArrows className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={formData.inviteCode}
                      onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 transition-colors ${
                        formData.inviteCode && !isValidatingCode && !isCodeValid
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 focus:border-yellow-500'
                      }`}
                      placeholder={t('auth.inviteCode')}
                      required
                    />
                    {isValidatingCode && (
                      <div className="absolute right-3 top-3.5">
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {formData.inviteCode && !isValidatingCode && isCodeValid && (
                      <div className="absolute right-3 top-3.5">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {formData.inviteCode && !isValidatingCode && !isCodeValid && (
                    <p className="text-xs text-red-600 mt-1">
                      {t('auth.invalidInviteCode')}
                    </p>
                  )}
                  {formData.inviteCode && !isValidatingCode && isCodeValid && inviterInfo && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {t('auth.validInviteCode')} {inviterInfo.username}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {t('auth.inviteCodeRequired')}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">{t('auth.accountPreview')}:</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p><strong>{t('auth.name')}:</strong> {formData.firstName || 'User'} {formData.lastName || generateRandomId()}</p>
                    <p><strong>{t('auth.phoneNumber')}:</strong> {selectedCountry.code} {phone}</p>
                    <p><strong>{t('profile.currency')}:</strong> {selectedCountry.currency} ({selectedCountry.symbol})</p>
                    <p><strong>{t('profile.country')}:</strong> {selectedCountry.name}</p>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading || !phone || !formData.password || (isSignUp && (!formData.inviteCode || !isCodeValid))}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? t('auth.processing') : isSignUp ? t('auth.createAccount') : t('auth.signIn')}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
            </button>
          </div>

          {isSignUp && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-700 text-center">
                  <strong>{t('auth.quickRegistration')}:</strong> {t('auth.namesOptional')}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 text-center">
                  <strong>{t('auth.inviteRequired')}:</strong> {t('auth.inviteRequiredDesc')}
                </p>
              </div>
            </div>
          )}

          {!isSignUp && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-green-700 text-center">
                {t('auth.createAccountPrompt')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
