'use client';

import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsented) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full z-50 bg-gray-800 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-sm">
      <span className="mb-2 sm:mb-0">
        We use cookies to enhance your browing experience. By using this site, you accept our use of cookies.
      </span>
      <button
        onClick={handleAccept}
        className="nes-btn bg-white text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-200 transition"
      >
        Accept
      </button>
    </div>
  );
}
