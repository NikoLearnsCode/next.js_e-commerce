'use client';
import {FloatingLabelInput} from './floatingLabelInput';
import {Button} from './button';

export default function Newsletter() {
  return (
    <section className='border-t border-gray-100 px-6'>
      <form>
        <div className=' text-center py-14 border-t border-b border-gray-50'>
          <h2 className='font-medium mb-6 text-sm sm:text-base '>
            10 % rabatt vid nästa köp om du anmäler dig till nyhetsbrevet
          </h2>
          <div className='max-w-sm mx-auto'>
            <FloatingLabelInput
              id='email'
              label='E-postadress'
              type='email'
              required
            />
            <Button className='w-full mt-4'>Anmälan</Button>
          </div>
        </div>
      </form>
    </section>
  );
}
