export function generateScheduleByStoreType(storeType, employees, daysInMonth) {
    const schedule = {};

    // Inisialisasi data kosong untuk setiap karyawan
    employees.forEach(emp => {
        schedule[emp.id] = {};
    });

    for (let day = 1; day <= daysInMonth; day++) {
        const shuffled = [...employees].sort(() => Math.random() - 0.5);
        const males = shuffled.filter(e => e.gender === 'male');
        const females = shuffled.filter(e => e.gender === 'female');

        const assignments = [];

        if (storeType === '24h') {
            // Toko 24 Jam: 3 pagi, 3 siang, 2 malam (male only), 2 libur
            const nightMales = males.slice(0, 2);
            const remaining = shuffled.filter(e => !nightMales.includes(e));

            assignments.push(...nightMales.map(e => ({ id: e.id, shift: 'M' })));
            assignments.push(...remaining.slice(0, 3).map(e => ({ id: e.id, shift: 'P' })));
            assignments.push(...remaining.slice(3, 6).map(e => ({ id: e.id, shift: 'S' })));
            assignments.push(...remaining.slice(6, 8).map(e => ({ id: e.id, shift: 'O' })));

        } else {
            // Toko Reguler: 2 pagi, 2 siang, 1–2 libur
            assignments.push(...shuffled.slice(0, 2).map(e => ({ id: e.id, shift: 'P' })));
            assignments.push(...shuffled.slice(2, 4).map(e => ({ id: e.id, shift: 'S' })));
            assignments.push(...shuffled.slice(4, 6).map(e => ({ id: e.id, shift: 'O' })));
        }

        assignments.forEach(a => {
            schedule[a.id][day] = a.shift;
        });
    }

    return schedule;
}
