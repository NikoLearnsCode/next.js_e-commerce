'use server';

import {createClient} from '@/utils/supabase/server';
import {headers} from 'next/headers';
import {getSessionId} from '@/utils/cookies';
import {cookies} from 'next/headers';

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Register user
export const signUpAction = async (
  formData: FormData
): Promise<{
  success: boolean;
  callbackUrl?: string;
  error?: string;
  message?: string;
}> => {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const callbackUrl = formData.get('callbackUrl')?.toString() || '/';
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  if (!email || !password) {
    return {
      success: false,
      error: 'E-postadress och lösenord krävs',
    };
  }

  const {error, data} = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + ' ' + error.message);

    // Translate common error messages to swedish
    let errorMessage = error.message;

    if (error.message.includes('Password should be at least')) {
      errorMessage = 'Lösenordet måste vara minst 6 tecken långt.';
    } else if (error.message.includes('User already registered')) {
      errorMessage = 'En användare med denna e-postadress finns redan.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = 'Ogiltig e-postadress. Kontrollera formatet.';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  if (data?.user?.identities?.length === 0) {
    return {
      success: false,
      error:
        'Ett konto med denna e-postadress finns redan. Logga in eller kontrollera din e-post för en verifieringslänk.',
    };
  }

  // If sign up successful and we have a user
  if (data?.user) {
    try {
      console.log('Transferring cart for new user:', data.user.id);
      await transferCartOnLogin(data.user.id);
      console.log('Cart transfer complete for new user');

      // Delete the session cookie after successful transfer
      const cookieStore = await cookies();
      cookieStore.delete('cart_session_id');
      console.log('Cart session cookie deleted');
    } catch (transferError) {
      console.error('Error during cart transfer after sign up:', transferError);
    }
  } else {
    console.warn(
      'Sign up successful but no user data returned for cart transfer.'
    );
  }

  return {
    success: true,
    callbackUrl: callbackUrl,

    // message: 'Tack för din registrering! ...'
  };
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Log in user
export const signInAction = async (formData: FormData) => {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const callbackUrl = formData.get('callbackUrl')?.toString() || '/';

  const {error, data} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMessage = error.message;

    // Translate common error messages to swedish
    if (error.message === 'Invalid login credentials') {
      errorMessage = 'Fel e-postadress eller lösenord. Försök igen.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage =
        'E-postadressen har inte bekräftats. Kontrollera din e-post för en bekräftelselänk.';
    } else if (error.message.includes('User not found')) {
      errorMessage =
        'Användaren hittades inte. Kontrollera e-postadressen eller skapa ett nytt konto.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = 'Ogiltig e-postadress. Kontrollera formatet.';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  // Transfer cart from session to user
  if (data?.user) {
    console.log('Transferring cart for user:', data.user.id);
    await transferCartOnLogin(data.user.id);
    console.log('Cart transfer complete');

    const cookieStore = await cookies();
    cookieStore.delete('cart_session_id');
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  // on success
  return {
    success: true,
    callbackUrl: callbackUrl,
  };

  // return redirect(callbackUrl);
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Forgot password
export const forgotPasswordAction = async (
  formData: FormData
): Promise<{success: boolean; error?: string; message?: string}> => {
  const email = formData.get('email')?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  if (!email) {
    return {
      success: false,
      error: 'E-postadress krävs',
    };
  }

  const {error} = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);

    let errorMessage = 'Kunde inte återställa lösenordet';

    if (error.message.includes('User not found')) {
      errorMessage = 'Ingen användare med denna e-postadress hittades.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = 'Ogiltig e-postadress. Kontrollera formatet.';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  return {
    success: true,
    message:
      'Om e-postadressen är registrerad hos oss kommer en återställningslänk att skickas. Kontrollera din e-post.',
  };
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reset password
export const resetPasswordAction = async (
  formData: FormData
): Promise<{success: boolean; error?: string; message?: string}> => {
  const supabase = await createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return {
      success: false,
      error: 'Lösenord och bekräfta lösenord krävs',
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: 'Lösenorden matchar inte',
    };
  }

  const {error} = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    let errorMessage = 'Lösenordsuppdateringen misslyckades';

    if (error.message.includes('Password should be at least')) {
      errorMessage = 'Lösenordet måste vara minst 6 tecken långt.';
    } else if (error.message.includes('Auth session missing')) {
      errorMessage =
        'Din session har gått ut. Logga in igen och försök på nytt.';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  return {
    success: true,
    message: 'Lösenordet har uppdaterats',
  };
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Log out user
export const signOutAction = async () => {
  // const cookieStore = await cookies();
  const supabase = await createClient();

  try {
    const {error} = await supabase.auth.signOut();

    if (error) {
      console.error('Fel vid utloggning:', error);
    }

    // // Generera ny session_id
    // const newSessionId = uuidv4();
    // cookieStore.set(CART_SESSION_COOKIE, newSessionId, {
    //   maxAge: 60 * 60 * 24 * 30,
    //   path: '/',
    //   httpOnly: true,
    //   sameSite: 'lax',
    //   secure: process.env.NODE_ENV === 'production',
    // });

    // console.log('Ny session_id från utloggning:', newSessionId);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Fel vid utloggning:', error);
  }
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Change password
export const changePasswordAction = async (
  formData: FormData
): Promise<{success: boolean; error?: string; message?: string}> => {
  const supabase = await createClient();

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    // Return error object
    return {
      success: false,
      error: 'Alla fält måste fyllas i',
    };
  }

  if (newPassword !== confirmPassword) {
    // Return error object
    return {
      success: false,
      error: 'Lösenorden matchar inte',
    };
  }

  // Get user's email to verify current password
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    // Return error object
    return {
      success: false,
      error: 'Du måste vara inloggad för att ändra lösenord',
    };
  }

  // Verifiera nuvarande lösenord genom att försöka logga in
  const {error: signInError} = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    // Return error object
    return {
      success: false,
      error: 'Nuvarande lösenord är felaktigt',
    };
  }

  // Update password
  const {error} = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    let errorMessage = 'Lösenordsuppdateringen misslyckades';

    if (error.message.includes('Password should be at least')) {
      errorMessage = 'Lösenordet måste vara minst 6 tecken långt.';
    } else if (error.message.includes('Auth session missing')) {
      errorMessage =
        'Din session har gått ut. Logga in igen och försök på nytt.';
    }

    // Return error object
    return {
      success: false,
      error: errorMessage,
    };
  }

  // Return success object
  return {
    success: true,
    message: 'Lösenordet har uppdaterats',
  };
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Transfer cart from session to user
export async function transferCartOnLogin(userId: string) {
  try {
    const supabase = await createClient();
    const sessionId = await getSessionId();

    // If no session_id, do nothing
    if (!sessionId) {
      console.log('No session_id found, nothing to transfer');
      return {success: true, message: 'No session_id found'};
    }

    console.log(
      'Starting cart transfer with sessionId:',
      sessionId,
      'and userId:',
      userId
    );

    // Find cart associated with current session_id
    const {data: sessionCart, error: sessionCartError} = await supabase
      .from('carts')
      .select('*')
      .eq('session_id', sessionId)
      .is('user_id', null)
      .maybeSingle();

    if (sessionCartError) {
      console.error('Error fetching session cart:', sessionCartError);
      return {success: false, error: sessionCartError};
    }

    // If no anonymous cart found, do nothing
    if (!sessionCart) {
      console.log('No session cart found');
      return {success: true, message: 'No session cart found'};
    }

    console.log('Found session cart:', sessionCart);

    // Check if user already has a cart
    const {data: userCart, error: userCartError} = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (userCartError) {
      console.error('Error fetching user cart:', userCartError);
      return {success: false, error: userCartError};
    }

    if (userCart) {
      console.log('Found user cart, merging items');
      // User already has a cart - merge contents
      const combinedItems = [...(userCart.items || [])];

      // Add each item from sessionCart
      for (const item of sessionCart.items || []) {
        const existingItemIndex = combinedItems.findIndex(
          (existingItem) =>
            existingItem.product_id === item.product_id &&
            existingItem.size === item.size
        );

        if (existingItemIndex >= 0) {
          // If product already exists, update quantity
          combinedItems[existingItemIndex].quantity += item.quantity;
        } else {
          // Otherwise add as new product
          combinedItems.push(item);
        }
      }

      // Update user's cart with the merged contents
      const {error: updateError} = await supabase
        .from('carts')
        .update({
          items: combinedItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userCart.id);

      if (updateError) {
        console.error('Error updating user cart:', updateError);
        return {success: false, error: updateError};
      }

      // Delete the anonymous cart
      const {error: deleteError} = await supabase
        .from('carts')
        .delete()
        .eq('id', sessionCart.id);

      if (deleteError) {
        console.error('Error deleting session cart:', deleteError);
      }

      console.log('Cart merged and session cart deleted');
    } else {
      console.log('No user cart found, transferring session cart');
      // User has no cart - transfer the anonymous cart
      const {error: updateError} = await supabase
        .from('carts')
        .update({
          user_id: userId,
          session_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionCart.id);

      if (updateError) {
        console.error('Error transferring cart:', updateError);
        return {success: false, error: updateError};
      }

      console.log('Session cart transferred to user');
    }

    return {success: true};
  } catch (error) {
    console.error('Unexpected error transferring cart on login:', error);
    return {success: false, error};
  }
}
