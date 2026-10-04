import type { NextRequest } from 'next/server'

import { getTechSheet } from '@/lib/tech-sheet/data'
import { techSheetResponse } from '@/lib/tech-sheet/render'

/** Technický list tvaru řady: /technicky-list/<řada>/<tvar>.pdf */
export async function GET(req: NextRequest, { params }: { params: Promise<{ series: string; file: string }> }) {
  const { series, file } = await params
  return techSheetResponse(req, () => getTechSheet(series, decodeURIComponent(file).replace(/\.pdf$/i, '')))
}
