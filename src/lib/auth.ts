import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from './prisma';

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF', 
  EVENT_OWNER = 'EVENT_OWNER',
  ATTENDEE = 'ATTENDEE',
}

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
}

/**
 * Get the current authenticated user with role information
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the current user has the required role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Admin has access to everything
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  // Staff has access to staff-level, event owner, and attendee tasks
  if (user.role === UserRole.STAFF && (requiredRole === UserRole.STAFF || requiredRole === UserRole.EVENT_OWNER || requiredRole === UserRole.ATTENDEE)) {
    return true;
  }

  // Event owners can access event owner and attendee level tasks
  if (user.role === UserRole.EVENT_OWNER && (requiredRole === UserRole.EVENT_OWNER || requiredRole === UserRole.ATTENDEE)) {
    return true;
  }

  // Attendees can only access attendee level tasks
  if (user.role === UserRole.ATTENDEE && requiredRole === UserRole.ATTENDEE) {
    return true;
  }

  return false;
}

/**
 * Check if the current user can manage a specific event
 */
export async function canManageEvent(eventId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Admin can manage all events
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  // Staff can manage all events
  if (user.role === UserRole.STAFF) {
    return true;
  }

  // Event owners can only manage their own events
  if (user.role === UserRole.EVENT_OWNER) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { ownerId: true },
    });

    return event?.ownerId === user.id;
  }

  // Attendees cannot manage any events
  if (user.role === UserRole.ATTENDEE) {
    return false;
  }

  return false;
}

/**
 * Check if the current user can view attendees for a specific event
 */
export async function canViewAttendees(eventId: string): Promise<boolean> {
  return await canManageEvent(eventId);
}

/**
 * Check if the current user can export attendee data for a specific event
 */
export async function canExportAttendees(eventId: string): Promise<boolean> {
  return await canManageEvent(eventId);
}

/**
 * Get all events that the current user can manage
 */
export async function getManagedEvents() {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }

  // Admin and Staff can see all events
  if (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) {
    return await prisma.event.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  // Event owners can only see their own events
  return await prisma.event.findMany({
    where: {
      ownerId: user.id,
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          rsvps: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
}

/**
 * Role hierarchy helper - determines if a role has higher privileges than another
 */
export function hasHigherRole(userRole: UserRole, compareRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.ADMIN]: 4,
    [UserRole.STAFF]: 3,
    [UserRole.EVENT_OWNER]: 2,
    [UserRole.ATTENDEE]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[compareRole];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.STAFF:
      return 'Staff Member';
    case UserRole.EVENT_OWNER:
      return 'Event Owner';
    default:
      return 'Unknown';
  }
}
