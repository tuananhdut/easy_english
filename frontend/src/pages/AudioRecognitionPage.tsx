import React, { useState, useRef } from 'react'
import { Card, Button, Input, Typography, Space, message, Progress } from 'antd'
import { AudioOutlined, StopOutlined, SendOutlined } from '@ant-design/icons'
import axios from 'axios'
import RecordRTC from 'recordrtc'

const { Title, Text } = Typography

interface RecognitionResult {
  status: string
  recognized_text: string
  expected_word: string
  accuracy: number
}

const AudioRecognitionPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [expectedWord, setExpectedWord] = useState('')
  const [result, setResult] = useState<RecognitionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const recorderRef = useRef<RecordRTC | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        bufferSize: 4096
      })

      recorderRef.current = recorder
      recorder.startRecording()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      message.error('Error accessing microphone. Please make sure you have granted microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current?.getBlob()
        if (blob) {
          setAudioBlob(blob)
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
        setIsRecording(false)
      })
    }
  }

  const handleSubmit = async () => {
    if (!audioBlob || !expectedWord) {
      message.warning('Please record audio and enter an expected word')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('audio_file', audioBlob, 'recording.wav')
    formData.append('expected_word', expectedWord)

    try {
      const response = await axios.post<RecognitionResult>('http://localhost:8000/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setResult(response.data)
      message.success('Recognition completed successfully')
    } catch (error) {
      console.error('Error:', error)
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || 'Error during recognition. Please try again.')
      } else {
        message.error('Error during recognition. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return '#52c41a' // green
    if (accuracy >= 0.6) return '#faad14' // yellow
    return '#ff4d4f' // red
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <Card>
        <Title level={2} style={{ marginBottom: '1.5rem' }}>
          Audio Recognition
        </Title>

        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <Space>
            <Button
              type={isRecording ? 'primary' : 'default'}
              danger={isRecording}
              icon={isRecording ? <StopOutlined /> : <AudioOutlined />}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
          </Space>

          {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} style={{ width: '100%' }} />}

          <Input
            placeholder='Enter expected word'
            value={expectedWord}
            onChange={(e) => setExpectedWord(e.target.value)}
            size='large'
          />

          <Button
            type='primary'
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={loading}
            disabled={!audioBlob || !expectedWord}
            block
          >
            Submit for Recognition
          </Button>

          {result && (
            <Card type='inner' title='Recognition Result'>
              <Space direction='vertical' style={{ width: '100%' }}>
                <div>
                  <Text strong>Expected Word: </Text>
                  <Text>{result.expected_word}</Text>
                </div>
                <div>
                  <Text strong>Recognized Text: </Text>
                  <Text>{result.recognized_text}</Text>
                </div>
                <div>
                  <Text strong>Accuracy: </Text>
                  <Progress
                    percent={Math.round(result.accuracy * 100)}
                    strokeColor={getAccuracyColor(result.accuracy)}
                    format={(percent) => `${percent}%`}
                  />
                </div>
              </Space>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default AudioRecognitionPage
