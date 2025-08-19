'use server';

import {createClient} from '@/utils/supabase/server';
// import {revalidatePath} from 'next/cache';


export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createClient();

  const {
    data: {user},
    error: authError,
  } = await supabase.auth.getUser();
  const requestUserId = formData.get('userId')?.toString();

  if (authError || !user || user.id !== requestUserId) {
    throw new Error('UNAUTHORIZED');
  }


  const updateType = formData.get('updateType')?.toString() || 'fullName';

  if (updateType === 'fullName') {

    const fullName = formData.get('fullName')?.toString() || '';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const {data, error} = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
      },
    });

    if (error) {
      throw new Error('Kunde inte uppdatera profilen');
    }

    // revalidatePath('/profile');

    return {
      success: true,
      user: data.user,
    };
  } else if (updateType === 'phoneNumber') {
    // Get phoneNumber from form data
    const phoneNumber = formData.get('phoneNumber')?.toString() || '';

    const {data, error} = await supabase.auth.updateUser({
      data: {
        phone_number: phoneNumber,
      },
    });

    if (error) {
      throw new Error('Kunde inte uppdatera telefonnummer');
    }

    // revalidatePath('/profile');

    return {
      success: true,
      user: data.user,
    };
  }

  throw new Error('Ogiltig uppdateringstyp');
};
