import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { ChatProvider } from '../../contexts/ChatContext';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { ModalProvider } from '../../contexts/ModalContext';

export function renderWithProviders(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <ChatProvider>
              <ModalProvider>
                {children}
              </ModalProvider>
            </ChatProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}