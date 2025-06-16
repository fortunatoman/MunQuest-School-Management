import React, { useState } from 'react';
import { getUserDataByEmailApi } from '../apis/Users';

const TestEmailConfirmation: React.FC = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      console.log('Testing API with email:', email);
      const response = await getUserDataByEmailApi(email);
      console.log('API Response:', response);
      setResult(response);
    } catch (error) {
      console.error('API Error:', error);
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Email Confirmation API</h1>
      
      <div className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email to test"
          className="border p-2 rounded w-64 mr-2"
        />
        <button
          onClick={testApi}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestEmailConfirmation;
