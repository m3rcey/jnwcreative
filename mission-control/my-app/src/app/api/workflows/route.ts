import { NextResponse } from 'next/server'
import { store } from '@/lib/store'

export async function GET() {
  return NextResponse.json(store.getWorkflows())
}

export async function POST(request: Request) {
  const workflow = await request.json()
  store.addWorkflow(workflow)
  return NextResponse.json(workflow, { status: 201 })
}
