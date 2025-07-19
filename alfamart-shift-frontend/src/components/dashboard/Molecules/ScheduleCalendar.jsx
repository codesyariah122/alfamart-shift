import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { format, parse, startOfWeek, getDay } from 'date-fns';
import idLocale from 'date-fns/locale/id';

const locales = {
    'id': idLocale,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

const ScheduleCalendar = ({ data }) => {
    // Convert data dari API ke format yang bisa dipakai Big Calendar
    const convertScheduleToEvents = () => {
        const events = [];

        Object.values(data).forEach(({ employee, schedule }) => {
            Object.values(schedule).forEach(({ schedule_date, shift }) => {
                const date = new Date(schedule_date);

                // Default shift time
                let startHour = 8, endHour = 16;
                if (shift.shift_code === 'S') {
                    startHour = 12; endHour = 20;
                } else if (shift.shift_code === 'M') {
                    startHour = 20; endHour = 8;
                }

                const start = new Date(date);
                start.setHours(startHour, 0);

                const end = new Date(date);
                if (shift.shift_code === 'M') end.setDate(end.getDate() + 1);
                end.setHours(endHour, 0);

                events.push({
                    title: `${employee.name} - ${shift.shift_code}`,
                    start,
                    end,
                    resource: { employee_id: employee.id, shift_id: shift.id }
                });
            });
        });

        return events;
    };

    return (
        <div
            className="p-4 bg-white rounded shadow"
            style={{
                position: 'relative', // pastikan ini RELATIVE
                overflow: 'visible',
                zIndex: 0,
            }}
        >

            <Calendar
                localizer={localizer}
                events={convertScheduleToEvents()}
                startAccessor="start"
                endAccessor="end"
                defaultView="month"
                views={['month', 'week', 'day']}
                popup={true}
                style={{ height: 600 }}
                onShowMore={(events, date) => {
                    console.log('Show more clicked:', { events, date });
                }}
            />
        </div>
    );
};

export default ScheduleCalendar;
