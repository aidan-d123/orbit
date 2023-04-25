//hooks
import { useUtils } from "../riscv/useUtils"

export const useRelocation = () => {
    const { checkArgsLength, argLengthError, checkRegister, getNumber } = useUtils()

    const convertToAuipc = (inst, symbolTable, setErrors) => {
        const lineNumber = inst.lineNo

        if (checkArgsLength(inst.talLine, 3)) {
            checkRegister(inst.talLine[1], lineNumber, setErrors)
            let matchedSymbol
            let imm
            for (const symbol of symbolTable) {
                if (symbol.label === inst.talLine[2]) {
                    matchedSymbol = symbol
                    imm = symbol.address - inst.memoryLocation
                    break
                }
            }

            if (!matchedSymbol) {
                setErrors(prevErrors => {
                    return [...prevErrors, { errorMessage: `Label "${inst.talLine[2]}" is not defined`, errorLine: inst.lineNo }]
                })
            } else {
                if ((imm >= -2048) && (imm <= 2047)) {
                    return ["auipc", inst.talLine[1], "0"]
                } else if ((imm > 2047 && imm <= 21474483647) || (imm < -2048 && imm >= -21474483648)) {
                    const imm_hi = (imm + 2048) >>> 12
                    return ["auipc", inst.talLine[1], imm_hi.toString()]
                } else {
                    setErrors(prevErrors => {
                        return [...prevErrors, { errorMessage: `Immediate value for instruction "${inst.talLine[0]}" (${imm}) out of range (>= -2048 and <=2147483648)}`, errorLine: lineNumber }]
                    })
                }
            }
        } else {
            argLengthError(2, inst.talLine, setErrors, lineNumber)
        }
    }

    const relocateLoad = (inst, symbolTable) => {
        if (checkArgsLength(inst.talLine, 3)) {
            let matchedSymbol
            let imm
            for (const symbol of symbolTable) {
                if (symbol.label === inst.talLine[2]) {
                    matchedSymbol = symbol
                    imm = symbol.address - (inst.memoryLocation - 4)
                    break
                }
            }

            if (matchedSymbol) {
                if ((imm >= -2048) && (imm <= 2047)) {
                    if (inst.talLine[0] === 'la2') {
                        return ["addi", inst.talLine[1], inst.talLine[1], imm.toString()]
                    } else {
                        return [inst.line[0], inst.talLine[1], imm.toString(), inst.talLine[1]]
                    }
                } else if (((imm > 2047) && (imm <= 21474483647)) || ((imm < -2048) && (imm >= -21474483648))) {
                    const imm_hi = (imm + 0x800) >>> 12
                    let imm_lo = imm - (imm_hi << 12)
                    imm_lo = getNumber(imm_lo.toString(10)) // accounts for strange behaviour with JS bitwise shifts

                    if (inst.talLine[0] === 'la2') {
                        return ["addi", inst.talLine[1], inst.talLine[1], imm_lo.toString()]
                    } else {
                        return [inst.line[0], inst.talLine[1], imm_lo.toString(), inst.talLine[1]]
                    }
                }
            }
        }
        return null
    }

    return { convertToAuipc, relocateLoad }
}

