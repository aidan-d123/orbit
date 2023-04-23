export const useLexer = () => {

  const addNonemptyWord = (previous, next) => {
    const word = next.toString()
    if (word) {
      previous.push(word)
    }
  }

  const lexLine = (line, setErrors, currentLineNumber) => {
    const previousWords = []
    const labels = []
    let currentWord = ""
    let escaped = false
    let inCharacter = false
    let inString = false
    let foundComment = false
    let lineCharacters = line.split('')

    for (const lineChar of lineCharacters) {
      let wasDelimiter = false
      let wasLabel = false

      switch (lineChar) {
        case '#': foundComment = !inString && !inCharacter; break
        case '\'': inCharacter = !((escaped && !inCharacter) || (!escaped && inCharacter)) && !inString; break
        case '"': inString = !((escaped && !inString) || (!escaped && inString)) && !inCharacter; break
        case ':':
          if (!inString && !inCharacter) {
            wasLabel = true
            if (!arrayIsEmpty(previousWords)) {
              setErrors(prevErrors => {
                return [...prevErrors, { errorMessage: `Label in the middle of an instruction`, errorLine: currentLineNumber }]
              })
            }
          }
          break
        case ' ':
        case '\t':
        case '(':
        case ')':
        case ',': wasDelimiter = !inString && !inCharacter; break;
      }

      escaped = !escaped && lineChar == '\\'
      if (foundComment) break

      if (wasDelimiter) {
        addNonemptyWord(previousWords, currentWord)
        currentWord = ""
      } else if (wasLabel) {
        addNonemptyWord(labels, currentWord)
        currentWord = ""
      } else {
        currentWord = currentWord + lineChar
      }
    }

    addNonemptyWord(previousWords, currentWord)

    return { labels, previousWords }
  }

  //To check if an array is empty
  function arrayIsEmpty(array) {
    if (!Array.isArray(array)) {
      return false
    }
    return array.length === 0
  }

  return { lexLine }
}

