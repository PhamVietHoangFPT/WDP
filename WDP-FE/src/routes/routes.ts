import { lazy } from 'react'
import type { LayoutRoute } from '../types/routes'
import DeliveryStaffKitShipment from '../pages/DeliveryStaffHomePage/DeliveryStaffKitShipment'
import StaffServiceCase from '../pages/Staff/StaffServiceCase'
import StaffServiceCaseDetail from '../pages/Staff/StaffServiceCaseDetail'
import StaffPaymentHistory from '../pages/Staff/PaymentHistory'
import StaffPaymentHistoryDetail from '../pages/Staff/PaymentDetail'
import StaffServeServiceCase from '../pages/Staff/StaffServeServiceCase'
import ManagerServiceCaseWithoutDelivery from '../pages/ManagerServiceCaseWithoutDelivery/ManagerServiceCaseWithoutDelivery'
import DeliveryStaffServiceCase from '../pages/DeliveryStaffServiceCase/DeliveryStaffServiceCase'
import ReturnFail from '../pages/Staff/ReturnFail'
import SampleCollectorDoneServiceCase from '../pages/SampleCollectorDoneServiceCase/SampleCollectorDoneServiceCase'
import { DoctorManagerLayout } from '../components/layout/DoctorManagerLayout'
import DoctorManagerHomePage from '../pages/DoctorManagerHomePage/DoctorManagerHomePage'

const StaffAdministrationRegister = lazy(
  () => import('../pages/Staff/StaffAdministrationRegister')
)

const StaffManageTestTaker = lazy(
  () => import('../pages/Staff/StaffManageTestTaker')
)

const StaffGetServiceCaseByCustomer = lazy(
  () =>
    import(
      '../pages/StaffGetServiceCaseByCustomer/StaffGetServiceCaseByCustomer'
    )
)
const AdminManagerList = lazy(
  () => import('../pages/AdminManagerList/AdminManagerList')
)
const FacilitiesWithManager = lazy(
  () => import('../pages/FacilitiesWithManager/FacilitiesWithManager')
)
const AdminstrativeServices = lazy(
  () => import('../components/AdminstrativeServices/AdminstrativeServices')
)

// Các layout này được export dưới dạng named export { LayoutName }
const AdminLayout = lazy(() =>
  import('../components/layout/AdminLayout').then((module) => ({
    default: module.AdminLayout,
  }))
)
const DeliveryStaffLayout = lazy(() =>
  import('../components/layout/DeliveryStaffLayout').then((module) => ({
    default: module.DeliveryStaffLayout,
  }))
)
const DoctorLayout = lazy(() =>
  import('../components/layout/DoctorLayout').then((module) => ({
    default: module.DoctorLayout,
  }))
)
const CertifierLayout = lazy(() =>
  import('../components/layout/CertifierLayout').then((module) => ({
    default: module.CertifierLayout,
  }))
)
const ManagerLayout = lazy(() =>
  import('../components/layout/ManagerLayout').then((module) => ({
    default: module.ManagerLayout,
  }))
)
const StaffLayout = lazy(() =>
  import('../components/layout/StaffLayout').then((module) => ({
    default: module.StaffLayout,
  }))
)
const SampleCollectorLayout = lazy(() =>
  import('../components/layout/SampleCollectorLayout').then((module) => ({
    default: module.SampleCollectorLayout,
  }))
)

// Các layout này được export dưới dạng export default
const LoginRegisterLayout = lazy(
  () => import('../components/layout/LoginRegisterLayout')
)
const MainLayout = lazy(() => import('../components/layout/MainLayout'))

// --- Các Trang (tải lười - lazy loading) ---
const Homepage = lazy(() => import('../components/Home/HomePage'))
const AdminHomePage = lazy(() => import('../pages/AdminHomePage/AdminHomePage'))
const CreateFacilityAdmin = lazy(
  () => import('../pages/CreateFacilityAdmin/CreateFacilityAdmin')
)
const Blog = lazy(() => import('../pages/Blogs/Blog'))
const BlogDetail = lazy(() => import('../pages/Blogs/BlogDetail'))
const DeliveryStaffHomePage = lazy(
  () => import('../pages/DeliveryStaffHomePage/DeliveryStaffHomePage')
)
const DoctorHomePage = lazy(
  () => import('../pages/DoctorHomePage/DoctorHomePage')
)
const CertifierHomePage = lazy(
  () => import('../pages/CertifierHomePage/CertifierHomePage')
)
const DocumentFormAccept = lazy(
  () => import('../components/Certifier/DocumentFormAccept')
)
const DoneDocumentForm = lazy(
  () => import('../components/Certifier/DoneDocumentForm')
)
const ServiceCaseNeedAcceptAdn = lazy(
  () => import('../pages/CertifierManage/ServiceCaseNeedAcceptAdn')
)
const ServiceHasAcceptAdn = lazy(
  () => import('../pages/CertifierManage/ServiceHasAcceptAdn')
)
const DoctorUpdateConditionPage = lazy(
  () => import('../pages/DoctorUpdateCondition/doctorUpdateCondition')
)
const ServiceCaseAlreadyHasAdn = lazy(
  () =>
    import('../pages/DoctorServiceCaseWithoutResult/ServiceCaseAlreadyHasAdn')
)
const ServiceCaseNeedCreateAdn = lazy(
  () =>
    import('../pages/DoctorServiceCaseWithoutResult/ServiceCaseNeedCreateAdn')
)
const DocumentForm = lazy(() => import('../components/Doctor/DocumentForm'))
const FacilityDetailAdmin = lazy(
  () => import('../pages/FacilityDetailAdmin/FacilityDetailAdmin')
)
const FacilityListAdmin = lazy(
  () => import('../pages/FacilityListAdmin/FacilityListAdmin')
)
const Login = lazy(() => import('../pages/Login/Login'))
const ManagerHomePage = lazy(
  () => import('../pages/ManagerHomePage/ManagerHomePage')
)
const CreateTesteeForm = lazy(
  () => import('../pages/ProfileUser/CreateTestTaker')
)
const ProfileUser = lazy(() => import('../pages/ProfileUser/ProfileUser'))
const TestTakerEditForm = lazy(
  () => import('../pages/ProfileUser/TestTakerEditForm')
)
const TestTakerList = lazy(() => import('../pages/ProfileUser/TestTakerList'))
const Register = lazy(() => import('../pages/Register/Register'))
const CreateSlot = lazy(() => import('../pages/SlotAdmin/SlotAdmin'))
const SlotsFacilitiesList = lazy(
  () => import('../pages/SlotFacilitiesAdmin/SlotFacilitiesAdmin')
)
const StaffHomePage = lazy(() => import('../pages/StaffHomePage/StaffHomePage'))
const PaymentPage = lazy(() => import('../pages/Payment/PaymentPage'))
const PaymentSuccessPage = lazy(
  () => import('../pages/Payment/PaymentSuccessPage')
)
const PaymentConditionSuccessPage = lazy(
  () => import('../pages/Payment/PaymentConditionSuccessPage')
)
const PaymentHistory = lazy(() => import('../pages/ProfileUser/PaymentHistory'))
const PaymentDetail = lazy(() => import('../pages/ProfileUser/PaymentDetail'))
const HomeRegisteration = lazy(
  () => import('../pages/HomeRegisteration/homeRegisteration')
)
const ServiceAtHome = lazy(() => import('../pages/ServiceAtHome/serviceAtHome'))
const ManagerCreateAccount = lazy(
  () => import('../pages/ManagerCreateAccount/ManagerCreateAccount')
)
const SampleCollectorHomePage = lazy(
  () => import('../pages/SampleCollectorHomePage/SampleCollectorHomePage')
)
const SampleCollectorServiceCase = lazy(
  () => import('../pages/SampleCollectorServiceCase/SampleCollectorServiceCase')
)
const ServiceAtFacility = lazy(
  () => import('../pages/ServiceAtFacility/ServiceAtFacility')
)
const AdnFacilityRegisteration = lazy(
  () => import('../pages/AdnFacilityRegisteration/AdnFacilityRegisteration')
)
const DoctorServiceCaseWithoutResult = lazy(
  () =>
    import(
      '../pages/DoctorServiceCaseWithoutResult/DoctorServiceCaseWithoutResult'
    )
)
const AdminService = lazy(() => import('../pages/AdminService/AdminService'))
const ServiceDetail = lazy(
  () => import('../components/Admin/AdminService/ServiceDetail')
)
const ManagerServiceCaseWithoutDoctor = lazy(
  () =>
    import(
      '../pages/ManagerServiceCaseWithoutDoctor/ManagerServiceCaseWithoutDoctor'
    )
)

const ManagerServiceCaseWithoutSampleCollector = lazy(
  () => import('../pages/Sample/Sample')
)
const ManagerKitShipmentPage = lazy(
  () => import('../pages/ManagerKitShipment/managerKitShipmentPage')
)
const TimeReturnList = lazy(
  () => import('../components/Admin/AdminTimeReturn/TimeReturnList')
)
const TimeReturnDetail = lazy(
  () => import('../components/Admin/AdminTimeReturn/TimeReturnDetail')
)
const SampleList = lazy(
  () => import('../components/Admin/AdminSample/SampleList')
)
const SampleDetail = lazy(
  () => import('../components/Admin/AdminSample/SampleDetail')
)

const SamplingKitInventoryList = lazy(
  () => import('../components/Staff/SamplingKitInventoryList')
)

const SamplingKitInventoryDetail = lazy(
  () => import('../components/Staff/SamplingKitInventoryDetail')
)

const ServiceCase = lazy(() => import('../pages/ProfileUser/ServiceCase'))

const ServiceCaseDetail = lazy(
  () => import('../pages/ProfileUser/ServiceCaseDetail')
)

const ProfileLayout = lazy(() => import('../components/layout/ProfileLayout'))

const ManageAddress = lazy(() => import('../pages/ProfileUser/ManageAddress'))

const UserResult = lazy(() => import('../pages/ProfileUser/UserResult'))
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
    layout: ProfileLayout,
    role: ['Customer'],
    data: [
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
      {
        path: '/service-case-customer/:id',
        component: ServiceCaseDetail,
        role: ['Customer'],
      },
      {
        path: '/manage-address',
        component: ManageAddress,
        role: ['Customer'],
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
      },
      {
        path: '/payment-success',
        component: PaymentSuccessPage,
      },
      {
        path: '/payment-success-condition',
        component: PaymentConditionSuccessPage,
      },
      {
        path: '/home-registeration',
        component: HomeRegisteration,
      },
      {
        path: '/adminstrative-services',
        component: AdminstrativeServices,
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
      {
        path: '/result/:resultId',
        component: UserResult,
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
        path: '/admin/samples',
        component: SampleList,
      },
      {
        path: '/admin/samples/:sampleId',
        component: SampleDetail,
      },
      {
        path: '/admin/managers',
        component: AdminManagerList,
      },
      {
        path: '/admin/facilitiesWithManager',
        component: FacilitiesWithManager,
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
      {
        path: 'manager/kit-shipment-without-delivery-staff',
        component: ManagerKitShipmentPage,
      },
      {
        path: 'manager/service-cases-without-delivery-staff',
        component: ManagerServiceCaseWithoutDelivery,
      },
    ],
  },

  {
    layout: DoctorManagerLayout,
    role: ['Doctor Manager'],
    data: [
      {
        path: '/doctor-manager',
        component: DoctorManagerHomePage,
      },
      {
        path: '/doctor-manager/samples',
        component: ManagerServiceCaseWithoutSampleCollector,
      },
      {
        path: '/doctor-manager/service-cases-without-doctor',
        component: ManagerServiceCaseWithoutDoctor,
      },
    ],
  },

  {
    layout: DeliveryStaffLayout,
    data: [
      {
        path: '/delivery-staff',
        component: DeliveryStaffHomePage,
        // role: ['admin'],
      },
      {
        path: '/delivery-staff/kit-shipment',
        component: DeliveryStaffKitShipment,
        // role: ['admin'],
      },
      {
        path: '/delivery-staff/service-case',
        component: DeliveryStaffServiceCase,
        // role: ['admin'],
      },
    ],
  },
  {
    layout: SampleCollectorLayout,
    role: ['Sample Collector'],
    data: [
      {
        path: '/sample-collector',
        component: SampleCollectorHomePage,
        // role: ['admin'],
      },
      {
        path: '/sample-collector/service-cases',
        component: SampleCollectorServiceCase,
        // role: ['admin'],
      },
      {
        path: '/sample-collector/service-cases-done',
        component: SampleCollectorDoneServiceCase,
        // role: ['admin'],
      },
    ],
  },
  {
    layout: CertifierLayout,
    role: ['Certifier'],
    data: [
      {
        path: '/certifier',
        component: CertifierHomePage,
        // role: ['admin'],
      },
      {
        path: '/certifier/service-cases-without-adn-documentation-false',
        component: ServiceCaseNeedAcceptAdn,
        // role: ['admin'],
      },
      {
        path: '/certifier/adn-result/:serviceCaseId',
        component: DocumentFormAccept,
        // role: ['admin'],
      },
      {
        path: '/certifier/service-cases-without-adn-documentation-true',
        component: ServiceHasAcceptAdn,
        // role: ['admin'],
      },
      {
        path: '/certifier/view-adn-documentation/:serviceCaseId',
        component: DoneDocumentForm,
        // role: ['admin'],
      },
    ],
  },
  {
    layout: DoctorLayout,
    role: ['Doctor'],
    data: [
      {
        path: '/doctor',
        component: DoctorHomePage,
      },
      {
        path: '/doctor/service-cases-without-results',
        component: DoctorServiceCaseWithoutResult,
      },
      {
        path: '/doctor/service-cases-condition',
        component: DoctorUpdateConditionPage,
      },
      {
        path: '/doctor/service-cases-without-adn-documentation-true',
        component: ServiceCaseAlreadyHasAdn,
      },
      {
        path: '/doctor/service-cases-without-adn-documentation-false',
        component: ServiceCaseNeedCreateAdn,
      },
      {
        path: '/doctor/create-adn-document/:serviceCaseId',
        component: DocumentForm,
      },
    ],
  },
  {
    layout: StaffLayout,
    role: ['Staff'],
    data: [
      {
        path: '/staff',
        component: StaffHomePage,
      },
      {
        path: '/staff/sampling-kit-inventory',
        component: SamplingKitInventoryList,
      },
      {
        path: '/staff/sampling-kit-inventory/:samplingKitInventoryId',
        component: SamplingKitInventoryDetail,
      },
      {
        path: '/staff/update-service-case-status-for-customer',
        component: StaffGetServiceCaseByCustomer,
      },
      {
        path: '/staff/manage-test-taker',
        component: StaffManageTestTaker,
      },
      {
        path: '/staff/register-for-administration',
        component: StaffAdministrationRegister,
      },
      {
        path: '/staff/service-case-customer',
        component: StaffServiceCase,
      },
      {
        path: '/staff/service-case-customer/:id',
        component: StaffServiceCaseDetail,
      },
      {
        path: '/staff/payment-history',
        component: StaffPaymentHistory,
      },
      {
        path: '/staff/payment-history/:id',
        component: StaffPaymentHistoryDetail,
      },
      {
        path: '/staff/test-takers/served',
        component: StaffServeServiceCase,
      },
      {
        path: '/staff/return-fail',
        component: ReturnFail,
      },
    ],
  },
]

export default routes
