import React from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import Introduction from '../Introduction/introduction'
import type { Service } from '../../types/service'
import { useGetServiceListQuery } from '../../features/service/serviceAPI'
import ServiceCardSlider from '../ServiceSlider/serviceSlider'
import Content from '../Content/content'
import DNAInfoBanner from '../Introduction/introduction2'
import ServicesSection from '../Introduction/ServicesSection'
import { useGetFacilitiesListQuery } from '../../features/admin/facilitiesAPI'
import FacilityCardSlider from '../FacilitiesCard/FacilityCardSlider'

// Dịch vụ (Service)
interface ServiceListResponse {
  data: Service[]
  pagination: {
    totalItems: number
    pageSize: number
    totalPages: number
    currentPage: number
  }
  success: boolean
  message: string
  statusCode: number
}

// Cơ sở (Facility)
interface Facility {
  _id: string
  facilityName: string
  phoneNumber: string
  address: {
    fullAddress: string
    location: {
      type: string
      coordinates: [number, number]
    }
  }
}

interface FacilitiesResponse {
  data: Facility[]
  pagination: {
    totalItems: number
    pageSize: number
    totalPages: number
    currentPage: number
  }
  success: boolean
  message: string
  statusCode: number
}

const Homepage: React.FC = () => {
  const { data, isLoading } = useGetServiceListQuery<ServiceListResponse>({
    pageNumber: 1,
    pageSize: 5,
  })
  const services = data?.data || []

  const { data: facilityData, isLoading: isFacilitiesLoading } =
    useGetFacilitiesListQuery<FacilitiesResponse>({
      pageNumber: 1,
      pageSize: 8,
    })
  const facilities = facilityData?.data || []

  return (
    <>
      {/* Giới thiệu banner full */}
      <div style={{ width: '100%', marginBottom: '48px' }}>
        <Introduction />
      </div>

      {/* Slogan dưới banner */}
      <h2
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '34px',
          color: 'rgb(24, 144, 255)',
        }}
      >
        Hệ thống xét nghiệm ADN hàng đầu
      </h2>

      {/* Banner DNA info */}
      <div style={{ width: '100%', marginBottom: '48px' }}>
        <DNAInfoBanner />
      </div>

      {/* Dịch vụ */}
      <div
        style={{
          width: '100%',
          maxWidth: '80%',
          padding: '24px',
          margin: '0 auto',
        }}
      >
        <Content
          title='CÁC DỊCH VỤ'
          btnContent='Xem tất cả dịch vụ'
          linkURL='/price'
        />
        {isLoading ? (
          <LoadingOutlined
            style={{
              fontSize: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '30vh',
            }}
          />
        ) : (
          <ServiceCardSlider services={services} />
        )}
      </div>

      {/* Dịch vụ nổi bật riêng */}
      <div style={{ width: '100%', marginBottom: '48px' }}>
        <ServicesSection />
      </div>

      {/* Danh sách chi nhánh (Facility Slider) */}
      <div
        style={{
          width: '100%',
          maxWidth: '80%',
          padding: '24px',
          margin: '0 auto',
        }}
      >
        <Content
          title='CÁC CHI NHÁNH HOẠT ĐỘNG'
        />
        {isFacilitiesLoading ? (
          <LoadingOutlined
            style={{
              fontSize: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '30vh',
            }}
          />
        ) : (
          <FacilityCardSlider facilities={facilities.slice(0, 4)} />
        )}
      </div>
    </>
  )
}

export default Homepage
