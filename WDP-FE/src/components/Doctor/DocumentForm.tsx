import React, { useState, useEffect } from 'react'
import { Table, Input, Button, message, Typography, Space } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useCreateAdnDocumentationMutation } from '../../features/doctor/doctorAPI'

const { Title } = Typography

const lociList = [
  'D3S1358',
  'vWA',
  'D16S539',
  'CSF1PO',
  'TPOX',
  'D8S1179',
  'D21S11',
  'D18S51',
  'D5S818',
  'D13S317',
  'D7S820',
  'D1S1656',
  'D10S1248',
  'D2S441',
  'D12S391',
  'D19S433',
  'FGA',
  'D22S1045',
  'D2S1338',
  'D6S1043',
  'SE33',
  'Amelogenin',
  'DYS391',
  'Y-indel',
]

export default function CreateAdnDocumentPage() {
  const { serviceCaseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const serviceCase = location.state?.serviceCase

  const [createAdnDocumentation] = useCreateAdnDocumentationMutation()
  const [profiles, setProfiles] = useState<any[]>([])

  useEffect(() => {
    if (!serviceCase) return

    const { caseMember, services } = serviceCase
    const testTakers = caseMember?.testTakers || []
    const sampleIds = caseMember?.sampleIdentifyNumbers || []

    const generated = sampleIds.map((sampleId: string, index: number) => {
      const taker = testTakers[index]
      const sample = services[index]?.sample
      return {
        sampleIdentifyNumber: `${taker?.name || 'Mẫu'} - ${sample?.name || 'Không rõ'} (ID: ${sampleId})`,
        realSampleId: sampleId,
        markers: [],
      }
    })

    setProfiles(generated)
  }, [serviceCase])

  const handleAlleleChange = (
    value: string,
    sampleIndex: number,
    locus: string
  ) => {
    const updated = [...profiles]
    const markerIndex = updated[sampleIndex].markers.findIndex(
      (m: any) => m.locus === locus
    )
    if (markerIndex !== -1) {
      updated[sampleIndex].markers[markerIndex].alleles = value.split(',')
    } else {
      updated[sampleIndex].markers.push({ locus, alleles: value.split(',') })
    }
    setProfiles(updated)
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token || !serviceCaseId) return

    const doctorId = jwtDecode<any>(token).userId
    const body = {
      serviceCase: serviceCaseId,
      doctor: doctorId,
      profiles,
    }
    console.log('Body gửi lên:', JSON.stringify(body, null, 2))
    try {
      await createAdnDocumentation(body).unwrap()
      message.success('Tạo tài liệu thành công')
      navigate(-1)
    } catch (error: any) {
      message.error(error?.data?.message || 'Tạo tài liệu thất bại')
    }
  }

  const columns = [
    {
      title: 'Locus',
      dataIndex: 'locus',
      key: 'locus',
      render: (text: string) => <strong>{text}</strong>,
    },
    ...profiles.map((sample, sampleIndex) => ({
      title: sample.sampleIdentifyNumber,
      dataIndex: sample.sampleIdentifyNumber,
      render: (_: any, record: any) => {
        const marker = sample.markers.find((m: any) => m.locus === record.locus)
        return (
          <Input
            placeholder='Alleles, ví dụ: 13,15.3'
            defaultValue={marker?.alleles?.join(',')}
            onChange={(e) =>
              handleAlleleChange(e.target.value, sampleIndex, record.locus)
            }
          />
        )
      },
    })),
  ]

  if (!serviceCase) {
    return (
      <div style={{ padding: 24, color: 'red' }}>
        ❌ Không tìm thấy dữ liệu hồ sơ. Vui lòng quay lại trang trước.
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Tạo tài liệu ADN</Title>

      <Table
        dataSource={lociList.map((locus) => ({ key: locus, locus }))}
        columns={columns}
        pagination={false}
        bordered
      />

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button type='primary' onClick={handleSubmit}>
          Gửi
        </Button>
      </div>
    </div>
  )
}
