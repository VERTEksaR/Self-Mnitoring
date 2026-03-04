import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';


export function DateRangeCalendar({ draftRange, onChange }) {
    return (
        <DayPicker
            mode="range"
            selected={draftRange}
            onSelect={onChange}
        />
    );
}