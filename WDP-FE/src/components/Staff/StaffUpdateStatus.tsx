import Cookies from 'js-cookie'
import { useGetServiceCasesByCustomerQuery } from '../../features/staff/staffAPI'

export default function StaffUpdateStatus() {
  const userData = Cookies.get('userData')
  const parsedUserData = userData
    ? JSON.parse(decodeURIComponent(userData))
    : {}
  const facilityId = parsedUserData?.facility?._id || ''
  const email = 'juchado@gmail.com'
  const { data, error, isLoading } = useGetServiceCasesByCustomerQuery({
    facilityId,
    email,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Cập nhật tình trạng</h2>
      <ul>
        {/* {data?.map((serviceCase) => (
          <li key={serviceCase.id}>{serviceCase.name}</li>
        ))} */}
      </ul>
    </div>
  )
}
