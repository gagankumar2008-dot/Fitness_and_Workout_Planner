import {
  Activity, BarChart3, BookOpen, CalendarDays, CircleUserRound, Dumbbell,
  LayoutDashboard, Settings, Timer, Weight,
} from 'lucide-react'

const navGroups = [
  {
    label: 'WORKSPACE',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'library', label: 'Exercise library', icon: BookOpen },
      { id: 'planner', label: 'Weekly planner', icon: CalendarDays },
      { id: 'progress', label: 'Progress tracking', icon: BarChart3 },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { id: 'bmi', label: 'BMI calculator', icon: Weight },
      { id: 'timer', label: 'Rest timer', icon: Timer },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar({ active, onNavigate, streak = 0, compact = false }) {
  return (
    <aside className={`sidebar ${compact ? 'sidebar-mobile' : ''}`}>
      <button className="brand" onClick={() => onNavigate('dashboard')} aria-label="FitTrack home">
        <span className="brand-mark"><Activity size={21} strokeWidth={2.6} /></span>
        <span className="brand-name">fittrack<span>.</span></span>
      </button>
      <div className="sidebar-profile">
        <div className="avatar"><CircleUserRound size={21} /></div>
        <div><strong>Hey, Alex</strong><span>Keep showing up</span></div>
        <span className="profile-dot" />
      </div>
      <nav className="side-nav" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-label">{group.label}</p>
            {group.items.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-link ${active === id ? 'active' : ''}`} onClick={() => onNavigate(id)}>
                <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
                {active === id && <span className="nav-active-dot" />}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="streak-card">
          <div className="streak-icon"><Dumbbell size={17} /></div>
          <div><strong>{streak} day streak</strong><span>You're on a roll</span></div>
          <span className="streak-spark">✦</span>
        </div>
        <div className="sidebar-foot">Made for your momentum <span>✳</span></div>
      </div>
    </aside>
  )
}
