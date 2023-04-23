// hooks
import { useRegex } from "./useRegex"

export const useUtils = () => {
    const { registers } = useRegex()

    const getNumber = (s) => {
        const bits = 32
        const max = Math.pow(2, bits) - 1
        const min = Math.pow(2, (bits - 1)) - 1

        const skipSign = isSigned(s)                              // determine if number has a sign
        const stringRadix = s.substring(skipSign, skipSign + 2)   // extract radix 
        const radix = determineRadix(stringRadix)                // determine radix
        let intString

        if (radix) {
            const numberWithoutRadixAndSign = s.substring(skipSign + 2, s.length)           // string without the radix and sign
            if (sanitise(numberWithoutRadixAndSign, radix)) {
                const noRadixString = s.substring(0, skipSign) + numberWithoutRadixAndSign  // String with sign and no radix
                intString = parseInt(noRadixString.substring(skipSign), radix)
            }
        } else if (/^\d+$/.test(s.substring(skipSign, s.length))) {
            //intString = parseInt(s.substring(skipSign), 10)
            intString = parseInt(s.substring(skipSign), 10)
        }

        if (intString > min && intString <= max) {
            const mask = parseInt("1".repeat(bits), 2)
            intString = -((intString ^ mask) + 1) // 2's complement
        }

        if (skipSign === 1 && s.charAt(0) === '-') {
            intString = intString * -1
        }

        return intString
    }

    const isSigned = s => {
        switch (s.charAt(0)) {
            case '+':
            case '-': return 1
            default: return 0
        }
    }

    const determineRadix = (stringRadix) => {
        const radixPrefixes = {
            '0x': 16,
            '0o': 8,
            '0b': 2,
            '0d': 10
        };

        return radixPrefixes[stringRadix] || null;
    }

    const sanitise = (s, radix) => {
        const regexes = {
            2: /^[01]+$/i,
            8: /^[0-7]+$/i,
            10: /^\d+$/i,
            16: /^[0-9a-f]+$/i
        };

        return regexes[radix].test(s);
    }

    const invertNegative = (imm, bits) => {
        let binaryStr = imm.toString(2)
        binaryStr = binaryStr.substring(1, binaryStr.length) // remove '-'

        const length = binaryStr.length
        binaryStr = length < bits ? "0".repeat(bits - length) + binaryStr : binaryStr

        let inverse = ''
        for (const char of binaryStr) {
            inverse += (char === '0' ? '1' : '0')
        }

        const newString = parseInt(inverse, 2) + 1
        return newString
    }

    const checkArgsLength = (args, length) => {
        return args.length === length
    }

    const argLengthError = (length, line, setErrors, newCurrentLineNumber) => {
        setErrors(prevErrors => {
            return [...prevErrors, { errorMessage: `Instruction "${line[0]}" takes ${length} arguments, recieved ${line.length - 1}`, errorLine: newCurrentLineNumber }]
        })

    }

    const checkRegister = (reg, lineNumber, setErrors) => {
        if (!registers.test(reg)) {
            registerError(reg, lineNumber, setErrors)
        }
    }

    const registerError = (arg, lineNumber, setErrors) => {
        setErrors(prevErrors => {
            return [...prevErrors, { errorMessage: `Invalid register: "${arg}"`, errorLine: lineNumber }]
        })

    }

    const checkImmediate = (imm, inst, lower, upper, setErrors, lineNumber) => {
        if (!isNaN(imm) && (!(imm >= lower && imm <= upper))) {
            setErrors(prevErrors => {
                return [...prevErrors, { errorMessage: `Immediate value for instruction "${inst}" (${imm}) out of range (<= ${upper} and >=${lower})`, errorLine: lineNumber }]
            })
            return false
        } else if (isNaN(imm)) {
            setErrors(prevErrors => {
                return [...prevErrors, { errorMessage: `Invalid immediate value`, errorLine: lineNumber }]
            })
            return false
        }
        return true
    }

    return { checkArgsLength, argLengthError, checkRegister, checkImmediate, getNumber, invertNegative }
}

