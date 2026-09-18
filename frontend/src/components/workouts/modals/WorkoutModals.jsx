import { TrainingDetailModal } from "./TrainingDetailModal.jsx";
import { TrainingFormModal } from "./TrainingFormModal.jsx";
import {ExerciseFromModal} from "./ExerciseFromModal.jsx";


export function WorkoutModals({ detailTraining, setDetailTraining,
                              trainForm, setTrainForm, exForm,
                              setExForm, removeTraining, saveTraining,
                              exercises, saveExercise}) {
    return (
        <>
            {detailTraining && (
                <TrainingDetailModal
                training={detailTraining} onClose={() => setDetailTraining(null)}
                onDelete={removeTraining} onEdit={(t) => {
                    setTrainForm({id: t.id, name: t.name, date: t.date,
                    exercises: (t.training_exercises || []).map(te => ({
                        exercise_id: te.exercise_id,
                        quantity: te.quantity ?? '',
                        weight: te.weight ?? '',
                    })),
                    });
                    setDetailTraining(null);
                }}/>
            )}
            {trainForm && (
                <TrainingFormModal
                setTrainForm={setTrainForm} trainForm={trainForm}
                saveTraining={saveTraining} exercises={exercises}/>
            )}
            {exForm && (
                <ExerciseFromModal
                exForm={exForm} saveExercise={saveExercise}
                setExForm={setExForm}/>
            )}
        </>
    )
}