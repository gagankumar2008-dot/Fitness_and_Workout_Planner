import { Plus } from 'lucide-react'

export default function ExerciseCard({ exercise, onAdd, compact = false }) {
  return (
    <article className={`exercise-card ${compact ? 'exercise-card-compact' : ''}`}>
      <div className={`exercise-art muscle-${exercise.muscle.toLowerCase()}`}>
        <span>{exercise.icon}</span>
        <small>{exercise.muscle.toUpperCase()}</small>
      </div>
      <div className="exercise-info">
        <div className="exercise-heading"><h3>{exercise.name}</h3><span className={`level level-${exercise.level.toLowerCase()}`}>{exercise.level}</span></div>
        <p>{exercise.muscle} <span>·</span> {exercise.sets} sets × {exercise.reps}</p>
      </div>
      <button className="icon-action add-exercise" onClick={() => onAdd(exercise)} aria-label={`Add ${exercise.name} to planner`} title="Add to planner"><Plus size={17} /></button>
    </article>
  )
}
