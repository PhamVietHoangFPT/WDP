import React from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

interface Props {
  children: React.ReactNode
  protectedRole?: string[]
}

interface DecodedToken {
  role: string
  exp?: number
  [key: string]: any
}

const PermissionCheck: React.FC<Props> = ({ children, protectedRole }) => {
  const token = Cookies.get('userToken')

  if (!token) {
    // ✅ Nếu không có token, vẫn cho vào
    return <>{children}</>
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token)

    // ✅ Nếu token hết hạn → vẫn không redirect
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      Cookies.remove('userToken')
      return <>{children}</>
    }

    // ✅ Nếu có role bảo vệ, thì kiểm tra quyền
    if (protectedRole?.length) {
      const userRole = decoded.role?.toLowerCase()
      const allowedRoles = protectedRole.map((r) => r.toLowerCase())
      if (!allowedRoles.includes(userRole)) {
        return <div>Bạn không có quyền truy cập nội dung này.</div>
      }
    }

    return <>{children}</>
  } catch (err) {
    Cookies.remove('userToken')
    return <>{children}</> // Token sai, nhưng không redirect
  }
}

export default PermissionCheck
