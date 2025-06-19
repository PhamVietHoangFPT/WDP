import Homepage from '../components/Home/HomePage'
import { AdminLayout } from '../components/layout/AdminLayout'
import { DeliveryStaffLayout } from '../components/layout/DeliveryStaffLayout'
import { DoctorLayout } from '../components/layout/DoctorLayout'
import LoginRegisterLayout from '../components/layout/LoginRegisterLayout'
import MainLayout from '../components/layout/MainLayout'
import { ManagerLayout } from '../components/layout/ManagerLayout'
import { StaffLayout } from '../components/layout/StaffLayout'
import AdminHomePage from '../pages/AdminHomePage/AdminHomePage'
import CreateFacilityAdmin from '../pages/CreateFacilityAdmin/CreateFacilityAdmin'
import Blog from '../pages/Blogs/Blog'
import BlogDetail from '../pages/Blogs/BlogDetail'
import DeliveryStaffHomePage from '../pages/DeliveryStaffHomePage/DeliveryStaffHomePage'
import DoctorHomePage from '../pages/DoctorHomePage/DoctorHomePage'
import FacilityDetailAdmin from '../pages/FacilityDetailAdmin/FacilityDetailAdmin'
import FacilityListAdmin from '../pages/FacilityListAdmin/FacilityListAdmin'
import Login from '../pages/Login/Login'
import ManagerHomePage from '../pages/ManagerHomePage/ManagerHomePage'
import CreateTesteeForm from '../pages/ProfileUser/CreateTestTaker'
import ProfileUser from '../pages/ProfileUser/ProfileUser'
import TestTakerEditForm from '../pages/ProfileUser/TestTakerEditForm'
import TestTakerList from '../pages/ProfileUser/TestTakerList'
import Register from '../pages/Register/Register'
import CreateSlot from '../pages/SlotAdmin/SlotAdmin'
import SlotsFacilitiesList from '../pages/SlotFacilitiesAdmin/SlotFacilitiesAdmin'
import StaffHomePage from '../pages/StaffHomePage/StaffHomePage'
import type { LayoutRoute } from '../types/routes'
import BookingPage from '../pages/BookingPage/BookingPage'
import PaymentPage from '../pages/Payment/PaymentPage'
import PaymentSuccessPage from '../pages/Payment/PaymentSuccessPage'
import PaymentHistory from '../pages/ProfileUser/PaymentHistory'
import PaymentDetail from '../pages/ProfileUser/PaymentDetail'
import HomeRegisteration from '../pages/HomeRegisteration/homeRegisteration'
import ServiceAtHome from '../pages/ServiceAtHome/serviceAtHome'


const routes: LayoutRoute[] = [
  {
    layout: LoginRegisterLayout,
    data: [
      {
        path: '/login',
        component: Login,
      },
      {
        path: '/register',
        component: Register,
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
      {
        path: '/profile',
        component: ProfileUser,
        role: ['Customer'],
      },
      {
        path: '/create-testee',
        component: CreateTesteeForm,
        role: ['Customer'],
      },
      {
        path: '/list-testee',
        component: TestTakerList,
        role: ['Customer'],
      },
      {
        path: '/test-takers/edit/:id',
        component: TestTakerEditForm,
        role: ['Customer'],
      },
      {
        path: '/blogs',
        component: Blog,
      },
      {
        path: '/blogs/:id',
        component: BlogDetail,
      },
      {
        path: '/booking',
        component: BookingPage,
        role: ['Customer'],
      },
      {
        path: '/payment',
        component: PaymentPage,
        role: ['Customer'],
      },
      {
        path: '/',
        component: PaymentSuccessPage,
        role: ['Customer'],
      },
      {
        path: '/payment-history',
        component: PaymentHistory,
        role: ['Customer'],
      },
      {
        path: '/payment-history/:id',
        component: PaymentDetail,
        role: ['Customer'],
      },
      {
        path: '/home-registeration',
        component: HomeRegisteration,
      },
      {
        path: '/register-service-at-home/:id',
        component: ServiceAtHome,
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
      {
        path: '/admin/createFacility',
        component: CreateFacilityAdmin,
        role: ['Admin'],
      },
      {
        path: '/admin/facility',
        component: FacilityListAdmin,
        role: ['Admin'],
      },
      {
        path: '/admin/facility/:id',
        component: FacilityDetailAdmin,
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
        role: ['Staff'],
      },
    ],
  },
]

export default routes
