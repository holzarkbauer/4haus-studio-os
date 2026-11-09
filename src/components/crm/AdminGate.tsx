import React, { useEffect, useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { ui } from '../../ui/tokens';
import { Language } from '../../types';
import { CrmApp } from './CrmApp';

// 4haus.us/admin: entrada directa al CRM. Pide iniciar sesión con Google y solo deja pasar
// a las cuentas del equipo (ADMIN_UIDS en el servidor). La verificación real la hace el servidor.
export function AdminGate({ lang, themeMode, userId, isLoggingIn, onGoogleLogin }: { lang: Language; themeMode: 'light' | 'dark'; userId?: string | null; isLoggingIn?: boolean; onGoogleLogin?: () => void }) {
  const isDark = themeMode === 'dark';
  const s = ui(isDark);
  const t = (es: string, en: string) => (lang === 'en' ? en : es);
  const [state, setState] = useState<'checking' | 'admin' | 'denied'>('checking');

  useEffect(() => {
    if (!userId) return setState('denied');
    setState('checking');
    fetch('/api/studio/admin/me')
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d) => setState(d?.admin ? 'admin' : 'denied'))
      .catch(() => setState('denied'));
  }, [userId]);

  if (state === 'admin') return <CrmApp lang={lang} themeMode={themeMode} />;

  return (
    <div className="max-w-md mx-auto pt-16">
      <div className={`${s.card} p-8 text-center space-y-4`}>
        {state === 'checking' ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        ) : (
          <>
            <Lock className={`w-6 h-6 mx-auto ${s.muted}`} />
            <h2 className={s.title}>{t('Backoffice de 4haus', '4haus back office')}</h2>
            {!userId ? (
              <>
                <p className={`text-sm ${s.muted}`}>{t('Inicia sesión con la cuenta de Google del equipo.', 'Sign in with your team Google account.')}</p>
                <button type="button" onClick={onGoogleLogin} disabled={isLoggingIn} className={`${s.primaryButton} w-full`}>
                  {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />} {t('Entrar con Google', 'Sign in with Google')}
                </button>
              </>
            ) : (
              <p className={`text-sm ${s.muted}`}>
                {t('Esta cuenta no tiene acceso al backoffice. Si eres del equipo, pide que agreguen tu UID en ADMIN_UIDS.', 'This account has no back-office access.')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
