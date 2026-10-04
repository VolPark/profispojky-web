import type { NextRequest } from 'next/server'

import { getProductTechSheet } from '@/lib/tech-sheet/data'
import { techSheetResponse } from '@/lib/tech-sheet/render'

/** Technický list položky: /technicky-list/<kód>.pdf (list jejího tvaru se zvýrazněnou položkou, nebo jen položka). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ series: string }> }) {
  // stejný dynamický segment jako /technicky-list/<řada>/<tvar>.pdf (Next.js vyžaduje jeden název)
  const { series: file } = await params
  return techSheetResponse(req, () => getProductTechSheet(decodeURIComponent(file).replace(/\.pdf$/i, '')))
}
