import React from 'react'
import type { LayoutRoute } from '../types/routes'
import ServiceCase from '../pages/ProfileUser/ServiceCase'
// Các layout này được export dưới dạng named export { LayoutName }
const AdminLayout = React.lazy(() =>
  import('../components/layout/AdminLayout').then((module) => ({
    default: module.AdminLayout,
  }))
)
const DeliveryStaffLayout = React.lazy(() =>
  import('../components/layout/DeliveryStaffLayout').then((module) => ({
    default: module.DeliveryStaffLayout,
  }))
)
const DoctorLayout = React.lazy(() =>
  import('../components/layout/DoctorLayout').then((module) => ({
    default: module.DoctorLayout,
  }))
)
const ManagerLayout = React.lazy(() =>
  import('../components/layout/ManagerLayout').then((module) => ({
    default: module.ManagerLayout,
  }))
)
const StaffLayout = React.lazy(() =>
  import('../components/layout/StaffLayout').then((module) => ({
    default: module.StaffLayout,
  }))
)
const SampleCollectorLayout = React.lazy(() =>
  import('../components/layout/SampleCollectorLayout').then((module) => ({
    default: module.SampleCollectorLayout,
  }))
)

// Các layout này được export dưới dạng export default
const LoginRegisterLayout = React.lazy(
  () => import('../components/layout/LoginRegisterLayout')
)
const MainLayout = React.lazy(() => import('../components/layout/MainLayout'))

// --- Các Trang (tải lười - lazy loading) ---
const Homepage = React.lazy(() => import('../components/Home/HomePage'))
const AdminHomePage = React.lazy(
  () => import('../pages/AdminHomePage/AdminHomePage')
)
const CreateFacilityAdmin = React.lazy(
  () => import('../pages/CreateFacilityAdmin/CreateFacilityAdmin')
)
const Blog = React.lazy(() => import('../pages/Blogs/Blog'))
const BlogDetail = React.lazy(() => import('../pages/Blogs/BlogDetail'))
const DeliveryStaffHomePage = React.lazy(
  () => import('../pages/DeliveryStaffHomePage/DeliveryStaffHomePage')
)
const DoctorHomePage = React.lazy(
  () => import('../pages/DoctorHomePage/DoctorHomePage')
)
const FacilityDetailAdmin = React.lazy(
  () => import('../pages/FacilityDetailAdmin/FacilityDetailAdmin')
)
const FacilityListAdmin = React.lazy(
  () => import('../pages/FacilityListAdmin/FacilityListAdmin')
)
const Login = React.lazy(() => import('../pages/Login/Login'))
const ManagerHomePage = React.lazy(
  () => import('../pages/ManagerHomePage/ManagerHomePage')
)
const CreateTesteeForm = React.lazy(
  () => import('../pages/ProfileUser/CreateTestTaker')
)
const ProfileUser = React.lazy(() => import('../pages/ProfileUser/ProfileUser'))
const TestTakerEditForm = React.lazy(
  () => import('../pages/ProfileUser/TestTakerEditForm')
)
const TestTakerList = React.lazy(
  () => import('../pages/ProfileUser/TestTakerList')
)
const Register = React.lazy(() => import('../pages/Register/Register'))
const CreateSlot = React.lazy(() => import('../pages/SlotAdmin/SlotAdmin'))
const SlotsFacilitiesList = React.lazy(
  () => import('../pages/SlotFacilitiesAdmin/SlotFacilitiesAdmin')
)
const StaffHomePage = React.lazy(
  () => import('../pages/StaffHomePage/StaffHomePage')
)
const PaymentPage = React.lazy(() => import('../pages/Payment/PaymentPage'))
const PaymentSuccessPage = React.lazy(
  () => import('../pages/Payment/PaymentSuccessPage')
)
const PaymentHistory = React.lazy(
  () => import('../pages/ProfileUser/PaymentHistory')
)
const PaymentDetail = React.lazy(
  () => import('../pages/ProfileUser/PaymentDetail')
)
const HomeRegisteration = React.lazy(
  () => import('../pages/HomeRegisteration/homeRegisteration')
)
const ServiceAtHome = React.lazy(
  () => import('../pages/ServiceAtHome/serviceAtHome')
)
const ManagerCreateAccount = React.lazy(
  () => import('../pages/ManagerCreateAccount/ManagerCreateAccount')
)
const SampleCollectorHomePage = React.lazy(
  () => import('../pages/SampleCollectorHomePage/SampleCollectorHomePage')
)
const SampleCollectorServiceCase = React.lazy(
  () => import('../pages/SampleCollectorServiceCase/SampleCollectorServiceCase')
)
const ServiceAtFacility = React.lazy(
  () => import('../pages/ServiceAtFacility/ServiceAtFacility')
)
const AdnFacilityRegisteration = React.lazy(
  () => import('../pages/AdnFacilityRegisteration/AdnFacilityRegisteration')
)
const DoctorServiceCaseWithoutResult = React.lazy(
  () =>
    import(
      '../pages/DoctorServiceCaseWithoutResult/DoctorServiceCaseWithoutResult'
    )
)
const AdminService = React.lazy(
  () => import('../pages/AdminService/AdminService')
)
const ServiceDetail = React.lazy(
  () => import('../components/Admin/AdminService/ServiceDetail')
)
const ManagerServiceCaseWithoutDoctor = React.lazy(
  () =>
    import(
      '../pages/ManagerServiceCaseWithoutDoctor/ManagerServiceCaseWithoutDoctor'
    )
)
const ManagerServiceCaseWithoutSampleCollector = React.lazy(
  () => import('../pages/Sample/Sample')
)
const TimeReturnList = React.lazy(
  () => import('../components/Admin/AdminTimeReturn/TimeReturnList')
)
const TimeReturnDetail = React.lazy(
  () => import('../components/Admin/AdminTimeReturn/TimeReturnDetail')
)
const SampleTypeList = React.lazy(
  () => import('../components/Admin/AdminSampleType/SampleTypeList')
)
const SampleTypeDetail = React.lazy(
  () => import('../components/Admin/AdminSampleType/SampleTypeDetail')
)
const SampleList = React.lazy(
  () => import('../components/Admin/AdminSample/SampleList')
)
const SampleDetail = React.lazy(
  () => import('../components/Admin/AdminSample/SampleDetail')
)

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
        path: '/payment',
        component: PaymentPage,
        role: ['Customer'],
      },
      {
        path: '/payment-success',
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
        path: '/service-case-customer',
        component: ServiceCase,
        role: ['Customer'],
      },
      // {
      //   path: '/service-case-customer/:id',
      //   component: PaymentDetail,
      //   role: ['Customer'],
      // },
      {
        path: '/home-registeration',
        component: HomeRegisteration,
      },
      {
        path: '/register-service-at-home/:id',
        component: ServiceAtHome,
      },
      {
        path: '/register-service-at-facility/:id',
        component: ServiceAtFacility,
      },
      {
        path: '/register-service',
        component: AdnFacilityRegisteration,
      },
    ],
  },
  {
    layout: AdminLayout,
    role: ['Admin'],
    data: [
      {
        path: '/admin',
        component: AdminHomePage,
      },
      {
        path: '/admin/slotAdmin',
        component: CreateSlot,
      },
      {
        path: '/admin/slotsFacilitiesAdmin',
        component: SlotsFacilitiesList,
      },
      {
        path: '/admin/createFacility',
        component: CreateFacilityAdmin,
      },
      {
        path: '/admin/facilities',
        component: FacilityListAdmin,
      },
      {
        path: '/admin/facility/:id',
        component: FacilityDetailAdmin,
      },
      {
        path: '/admin/services',
        component: AdminService,
      },
      {
        path: '/admin/service/:serviceId',
        component: ServiceDetail,
      },
      {
        path: '/admin/time-returns',
        component: TimeReturnList,
      },
      {
        path: '/admin/time-returns/:timeReturnId',
        component: TimeReturnDetail,
      },
      {
        path: '/admin/sample-types',
        component: SampleTypeList,
      },
      {
        path: '/admin/sample-types/:sampleTypeId',
        component: SampleTypeDetail,
      },
      {
        path: '/admin/samples',
        component: SampleList,
      },
      {
        path: '/admin/samples/:sampleId',
        component: SampleDetail,
      },
    ],
  },
  {
    layout: ManagerLayout,
    role: ['Manager'],
    data: [
      {
        path: '/manager',
        component: ManagerHomePage,
      },
      {
        path: '/manager/samples',
        component: ManagerServiceCaseWithoutSampleCollector,
      },
      {
        path: '/manager/service-cases-without-doctor',
        component: ManagerServiceCaseWithoutDoctor,
      },
      {
        path: '/manager/create-account',
        component: ManagerCreateAccount,
      },
    ],
  },
  {
    layout: DeliveryStaffLayout,
    data: [
      {
        path: '/delivery staff',
        component: DeliveryStaffHomePage,
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
    layout: SampleCollectorLayout,
    data: [
      {
        path: '/sample collector',
        component: SampleCollectorHomePage,
        // role: ['admin'],
      },
      {
        path: '/sample collector/service-cases',
        component: SampleCollectorServiceCase,
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
      {
        path: '/doctor/service-cases-without-results',
        component: DoctorServiceCaseWithoutResult,
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
