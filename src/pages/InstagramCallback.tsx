import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleInstagramCallback } from '../services/instagramOAuth';
import { Loader2 } from 'lucide-react';

export const InstagramCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage('Autenticação cancelada ou negada');
        setTimeout(() => navigate('/connections'), 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Parâmetros de autenticação inválidos');
        setTimeout(() => navigate('/connections'), 3000);
        return;
      }

      const result = await handleInstagramCallback(code, state);

      if (result.success) {
        setStatus('success');
        setTimeout(() => navigate('/connections'), 2000);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Erro desconhecido');
        setTimeout(() => navigate('/connections'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Conectando Instagram
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto processamos sua autenticação...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Conectado com Sucesso!
            </h2>
            <p className="text-gray-600">
              Redirecionando para conexões...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Erro na Conexão
            </h2>
            <p className="text-gray-600">{errorMessage}</p>
          </>
        )}
      </div>
    </div>
  );
};
