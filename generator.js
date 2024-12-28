import { realDictionary } from './dictionary.js';

export function getRandomIndex(maxLength) {
    return Math.floor(Math.random() * Math.floor(maxLength));
}

export function getNewWord() {
    return realDictionary[getRandomIndex(realDictionary.length)].toUpperCase();
}

export const showMessage = (message, time) => {
    const toast = document.createElement('li');

    toast.textContent = message;
    toast.className = 'toast';

    document.querySelector('.toaster ul').prepend(toast);
    
    setTimeout(() => toast.classList.add('fade'), time);

    toast.addEventListener('transitionend', (event) => event.target.remove());
};