# CareLink Hospital Management System

Full-stack Hospital Management System (HMS) for Sri Lanka built with the MERN stack.

## Features

- Role-based dashboards (Admin, Doctor, Nurse, Receptionist, Lab, Pharmacy, Billing, Patient)
- Patient registration with auto-generated QR codes
- Appointment booking with queue management
- Real-time queue TV display via Socket.io
- Electronic Medical Records (EMR)
- Laboratory module with abnormal value flagging
- Pharmacy inventory and dispensing
- Ward and bed management with visual bed map
- Billing with PayHere online payments
- WhatsApp and email notifications (Twilio + Nodemailer)
- Admin reports and analytics with charts

## Login Credentials (after seeding)

| Role          | Email                    | Password       |
|---------------|--------------------------|----------------|
| Admin         | admin@hospital.lk        | Admin@123      |
| Doctor        | dr.perera@hospital.lk    | Doctor@123     |
| Nurse         | nurse@hospital.lk        | Nurse@123      |
| Receptionist  | reception@hospital.lk    | Reception@123  |
| Lab Tech      | lab@hospital.lk          | Lab@123        |
| Pharmacist    | pharmacy@hospital.lk     | Pharmacy@123   |
| Billing       | billing@hospital.lk      | Billing@123    |
| Patient       | (self-register)          | (own password) |

## Queue TV Display

Open in a browser on any TV/monitor:

http://localhost:5173/queue/display

No login needed. Updates in real-time.

## Setup

1. `cd server && npm install`
2. `cd ../client && npm install`
3. Fill in `server/.env` (MongoDB and Cloudinary credentials included)
4. `cd server && node seeder.js`
5. Terminal 1: `cd server && npm run dev`
6. Terminal 2: `cd client && npm run dev`
7. Open: http://localhost:5173

## PayHere Testing

Use ngrok for notify_url: `ngrok http 5001`

Test cards: Visa 4916217501611292 | MasterCard 5307732125531191

## Twilio WhatsApp Sandbox

Send "join bag-tent" to +1 415 523 8886 from WhatsApp to activate sandbox.

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Socket.io, Cloudinary, PayHere, Twilio, Nodemailer

**Frontend:** React 18, Vite, Tailwind CSS, Redux Toolkit, React Router, Recharts, Socket.io-client
