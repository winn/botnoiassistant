import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from './feedback/LoadingSpinner';

export default function TestSharedView({ tools }) {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testMessage, setTestMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadSharedAgent();
  }, [shareId]);

  const loadSharedAgent = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!shareId) {
        throw new Error('No agent ID provided');
      }

      // First get the agent with session_quota
      const { data: publicAgent, error: publicError } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          character,
          actions,
          enabled_tools,
          faqs,
          is_public,
          session_quota
        `)
        .eq('id', shareId)
        .eq('is_public', true)
        .single();

      if (publicError) {
        console.error('Database error:', publicError);
        throw new Error('Failed to load agent');
      }

      if (!publicAgent) {
        throw new Error('Agent not found or is not public');
      }

      setAgent(publicAgent);

      // Initialize session
      const timestamp = Date.now();
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          agentId: publicAgent.id,
          timestamp
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize session');
      }

      setSession(data.session);

    } catch (error) {
      console.error('Error loading shared agent:', error);
      setError(error.message || 'Failed to load shared agent');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async (e) => {
    e.preventDefault();
    if (!testMessage.trim() || !session) return;

    // Check if quota is exceeded
    if (session.message_count >= agent.session_quota) {
      toast.error('Session quota exceeded. Maximum messages reached.');
      return;
    }

    try {
      setSending(true);

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          agentId: agent.id,
          sessionId: session.session_id,
          message: testMessage.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Refresh session data
      const { data: updatedSession, error: sessionError } = await supabase
        .from('shared_sessions')
        .select('*')
        .eq('session_id', session.session_id)
        .single();

      if (sessionError) throw sessionError;
      setSession(updatedSession);

      // Clear message input
      setTestMessage('');
      toast.success('Message sent successfully');

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (error || !agent || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Test Failed</h1>
          <p className="text-gray-600 mb-6">{error || 'Failed to initialize test session.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const isQuotaExceeded = session.message_count >= agent.session_quota;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Test Results</h1>
            <p className="text-gray-600">Testing shared agent functionality</p>
          </div>

          {isQuotaExceeded && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Session Quota Exceeded</p>
              <p className="text-sm mt-1">
                You have reached the maximum number of messages ({agent.session_quota}) for this session.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Agent Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{agent.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{agent.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Session Quota</dt>
                    <dd className="mt-1 text-sm text-gray-900">{agent.session_quota} messages</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Public</dt>
                    <dd className="mt-1 text-sm text-gray-900">{agent.is_public ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Character</dt>
                    <dd className="mt-1 text-sm text-gray-900">{agent.character}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Actions</dt>
                    <dd className="mt-1 text-sm text-gray-900">{agent.actions}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Session Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Session ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{session.session_id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(session.created_at).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Message Count</dt>
                    <dd className={`mt-1 text-sm ${isQuotaExceeded ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {session.message_count} / {agent.session_quota}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Daily Usage</dt>
                    <dd className="mt-1 text-sm text-gray-900">{session.daily_usage}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Test Message</h2>
              <form onSubmit={handleSendTestMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send a test message to increment counters
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Enter test message"
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      disabled={sending || isQuotaExceeded}
                    />
                    <button
                      type="submit"
                      disabled={sending || !testMessage.trim() || isQuotaExceeded}
                      className={`px-4 py-2 rounded-lg text-white transition-colors ${
                        sending || !testMessage.trim() || isQuotaExceeded
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-sky-500 hover:bg-sky-600'
                      }`}
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => navigate(`/shared/${agent.id}`)}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              Try Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}