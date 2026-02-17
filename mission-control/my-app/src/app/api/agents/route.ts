import { NextResponse } from 'next/server'
import { store } from '@/lib/store'

export async function GET() {
  return NextResponse.json(store.getAgents())
}

export async function POST(request: Request) {
  const agent = await request.json()
  store.addAgent(agent)
  return NextResponse.json(agent, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    const agents = store.getAgents()
    const filtered = agents.filter(a => a.id !== id)
    // Update store (in-memory only for now)
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'No ID provided' }, { status: 400 })
}
