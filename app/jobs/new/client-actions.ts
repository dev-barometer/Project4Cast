'use server';

// Server Actions for creating clients and brands

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireEmailVerification } from '@/lib/security';
import { revalidatePath } from 'next/cache';

// Server action to create a new client
export async function createClient(formData: FormData) {
  const name = formData.get('name')?.toString().trim();

  if (!name) {
    return { success: false, error: 'Client name is required', clientId: null };
  }

  // Require email verification
  const session = await auth();
  if (session?.user?.id) {
    try {
      await requireEmailVerification(session.user.id);
    } catch (error: any) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        return { success: false, error: 'Please verify your email address', clientId: null };
      }
      throw error;
    }
  }

  try {
    const client = await prisma.client.create({
      data: { name },
    });
    revalidatePath('/jobs/new');
    return { success: true, error: null, clientId: client.id };
  } catch (error: any) {
    console.error('Error creating client:', error);
    return { success: false, error: error.message || 'Failed to create client', clientId: null };
  }
}

// Server action to create a new brand
export async function createBrand(formData: FormData) {
  const name = formData.get('name')?.toString().trim();
  const clientId = formData.get('clientId')?.toString();

  if (!name || !clientId) {
    return { success: false, error: 'Brand name and client are required', brandId: null };
  }

  // Require email verification
  const session = await auth();
  if (session?.user?.id) {
    try {
      await requireEmailVerification(session.user.id);
    } catch (error: any) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        return { success: false, error: 'Please verify your email address', brandId: null };
      }
      throw error;
    }
  }

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    return { success: false, error: 'Client not found', brandId: null };
  }

  try {
    const brand = await prisma.brand.create({
      data: { name, clientId },
    });
    revalidatePath('/jobs/new');
    return { success: true, error: null, brandId: brand.id };
  } catch (error: any) {
    console.error('Error creating brand:', error);
    return { success: false, error: error.message || 'Failed to create brand', brandId: null };
  }
}






