import type { PayloadRequest } from 'payload'

import { serverUrl } from '@/lib/preview'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** Pozvánka (nový účet) vs. zapomenuté heslo – rozlišeno přes req.context.invite. */
const isInvite = (req?: PayloadRequest) => Boolean(req?.context?.invite)

// Přes /nastavit-heslo – odhlásí případný jiný účet v prohlížeči, jinak Payload formulář neukáže.
const resetUrl = (token: string) => `${serverUrl()}/nastavit-heslo?token=${encodeURIComponent(token)}`

export const authEmailSubject = ({ req }: { req?: PayloadRequest } = {}) =>
  isInvite(req) ? 'Váš přístup do administrace webu PROFI SPOJKY' : 'Obnovení hesla do administrace webu PROFI SPOJKY'

export const authEmailHTML = ({ req, token, user }: { req?: PayloadRequest; token?: string; user?: { name?: string | null } } = {}) => {
  const url = resetUrl(token ?? '')
  const invite = isInvite(req)
  const greeting = user?.name ? `Dobrý den, ${esc(user.name)},` : 'Dobrý den,'
  const intro = invite
    ? 'byl Vám vytvořen účet do administrace webu profispojky.cz. Pro první přihlášení si nastavte vlastní heslo:'
    : 'obdrželi jsme žádost o obnovení hesla do administrace webu profispojky.cz. Nové heslo nastavíte zde:'
  const validity = invite ? 'Odkaz platí 7 dní.' : 'Odkaz platí 1 hodinu.'
  const outro = invite
    ? 'Po nastavení hesla se přihlašujete na adrese ' + `<a href="${serverUrl()}/admin" style="color:#0B6A91">${serverUrl()}/admin</a>.`
    : 'Pokud jste o obnovení hesla nežádali, tento e-mail ignorujte – heslo zůstane beze změny.'

  return `<div style="font-family:Inter,-apple-system,'Segoe UI',sans-serif;font-size:16px;color:#111827;line-height:1.625;max-width:640px">
<p style="margin:0 0 16px">${greeting}</p>
<p style="margin:0 0 24px">${intro}</p>
<p style="margin:0 0 24px"><a href="${url}" style="display:inline-block;background:#1C2F5A;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">${invite ? 'Nastavit heslo' : 'Nastavit nové heslo'}</a></p>
<p style="margin:0 0 8px;font-size:14px;color:#4b5563">${validity} Pokud tlačítko nefunguje, zkopírujte do prohlížeče tuto adresu:<br><span style="word-break:break-all">${url}</span></p>
<p style="margin:24px 0 0">${outro}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px"><tr><td style="border-left:3px solid #1C2F5A;background-color:#f8fafc;border-radius:0 8px 8px 0;padding:12px 16px;font-size:12px;line-height:1.6;color:#5e7ca8"><strong style="color:#1C2F5A;font-weight:600">Správa webu PROFI SPOJKY</strong><br>Automatická zpráva administrace webu. Na tento e-mail neodpovídejte.</td></tr></table>
</div>`
}
