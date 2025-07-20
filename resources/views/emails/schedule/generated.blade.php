 @php
     \Carbon\Carbon::setLocale('id');
     $bulanNama = \Carbon\Carbon::createFromDate($year, $month, 1)->translatedFormat('F');
 @endphp
 <!DOCTYPE html>
 <html lang="id">

 <head>
     <meta charset="UTF-8" />
     <title>Jadwal Shift Bulan {{ $bulanNama ?? '...' }}</title>
     <style>
         body {
             font-family: Arial, sans-serif;
             color: #1f2937;
             /* gray-800 */
             background-color: #fff;
             margin: 0;
             padding: 20px;
         }

         h2 {
             font-size: 18px;
             font-weight: 700;
             margin-bottom: 12px;
         }

         p {
             font-size: 14px;
             margin-bottom: 16px;
         }

         .created-by {
             font-style: italic;
             font-size: 13px;
             color: #4b5563;
         }

         table {
             border-collapse: collapse;
             width: 100%;
             max-width: 600px;
         }

         th,
         td {
             border: 1px solid #d1d5db;
             /* gray-300 */
             padding: 8px 10px;
             text-align: left;
             font-size: 14px;
         }

         th {
             background-color: #f3f4f6;
             /* gray-100 */
             font-weight: 600;
         }

         .shift-p {
             background-color: #d1fae5;
             /* bg-green-100 */
             color: #065f46;
             /* text-green-800 */
             font-weight: 600;
         }

         .shift-s {
             background-color: #fef3c7;
             /* bg-yellow-100 */
             color: #78350f;
             /* text-yellow-800 */
             font-weight: 600;
         }

         .shift-m {
             background-color: #fee2e2;
             /* bg-red-100 */
             color: #991b1b;
             /* text-red-800 */
             font-weight: 600;
         }

         .shift-libur {
             color: #9ca3af;
             /* gray-400 */
             font-style: italic;
         }
     </style>
 </head>

 <body>
     <h2>Jadwal Shift Bulan {{ ucfirst($bulanNama) }} {{ $year }}</h2>
     <p>Halo <strong>{{ $employee->name }}</strong>,</p>
     <p>Berikut adalah jadwal shift Anda untuk bulan ini. Dibuat oleh <strong>{{ $createdBy }}</strong>.</p>

     <table>
         <thead>
             <tr>
                 <th>Tanggal</th>
                 <th>Shift</th>
                 <th>Jam Masuk</th>
                 <th>Jam Selesai</th>
             </tr>
         </thead>
         <tbody>
             @foreach ($schedules as $schedule)
                 @php
                     // Tentukan class shift berdasarkan kode shift
                     $shiftCode = strtolower($schedule->shift->shift_code ?? '');
                     $shiftClass = match ($shiftCode) {
                         'p' => 'shift-p',
                         's' => 'shift-s',
                         'm' => 'shift-m',
                         default => 'shift-libur',
                     };

                     // Format waktu masuk dan selesai agar hanya HH:mm
                     $startTime = $schedule->shift->start_time ?? '-';
                     $endTime = $schedule->shift->end_time ?? '-';

                     if ($startTime !== '-') {
                         $startTime = \Carbon\Carbon::parse($startTime)->format('H:i');
                     }
                     if ($endTime !== '-') {
                         $endTime = \Carbon\Carbon::parse($endTime)->format('H:i');
                     }
                 @endphp
                 <tr>
                     <td>{{ \Carbon\Carbon::parse($schedule->schedule_date)->translatedFormat('j F Y') }}</td>
                     <td class="{{ $shiftClass }}">{{ $schedule->shift->shift_name ?? 'Libur' }}</td>
                     <td>{{ $startTime }}</td>
                     <td>{{ $endTime }}</td>
                 </tr>
             @endforeach
         </tbody>
     </table>

     <p>Terima kasih.</p>
 </body>

 </html>
