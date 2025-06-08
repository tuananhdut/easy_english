import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration is missing. Please check your .env file')
      throw new Error('Email configuration is missing')
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service configuration error:', error)
      } else {
        console.log('Email service is ready to send messages')
      }
    })
  }

  async sendShareNotification(
    to: string,
    collectionName: string,
    ownerName: string,
    collectionId: number,
    token: string
  ) {
    if (!process.env.CLIENT_URL) {
      throw new Error('FRONTEND_URL is not configured')
    }
    console.log(token)
    const confirmUrl = `${process.env.CLIENT_URL}/confirm-share?token=${token}&collectionId=${collectionId}`

    const mailOptions = {
      from: `"Flashcard App" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Bạn có một bộ sưu tập mới được chia sẻ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1890ff;">Thông báo chia sẻ bộ sưu tập</h2>
          <p>Xin chào,</p>
          <p><strong>${ownerName}</strong> đã chia sẻ bộ sưu tập <strong>${collectionName}</strong> với bạn.</p>
          <p>Bạn có thể truy cập vào ứng dụng để xem và học bộ sưu tập này.</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0;">Bộ sưu tập: ${collectionName}</p>
            <p style="margin: 5px 0;">Người chia sẻ: ${ownerName}</p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${confirmUrl}" 
               style="background-color: #1890ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Xác nhận và xem bộ sưu tập
            </a>
          </div>
          <p style="margin-top: 20px;">Trân trọng,<br>Flashcard App Team</p>
        </div>
      `
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email notification')
    }
  }
}

export const emailService = new EmailService()
