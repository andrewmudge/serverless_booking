'use client';

import Cookies from 'js-cookie';

export const saveSession = (jwt: string) => {
  Cookies.set('jwt', jwt, { expires: 7 });
};

export const getSession = () => {
  return Cookies.get('jwt');
};

export const clearSession = () => {
  Cookies.remove('jwt');
};

console.log('cookies.ts loaded');
