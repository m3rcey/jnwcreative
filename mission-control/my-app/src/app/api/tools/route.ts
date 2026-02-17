import { NextResponse } from 'next/server'
import { store } from '@/lib/store'

export async function GET() {
  return NextResponse.json(store.getTools())
}

export async function POST(request: Request) {
  const tool = await request.json()
  store.addTool(tool)
  return NextResponse.json(tool, { status: 201 })
}
