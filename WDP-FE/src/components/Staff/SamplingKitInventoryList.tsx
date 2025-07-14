import { useGetAllSamplingKitInventoriesQuery } from '../../features/samplingKitInventory/samplingKitInventoryAPI'
import Cookies from 'js-cookie'
import { useSearchParams } from 'react-router-dom'
import { useGetSamplesQuery } from '../../features/admin/sampleAPI'
export default function SamplingKitInventoryList() {
  const [searchParams] = useSearchParams()
  const pageNumber = Number(searchParams.get('pageNumber')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 10
  const userData = Cookies.get('userData')
  const parsedUserData = userData
    ? JSON.parse(decodeURIComponent(userData))
    : {}
  const facilityId = parsedUserData?.facility._id
  const {
    data: samplingKitData,
    error: samplingKitError,
    isLoading: samplingKitLoading,
  } = useGetAllSamplingKitInventoriesQuery({
    facilityId: facilityId,
    pageNumber: pageNumber,
    pageSize: pageSize,
  })
  const {
    data: sampleData,
    error: sampleError,
    isLoading: sampleLoading,
  } = useGetSamplesQuery({})
  return <div>SamplingKitInventoryList</div>
}
