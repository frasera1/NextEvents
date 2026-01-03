'use server'

import { createSupabaseClient } from "@/config/supabase-config"
import nodemailer from 'nodemailer'

export const sendBookingConfirmationMail = async (bookingId: number) => {
  try {
    const supabase = await createSupabaseClient()

    // Fetch booking details with related event and user information
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      throw new Error('Booking not found')
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', booking.event_id)
      .single()

    if (eventError || !event) {
      throw new Error('Event not found')
    }

    // Fetch user details
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('name, email')
      .eq('id', booking.user_id)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Format date and time
    const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'TBD'

    const eventTime = event.start_time && event.end_time
      ? `${event.start_time} - ${event.end_time}`
      : event.start_time || 'TBD'

    // Create professional HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Booking Confirmed!</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Thank you for your reservation</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Dear <strong>${user.name}</strong>,
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; color: #333333; line-height: 1.6;">
                We're delighted to confirm your booking. Your reservation has been successfully processed.
              </p>
            </td>
          </tr>
          
          <!-- Booking Details -->
          <tr>
            <td style="padding: 20px 30px;">
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px;">
                <h2 style="margin: 0 0 20px; font-size: 20px; color: #333333;">Event Details</h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #666666; width: 40%;">Event:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">${event.title || 'Event'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #666666;">Date:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">${eventDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #666666;">Time:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">${eventTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #666666;">Location:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">${event.location || 'TBD'}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Booking Summary -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background-color: #f8f9fa; border-left: 4px solid #764ba2; padding: 20px; border-radius: 4px;">
                <h2 style="margin: 0 0 20px; font-size: 20px; color: #333333;">Booking Summary</h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #666666; width: 40%;">Booking ID:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">#${booking.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #666666;">Ticket Type:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">${booking.ticket_type_name || 'General Admission'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #666666;">Quantity:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">${booking.booked_tickets || 1} ticket(s)</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #666666;">Payment ID:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">${booking.payment_id || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 0; font-size: 16px; color: #333333; font-weight: 600; border-top: 2px solid #dee2e6;">Total Amount:</td>
                    <td style="padding: 12px 0 0; font-size: 18px; color: #667eea; font-weight: 700; border-top: 2px solid #dee2e6;">$${(booking.total_amount || 0).toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Important Information -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;">
                  <strong>Important:</strong> Please bring a valid photo ID and this confirmation email to the event. We recommend arriving 15-30 minutes before the start time.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                If you have any questions or need to make changes to your booking, please contact our support team.
              </p>
              <p style="margin: 15px 0 0; font-size: 14px; color: #666666;">
                Thank you for choosing our platform!
              </p>
              <p style="margin: 15px 0 0; font-size: 12px; color: #999999;">
                This is an automated message, please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Plain text version for email clients that don't support HTML
    const textContent = `
Booking Confirmation

Dear ${user.name},

We're delighted to confirm your booking. Your reservation has been successfully processed.

EVENT DETAILS
Event: ${event.title || 'Event'}
Date: ${eventDate}
Time: ${eventTime}
Location: ${event.location || 'TBD'}

BOOKING SUMMARY
Booking ID: #${booking.id}
Ticket Type: ${booking.ticket_type_name || 'General Admission'}
Quantity: ${booking.booked_tickets || 1} ticket(s)
Payment ID: ${booking.payment_id || 'N/A'}
Total Amount: $${(booking.total_amount || 0).toFixed(2)}

IMPORTANT: Please bring a valid photo ID and this confirmation email to the event. We recommend arriving 15-30 minutes before the start time.

If you have any questions or need to make changes to your booking, please contact our support team.

Thank you for choosing our platform!

This is an automated message, please do not reply to this email.
    `

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Events Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Booking Confirmation - ${event.title || 'Event'} (Booking #${booking.id})`,
      text: textContent,
      html: htmlContent,
    })

    console.log('Email sent successfully:', info.messageId)

    return {
      success: true,
      message: 'Booking confirmation email sent successfully',
      data: { messageId: info.messageId }
    }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return {
      success: false,
      message: error.message || 'Failed to send booking confirmation email',
    }
  }
}