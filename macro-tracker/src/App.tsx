import { useState, useEffect, useMemo } from 'react'
import './index.css'
import { Plus, TrendingUp, Scale, Target, Calendar, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

// Josh's targets
const TARGET_WEIGHT = 160
const START_WEIGHT = 145

// Daily macro targets for lean bulk (plant-based)
const MACRO_TARGETS = {
  protein: 140, // grams
  carbs: 300,   // grams
  fat: 70,      // grams
  calories: 2500
}

interface DailyLog {
  date: string
  weight: number
  protein: number
  carbs: number
  fat: number
  calories: number
  notes: string
}

function App() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddModal, setShowAddModal] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('macro_logs')
    if (saved) setLogs(JSON.parse(saved))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('macro_logs', JSON.stringify(logs))
  }, [logs])

  const addLog = (log: DailyLog) => {
    setLogs(prev => {
      const filtered = prev.filter(l => l.date !== log.date)
      return [...filtered, log].sort((a, b) => a.date.localeCompare(b.date))
    })
  }

  const deleteLog = (date: string) => {
    if (confirm('Delete this entry?')) {
      setLogs(prev => prev.filter(l => l.date !== date))
    }
  }

  // Get current log for selected date
  const currentLog = logs.find(l => l.date === selectedDate)

  // Calculate stats
  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : START_WEIGHT
  const weightChange = latestWeight - START_WEIGHT
  const progressToGoal = ((latestWeight - START_WEIGHT) / (TARGET_WEIGHT - START_WEIGHT)) * 100

  // 7-day average weight
  const sevenDayAvg = useMemo(() => {
    const recent = logs.slice(-7)
    if (recent.length === 0) return null
    return recent.reduce((sum, l) => sum + l.weight, 0) / recent.length
  }, [logs])

  // Weight trend (last 7 days vs previous 7 days)
  const weightTrend = useMemo(() => {
    if (logs.length < 14) return null
    const recent = logs.slice(-7).reduce((sum, l) => sum + l.weight, 0) / 7
    const previous = logs.slice(-14, -7).reduce((sum, l) => sum + l.weight, 0) / 7
    return recent - previous
  }, [logs])

  // Weekly averages
  const weeklyStats = useMemo(() => {
    const weeks: { [key: string]: DailyLog[] } = {}
    logs.forEach(log => {
      const date = new Date(log.date)
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
      if (!weeks[weekKey]) weeks[weekKey] = []
      weeks[weekKey].push(log)
    })
    return Object.entries(weeks).slice(-4).map(([week, data]) => ({
      week,
      avgWeight: data.reduce((sum, l) => sum + l.weight, 0) / data.length,
      avgCalories: data.reduce((sum, l) => sum + l.calories, 0) / data.length,
      avgProtein: data.reduce((sum, l) => sum + l.protein, 0) / data.length,
    }))
  }, [logs])

  // Navigation
  const goToPreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Macro Tracker</h1>
                <p className="text-xs text-gray-400">145 → 160 lbs @ 12% BF</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log Day
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400">Current Weight</p>
            <p className="text-2xl font-bold">{latestWeight.toFixed(1)} lbs</p>
            <p className={`text-xs ${weightChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)} lbs
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400">7-Day Avg</p>
            <p className="text-2xl font-bold">{sevenDayAvg?.toFixed(1) || '---'} lbs</p>
            {weightTrend !== null && (
              <p className={`text-xs ${(weightTrend || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(weightTrend || 0) >= 0 ? '↑' : '↓'} {Math.abs(weightTrend || 0).toFixed(2)} lbs/week
              </p>
            )}
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400">Progress to Goal</p>
            <p className="text-2xl font-bold">{Math.min(100, Math.max(0, progressToGoal)).toFixed(0)}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 rounded-full h-2 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, progressToGoal))}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400">Days Logged</p>
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-gray-500">Keep it up!</p>
          </div>
        </div>

        {/* Daily View */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-sm text-gray-400">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {currentLog && (
                <p className="text-xs text-gray-500 mt-1">Logged</p>
              )}
            </div>
            <button 
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {currentLog ? (
            <div className="space-y-6">
              {/* Weight */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Weight</span>
                </div>
                <span className="text-xl font-bold">{currentLog.weight} lbs</span>
              </div>

              {/* Macros */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Macros</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Protein', value: currentLog.protein, target: MACRO_TARGETS.protein, unit: 'g', color: 'bg-blue-500' },
                    { label: 'Carbs', value: currentLog.carbs, target: MACRO_TARGETS.carbs, unit: 'g', color: 'bg-yellow-500' },
                    { label: 'Fat', value: currentLog.fat, target: MACRO_TARGETS.fat, unit: 'g', color: 'bg-red-500' },
                    { label: 'Calories', value: currentLog.calories, target: MACRO_TARGETS.calories, unit: '', color: 'bg-green-500' },
                  ].map(macro => (
                    <div key={macro.label} className="bg-gray-700 rounded-lg p-3">
                      <p className="text-xs text-gray-400">{macro.label}</p>
                      <p className="text-xl font-bold">{macro.value}{macro.unit}</p>
                      <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
                        <div 
                          className={`${macro.color} rounded-full h-1.5 transition-all`}
                          style={{ width: `${Math.min(100, (macro.value / macro.target) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{macro.target}{macro.unit} target</p>
                    </div>
                  ))}
                </div>
              </div>

              {currentLog.notes && (
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-sm">{currentLog.notes}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => deleteLog(selectedDate)}
                  className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Entry
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No data for this date</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
              >
                Log This Day
              </button>
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        {weeklyStats.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Weekly Trends
            </h2>
            <div className="space-y-3">
              {weeklyStats.map((week, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">Week {i + 1}</p>
                    <p className="text-sm text-gray-400">{week.avgCalories.toFixed(0)} cal avg</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{week.avgWeight.toFixed(1)} lbs</p>
                    <p className="text-sm text-gray-400">{week.avgProtein.toFixed(0)}g protein</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Target className="w-6 h-6 text-green-200 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-100">Lean Bulk Tips</h3>
              <ul className="mt-2 space-y-1 text-sm text-green-200">
                <li>• Aim for +0.5 lbs per week (slower = more muscle, less fat)</li>
                <li>• Protein: 140g daily (plant sources: tofu, lentils, tempeh, protein powder)</li>
                <li>• Weigh daily, compare weekly averages (not daily fluctuations)</li>
                <li>• If weight stalls 2+ weeks, add 100-200 calories</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Add Log Modal */}
      {showAddModal && (
        <AddLogModal 
          date={selectedDate}
          existingLog={currentLog}
          onClose={() => setShowAddModal(false)}
          onAdd={addLog}
        />
      )}
    </div>
  )
}

function AddLogModal({ date, existingLog, onClose, onAdd }: { 
  date: string
  existingLog?: DailyLog
  onClose: () => void
  onAdd: (log: DailyLog) => void 
}) {
  const [formData, setFormData] = useState({
    weight: existingLog?.weight.toString() || '',
    protein: existingLog?.protein.toString() || '',
    carbs: existingLog?.carbs.toString() || '',
    fat: existingLog?.fat.toString() || '',
    calories: existingLog?.calories.toString() || '',
    notes: existingLog?.notes || '',
  })

  const handleSubmit = () => {
    onAdd({
      date,
      weight: Number(formData.weight),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fat: Number(formData.fat),
      calories: Number(formData.calories),
      notes: formData.notes,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {existingLog ? 'Edit' : 'Log'} {new Date(date).toLocaleDateString()}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
              placeholder="145.0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Protein (g)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="140"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fat (g)</label>
              <input
                type="number"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Calories</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="2500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
              rows={3}
              placeholder="How did you feel? Energy levels?"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.weight}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {existingLog ? 'Update' : 'Log'} Day
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
