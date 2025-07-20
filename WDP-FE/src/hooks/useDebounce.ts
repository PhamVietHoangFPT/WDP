// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Thiết lập một timeout để cập nhật giá trị sau khoảng thời gian delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Hủy timeout nếu giá trị thay đổi (người dùng tiếp tục gõ)
    // Hoặc khi component unmount
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Chỉ chạy lại effect nếu value hoặc delay thay đổi

  return debouncedValue
}

export default useDebounce
