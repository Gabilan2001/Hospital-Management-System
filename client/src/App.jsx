import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';

import Login from './pages/Login';
import NotFound from './pages/NotFound';
import QueueDisplay from './pages/queue/QueueDisplay';

import PatientLayout from './components/layout/PatientLayout';
import DoctorLayout from './components/layout/DoctorLayout';
import NurseLayout from './components/layout/NurseLayout';
import ReceptionLayout from './components/layout/ReceptionLayout';
import LabLayout from './components/layout/LabLayout';
import PharmacyLayout from './components/layout/PharmacyLayout';
import BillingLayout from './components/layout/BillingLayout';
import AdminLayout from './components/layout/AdminLayout';

import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MyMedicalRecords from './pages/patient/MyMedicalRecords';
import MyPrescriptions from './pages/patient/MyPrescriptions';
import MyLabResults from './pages/patient/MyLabResults';
import MyBills from './pages/patient/MyBills';
import PayBill from './pages/patient/PayBill';
import PatientProfile from './pages/patient/PatientProfile';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import PatientDetail from './pages/doctor/PatientDetail';
import WritePrescription from './pages/doctor/WritePrescription';
import OrderLabTest from './pages/doctor/OrderLabTest';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorProfile from './pages/doctor/DoctorProfile';

import NurseDashboard from './pages/nurse/NurseDashboard';
import WardPatients from './pages/nurse/WardPatients';
import RecordVitals from './pages/nurse/RecordVitals';
import NurseProfile from './pages/nurse/NurseProfile';

import ReceptionDashboard from './pages/receptionist/ReceptionDashboard';
import RegisterPatient from './pages/receptionist/RegisterPatient';
import ManageAppointments from './pages/receptionist/ManageAppointments';
import QueueManagement from './pages/receptionist/QueueManagement';
import ReceptionProfile from './pages/receptionist/ReceptionProfile';

import LabDashboard from './pages/lab/LabDashboard';
import LabTestOrders from './pages/lab/LabTestOrders';
import UploadResult from './pages/lab/UploadResult';
import LabHistory from './pages/lab/LabHistory';

import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PrescriptionQueue from './pages/pharmacy/PrescriptionQueue';
import DispenseMedicine from './pages/pharmacy/DispenseMedicine';
import MedicineInventory from './pages/pharmacy/MedicineInventory';
import PharmacyBilling from './pages/pharmacy/PharmacyBilling';

import BillingDashboard from './pages/billing/BillingDashboard';
import GenerateInvoice from './pages/billing/GenerateInvoice';
import AllInvoices from './pages/billing/AllInvoices';
import PaymentHistory from './pages/billing/PaymentHistory';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import { AddDoctor, EditDoctor } from './pages/admin/DoctorForm';
import ManageStaff from './pages/admin/ManageStaff';
import ManagePatients from './pages/admin/ManagePatients';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageWards from './pages/admin/ManageWards';
import ManageBeds from './pages/admin/ManageBeds';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AuthBootstrap from './components/common/AuthBootstrap';

const App = () => (
  <>
    <AuthBootstrap />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/queue/display" element={<QueueDisplay />} />

      <Route element={<PrivateRoute />}>
        <Route element={<RoleRoute allowedRoles={['patient']} />}>
          <Route element={<PatientLayout />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/book" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<MyAppointments />} />
            <Route path="/patient/records" element={<MyMedicalRecords />} />
            <Route path="/patient/prescriptions" element={<MyPrescriptions />} />
            <Route path="/patient/lab-results" element={<MyLabResults />} />
            <Route path="/patient/bills" element={<MyBills />} />
            <Route path="/patient/pay/:invoiceId" element={<PayBill />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['doctor']} />}>
          <Route element={<DoctorLayout />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/patient/:id" element={<PatientDetail />} />
            <Route path="/doctor/prescription" element={<WritePrescription />} />
            <Route path="/doctor/lab-order" element={<OrderLabTest />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['nurse']} />}>
          <Route element={<NurseLayout />}>
            <Route path="/nurse" element={<NurseDashboard />} />
            <Route path="/nurse/ward-patients" element={<WardPatients />} />
            <Route path="/nurse/vitals" element={<RecordVitals />} />
            <Route path="/nurse/profile" element={<NurseProfile />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['receptionist']} />}>
          <Route element={<ReceptionLayout />}>
            <Route path="/reception" element={<ReceptionDashboard />} />
            <Route path="/reception/register" element={<RegisterPatient />} />
            <Route path="/reception/appointments" element={<ManageAppointments />} />
            <Route path="/reception/appointments/book" element={<Navigate to="/reception/appointments" replace />} />
            <Route path="/reception/queue" element={<QueueManagement />} />
            <Route path="/reception/profile" element={<ReceptionProfile />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['lab_technician']} />}>
          <Route element={<LabLayout />}>
            <Route path="/lab" element={<LabDashboard />} />
            <Route path="/lab/orders" element={<LabTestOrders />} />
            <Route path="/lab/upload" element={<UploadResult />} />
            <Route path="/lab/history" element={<LabHistory />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['pharmacist']} />}>
          <Route element={<PharmacyLayout />}>
            <Route path="/pharmacy" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/queue" element={<PrescriptionQueue />} />
            <Route path="/pharmacy/dispense" element={<DispenseMedicine />} />
            <Route path="/pharmacy/inventory" element={<MedicineInventory />} />
            <Route path="/pharmacy/billing" element={<PharmacyBilling />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['billing']} />}>
          <Route element={<BillingLayout />}>
            <Route path="/billing" element={<BillingDashboard />} />
            <Route path="/billing/generate" element={<GenerateInvoice />} />
            <Route path="/billing/invoices" element={<AllInvoices />} />
            <Route path="/billing/payments" element={<PaymentHistory />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<ManageDoctors />} />
            <Route path="/admin/doctors/add" element={<AddDoctor />} />
            <Route path="/admin/doctors/edit/:id" element={<EditDoctor />} />
            <Route path="/admin/staff" element={<ManageStaff />} />
            <Route path="/admin/patients" element={<ManagePatients />} />
            <Route path="/admin/departments" element={<ManageDepartments />} />
            <Route path="/admin/wards" element={<ManageWards />} />
            <Route path="/admin/beds" element={<ManageBeds />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;
