import { useState, useEffect } from 'react' // Thêm useEffect
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Input, Avatar, Button, Tooltip, Divider, Spin } from 'antd' // Thêm Spin
import {
    SearchOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MedicineBoxOutlined,
    BarChartOutlined, // Giữ nguyên hoặc thay đổi icon phù hợp hơn nếu có
    // Thêm các icon khác nếu cần cho các mục menu khác của Delivery
} from '@ant-design/icons'
import Cookies from 'js-cookie'
import { useGetUserListQuery, useGetFacilitiesNameAndAddressQuery } from '../../../features/admin/facilitiesAPI' // Đảm bảo đường dẫn đúng đến API slice của mày

const { Sider } = Layout
const { Search } = Input

export const SideBar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false)
    const [userFacilityName, setUserFacilityName] = useState('N/A') // State để lưu tên cơ sở
    const [isLoadingFacility, setIsLoadingFacility] = useState(false) // State loading cho facility

    // Lấy userData từ cookie và decode nó
    const userDataString = Cookies.get('userData');
    let userData = {};
    if (userDataString) {
        try {
            // Decode URI component trước khi parse JSON
            userData = JSON.parse(decodeURIComponent(userDataString));
        } catch (error) {
            console.error('Lỗi khi parse userData từ cookie:', error);
        }
    }

    // Lấy userId từ userData
    const userId = userData?.id;

    // Sử dụng RTK Query để lấy danh sách người dùng và danh sách cơ sở
    const { data: userListData, error: userListError } = useGetUserListQuery();
    const { data: facilitiesListData, error: facilitiesListError } = useGetFacilitiesNameAndAddressQuery();

    useEffect(() => {
        const fetchAndSetFacility = async () => {
            if (userId && userListData && facilitiesListData) {
                setIsLoadingFacility(true);
                try {
                    // 1. Tìm user trong userListData dựa trên userId từ cookie
                    const currentUser = userListData.data.find(user => user._id === userId);

                    if (currentUser && currentUser.facility) {
                        // 2. Nếu user có facility ID, tìm facility tương ứng trong facilitiesListData
                        const facilityInfo = facilitiesListData.data.find(
                            facility => facility._id === currentUser.facility
                        );
                        if (facilityInfo) {
                            setUserFacilityName(facilityInfo.facilityName);
                        } else {
                            setUserFacilityName('Không tìm thấy cơ sở');
                        }
                    } else if (currentUser && currentUser.role?.role === 'Admin') {
                         setUserFacilityName('Toàn quyền'); // Admin không thuộc cơ sở cụ thể
                    }
                    else {
                        setUserFacilityName('Không có cơ sở');
                    }
                } catch (e) {
                    console.error("Lỗi khi tìm thông tin cơ sở:", e);
                    setUserFacilityName('Lỗi tải cơ sở');
                } finally {
                    setIsLoadingFacility(false);
                }
            } else if (!userId) {
                setUserFacilityName('Chưa đăng nhập');
            } else if (userListError || facilitiesListError) {
                setUserFacilityName('Lỗi tải dữ liệu');
            }
        };

        fetchAndSetFacility();
    }, [userId, userListData, facilitiesListData, userListError, facilitiesListError]); // Dependencies cho useEffect


    // Get the current selected keys based on the pathname
    const getSelectedKeys = () => {
        const pathname = location.pathname
        // Điều chỉnh để khớp với path của Delivery
        if (pathname === '/delivery') return ['delivery'];
        // Hoặc nếu có các sub-path cho delivery, thêm vào đây
        // if (pathname.startsWith('/delivery')) {
        //     const segments = pathname.split('/').filter(Boolean);
        //     if (segments.length > 1) {
        //         return [pathname.substring(1)];
        //     }
        //     return ['delivery'];
        // }


        // Check if pathname includes any of these paths
        const paths = [
            'appointments',
            'patients',
            'inventory',
            'vaccinations',
            'reports',
            'documents',
            'settings',
            // Thêm các path của delivery vào đây
            'delivery',
        ]

        for (const path of paths) {
            if (pathname.includes(path)) {
                // If it's a sub-path, return both parent and child keys
                const segments = pathname.split('/').filter(Boolean)
                if (segments.length > 1) {
                    return [path, pathname.substring(1)] // Remove leading slash
                }
                return [path]
            }
        }

        return []
    }

    // Define the menu items
    const items = [
        {
            key: 'delivery', // Đảm bảo key khớp với path
            icon: <BarChartOutlined />, // Có thể thay bằng icon khác phù hợp hơn nếu có
            label: 'Quản trị',
            onClick: () => navigate('delivery'),
        },
        // Thêm các mục menu khác của Delivery vào đây nếu có
    ]

    return (
        <Sider
            width={250}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            theme='light'
            style={{
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                height: '100vh',
                position: 'sticky',
                top: 0,
                left: 0,
            }}
        >
            {/* Logo and Title */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    borderBottom: '1px solid #f0f0f0',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MedicineBoxOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                    {!collapsed && (
                        <span style={{ marginLeft: 12, fontWeight: 600 }}>VacciTrack</span>
                    )}
                </div>
                {!collapsed && (
                    <Button
                        type='text'
                        icon={<MenuFoldOutlined />}
                        onClick={() => setCollapsed(true)}
                        size='small'
                    />
                )}
                {collapsed && (
                    <Button
                        type='text'
                        icon={<MenuUnfoldOutlined />}
                        onClick={() => setCollapsed(false)}
                        size='small'
                        style={{ marginTop: 16 }}
                    />
                )}
            </div>

            {/* Search */}
            {!collapsed && (
                <div style={{ padding: '12px 16px' }}>
                    <Search
                        placeholder='Search...'
                        allowClear
                        size='middle'
                        prefix={<SearchOutlined />}
                    />
                </div>
            )}

            {/* Navigation Menu */}
            <Menu
                mode='inline'
                selectedKeys={getSelectedKeys()}
                defaultOpenKeys={
                    getSelectedKeys().length > 0 ? [getSelectedKeys()[0]] : []
                }
                style={{ borderRight: 0 }}
                items={items}
            />

            {/* User Profile */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    padding: '16px',
                    borderTop: '1px solid #f0f0f0',
                    backgroundColor: '#fff',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: collapsed ? 0 : 12,
                    }}
                >
                    <Avatar icon={<UserOutlined />} />
                    {!collapsed && (
                        <div style={{ marginLeft: 12 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, color: 'black' }}>
                                {/* Sửa userData?.Name thành userData?.name để khớp với cookie */}
                                {userData?.name || 'Delivery User'}
                            </div>
                            <div style={{ fontSize: 12, color: 'black' }}>
                                {/* Sửa userData?.Email thành userData?.email để khớp với cookie */}
                                {userData?.email || 'delivery@vaccitrack.com'}
                            </div>
                            <div style={{ fontSize: 12, color: 'gray', marginTop: 4 }}>
                                {isLoadingFacility ? <Spin size="small" /> : `Cơ sở: ${userFacilityName}`}
                            </div>
                        </div>
                    )}
                </div>
                {!collapsed && <Divider style={{ margin: '12px 0' }} />}
                <Tooltip title={collapsed ? 'Logout' : ''} placement='right'>
                    <Button
                        type='primary'
                        danger
                        icon={<LogoutOutlined />}
                        onClick={() => {
                            Cookies.remove('userData')
                            Cookies.remove('userToken')
                            navigate('/login')
                        }}
                        style={{ width: collapsed ? '100%' : '100%' }}
                        size={collapsed ? 'middle' : 'middle'}
                    >
                        {!collapsed && 'Đăng xuất'}
                    </Button>
                </Tooltip>
            </div>
        </Sider>
    )
}