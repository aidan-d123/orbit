//hooks
import { useLexer } from "./useLexer"
import { useMemorySegments } from "../riscv/useMemorySegments"
import { useUtils } from "../riscv/useUtils"
import { usePseudoDispatcher } from "./usePseudoDispatcher"

export const useAssemblerPassOne = () => {
    const { lexLine } = useLexer()
    const { replacePseudoInstructions } = usePseudoDispatcher()
    const { TEXT_BEGIN, DATA_BEGIN } = useMemorySegments()
    const { getNumber } = useUtils()

    let currentLineNumber = 0
    let currentDataOffset = DATA_BEGIN
    let currentTextOffset = TEXT_BEGIN
    let inTextSegment = true
    let talInstructions = []
    let dataMemory = []
    let symbolTable = []
    const labels = []

    const doPassOne = (code, setErrors, setWarnings) => {

        let myArray = code.split(/\r?\n/)

        for (const line of myArray) {
            currentLineNumber++
            const newCurrentLineNumber = currentLineNumber
            const offset = getOffset()
            const { labels, previousWords } = lexLine(line, setErrors, currentLineNumber)

            labels.forEach(label => {
                const isLabelRepeated = addLabel(label)
                if (isLabelRepeated === true) {
                    setErrors(prevErrors => {
                        return [...prevErrors, { errorMessage: `Label "${label}" is already defined`, errorLine: newCurrentLineNumber }]
                    })
                } else {
                    symbolTable.push({ label, address: offset })
                }
            })

            if (arrayIsEmpty(previousWords) || previousWords[0] === '') continue

            const instructionArguments = [...previousWords]
            const firstElement = instructionArguments.shift()

            if (isAssemblerDirective(firstElement)) {
                parseAssemblerDirective(firstElement, instructionArguments, setErrors, setWarnings, currentLineNumber)
            } else {
                if (!inTextSegment) {
                    setWarnings(prevWarnings => {
                        return [...prevWarnings, { warningMessage: `Declaring an instrcution without using the ".text" directive`, warningLine: newCurrentLineNumber }]
                    })
                }

                const expandedInstructions = replacePseudoInstructions(previousWords, setErrors, currentLineNumber)
                if (expandedInstructions) {
                    expandedInstructions.forEach(expandedInstruction => {
                        const newInst = [...expandedInstruction]
                        talInstructions.push({ lineNo: currentLineNumber, line: previousWords, talLine: newInst, memoryLocation: currentTextOffset })
                        currentTextOffset += 4
                    })
                }
            }
        }

        return { symbolTable, talInstructions, dataMemory }
    }

    const getOffset = () => {
        return inTextSegment ? currentTextOffset : currentDataOffset
    }

    const isAssemblerDirective = firstElement => {
        return firstElement.charAt(0) === '.'
    }

    const parseAssemblerDirective = (directive, instructionArguments, setErrors, setWarnings, newCurrentLineNumber) => {
        switch (directive) {
            case ".data":
            case ".text":
                inTextSegment = directive === ".text"
                if (instructionArguments.length > 0) {
                    setErrors(prevErrors => {
                        return [...prevErrors, { errorMessage: `"${directive} directive takes no arguements`, errorLine: newCurrentLineNumber }]
                    })
                }
                break

            case ".byte":
                {
                    checkDataSection(setWarnings, newCurrentLineNumber)
                    if (instructionArguments) {
                        instructionArguments.forEach(inst => {
                            let imm = getNumber(inst)
                            if (imm !== undefined && imm <= 127 && imm >= -128) {
                                addDataToMem(imm)
                            } else {
                                setErrors(prevErrors => {
                                    return [...prevErrors, { errorMessage: `"Inavlid value: ${inst}"`, errorLine: newCurrentLineNumber }]
                                })
                            }
                        })
                    }
                } break

            case ".word": {
                checkDataSection(setWarnings, newCurrentLineNumber)
                // must convert word to 4 little endian bytes
                if (instructionArguments) {
                    instructionArguments.forEach(inst => {
                        const max = Math.pow(2, 32) - 1
                        const word = getNumber(inst)
                        if (word !== undefined && word > 0 && word <= max) {
                            let hexImm = word.toString(16)
                            hexImm = hexImm.length >= 8 ? hexImm : "0".repeat(8 - hexImm.length) + hexImm
                            hexImm = hexImm.match(/.{1,2}/g).reverse()
                            hexImm.forEach(imm => {
                                addDataToMem(parseInt(imm, 16))
                            })
                        } else {
                            setErrors(prevErrors => {
                                return [...prevErrors, { errorMessage: `"Inavlid value: ${inst}"`, errorLine: newCurrentLineNumber }]
                            })
                        }
                    })
                }
            } break

            case ".asciiz":
                checkDataSection(setWarnings, newCurrentLineNumber)
                if (instructionArguments.length === 1) {
                    let asciiBytes = getAsciiArray(instructionArguments, setErrors, newCurrentLineNumber)
                    if (asciiBytes !== undefined) {
                        asciiBytes.push("0") // null character for .asciiz directive

                        asciiBytes.forEach(byte => {
                            addDataToMem(byte)
                        })
                    }
                } else {
                    setErrors(prevErrors => {
                        return [...prevErrors, { errorMessage: `"${directive}" directive takes 1 argument`, errorLine: newCurrentLineNumber }]
                    })
                }
                break

            // Orbit doesn't have a linker
            case ".globl":
            case ".extern":
            case ".global":
                setWarnings(prevWarnings => {
                    return [...prevWarnings, { warningMessage: `"${directive}" directive unneccesary as Orbit does not support multiple files per program`, warningLine: newCurrentLineNumber }]
                })
                break

            case ".float":
            case ".align":
            case ".bss":
            case ".rodata":
            case ".space":
            case ".start":
            case ".zero":
                setErrors(prevErrors => {
                    return [...prevErrors, { errorMessage: `"${directive}" is currently not supported`, errorLine: newCurrentLineNumber }]
                })
                break

            default:
                setErrors(prevErrors => {
                    return [...prevErrors, { errorMessage: `"${directive}" is an unknown directive`, errorLine: newCurrentLineNumber }]
                })
                break
        }
    }

    const getAsciiArray = (instructionArguments, setErrors, newCurrentLineNumber) => {
        let array = []
        instructionArguments.forEach(inst => {
            if (checkAscii(inst, setErrors, newCurrentLineNumber)) {
                let newInst = inst.slice(1, -1)
                array = parseAsciiString(newInst)
            }
        })

        return array
    }

    const parseAsciiString = str => {
        const codes = [];

        for (let i = 0; i < str.length; i++) {
            const char = str.charAt(i);

            if (char === '\\') {
                // Handle escape sequence
                const nextChar = str.charAt(i + 1);
                switch (nextChar) {
                    case '0': // Octal escape sequence
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                        const octalCode = parseInt(str.substring(i + 1, i + 4), 8);
                        codes.push(octalCode);
                        i += 3;
                        break;
                    case 'x': // Hexadecimal escape sequence
                        const hexCode = parseInt(str.substring(i + 2, i + 4), 16);
                        codes.push(hexCode);
                        i += 3;
                        break;
                    case 'n': // Newline
                        codes.push(10);
                        i += 1;
                        break;
                    case 'r': // Carriage return
                        codes.push(13);
                        i += 1;
                        break;
                    case 't': // Tab
                        codes.push(9);
                        i += 1;
                        break;
                    case '\\': // Backslash
                        codes.push(92);
                        i += 1;
                        break;
                    case '\'': // Single quote
                        codes.push(39);
                        i += 1;
                        break;
                    case '"': // Double quote
                        codes.push(34);
                        i += 1;
                        break;
                    case 'b': // Backspace
                        codes.push(8);
                        i += 1;
                        break;
                    case 'f': // Form feed
                        codes.push(12);
                        i += 1;
                        break;
                    default:
                        // Unrecognized escape sequence, push backslash as is
                        codes.push(92);
                }
            } else {
                // Handle regular character
                const code = char.charCodeAt(0);
                codes.push(code);
            }
        }

        return codes;
    }

    const checkAscii = (str, setErrors, newCurrentLineNumber) => {
        const inQuotes = (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"')
        if (!inQuotes) {
            setErrors(prevErrors => {
                return [...prevErrors, { errorMessage: "ascii strings must be contained in inverted commas", errorLine: newCurrentLineNumber }]
            })
        }
        return inQuotes
    }

    const addDataToMem = (imm) => {
        dataMemory.push({
            hexAddress: (currentDataOffset).toString(16),
            address: (currentDataOffset),
            value: imm,
        })
        currentDataOffset++
    }

    const arrayIsEmpty = array => {
        if (!Array.isArray(array)) {
            return false
        }
        return array.length === 0

    }

    const checkDataSection = (setWarnings, newCurrentLineNumber) => {
        if (inTextSegment) {
            setWarnings(prevWarnings => {
                return [...prevWarnings, { warningMessage: `Data must be declared using ".data" directive`, warningLine: newCurrentLineNumber }]
            })
        }
    }

    const addLabel = label => {
        let isLabelRepeated = false
        if (labels.length != 0) {
            labels.forEach(labelObj => {
                if (label === labelObj.label) {
                    isLabelRepeated = true
                }
            })
        }
        labels.push({ label })
        return isLabelRepeated
    }

    return { doPassOne }
}