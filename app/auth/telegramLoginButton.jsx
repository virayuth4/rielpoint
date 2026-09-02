'use client'
import { useEffect, useRef } from 'react';

export default function TelegramLoginButton({ botName, onAuth, isMerchant = false }) {
  const ref = useRef(null);

  useEffect(() => {
    window.onTelegramAuth = (user) => {
      onAuth(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    if (ref.current) {
      ref.current.innerHTML = '';
      ref.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botName, onAuth]);

  return <div ref={ref} className="flex justify-center" />;
}