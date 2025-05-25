import React, { useEffect } from 'react'
import { getSoundApi } from '../features/dictionary/dictionaryApi'
import axios from 'axios'
import { SoundParams } from '../features/dictionary/dictionarytypes'
import '../styles/laban.css'
import { Spin } from 'antd'

interface DictionaryResultProps {
  searchText: string
}

const DictionaryResult: React.FC<DictionaryResultProps> = ({ searchText }) => {
  useEffect(() => {
    const fetchData = async () => {
      const handlePlaySound = async (type: string) => {
        try {
          const response = await getSound(searchText, type)
          const audio = new Audio(response)
          audio.play()
        } catch (error) {
          console.error('Không thể phát âm thanh:', error)
        }
      }
      try {
        const result = await axios.get('https://dict.laban.vn/ajax/find', {
          params: {
            type: 1,
            query: searchText
          }
        })

        const htmlContent = result.data?.enViData?.best?.details ?? '<div>Không tìm thấy kết quả</div>'
        const resultElement = document.getElementById('result')
        if (resultElement) {
          resultElement.innerHTML = htmlContent
          const elementUS = document.querySelector('a.sp_us')
          elementUS?.addEventListener('click', () => handlePlaySound('us'))

          const elementUK = document.querySelector('a.sp_uk')
          elementUK?.addEventListener('click', () => handlePlaySound('uk'))
        }
      } catch (error) {
        const resultElement = document.getElementById('result')
        if (resultElement) {
          resultElement.innerHTML = '<div style="color:red;">Lỗi tải dữ liệu từ server</div>'
        }
        console.error('Lỗi tải dữ liệu:', error)
      }
    }

    if (searchText.trim()) {
      fetchData()
    }
  }, [searchText])

  const getSound = async (word: string, type: string = 'us'): Promise<string> => {
    const soundParams: SoundParams = {
      accent: type,
      word: word
    }

    const response = await getSoundApi(soundParams)
    return response.data
  }

  return (
    <div className='wrapper'>
      <div className='details' id='result'>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size='large' />
        </div>
      </div>
    </div>
  )
}

export default DictionaryResult
