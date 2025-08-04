import React, { useState, useEffect } from 'react'
import { Table, Input, Button, message, Typography, Modal } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useCreateAdnDocumentationMutation } from '../../features/doctor/doctorAPI'

const { Title } = Typography
const { confirm } = Modal

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

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

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
    const isSingleService = caseMember?.isSingleService || false

    const generated: any[] = []

    if (isSingleService) {
      sampleIds.forEach((sampleId: any, index: number) => {
        const taker = testTakers[index] || null
        const sample = services[index % services.length]?.sample

        generated.push({
          sampleIdentifyNumber: `${taker?.name || 'Mẫu'} - ${sample?.name || 'Không rõ'} (ID: ${sampleId})`,
          realSampleId: sampleId,
          markers: [],
        })
      })
    } else {
      sampleIds.forEach((sampleId: any, index: number) => {
        const taker = testTakers[index % testTakers.length]
        const service = services[Math.floor(index / testTakers.length)]
        const sample = service?.sample

        generated.push({
          sampleIdentifyNumber: `${taker?.name || 'Mẫu'} - ${sample?.name || 'Không rõ'} (ID: ${sampleId})`,
          realSampleId: sampleId,
          markers: [],
        })
      })
    }

    setProfiles(generated)
  }, [serviceCase])

  const handleAlleleChange = (
    value: string,
    sampleIndex: number,
    locus: string,
    alleleIndex: number
  ) => {
    const updated = [...profiles]
    const markerIndex = updated[sampleIndex].markers.findIndex(
      (m: any) => m.locus === locus
    )

    const newValue = value.trim()

    if (markerIndex !== -1) {
      const alleles = [...updated[sampleIndex].markers[markerIndex].alleles]
      alleles[alleleIndex] = newValue
      updated[sampleIndex].markers[markerIndex].alleles = alleles
    } else {
      const alleles = alleleIndex === 0 ? [newValue, ''] : ['', newValue]
      updated[sampleIndex].markers.push({ locus, alleles })
    }

    setProfiles(updated)
  }

  const handleSubmit = () => {
    const token = getCookie('userToken')
    if (!token || !serviceCaseId) {
      message.error('Thiếu token hoặc mã hồ sơ')
      return
    }

    const doctorId = jwtDecode<any>(token).id

    const cleanedProfiles = profiles.map((p) => ({
      ...p,
      markers: p.markers
        .filter(
          (m: any) => m.alleles && m.alleles.filter((a: string) => a).length > 0
        )
        .map((m: any) => ({
          locus: m.locus,
          alleles: m.alleles.filter((a: string) => a),
        })),
    }))

    if (cleanedProfiles.every((p) => p.markers.length === 0)) {
      message.warning('Bạn chưa nhập dữ liệu allele')
      return
    }

    confirm({
      title: 'Xác nhận gửi tài liệu?',
      content:
        'Vui lòng xác nhận các thông tin. Khi đã bấm gửi, bạn phải chịu trách nhiệm với kết quả. Hành động không thể hoàn tác.',
      okText: 'Xác nhận gửi',
      cancelText: 'Hủy',
      onOk: async () => {
        const body = {
          serviceCase: serviceCaseId,
          doctor: doctorId,
          profiles: cleanedProfiles,
        }

        try {
          console.log('Body gửi lên:', JSON.stringify(body, null, 2))
          await createAdnDocumentation(body).unwrap()
          message.success('Tạo tài liệu thành công')
          navigate(-1)
        } catch (error: any) {
          console.error('Lỗi gửi tài liệu:', error)
          message.error(error?.data?.message || 'Tạo tài liệu thất bại')
        }
      },
    })
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
          <div style={{ display: 'flex', gap: 4 }}>
            <Input
              placeholder='Allele 1'
              value={marker?.alleles?.[0] || ''}
              onChange={(e) =>
                handleAlleleChange(e.target.value, sampleIndex, record.locus, 0)
              }
            />
            <Input
              placeholder='Allele 2'
              value={marker?.alleles?.[1] || ''}
              onChange={(e) =>
                handleAlleleChange(e.target.value, sampleIndex, record.locus, 1)
              }
            />
          </div>
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
        scroll={{ x: true }}
      />

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button type='primary' onClick={handleSubmit}>
          Gửi
        </Button>
      </div>
    </div>
  )
}
