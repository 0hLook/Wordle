import { getNewWord } from './generator.js';
import { realDictionary } from './dictionary.js';
import { generateBoard } from './board.js';

const bKey = 'Backspace';
const eKey = 'Enter';
const wordList = realDictionary;

let theWord = getNewWord();

const numAttempts = 6;
const guessHistory = [];
let currentWord = '';

// Get everything setup and the game responding to user actions.
const keyPress = (event) => onKeyPress(event.key);
const keyClick = (event) => onKeyClick(event);

const init = () => {
  const KEYBOARD_KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  // Grab the gameboard and the keyboard
  const gameBoard = document.querySelector('#board');
  const keyboard = document.querySelector('#keyboard');

  // Generate the gameboard and the keyboard
  generateBoard(gameBoard);
  generateBoard(keyboard, 3, 10, KEYBOARD_KEYS, true);

  // Remove old event listeners first (if any)
  document.removeEventListener('keydown', keyPress);
  keyboard.removeEventListener('click', keyClick);

  // Add event listeners
  document.addEventListener('keydown', keyPress);
  keyboard.addEventListener('click', keyClick);
  gameBoard.addEventListener('animationend', event => event.target.setAttribute('data-animation', 'idle'));
};

const showMessage = (message, time) => {
  const toast = document.createElement('li');

  toast.textContent = message;
  toast.className = 'toast';

  document.querySelector('.toaster ul').prepend(toast);
  
  setTimeout(() => toast.classList.add('fade'), time);

  toast.addEventListener('transitionend', (event) => event.target.remove());
}

const restartGame = () => {
    // Clear the board and keyboard
    document.querySelector('#board').innerHTML = '';
    document.querySelector('#keyboard').innerHTML = '';
    document.querySelector('.toaster ul').innerHTML = '';

    document.removeEventListener('keydown', onKeyPress);
    document.querySelector('#keyboard')?.removeEventListener('click', onKeyClick);
  
    // Reset variables
    guessHistory.length = 0;
    currentWord = '';
    theWord = getNewWord()
  
    setTimeout(init, 0); // Small delay to ensure DOM is ready
}

const checkGuess = (guess, word) => {
    const guessLetters = guess.split('');
    const wordLetters = word.split('');
    const remainingWordLetters = [...wordLetters];
    const remainingGuessLetters = [...guessLetters];

    const currentRow = document.querySelector(`#board ul[data-row='${guessHistory.length}']`);

    // Apply initial styles to all letters in the row
    currentRow.querySelectorAll('li').forEach((element, index) => {
        element.setAttribute('data-status', 'none');
        element.setAttribute('data-animation', 'flip');
    });

    // Step 1: Mark valid letters
    guessLetters.forEach((letter, index) => {
        if (letter === wordLetters[index]) {
            currentRow.querySelector(`li:nth-child(${index + 1})`).setAttribute('data-status', 'valid');
            document.querySelector(`[data-key='${letter}']`).setAttribute('data-status', 'valid');
            
            remainingWordLetters[index] = null; // Mark as matched
            remainingGuessLetters[index] = null;
        }
    });

    // Step 2: Mark misplaced letters
    remainingGuessLetters.forEach((letter, index) => {
        if (letter && remainingWordLetters.includes(letter)) {
            const letterIndex = remainingWordLetters.indexOf(letter);
            currentRow.querySelector(`li:nth-child(${index + 1})`).setAttribute('data-status', 'invalid');

            const keyboardKey = document.querySelector(`[data-key='${letter}']`);
            if (keyboardKey.getAttribute('data-status') !== 'valid') {
                keyboardKey.setAttribute('data-status', 'invalid');
            }

            remainingWordLetters[letterIndex] = null; // Remove from remaining letters
        }
    });

    // Step 3: Mark absent/incorrect letters on the keyboard
    guessLetters.forEach(letter => {
        const keyboardKey = document.querySelector(`[data-key='${letter}']`);
        if (keyboardKey && keyboardKey.getAttribute('data-status') === 'empty') {
            keyboardKey.setAttribute('data-status', 'none');
        }
    });

    // Update guess history and reset current word
    guessHistory.push(currentWord);
    currentWord = '';

    // Checking game state
    if (guess === word) {
        showMessage('You Won!', 5000);
        endGame();
        return;
    }

    if (guessHistory.length >= numAttempts) {
        showMessage(`Game Over! The word was: ${word}`, 5000);
        endGame();
    }
};



const endGame = () => {
    document.removeEventListener('keydown', onKeyPress);
    keyboard.removeEventListener('click', onKeyClick);
  
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Game';
    restartButton.className = 'restart-button';
    restartButton.addEventListener('click', restartGame);
  
    document.querySelector('#board').appendChild(restartButton);
}

const onKeyClick = (event) => {
  if (event.target.nodeName === 'LI') {
    onKeyPress(event.target.getAttribute('data-key'));
  }
}

const onKeyPress = (key) => {
  // Don't allow more then 6 attempts to guess the word
  if (guessHistory.length >= numAttempts) {
    return;
  }

  // Find the current active row
  const currentRow = document.querySelector(`#board ul[data-row='${guessHistory.length}']`);

  // Find the next empty column in the current active row
  let targetColumn = currentRow.querySelector('[data-status="empty"]');

  if (key === bKey) {
    if (targetColumn === null) {
      // Get the last column of the current active row
      // as we are on the last column
      targetColumn = currentRow.querySelector('li:last-child');
    } else {
      // Find the previous column, otherwise get the first column
      // so we always have have a column to operate on
      targetColumn = targetColumn.previousElementSibling ?? targetColumn;
    }

    // Clear the column of its content
    targetColumn.textContent = '';
    targetColumn.setAttribute('data-status', 'empty');
    
    // Remove the last letter from the currentWord
    currentWord = currentWord.slice(0, -1);
    
    return;
  }

  if (key === eKey) {
    if (currentWord.length < 5) {
      showMessage('Some letters are missing..', 750);
      return;
    }

    if (currentWord.length === 5 && wordList.includes(currentWord.toLowerCase())) {
        checkGuess(currentWord, theWord.toUpperCase());
      } else {
        currentRow.setAttribute('data-animation', 'invalid');
        showMessage('This is not a real word..', 750);
      }
      
    return;
  }

  // We have reached the 5 letter limit for the guess word
  if (currentWord.length >= 5) {
    return;
  }

  const upperCaseLetter = key.toUpperCase();

  // Add the letter to the next empty column
  // if the provided letter is between A-Z
  if (/^[A-Z]$/.test(upperCaseLetter)) {
    currentWord += upperCaseLetter;

    targetColumn.textContent = upperCaseLetter;
    targetColumn.setAttribute('data-status', 'filled');
    targetColumn.setAttribute('data-animation', 'pop');
  }
}

// Call the initialization function when the DOM is loaded to get
// everything setup and the game responding to user actions.
document.addEventListener('DOMContentLoaded', init);