import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import idLocale from 'date-fns/locale/id';
import { parseISO } from 'date-fns';

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

        const month = 7; // ← Juli
        const year = 2025;

        Object.values(data).forEach((item) => {
            const { employee, schedule } = item;

            if (!employee || !schedule) return;

            Object.entries(schedule).forEach(([key, schedItem]) => {
                const shift = schedItem?.shift;

                if (!shift) {
                    console.warn('Missing shift:', { key, shift, employee });
                    return;
                }

                // Ambil tanggal dari key
                const schedule_date_str = `${key}/${month}/${year}`;

                try {
                    const date = parse(schedule_date_str, 'dd/MM/yyyy', new Date());

                    let startHour = 8,
                        endHour = 16;
                    if (shift.shift_code === 'S') {
                        startHour = 12;
                        endHour = 20;
                    } else if (shift.shift_code === 'M') {
                        startHour = 20;
                        endHour = 8;
                    }

                    const start = new Date(date);
                    start.setHours(startHour, 0);

                    const end = new Date(date);
                    if (shift.shift_code === 'M') {
                        end.setDate(end.getDate() + 1);
                    }
                    end.setHours(endHour, 0);

                    events.push({
                        title: `${employee.name} - ${shift.shift_code}`,
                        start,
                        end,
                        resource: {
                            employee_id: employee.id,
                            shift_id: shift.id,
                        },
                    });
                } catch (error) {
                    console.error('Error parsing schedule:', error, { schedule_date_str });
                }
            });
        });

        console.log('Converted events:', events);
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
