/**
 * Get a random item from an array
 * @param {Array} array - The array to choose from
 * @returns {*} A random item from the array
 */
export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)]
}

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled array
 */
export function shuffleArray(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
}

