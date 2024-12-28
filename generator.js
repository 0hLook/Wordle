import { realDictionary } from './dictionary.js';

export function getRandomIndex(maxLength) {
    return Math.floor(Math.random() * Math.floor(maxLength));
}

export function getNewWord() {
    return realDictionary[getRandomIndex(realDictionary.length)].toUpperCase();
}