import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function TestProxyApi() {
  const { shareId } = useParams();
  const [sharedAgent, setSharedAgent] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [decryptedCredentials, setDecryptedCredentials] = useState(null);

  useEffect(() => {
    async function verifySharedAgent() {
      try {
        setVerifying(true);
        setError(null);
        setSharedAgent(null);
        setDecryptedCredentials(null);

        if (!shareId) {
          setError('No share ID provided');
          return;
        }

        // First verify the share_id exists
        const { data: agents, error: verifyError } = await supabase
          .from('shared_agents')
          .select(`
            id,
            share_id,
            credentials,
            agent:agents (
              id,
              name,
              character,
              actions,
              faqs,
              enabled_tools
            )
          `)
          .eq('share_id', shareId)
          .single();

        if (verifyError) {
          console.error('Error verifying share ID:', verifyError);
          setError('Failed to verify share ID');
          return;
        }

        if (!agents) {
          setError('Invalid share ID');
          return;
        }

        if (!agents.agent) {
          setError('Referenced agent not found');
          return;
        }

        setSharedAgent(agents);
        console.log('Verified shared agent:', agents);

        // Decrypt credentials
        try {
          if (!agents.credentials || !agents.credentials.key || !agents.credentials.iv || !agents.credentials.data) {
            throw new Error('Invalid credentials format');
          }

          // Convert base64 strings back to array buffers
          const key = Uint8Array.from(atob(agents.credentials.key), c => c.charCodeAt(0));
          const iv = Uint8Array.from(atob(agents.credentials.iv), c => c.charCodeAt(0));
          const data = Uint8Array.from(atob(agents.credentials.data), c => c.charCodeAt(0));

          // Import the key
          const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            'AES-GCM',
            true,
            ['decrypt']
          );

          // Decrypt the data
          const decryptedData = await crypto.subtle.decrypt(
            {
              name: 'AES-GCM',
              iv
            },
            cryptoKey,
            data
          );

          // Convert the decrypted data back to an object
          const decoder = new TextDecoder();
          const credentials = JSON.parse(decoder.decode(decryptedData));
          setDecryptedCredentials(credentials);
        } catch (decryptError) {
          console.error('Decryption error:', decryptError);
          setError('Failed to decrypt credentials: ' + decryptError.message);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError(error.message || 'Failed to verify shared agent');
      } finally {
        setVerifying(false);
      }
    }

    verifySharedAgent();
  }, [shareId]);

  if (!shareId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-red-600">
          No share ID provided. Please use the format: /#/test/[share-id]
        </div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying shared agent...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shared Agent Data</h1>
      
      {sharedAgent && (
        <div className="space-y-6">
          {/* Agent Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-lg mb-4">Agent Details:</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Name:</span> {sharedAgent.agent.name}</p>
              <p><span className="font-medium">Character:</span> {sharedAgent.agent.character}</p>
              <p><span className="font-medium">Actions:</span> {sharedAgent.agent.actions}</p>
              
              {/* FAQs */}
              {sharedAgent.agent.faqs?.length > 0 && (
                <div>
                  <h3 className="font-medium mt-4 mb-2">FAQs:</h3>
                  <div className="space-y-3">
                    {sharedAgent.agent.faqs.map((faq, index) => (
                      <div key={index} className="bg-white p-3 rounded">
                        <p className="font-medium">Q: {faq.question}</p>
                        <p className="text-gray-600">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enabled Tools */}
              {sharedAgent.agent.enabled_tools?.length > 0 && (
                <div>
                  <h3 className="font-medium mt-4 mb-2">Enabled Tools:</h3>
                  <ul className="list-disc list-inside">
                    {sharedAgent.agent.enabled_tools.map((tool, index) => (
                      <li key={index}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Credentials */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-lg mb-4">Credentials:</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Encrypted:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(sharedAgent.credentials, null, 2)}
                </pre>
              </div>
              {decryptedCredentials && (
                <div>
                  <h3 className="font-medium mb-2">Decrypted:</h3>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(decryptedCredentials, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}