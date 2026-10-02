import type { UIFieldServerProps } from 'payload'
import React from 'react'

import type { ImportDiff } from '@/lib/bc-import/types'
import { formatDate } from '@/lib/format'

import { ConfirmImportButton } from './ConfirmImportButton'

const FIELD_LABELS: Record<string, string> = {
  code: 'Kód',
  name: 'Název',
  ean: 'EAN',
  unit: 'MJ',
  seriesCode: 'Řada',
  status: 'Stav',
  bcActive: 'Viditelnost',
}
const STATUS_LABELS: Record<string, string> = { active: 'aktivní', sale: 'výprodej', inactive: 'neaktivní' }
const v = (field: string, value: string) => (field === 'status' ? (STATUS_LABELS[value] ?? value) : value) || '–'
const LIMIT = 200

export const ImportReview = ({ data, id }: UIFieldServerProps) => {
  if (!id) {
    return (
      <div className="ps-import ps-import--intro">
        <p>
          Nahrajte export položek z Business Central (<strong>XLSX</strong> nebo <strong>CSV</strong>). Rozpoznáváme sloupce{' '}
          <em>Kód, Název, EAN, MJ, Řada, Stav</em> (česky i anglicky). Po uložení uvidíte náhled změn – do katalogu se nic
          nezapíše, dokud nekliknete na <strong>Potvrdit</strong>.
        </p>
      </div>
    )
  }

  const diff = data?.diff as ImportDiff | undefined
  const errors = (data?.errors as string[] | undefined) ?? []
  const columns = (data?.columns as Record<string, string> | undefined) ?? {}
  const status = data?.status as string

  return (
    <div className="ps-import">
      {status === 'confirmed' && (
        <p className="ps-alert ps-alert--ok">Import byl potvrzen {formatDate(data?.confirmedAt as string, true)}. Níže je, co se zapsalo.</p>
      )}
      {status === 'superseded' && <p className="ps-alert">Tento náhled nahradil novější import – nelze ho potvrdit.</p>}
      {status === 'failed' && <p className="ps-alert ps-alert--bad">Soubor se nepodařilo zpracovat.</p>}

      {Object.keys(columns).length > 0 && (
        <p className="ps-import__cols">
          Rozpoznané sloupce:{' '}
          {Object.entries(columns).map(([k, col]) => (
            <span key={k} className="ps-badge">
              {FIELD_LABELS[k] ?? k} ← „{col}“
            </span>
          ))}
        </p>
      )}

      {errors.length > 0 && (
        <details className="ps-import__errors" open={status === 'failed'}>
          <summary>Upozornění v souboru ({errors.length})</summary>
          <ul>
            {errors.slice(0, LIMIT).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </details>
      )}

      {diff && (
        <>
          <div className="ps-import__summary">
            <div className="ps-stat ps-stat--new">
              <b>{diff.created.length}</b>nových
            </div>
            <div className="ps-stat ps-stat--chg">
              <b>{diff.changed.length}</b>změněných
            </div>
            <div className="ps-stat ps-stat--hide">
              <b>{diff.hidden.length}</b>se skryje
            </div>
            <div className="ps-stat">
              <b>{diff.unchangedCount}</b>beze změny
            </div>
          </div>

          {status === 'draft' && <ConfirmImportButton id={id} summary={diff} />}

          {diff.created.length > 0 && (
            <details open>
              <summary>Nové položky ({diff.created.length}) – půjdou do fronty „Doplnit obsah“</summary>
              <table className="ps-table">
                <thead>
                  <tr>
                    <th>Kód</th>
                    <th>Název</th>
                    <th>EAN</th>
                    <th>MJ</th>
                    <th>Řada</th>
                    <th>Stav</th>
                  </tr>
                </thead>
                <tbody>
                  {diff.created.slice(0, LIMIT).map((r) => (
                    <tr key={r.code}>
                      <td className="ps-mono">{r.code}</td>
                      <td>{r.name}</td>
                      <td>{r.ean ?? '–'}</td>
                      <td>{r.unit ?? '–'}</td>
                      <td>{r.seriesCode ?? '–'}</td>
                      <td>{STATUS_LABELS[r.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {diff.created.length > LIMIT && <p>… a dalších {diff.created.length - LIMIT}</p>}
            </details>
          )}

          {diff.changed.length > 0 && (
            <details open>
              <summary>Změněné položky ({diff.changed.length})</summary>
              <table className="ps-table">
                <thead>
                  <tr>
                    <th>Kód</th>
                    <th>Název</th>
                    <th>Změna</th>
                  </tr>
                </thead>
                <tbody>
                  {diff.changed.slice(0, LIMIT).map((c) => (
                    <tr key={c.code}>
                      <td className="ps-mono">{c.code}</td>
                      <td>{c.name}</td>
                      <td>
                        {c.changes.map((ch) => (
                          <div key={ch.field}>
                            <strong>{FIELD_LABELS[ch.field] ?? ch.field}:</strong> <del>{v(ch.field, ch.from)}</del> →{' '}
                            <ins>{v(ch.field, ch.to)}</ins>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {diff.changed.length > LIMIT && <p>… a dalších {diff.changed.length - LIMIT}</p>}
            </details>
          )}

          {diff.hidden.length > 0 && (
            <details open>
              <summary>Skryjí se ({diff.hidden.length}) – v exportu chybí, obsah (fotky, parametry) zůstane uložený</summary>
              <table className="ps-table">
                <thead>
                  <tr>
                    <th>Kód</th>
                    <th>Název</th>
                  </tr>
                </thead>
                <tbody>
                  {diff.hidden.slice(0, LIMIT).map((h) => (
                    <tr key={h.code}>
                      <td className="ps-mono">{h.code}</td>
                      <td>{h.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {diff.hidden.length > LIMIT && <p>… a dalších {diff.hidden.length - LIMIT}</p>}
            </details>
          )}
        </>
      )}
    </div>
  )
}
