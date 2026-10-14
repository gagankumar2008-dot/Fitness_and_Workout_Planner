import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, CalendarDays, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, Clock3, Dumbbell, Flame, Heart, Plus, Search,
  Sparkles, Trash2, TrendingUp, Weight, X,
} from 'lucide-react'
import exercises from './data/exercises.json'
import ExerciseCard from './components/ExerciseCard'
import Sidebar from './components/Sidebar'
import { getLocalDate, useStoredState } from './utils/storage'

const ProgressChart = lazy(() => import('./components/ProgressChart'))

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MUSCLES = ['All exercises', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
function makeEntry(exercise) {
  return { ...exercise, uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, completed: false }
}

function seededPlan() {
  const plan = Object.fromEntries(DAYS.map((day) => [day, []]))
  const presets = [
    ['Monday', 'push-ups'], ['Monday', 'dumbbell-row'],
    ['Tuesday', 'squats'], ['Tuesday', 'lunges'],
    ['Thursday', 'shoulder-press'], ['Thursday', 'plank'],
    ['Saturday', 'bicep-curls'], ['Saturday', 'dead-bugs'],
  ]
  presets.forEach(([day, id]) => {
    const exercise = exercises.find((item) => item.id === id)
    if (exercise) plan[day].push(makeEntry(exercise))
  })
  return plan
}

const beginnerPlan = {
  Monday: ['push-ups', 'dumbbell-row', 'squats'],
  Tuesday: [],
  Wednesday: ['shoulder-press', 'plank', 'bicep-curls'],
  Thursday: [],
  Friday: ['incline-pushups', 'lat-pulldown', 'lunges'],
  Saturday: [],
  Sunday: [],
}
const intermediatePlan = {
  Monday: ['dumbbell-press', 'dumbbell-row', 'lateral-raises'],
  Tuesday: ['goblet-squat', 'deadlift', 'russian-twists'],
  Wednesday: [],
  Thursday: ['arnold-press', 'hammer-curls', 'tricep-dips'],
  Friday: ['dumbbell-press', 'lat-pulldown', 'plank'],
  Saturday: [],
  Sunday: [],
}

function PageHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-subtitle">{subtitle}</p></div>
      {action}
    </div>
  )
}

function SectionTitle({ title, caption, action }) {
  return <div className="section-title"><div><h2>{title}</h2>{caption && <p>{caption}</p>}</div>{action}</div>
}

function calculateStreak(dates) {
  const completed = new Set(dates)
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!completed.has(getLocalDate(cursor))) cursor.setDate(cursor.getDate() - 1)
  if (!completed.has(getLocalDate(cursor))) return 0
  let streak = 0
  while (completed.has(getLocalDate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head"><h2 id="modal-title">{title}</h2><button className="icon-action" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
        {children}
      </section>
    </div>
  )
}

function Dashboard({ plan, progressEntries, streak, onNavigate, onToggle, onAddPlan }) {
  const all = DAYS.flatMap((day) => (plan[day] || []).map((item) => ({ ...item, day })))
  const done = all.filter((item) => item.completed).length
  const percent = all.length ? Math.round((done / all.length) * 100) : 0
  const weekDays = DAYS.map((day) => ({ day: day.slice(0, 3), total: (plan[day] || []).length, done: (plan[day] || []).filter((item) => item.completed).length }))
  const todayIndex = (new Date().getDay() + 6) % 7
  const upcomingDays = [...DAYS.slice(todayIndex), ...DAYS.slice(0, todayIndex)]
  const nextWorkout = upcomingDays.flatMap((day) => (plan[day] || []).filter((item) => !item.completed).map((item) => ({ ...item, day })))[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - todayIndex)
  const message = !all.length ? 'A fresh week is a fresh start.' : percent === 100 ? 'You did it. That’s what consistency looks like.' : percent >= 60 ? 'You’re finding your rhythm. Keep it going.' : percent > 0 ? 'Every rep counts. Keep building your streak.' : 'Small steps today. Strong habits tomorrow.'
  const lastEntry = [...progressEntries].sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <>
      <PageHeading eyebrow="YOUR PERSONAL FITNESS SPACE" title="Your week, in motion." subtitle="A little progress each day adds up to something big." action={<span className="date-chip"><span className="live-dot" /> WEEK OF {weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}</span>} />
      <section className="welcome-banner">
        <div className="welcome-copy"><div className="banner-tag"><Sparkles size={13} /> YOUR WEEKLY CHECK-IN</div><h2>{message}</h2><p>{nextWorkout ? <>Your next session is <strong>{nextWorkout.name}</strong> on {nextWorkout.day}.</> : all.length ? 'Your plan is complete for this week. Take a well-earned rest.' : 'Add your first workout to start building momentum.'}</p><button className="btn btn-light" onClick={() => onNavigate(all.length ? 'planner' : 'library')}>{all.length ? 'View your plan' : 'Explore exercises'} <ArrowRight size={16} /></button></div>
        <div className="banner-orbit orbit-one" /><div className="banner-orbit orbit-two" /><div className="banner-stat"><span>THIS WEEK</span><strong>{percent}<small>%</small></strong><div className="mini-progress"><i style={{ width: `${percent}%` }} /></div><em>{done} of {all.length} exercises done</em></div>
        <div className="banner-deco">✳</div>
      </section>
      <div className="stats-grid">
        <StatCard icon={Dumbbell} label="Planned workouts" value={all.length} detail="Exercises on your plan" accent="green" />
        <StatCard icon={CheckCircle2} label="Completed" value={done} detail={`${all.length - done} left to go`} accent="blue" />
        <StatCard icon={TrendingUp} label="Completion rate" value={`${percent}%`} detail="Your week at a glance" accent="purple" />
        <StatCard icon={Flame} label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} detail={streak ? 'Consistency looks good on you' : 'Complete a workout to start'} accent="orange" />
      </div>
      <div className="dashboard-grid">
        <section className="panel week-panel">
          <SectionTitle title="This week" caption="Your workout rhythm, day by day" action={<button className="text-action" onClick={() => onNavigate('planner')}>Full planner <ArrowRight size={14} /></button>} />
          <div className="week-bars">
            {weekDays.map((item) => (
              <button className="week-bar-day" key={item.day} onClick={() => onNavigate('planner')} title={`${item.done} of ${item.total} completed`}>
                <div className="bar-track"><i style={{ height: `${item.total ? Math.max((item.done / item.total) * 100, item.done ? 18 : 4) : 4}%` }} className={item.done === item.total && item.total ? 'bar-complete' : ''} /></div>
                <span className="bar-count">{item.total ? `${item.done}/${item.total}` : '–'}</span><span className="bar-day">{item.day}</span>
              </button>
            ))}
          </div>
          <div className="chart-legend"><span><i className="legend-lime" /> Completed</span><span><i className="legend-muted" /> Planned</span></div>
        </section>
        <section className="panel today-panel">
          <SectionTitle title="Next up" caption="Stay one step ahead" action={<button className="circle-link" onClick={() => onNavigate('planner')} aria-label="Go to planner"><ArrowRight size={16} /></button>} />
          {nextWorkout ? <div className="next-workout"><div className="next-workout-icon"><Dumbbell size={21} /></div><div className="next-workout-day">{nextWorkout.day.toUpperCase()}</div><h3>{nextWorkout.name}</h3><p>{nextWorkout.sets} sets <span>·</span> {nextWorkout.reps} reps</p><button className="btn btn-outline full-width" onClick={() => onToggle(nextWorkout.day, nextWorkout.uid)}><Check size={15} /> Mark as done</button></div>
            : <div className="empty-compact"><span className="empty-icon"><CheckCircle2 size={22} /></span><strong>{all.length ? 'All done for now!' : 'Nothing planned yet'}</strong><p>{all.length ? 'Enjoy your recovery time.' : 'Pick a workout and get going.'}</p><button className="text-action" onClick={() => all.length ? onNavigate('planner') : onAddPlan()}> {all.length ? 'View the week' : 'Choose a starter plan'} <ArrowRight size={14} /></button></div>}
          {lastEntry && <div className="last-checkin"><span>Last check-in</span><strong>{lastEntry.weight ? `${lastEntry.weight} kg` : `${lastEntry.duration} min`}</strong><small>{lastEntry.date}</small></div>}
        </section>
      </div>
      <section className="panel quick-panel">
        <SectionTitle title="A good place to start" caption="Build your routine one exercise at a time" action={<button className="text-action" onClick={() => onNavigate('library')}>Browse library <ArrowRight size={14} /></button>} />
        <div className="quick-grid">
          {['push-ups', 'squats', 'plank'].map((id) => {
            const item = exercises.find((exercise) => exercise.id === id)
            return <ExerciseMini key={id} exercise={item} onClick={() => onNavigate('library')} />
          })}
        </div>
      </section>
    </>
  )
}

function StatCard({ icon: Icon, label, value, detail, accent }) {
  return <article className={`stat-card stat-${accent}`}><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17} /></div></div><strong>{value}</strong><p>{detail}</p></article>
}

function ExerciseMini({ exercise, onClick }) {
  return <button className="exercise-mini" onClick={onClick}><span className={`mini-art muscle-${exercise.muscle.toLowerCase()}`}>{exercise.icon}</span><span><strong>{exercise.name}</strong><small>{exercise.sets} sets · {exercise.reps}</small></span><ArrowRight size={15} /></button>
}

function LibraryPage({ onAdd }) {
  const [filter, setFilter] = useState('All exercises')
  const [query, setQuery] = useState('')
  const filtered = exercises.filter((exercise) => (filter === 'All exercises' || exercise.muscle === filter) && exercise.name.toLowerCase().includes(query.toLowerCase()))
  return <>
    <PageHeading eyebrow="FIND YOUR NEXT MOVE" title="Exercise library" subtitle="Good form starts with a good plan. Pick what feels right for you." action={<span className="library-count"><Dumbbell size={15} /> {exercises.length} exercises</span>} />
    <div className="library-toolbar"><div className="filter-pills" role="group" aria-label="Filter by muscle group">{MUSCLES.map((muscle) => <button key={muscle} className={`filter-pill ${filter === muscle ? 'selected' : ''}`} onClick={() => setFilter(muscle)}>{muscle}</button>)}</div><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises..." aria-label="Search exercises" />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label></div>
    {filtered.length ? <div className="exercise-grid">{filtered.map((exercise) => <ExerciseCard exercise={exercise} onAdd={onAdd} key={exercise.id} />)}</div> : <div className="empty-state"><Search size={25} /><strong>No exercises found</strong><span>Try a different name or muscle group.</span></div>}
  </>
}

function PlannerPage({ plan, onToggle, onRemove, onAdd, onTemplate }) {
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1])
  const [template, setTemplate] = useState('')
  const weeklyTotal = DAYS.reduce((sum, day) => sum + (plan[day] || []).length, 0)
  const weeklyDone = DAYS.reduce((sum, day) => sum + (plan[day] || []).filter((item) => item.completed).length, 0)
  return <>
    <PageHeading eyebrow="MAKE IT A HABIT" title="Weekly planner" subtitle="Your plan, your pace. Move things around whenever you need." action={<div className="planner-top-actions"><label className="template-select"><Sparkles size={15} /><select value={template} onChange={(event) => { setTemplate(event.target.value); if (event.target.value) onTemplate(event.target.value) }} aria-label="Choose a workout template"><option value="">Choose a starter plan</option><option value="beginner">Beginner full body</option><option value="intermediate">Intermediate split</option></select><ChevronDown size={14} /></label><button className="btn btn-primary" onClick={() => onAdd(null, selectedDay)}><Plus size={16} /> Add exercise</button></div>} />
    <div className="planner-summary"><div className="planner-summary-icon"><CalendarDays size={20} /></div><div><strong>A week built around you</strong><span>{weeklyTotal ? `${weeklyDone} of ${weeklyTotal} exercises completed this week` : 'Start with a template or add exercises to your week'}</span></div><div className="planner-summary-progress"><div className="summary-progress-head"><span>WEEKLY PROGRESS</span><b>{weeklyTotal ? Math.round((weeklyDone / weeklyTotal) * 100) : 0}%</b></div><div className="progress-track"><i style={{ width: `${weeklyTotal ? (weeklyDone / weeklyTotal) * 100 : 0}%` }} /></div></div></div>
    <div className="mobile-day-picker"><button className="circle-link" onClick={() => setSelectedDay(DAYS[(DAYS.indexOf(selectedDay) + 6) % 7])} aria-label="Previous day"><ChevronLeft size={16} /></button><div><span>SELECTED DAY</span><strong>{selectedDay}</strong></div><button className="circle-link" onClick={() => setSelectedDay(DAYS[(DAYS.indexOf(selectedDay) + 1) % 7])} aria-label="Next day"><ChevronRight size={16} /></button></div>
    <div className="planner-grid">
      {DAYS.map((day, index) => {
        const list = plan[day] || []
        return <section key={day} className={`day-card ${selectedDay === day ? 'day-selected' : ''}`}>
          <button className="day-card-head" onClick={() => setSelectedDay(day)}><span className="day-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{day}</strong><small>{list.length ? `${list.length} exercise${list.length === 1 ? '' : 's'}` : 'Rest & reset'}</small></div><span className={`day-indicator ${list.length && list.every((item) => item.completed) ? 'indicator-done' : ''}`}>{list.length ? list.filter((item) => item.completed).length : <span className="rest-dot" />}</span></button>
          <div className="day-exercises">
            {list.map((item) => <article key={item.uid} className={`planned-exercise ${item.completed ? 'planned-complete' : ''}`}><button className={`complete-check ${item.completed ? 'checked' : ''}`} onClick={() => onToggle(day, item.uid)} aria-label={`${item.completed ? 'Mark incomplete' : 'Complete'} ${item.name}`}>{item.completed && <Check size={13} />}</button><div className="planned-main"><strong>{item.name}</strong><span>{item.sets} sets · {item.reps}</span></div><button className="remove-exercise" onClick={() => onRemove(day, item.uid)} aria-label={`Remove ${item.name}`} title="Remove exercise"><Trash2 size={14} /></button></article>)}
            {!list.length && <div className="rest-day"><span>☁</span><strong>Rest day</strong><small>Recovery is part of the plan.</small></div>}
          </div>
          <button className="add-day-exercise" onClick={() => onAdd(null, day)}><Plus size={14} /> Add exercise</button>
        </section>
      })}
    </div>
    <div className="planner-tip"><Sparkles size={16} /><span><strong>A gentle reminder:</strong> Rest days are training days too. Listen to your body and make this plan yours.</span></div>
  </>
}

function ProgressPage({ entries, onAddEntry, onDelete }) {
  const [date, setDate] = useState(getLocalDate())
  const [weight, setWeight] = useState('')
  const [duration, setDuration] = useState('')
  const [error, setError] = useState('')
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const handleSubmit = (event) => {
    event.preventDefault()
    if (!weight && !duration) { setError('Add a weight or workout duration to save your check-in.'); return }
    if (weight && (Number(weight) < 20 || Number(weight) > 350)) { setError('Enter a weight between 20 and 350 kg.'); return }
    if (duration && (Number(duration) < 1 || Number(duration) > 1440)) { setError('Enter a duration between 1 and 1440 minutes.'); return }
    onAddEntry({ id: `${Date.now()}`, date, weight: weight ? Number(weight) : null, duration: duration ? Number(duration) : null })
    setWeight(''); setDuration(''); setError('')
  }
  return <>
    <PageHeading eyebrow="NOTICE YOUR PROGRESS" title="Progress tracking" subtitle="The small wins are the big wins. Keep an eye on your journey." action={<span className="library-count"><TrendingUp size={15} /> {entries.length} check-in{entries.length === 1 ? '' : 's'}</span>} />
    <div className="progress-layout">
      <div className="progress-main"><section className="panel chart-panel"><SectionTitle title="Your progress" caption="Weight and workout duration over time" action={<div className="chart-key"><span><i className="legend-lime" /> Weight</span><span><i className="legend-blue" /> Duration</span></div>} /><Suspense fallback={<div className="chart-loading">Loading your chart...</div>}><ProgressChart entries={entries} /></Suspense></section>
        <section className="panel history-panel"><SectionTitle title="Check-in history" caption="A record of your effort" action={<span className="history-count">{entries.length} TOTAL</span>} />
          {sorted.length ? <div className="history-list">{sorted.map((entry) => <div className="history-row" key={entry.id}><div className="history-date-icon"><CalendarDays size={16} /></div><div className="history-date"><strong>{new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong><span>{entry.date}</span></div><div className="history-values">{entry.weight && <span><Weight size={14} /> {entry.weight} <small>kg</small></span>}{entry.duration && <span><Clock3 size={14} /> {entry.duration} <small>min</small></span>}</div><button className="remove-exercise history-delete" onClick={() => onDelete(entry.id)} aria-label="Delete progress entry"><Trash2 size={15} /></button></div>)}</div> : <div className="empty-history"><div className="empty-icon"><TrendingUp size={20} /></div><strong>Your story starts here</strong><span>Add your first check-in and watch your progress take shape.</span></div>}
        </section>
      </div>
      <aside className="panel log-panel"><div className="log-header"><div className="log-icon"><Plus size={18} /></div><div><h2>New check-in</h2><p>Progress over perfection.</p></div></div><form onSubmit={handleSubmit} className="log-form"><label>Date<input type="date" value={date} max={getLocalDate()} onChange={(event) => setDate(event.target.value)} required /></label><div className="input-with-unit"><label htmlFor="entry-weight">Body weight</label><div><input id="entry-weight" type="number" min="20" max="350" step="0.1" placeholder="e.g. 65.5" value={weight} onChange={(event) => setWeight(event.target.value)} /><span>kg</span></div></div><div className="input-with-unit"><label htmlFor="entry-duration">Workout duration</label><div><input id="entry-duration" type="number" min="1" max="1440" step="1" placeholder="e.g. 45" value={duration} onChange={(event) => setDuration(event.target.value)} /><span>min</span></div></div>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="btn btn-primary full-width"><Plus size={16} /> Save check-in</button></form><div className="privacy-note"><Heart size={14} /><span>Your data stays private on this device.</span></div></aside>
    </div>
  </>
}

function BmiPage({ bmiInputs, setBmiInputs }) {
  const height = Number(bmiInputs.height)
  const weightValue = Number(bmiInputs.weight)
  const bmi = height > 0 && weightValue > 0 ? weightValue / ((height / 100) ** 2) : null
  const category = bmi == null ? null : bmi < 18.5 ? { label: 'Underweight', tone: 'blue', detail: 'Below the adult healthy-weight range.' } : bmi < 25 ? { label: 'Healthy weight range', tone: 'green', detail: 'Within the adult healthy-weight range.' } : bmi < 30 ? { label: 'Overweight', tone: 'orange', detail: 'Above the adult healthy-weight range.' } : { label: 'Obesity range', tone: 'red', detail: 'At or above the adult obesity screening threshold.' }
  const position = bmi == null ? 0 : Math.min(Math.max(((bmi - 15) / 25) * 100, 0), 100)
  return <>
    <PageHeading eyebrow="A QUICK HEALTH CHECK" title="BMI calculator" subtitle="A simple reference point, not the whole picture." />
    <div className="bmi-layout"><section className="panel bmi-form-panel"><div className="bmi-section-icon"><Weight size={20} /></div><h2>Your measurements</h2><p>Enter your current height and weight to calculate your BMI.</p><div className="bmi-input"><label htmlFor="bmi-height">Height</label><div><input id="bmi-height" type="number" min="80" max="250" placeholder="170" value={bmiInputs.height} onChange={(event) => setBmiInputs({ ...bmiInputs, height: event.target.value })} /><span>cm</span></div></div><div className="bmi-input"><label htmlFor="bmi-weight">Weight</label><div><input id="bmi-weight" type="number" min="20" max="350" step="0.1" placeholder="65" value={bmiInputs.weight} onChange={(event) => setBmiInputs({ ...bmiInputs, weight: event.target.value })} /><span>kg</span></div></div><div className="bmi-live-note"><Sparkles size={14} /><span>Your result updates as you type.</span></div></section>
      <section className="panel bmi-result-panel"><div className="result-top"><div><span className="eyebrow">YOUR RESULT</span><h2>{category ? 'Your BMI' : 'Ready when you are'}</h2></div><div className="result-stamp"><Weight size={18} /></div></div>{category ? <><div className="bmi-reading"><strong>{bmi.toFixed(1)}</strong><span>BMI</span></div><div className={`bmi-category tone-${category.tone}`}><span className="category-dot" /><strong>{category.label}</strong><span>{category.detail}</span></div><div className="bmi-scale"><div className="scale-bar"><i className="scale-under" /><i className="scale-healthy" /><i className="scale-over" /><i className="scale-obese" /><span style={{ left: `${position}%` }} /></div><div className="scale-labels"><span>Underweight</span><span>Healthy</span><span>Overweight</span><span>Obesity</span></div></div></> : <div className="bmi-placeholder"><div className="bmi-placeholder-circle"><Weight size={25} /></div><strong>Enter your measurements</strong><span>Your BMI and category will appear here.</span></div>}</section>
      <div className="bmi-disclaimer"><div className="disclaimer-mark">i</div><div><strong>A helpful note about BMI</strong><p>BMI is a rough screening measure, not a diagnosis. It does not account for factors like muscle mass, age, or individual health. Adult BMI categories are not appropriate for everyone, especially growing teenagers. For personal guidance, talk with a qualified healthcare professional.</p></div></div>
    </div>
  </>
}

function TimerPage({ timerSeconds, setTimerSeconds }) {
  const [duration, setDuration] = useState(60)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => setTimerSeconds((seconds) => Math.max(seconds - 1, 0)), 1000)
    return () => window.clearInterval(timer)
  }, [running, setTimerSeconds])
  useEffect(() => {
    if (timerSeconds === 0) setRunning(false)
  }, [timerSeconds])
  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, '0')
  const seconds = (timerSeconds % 60).toString().padStart(2, '0')
  const presets = [30, 60, 90, 120]
  return <>
    <PageHeading eyebrow="TAKE YOUR TIME" title="Rest timer" subtitle="Recovery between sets is where the next rep gets stronger." />
    <div className="timer-layout"><section className="panel timer-panel"><div className="timer-ring" style={{ '--timer-progress': `${timerSeconds ? Math.max((timerSeconds / duration) * 100, 0) : 0}%` }}><div className="timer-ring-inner"><span>{timerSeconds === 0 ? 'REST COMPLETE' : running ? 'BREATHE & RESET' : 'READY WHEN YOU ARE'}</span><strong>{minutes}:{seconds}</strong><small>MINUTES : SECONDS</small></div></div><div className="timer-controls"><button className="btn btn-primary timer-main-btn" onClick={() => { if (!timerSeconds) setTimerSeconds(duration); setRunning(!running) }}>{running ? 'Pause timer' : timerSeconds && timerSeconds !== duration ? 'Resume timer' : 'Start timer'}</button><button className="btn btn-outline" onClick={() => { setRunning(false); setTimerSeconds(duration) }}>Reset</button></div><div className="timer-presets"><span>QUICK SET</span>{presets.map((secondsOption) => <button key={secondsOption} className={duration === secondsOption ? 'preset-active' : ''} onClick={() => { setRunning(false); setDuration(secondsOption); setTimerSeconds(secondsOption) }}>{secondsOption < 60 ? `${secondsOption}s` : `${secondsOption / 60}m`}</button>)}</div></section><aside className="panel timer-aside"><div className="timer-aside-mark"><Clock3 size={21} /></div><h2>Rest is part of the work.</h2><p>Taking a moment between sets helps you recover, stay focused, and bring your best to every rep.</p><div className="rest-tips"><span><CheckCircle2 size={16} /> Catch your breath</span><span><CheckCircle2 size={16} /> Sip some water</span><span><CheckCircle2 size={16} /> Get ready for the next set</span></div><div className="timer-aside-quote">“Almost everything will work again if you unplug it for a few minutes.”<small>— Anne Lamott</small></div></aside></div>
  </>
}

function SettingsPage({ onReset }) {
  return <><PageHeading eyebrow="MAKE FITTRACK YOURS" title="Settings" subtitle="Your preferences and the little details that make this space yours." /><section className="panel settings-panel"><div className="settings-heading"><div className="settings-icon"><Weight size={19} /></div><div><h2>Your data</h2><p>Understand how your information is stored.</p></div></div><div className="settings-info"><div><strong>Stored on this device</strong><p>Your workouts, progress entries, BMI inputs, and timer are saved in this browser's LocalStorage. They are not synced across devices or shared with an account.</p></div><span className="local-badge"><span /> LOCAL ONLY</span></div><div className="settings-info reset-setting"><div><strong>Reset all FitTrack data</strong><p>Remove your saved workouts, completion history, progress logs, and preferences from this browser.</p></div><button className="btn btn-danger" onClick={onReset}><Trash2 size={15} /> Reset data</button></div><div className="settings-footer"><span>FitTrack v1.0</span><span>Take it one workout at a time <span className="footer-star">✳</span></span></div></section></>
}

function App() {
  const [plan, setPlan] = useStoredState('fittrack-plan', seededPlan)
  const [entries, setEntries] = useStoredState('fittrack-progress', [])
  const [active, setActive] = useState('dashboard')
  const [streakDates, setStreakDates] = useStoredState('fittrack-completion-dates', [])
  const [bmiInputs, setBmiInputs] = useStoredState('fittrack-bmi', { height: '', weight: '' })
  const [timerSeconds, setTimerSeconds] = useStoredState('fittrack-timer', 60)
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')
  const streak = useMemo(() => calculateStreak(streakDates), [streakDates])
  const pageNames = { dashboard: 'Dashboard', library: 'Exercise library', planner: 'Weekly planner', progress: 'Progress tracking', bmi: 'BMI calculator', timer: 'Rest timer', settings: 'Settings' }

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const addExercise = (exercise, day) => setModal({ type: 'add', exercise, day: day || 'Monday' })
  const confirmAdd = (exercise, day) => {
    setPlan((current) => ({ ...current, [day]: [...(current[day] || []), makeEntry(exercise)] }))
    setModal(null)
    setNotice(`${exercise.name} added to ${day}.`)
  }
  const toggleExercise = (day, uid) => {
    const item = (plan[day] || []).find((exercise) => exercise.uid === uid)
    if (!item) return
    const completedDate = item.completedDate || getLocalDate()
    const nextCompleted = !item.completed
    setPlan((current) => {
      return {
        ...current,
        [day]: (current[day] || []).map((exercise) => exercise.uid === uid
          ? { ...exercise, completed: nextCompleted, completedDate: nextCompleted ? getLocalDate() : null }
          : exercise),
      }
    })
    if (nextCompleted) {
      setStreakDates((dates) => [...new Set([...dates, getLocalDate()])])
    } else {
      const otherCompletionOnDate = Object.values(plan).some((items) => items.some((exercise) => exercise.uid !== uid && exercise.completed && exercise.completedDate === completedDate))
      if (!otherCompletionOnDate) setStreakDates((dates) => dates.filter((date) => date !== completedDate))
    }
  }
  const removeExercise = (day, uid) => setPlan((current) => ({ ...current, [day]: (current[day] || []).filter((item) => item.uid !== uid) }))
  const applyTemplate = (name) => {
    const template = name === 'beginner' ? beginnerPlan : intermediatePlan
    const hasExercises = DAYS.some((day) => (plan[day] || []).length)
    if (hasExercises && !window.confirm('Replace your current weekly plan with this template?')) return
    const next = Object.fromEntries(DAYS.map((day) => [day, (template[day] || []).map((id) => makeEntry(exercises.find((exercise) => exercise.id === id))).filter(Boolean)]))
    setPlan(next)
    setNotice(`${name === 'beginner' ? 'Beginner' : 'Intermediate'} plan added. Make it your own!`)
  }
  const addProgress = (entry) => setEntries((current) => [...current, entry])
  const deleteProgress = (id) => setEntries((current) => current.filter((item) => item.id !== id))
  const resetData = () => {
    if (!window.confirm('Reset all FitTrack data saved in this browser? This cannot be undone.')) return
    try {
      ;['fittrack-plan', 'fittrack-progress', 'fittrack-completion-dates', 'fittrack-bmi', 'fittrack-timer'].forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error('Could not reset FitTrack data in localStorage', error)
      setNotice('FitTrack could not clear browser storage. Please check your browser settings.')
      return
    }
    setPlan(Object.fromEntries(DAYS.map((day) => [day, []])))
    setEntries([])
    setStreakDates([])
    setBmiInputs({ height: '', weight: '' })
    setTimerSeconds(60)
    setActive('dashboard')
    setNotice('Your local FitTrack data has been reset.')
  }

  const renderPage = () => {
    switch (active) {
      case 'library': return <LibraryPage onAdd={(exercise) => addExercise(exercise, 'Monday')} />
      case 'planner': return <PlannerPage plan={plan} onToggle={toggleExercise} onRemove={removeExercise} onAdd={addExercise} onTemplate={applyTemplate} />
      case 'progress': return <ProgressPage entries={entries} onAddEntry={addProgress} onDelete={deleteProgress} />
      case 'bmi': return <BmiPage bmiInputs={bmiInputs} setBmiInputs={setBmiInputs} />
      case 'timer': return <TimerPage timerSeconds={timerSeconds} setTimerSeconds={setTimerSeconds} />
      case 'settings': return <SettingsPage onReset={resetData} />
      default: return <Dashboard plan={plan} progressEntries={entries} streak={streak} onNavigate={setActive} onToggle={toggleExercise} onAddPlan={() => setActive('planner')} />
    }
  }

  return <div className="app-shell">
    <Sidebar active={active} onNavigate={setActive} streak={streak} />
    <div className="main-column">
      <header className="topbar"><div className="breadcrumb">FITTRACK <ChevronRight size={13} /> <strong>{pageNames[active]}</strong></div><div className="topbar-right"><span className="today-label">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span><button className="top-avatar" aria-label="Open settings" onClick={() => setActive('settings')}>A</button></div></header>
      <main className="main-content" key={active}>{renderPage()}</main>
      <footer className="mobile-footer"><Sidebar active={active} onNavigate={setActive} streak={streak} compact /></footer>
    </div>
    {modal?.type === 'add' && <AddExerciseModal exercise={modal.exercise} initialDay={modal.day} onClose={() => setModal(null)} onAdd={confirmAdd} />}
    {notice && <div className="toast" role="status"><CheckCircle2 size={17} /> {notice}</div>}
  </div>
}

function AddExerciseModal({ exercise: initialExercise, initialDay, onClose, onAdd }) {
  const [exerciseId, setExerciseId] = useState(initialExercise?.id || '')
  const [day, setDay] = useState(initialDay)
  const [search, setSearch] = useState('')
  const exercise = exercises.find((item) => item.id === exerciseId)
  const choices = exercises.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
  return <Modal title={initialExercise ? 'Add to your week' : 'Add an exercise'} onClose={onClose}>
    <div className="add-modal-content">{!initialExercise && <label className="modal-field">Choose an exercise<div className="modal-select-wrap"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the library..." /><select value={exerciseId} onChange={(event) => setExerciseId(event.target.value)} aria-label="Choose exercise"><option value="">Select an exercise</option>{choices.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.muscle}</option>)}</select></div></label>}
      {initialExercise && <div className="modal-exercise-preview"><span className={`mini-art muscle-${initialExercise.muscle.toLowerCase()}`}>{initialExercise.icon}</span><div><strong>{initialExercise.name}</strong><small>{initialExercise.muscle} · {initialExercise.sets} sets × {initialExercise.reps}</small></div></div>}
      {!initialExercise && exercise && <div className="modal-selected-note"><CheckCircle2 size={15} /> {exercise.sets} sets × {exercise.reps} · {exercise.level}</div>}
      <label className="modal-field">Add to day<select className="day-select" value={day} onChange={(event) => setDay(event.target.value)}>{DAYS.map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="modal-actions"><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!exercise} onClick={() => exercise && onAdd(exercise, day)}><Plus size={15} /> Add to {day}</button></div>
    </div>
  </Modal>
}

export default App
