import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Modal, Select, message } from 'antd';
import { useGetConditionListQuery } from '../../features/condition/conditionAPI';
import type { Condition } from '../../types/condition';

interface ConditionResponse {
    data: Condition[];
}

interface UpdateQualityModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (selectedConditionId: string) => void;
}

const UpdateQualityModal: React.FC<UpdateQualityModalProps> = ({
    open,
    onClose,
    onSubmit,
}) => {
    const [selectedConditionId, setSelectedConditionId] = useState<string | undefined>();
    const { data: conditionListData } = useGetConditionListQuery<ConditionResponse>({});

    // Xử lý chọn tùy chọn
    const handleSelect = (value: string) => {
        setSelectedConditionId(value);
        console.log('Selected ID:', value); // Gỡ lỗi để kiểm tra giá trị
    };

    // Xử lý nhấn "Lưu"
    const handleOk = useCallback(() => {
        if (!selectedConditionId) {
            message.error('Vui lòng chọn một chất lượng trước khi lưu.');
            return;
        }
        onSubmit(selectedConditionId);
    }, [selectedConditionId, onSubmit]);

    // Đặt lại selectedConditionId khi modal mở hoặc dữ liệu thay đổi
    useEffect(() => {
        if (open && conditionListData?.length && !selectedConditionId) {
            setSelectedConditionId(conditionListData[0]._id); // Đặt giá trị mặc định nếu có
        }
    }, [open, conditionListData, selectedConditionId]);

    // Tạo options từ conditionListData
    const conditionOptions = useMemo(() => {
        return conditionListData?.map((condition: Condition) => ({
            value: condition._id,
            label: condition.condition // Sử dụng condition thay vì name
        })) || [];
    }, [conditionListData]);

    return (
        <Modal
            title="Cập nhật chất lượng"
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            okText="Lưu"
            cancelText="Hủy"
            okButtonProps={{ disabled: !selectedConditionId }}
        >
            <Select
                style={{ width: '100%' }}
                placeholder="Chọn chất lượng"
                value={selectedConditionId}
                onChange={handleSelect}
                options={conditionOptions}
            />
        </Modal>
    );
};

export default UpdateQualityModal;