import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // <-- 1. Import Prisma

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, name, email } = body;

    if (!eventId || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        password: '',
      },
    });

    const newRsvp = await prisma.rSVP.create({
      data: {
        eventId: eventId,
        userId: user.id,
      },
    });

    return NextResponse.json(newRsvp, { status: 201 });

  } catch (error) { // <-- 2. No need to type the error here
    // 3. Check if the error is a known Prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Check for the unique constraint violation code
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "You have already RSVP'd for this event." },
          { status: 409 }
        );
      }
    }
    
    console.error('RSVP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}