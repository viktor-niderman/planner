import { debounce } from '@/helpers/debounce.js'

const url = 'https://api.niderman.pro/api/planners';

const debouncedSave = debounce(async (data) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': import.meta.env.VITE_API_KEY,
        'X-KEY': import.meta.env.VITE_KEY
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      throw new Error('Error: ' + response.statusText);
    }

    const result = await response.json();
  } catch (error) {
    console.log('Error in save:', error);
  }
}, 300);

export const saveToBackend = (data) => {
  debouncedSave(data);
};

export const loadFromBackend = async () => {
  return new Promise((resolve, reject) => {
    fetch(url + '/latest', {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': import.meta.env.VITE_API_KEY,
        'X-KEY': import.meta.env.VITE_KEY
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error:' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      resolve(JSON.parse(data.data));
    })
    .catch(error => {
      console.log(error)
      reject(false);
    });
  });
}
