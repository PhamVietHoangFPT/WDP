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
        // role: ['admin'],
      },
      {
        path: '/admin/slotAdmin',
        component: CreateSlot,
        // role: ['admin'],
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
