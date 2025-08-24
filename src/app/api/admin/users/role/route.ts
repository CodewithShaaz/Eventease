import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface UpdateRoleRequest {
  userId: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    // Only admin users can change roles
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body: UpdateRoleRequest = await request.json();
    const { userId, role } = body;

    // Validate role
    const validRoles = ['ADMIN', 'STAFF', 'EVENT_OWNER', 'ATTENDEE'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role specified.' },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: 'User role updated successfully',
        user: updatedUser,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { 
        message: 'Failed to update user role',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
