import { useState, useEffect } from 'react'
import './index.css'

// Sample data - in production this would connect to Josh's Notion CRM
const SAMPLE_LEADS = [
  { id: 1, name: 'Sarah Johnson', phone: '(314) 555-0123', email: 'sarah@email.com', quoteAmount: 4200, lastContact: '2026-02-14', status: 'Hot', notes: 'Wants King adjustable base', urgency: 72 },
  { id: 2, name: 'Mike Thompson', phone: '(314) 555-0456', email: 'mike@email.com', quoteAmount: 6800, lastContact: '2026-02-12', status: 'Hot', notes: 'Financing approved, deciding between tempurpedic models', urgency: 96 },
  { id: 3, name: 'Jennifer Davis', phone: '(314) 555-0789', email: 'jen@email.com', quoteAmount: 3500, lastContact: '2026-02-15', status: 'Warm', notes: 'Needs partner approval', urgency: 24 },
  { id: 4, name: 'Robert Chen', phone: '(314) 555-0321', email: 'robert@email.com', quoteAmount: 8900, lastContact: '2026-02-10', status: 'Hot', notes: 'Looking for split king for medical reasons', urgency: 120 },
  { id: 5, name: 'Lisa Martinez', phone: '(314) 555-0654', email: 'lisa@email.com', quoteAmount: 2800, lastContact: '2026-02-16', status: 'Hot', notes: 'Ready to buy, comparing quotes', urgency: 12 },
]

const MESSAGE_TEMPLATES = {
  hot: [
    "Hey {name}! Just checking in - that {amount} quote is still locked in for you. Any questions I can answer?",
    "Hi {name}, it's Josh from Mattress Firm. Want to make sure we get your {amount} sleep system secured. Free delivery this week!",
    "{name}! Your financing on the {amount} set is approved and ready. When works for delivery?",
  ],
  urgent: [
    "🔥 {name} - that quote expires soon. The {amount} package won't last at this price. Let's lock it in!",
    "URGENT: {name}, your {amount} hold expires today. Call me back ASAP to secure it!",
  ]
}

function daysSince(dateString) {
  const lastContact = new Date(dateString)
  const now = new Date()
  return Math.floor((now - lastContact) / (1000 * 60 * 60 * 24))
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount)
}

function getFireLevel(urgency) {
  if (urgency >= 96) return { emoji: '🔥🔥🔥', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' }
  if (urgency >= 48) return { emoji: '🔥🔥', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50' }
  return { emoji: '🔥', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50' }
}

function getRandomMessage(name, amount, urgency) {
  const templates = urgency >= 72 ? MESSAGE_TEMPLATES.urgent : MESSAGE_TEMPLATES.hot
  const template = templates[Math.floor(Math.random() * templates.length)]
  return template.replace('{name}', name.split(' ')[0]).replace('{amount}', formatCurrency(amount))
}

export default function App() {
  const [leads, setLeads] = useState(SAMPLE_LEADS)
  const [filter, setFilter] = useState('fire') // 'fire' = 48+ hrs, 'all' = all hot
  const [selectedLead, setSelectedLead] = useState(null)
  const [copied, setCopied] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)

  const filteredLeads = filter === 'fire' 
    ? leads.filter(l => l.status === 'Hot' && l.urgency >= 48).sort((a, b) => b.urgency - a.urgency)
    : leads.filter(l => l.status === 'Hot').sort((a, b) => b.urgency - a.urgency)

  const totalAtRisk = filteredLeads.reduce((sum, l) => sum + l.quoteAmount, 0)

  const handleCopyMessage = (lead) => {
    const message = getRandomMessage(lead.name, lead.quoteAmount, lead.urgency)
    navigator.clipboard.writeText(message)
    setCopied(lead.id)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleContact = (type, lead) => {
    if (type === 'call') {
      window.location.href = `tel:${lead.phone}`
    } else if (type === 'sms') {
      const message = getRandomMessage(lead.name, lead.quoteAmount, lead.urgency)
      window.location.href = `sms:${lead.phone}?body=${encodeURIComponent(message)}`
    } else if (type === 'email') {
      const subject = `Your ${formatCurrency(lead.quoteAmount)} sleep system quote`
      const body = getRandomMessage(lead.name, lead.quoteAmount, lead.urgency)
      window.location.href = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
  }

  // Voice activation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setVoiceActive(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      {/* Header */}
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-red-500">FIRE</span> ALARM
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Follow-Up Fire Alarm</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${voiceActive ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-gray-800 text-gray-500'}`}>
            {voiceActive ? '● VOICE ACTIVE' : '○ VOICE READY'}
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-red-600/20 to-orange-600/10 border border-red-500/30 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Sales at Risk</p>
              <p className="text-3xl font-black text-white">{formatCurrency(totalAtRisk)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl">🔥</p>
              <p className="text-xs text-gray-400">{filteredLeads.length} leads need you</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setFilter('fire')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
              filter === 'fire' 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🔥 FIRE ({leads.filter(l => l.status === 'Hot' && l.urgency >= 48).length})
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
              filter === 'all' 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ALL HOT ({leads.filter(l => l.status === 'Hot').length})
          </button>
        </div>

        {/* Leads List */}
        <div className="space-y-3">
          {filteredLeads.map(lead => {
            const fire = getFireLevel(lead.urgency)
            return (
              <div 
                key={lead.id}
                className={`rounded-2xl border ${fire.border} ${fire.bg} p-4 transition-all active:scale-[0.98]`}
                onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{fire.emoji}</span>
                      <h3 className="font-bold text-white">{lead.name}</h3>
                      <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">
                        {lead.urgency}h
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white mb-1">{formatCurrency(lead.quoteAmount)}</p>
                    <p className="text-sm text-gray-400">{lead.notes}</p>
                  </div>
                </div>

                {/* Expanded Actions */}
                {selectedLead === lead.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3 animate-in fade-in slide-in-from-top-2">
                    {/* Suggested Message */}
                    <div 
                      className="bg-gray-900/80 rounded-xl p-3 cursor-pointer relative group"
                      onClick={(e) => { e.stopPropagation(); handleCopyMessage(lead); }}
                    >
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                        Suggested Message
                        {copied === lead.id && <span className="text-green-400">✓ Copied!</span>}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {getRandomMessage(lead.name, lead.quoteAmount, lead.urgency)}
                      </p>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-gray-500">Tap to copy</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleContact('call', lead); }}
                        className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                      >
                        📞 Call
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleContact('sms', lead); }}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                      >
                        💬 Text
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleContact('email', lead); }}
                        className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                      >
                        ✉️ Email
                      </button>
                    </div>

                    {/* Contact Info */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>{lead.phone}</p>
                      <p>{lead.email}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-gray-400 font-medium">All caught up!</p>
            <p className="text-sm text-gray-600">No fires to put out right now</p>
          </div>
        )}

        {/* Voice Command Hint */}
        <div className="mt-8 p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Voice Commands</p>
          <p className="text-sm text-gray-400">Say <span className="text-white font-mono bg-gray-800 px-2 py-0.5 rounded">"crm fire"</span> to activate this screen instantly</p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Follow-Up Fire Alarm v1.0 • Built for Josh
        </p>
      </div>
    </div>
  )
}