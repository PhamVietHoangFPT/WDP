import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetResultByIdQuery } from '../../features/doctor/doctorAPI'

export default function UserResult() {
  const { resultId } = useParams<{ resultId: string }>()

  const { data, isLoading, error, isError } = useGetResultByIdQuery(
    resultId ?? '',
    {
      skip: !resultId,
    }
  )

  return <div>UserResult</div>
}
