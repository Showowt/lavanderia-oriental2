import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import twilio from 'twilio';

const sendMessageSchema = z.object({
  to: z.string().min(10),
  message: z.string().min(1).max(4096),
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // Normalize phone number
    let phoneNumber = data.to.replace(/\D/g, '');
    if (!phoneNumber.startsWith('52') && phoneNumber.length === 10) {
      phoneNumber = '52' + phoneNumber;
    }

    // Send via Twilio WhatsApp
    const message = await twilioClient.messages.create({
      body: data.message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:+${phoneNumber}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        sid: message.sid,
        status: message.status,
      },
      message: 'Mensaje enviado exitosamente',
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', message: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno', message: 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}
