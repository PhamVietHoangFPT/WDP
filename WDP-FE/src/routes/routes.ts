import Homepage from '../components/Home/HomePage'
import { AdminLayout } from '../components/layout/AdminLayout'
import { DeliveryStaffLayout } from '../components/layout/DeliveryStaffLayout'
import { DoctorLayout } from '../components/layout/DoctorLayout'
import LoginRegisterLayout from '../components/layout/LoginRegisterLayout'
import MainLayout from '../components/layout/MainLayout'
import { ManagerLayout } from '../components/layout/ManagerLayout'
import { StaffLayout } from '../components/layout/StaffLayout'
import AdminHomePage from '../pages/AdminHomePage/AdminHomePage'
import Blog from '../pages/Blogs/Blog'
import BlogDetail from '../pages/Blogs/BlogDetail'
import DeliveryStaffHomePage from '../pages/DeliveryStaffHomePage/DeliveryStaffHomePage'
import DoctorHomePage from '../pages/DoctorHomePage/DoctorHomePage'
import Login from '../pages/Login/Login'
import ManagerHomePage from '../pages/ManagerHomePage/ManagerHomePage'
import CreateTesteeForm from '../pages/ProfileUser/CreateTestTaker'
import ProfileUser from '../pages/ProfileUser/ProfileUser'
import TestTakerEditForm from '../pages/ProfileUser/TestTakerEditForm'
import TestTakerList from '../pages/ProfileUser/TestTakerList'
import Register from '../pages/Register/Register'
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
