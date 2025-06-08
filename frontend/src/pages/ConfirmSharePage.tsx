import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Result, Spin, message, Button } from 'antd'
import { confirmSharedCollection } from '../features/shareCollection/shareCollectionApi'
import { IConfirmShareCollectionResponse } from '../features/shareCollection/shareCollectionType'

const ConfirmSharePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareData, setShareData] = useState<IConfirmShareCollectionResponse | null>(null)

  useEffect(() => {
    const confirmShare = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setError('Thiếu thông tin xác nhận')
        setLoading(false)
        return
      }

      try {
        const response = await confirmSharedCollection(token)
        console.log(response)
        if (response.status === 'success') {
          setShareData(response.data)
          message.success('Xác nhận chia sẻ thành công')
          // Chuyển hướng đến trang collection sau 3 giây
          setTimeout(() => {
            navigate(`/dashboard/dictionary`)
          }, 3000)
        } else {
          setError('Xác nhận chia sẻ thất bại')
          message.error('Xác nhận chia sẻ thất bại')
        }
      } catch (err) {
        console.error('Error confirming share:', err)
        setError('Có lỗi xảy ra khi xác nhận chia sẻ')
        message.error('Có lỗi xảy ra khi xác nhận chia sẻ')
      } finally {
        setLoading(false)
      }
    }

    confirmShare()
  }, [searchParams, navigate])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size='large' tip='Đang xác nhận chia sẻ...' />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Result
          status='error'
          title='Xác nhận chia sẻ thất bại'
          subTitle={error}
          extra={[
            <Button type='primary' key='back' onClick={() => navigate('/dashboard')}>
              Quay lại trang chủ
            </Button>
          ]}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <Result
          status='success'
          title='Xác nhận chia sẻ thành công'
          subTitle={
            <div>
              <p>Bạn đã được cấp quyền {shareData?.permission === 'view' ? 'xem' : 'chỉnh sửa'} collection.</p>
              <p>Bạn sẽ được chuyển hướng đến trang collection trong giây lát...</p>
            </div>
          }
        />
      </Card>
    </div>
  )
}

export default ConfirmSharePage
