// import LoginRegisterLayout from '../components/layout/LoginRegisterLayout'
// import MainLayout from '../components/layout/MainLayout'
// import { ManagerLayout } from '../components/layout/ManagerLayout'
// import StaffLayout from '../components/layout/StaffLayout'
// import ManagerCustomerList from '../Pages/Home/Customer/CustomerListManager'
// import Homepage from '../Pages/Home/Home'
// import ManagerVaccineList from '../Pages/Home/VaccineManager/VaccineListManager'
// import Login from '../Pages/Login/Login'
// import ManagerHomePage from '../Pages/Manager/ManagerHomePage'
// import ProfilePage from '../Pages/Profile/ProfilePage'
// import Register from '../Pages/Register/Register'
// import StaffHomePage from '../Pages/Staff/StaffDefault/StaffHomePage'
// import { LayoutRoute } from '../types/routes'
// import AllVaccinesCustomer from '../Pages/Vaccines/AllVaccinesCustomer'
// import VaccineDetail from '../Pages/Home/VaccineManager/VaccineDetailManager'
// import CreateVaccine from '../Pages/Home/VaccineManager/CreateVaccineManager'
// import DoctorHomePage from '../Pages/Doctor/DoctorHomePage'
// import VaccineDetailsCustomer from '../Pages/Vaccines/VaccineDetailsCustomer'
// import VaccineRegistrationCustomer from '../Pages/Vaccines/VaccineRegistrationCustomer'
// import ForceUpdateAccount from '../Pages/Register/ForgeUpdateRegister'
// import ChildrenPage from '../Pages/Staff/ChildrenProfile/Children'
// import CustomerDetail from '../Pages/Staff/CustomerProfile/CustomerDetail'
// import VaccinatorHomePage from '../Pages/Vaccinator/VaccinatorHomePage'
// import StaffVaccination from '../Pages/Staff/Vaccination/StaffVaccination'
// import PaymentLayout from '../components/layout/PaymentLayout'
// import PaymentSuccess from '../Pages/Payment/PaymentSuccess'
// import PaymentFail from '../Pages/Payment/PaymentFail'
// import ManagerFacilityList from '../Pages/Home/Facility/FacilityListManager'
// import ManagerFacilityDetail from '../Pages/Home/Facility/FacilityDetailManager'
// import ManagerFacilityInventory from '../Pages/Home/Facility/FacilityInventoryManager'
// import ManagerFacilityCreate from '../Pages/Home/Facility/FacilityCreateManager'
// import ManagerFacilityImport from '../Pages/Home/Facility/FacilityImportManager'
// import VaccinationsHistory from '../Pages/Vaccinations/VaccinationsHistory'
// import BlogDetails from '../Pages/Blogs/BlogDetails'
// import RegiterVaccinationStaff from '../Pages/Staff/RegisterCustomer/registerVaccination'
// import RegisterCustomer from '../Pages/Staff/RegisterCustomer/registerCustomer'
// import DoctorLayout from '../components/layout/DoctorLayout'
// import ManagerPackageList from '../Pages/Home/Package/PackageListManager'
// import ManagerPackageDetail from '../Pages/Home/Package/PackageDetailManager'
// import ManagerPackageCreate from '../Pages/Home/Package/CreatePackageManager'
// import BlogDetail from '../Pages/Home/BlogManager/BlogDetailManager'
// import CreateBlog from '../Pages/Home/BlogManager/CreateBlogManager'
// import ManagerBlogList from '../Pages/Home/BlogManager/BlogListManager'
// import UpdatePassword from '../Pages/Profile/UpdatePassword'
// import UpdateEmail from '../Pages/Profile/UpdateEmail'
// import VaccinationSchedule from '../Pages/Staff/Schedule/VaccinationSchedule'
// import PersonnelListManager from '../Pages/Home/PersonnelManager/PersonnelListManager'
// import PersonnelDetailManager from '../Pages/Home/PersonnelManager/PersonnelDetailManager'
// import CreatePersonnelManager from '../Pages/Home/PersonnelManager/PersonnelCreateManager'
// import VaccinationsHistoryDetail from '../Pages/Vaccinations/VaccinationsHistoryDetail'
// import Blog from '../Pages/Blogs/Blog'
// import ForgotPassword from '../Pages/Profile/ForgotPassword'

import Homepage from '../components/Home/HomePage'
import { AdminLayout } from '../components/layout/AdminLayout'
import { DeliveryStaffLayout } from '../components/layout/DeliveryStaffLayout'
import { DoctorLayout } from '../components/layout/DoctorLayout'
import LoginRegisterLayout from '../components/layout/LoginRegisterLayout'
import MainLayout from '../components/layout/MainLayout'
import { ManagerLayout } from '../components/layout/ManagerLayout'
import { StaffLayout } from '../components/layout/StaffLayout'
import AdminHomePage from '../pages/AdminHomePage/AdminHomePage'
import DeliveryStaffHomePage from '../pages/DeliveryStaffHomePage/DeliveryStaffHomePage'
import DoctorHomePage from '../pages/DoctorHomePage/DoctorHomePage'
import Login from '../pages/Login/Login'
import ManagerHomePage from '../pages/ManagerHomePage/ManagerHomePage'
import CreateSlot from '../pages/SlotAdmin/SlotAdmin'
import SlotsFacilitiesList from '../pages/SlotFacilitiesAdmin/SlotFacilitiesAdmin'
import StaffHomePage from '../pages/StaffHomePage/StaffHomePage'
import type { LayoutRoute } from '../types/routes'

const routes: LayoutRoute[] = [
  {
    layout: LoginRegisterLayout,
    data: [
      {
        path: '/login',
        component: Login,
      },
    ],
  },
  {
    layout: MainLayout,
    data: [
      {
        path: '/',
        component: Homepage,
        exact: true,
      },
    ],
  },
  {
    layout: AdminLayout,
    data: [
      {
        path: '/admin',
        component: AdminHomePage,
        role: ['Admin'],
      },
      {
        path: '/admin/slotAdmin',
        component: CreateSlot,
        role: ['Admin'],
      },
      {
        path: '/admin/slotsFacilitiesAdmin',
        component: SlotsFacilitiesList,
        role: ['Admin'],
      },
    ],
  },
  {
    layout: ManagerLayout,
    data: [
      {
        path: '/manager',
        component: ManagerHomePage,
        // role: ['admin'],
      },
    ],
  },
  {
    layout: DeliveryStaffLayout,
    data: [
      {
        path: '/delivery',
        component: DeliveryStaffHomePage,
        // role: ['admin'],
      },
    ],
  },
  {
    layout: DoctorLayout,
    data: [
      {
        path: '/doctor',
        component: DoctorHomePage,
        // role: ['admin'],
      },
    ],
  },
  {
    layout: StaffLayout,
    data: [
      {
        path: '/staff',
        component: StaffHomePage,
        // role: ['admin'],
      },
    ],
  },
]

export default routes
