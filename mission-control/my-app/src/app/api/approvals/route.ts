import { NextResponse } from 'next/server'
import { store } from '@/lib/store'

export async function GET() {
  return NextResponse.json(store.getApprovals())
}

export async function POST(request: Request) {
  const { id, status } = await request.json()
  store.updateApproval(id, status)
  return NextResponse.json({ success: true })
}
