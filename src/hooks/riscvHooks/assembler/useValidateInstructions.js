//hooks
import { useRegex } from "../riscv/useRegex"
import { useUtils } from "../riscv/useUtils"
import { useMachineCode } from "./useMachineCode"

export const useValidateInstructions = () => {
    const { rType, iTypeShift, sType, iType, iTypeMem, bType, jType, uType } = useRegex()
    const { checkArgsLength, argLengthError, checkRegister, getNumber, checkImmediate } = useUtils()
    const { iTypeMachineCode, rTypeMachineCode, bTypeMachineCode, uTypeMachineCode, jTypeMachineCode, iTypShifteMachineCode, sTypeMachineCode } = useMachineCode()

    const validate = (inst, setErrors, setWarnings, symbolTable) => {
        const lineNumber = inst.lineNo

        switch (true) {
            //inst rd rs1 rs2
            case rType.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 4)) {
                    const instruction = inst.talLine[0]
                    const rd = inst.talLine[1]
                    const rs1 = inst.talLine[2]
                    const rs2 = inst.talLine[3]
                    checkRegisters([rd, rs1, rs2], lineNumber, setErrors)
                    return rTypeMachineCode(instruction, rd, rs1, rs2)
                } else {
                    argLengthError(3, inst.talLine, setErrors, lineNumber)
                    break
                }

            // inst rd rs1 imm
            case iType.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 4)) {
                    const instruction = inst.talLine[0]
                    const rd = inst.talLine[1]
                    const rs1 = inst.talLine[2]
                    //uses 32 instead of 12 for readability
                    const imm = getNumber(inst.talLine[3])
                    checkRegisters([rd, rs1], lineNumber, setErrors)
                    if (checkImmediate(imm, instruction, -2048, 2047, setErrors, lineNumber)) {
                        inst.talLine[3] = imm
                        return iTypeMachineCode(instruction, rd, rs1, imm)
                    }
                    break
                } else {
                    argLengthError(3, inst.talLine, setErrors, lineNumber)
                    break
                }

            // inst rd rs1 label
            case bType.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 4)) {
                    const instruction = inst.talLine[0]
                    const rd = inst.talLine[1]
                    const rs1 = inst.talLine[2]
                    checkRegisters([rd, rs1], lineNumber, setErrors)
                    const match = checkForLabel(inst, 3, symbolTable)
                    if (!match) {
                        setErrors(prevErrors => { return [...prevErrors, { errorMessage: `Label "${inst.talLine[3]}" is not defined`, errorLine: inst.lineNo }] })
                    } else if (checkImmediate(inst.talLine[3], instruction, -2048, 2047, setErrors, lineNumber)) {
                        return bTypeMachineCode(instruction, rd, rs1, inst.talLine[3])
                    }
                    break
                } else {
                    argLengthError(3, inst.talLine, setErrors, lineNumber)
                    break
                }

            // inst rd rs1 shamt
            case iTypeShift.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 4)) {
                    const instruction = inst.talLine[0]
                    const rd = inst.talLine[1]
                    const rs1 = inst.talLine[2]
                    const shamt = getNumber(inst.talLine[3])
                    checkRegisters([rd, rs1], lineNumber, setErrors)
                    if (checkImmediate(inst.talLine[3], instruction, 0, 31, setErrors, lineNumber)) {
                        inst.talLine[3] = shamt
                        return iTypShifteMachineCode(instruction, rd, rs1, shamt)
                    }
                    break
                } else {
                    argLengthError(3, inst.talLine, setErrors, lineNumber)
                    break
                }

            // inst rd imm rs1
            case iTypeMem.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 4)) {
                    const instruction = inst.talLine[0]
                    const rd = inst.talLine[1]
                    const rs1 = inst.talLine[3]
                    // the immediate value was validated in useRelocation, therefore can be treated as a 32 bit signed number
                    const imm = getNumber(inst.talLine[2])
                    checkRegisters([rd, rs1], lineNumber, setErrors)
                    if (checkImmediate(imm, instruction, -2048, 2047, setErrors, lineNumber)) {
                        inst.talLine[2] = imm
                        return iTypeMachineCode(instruction, rd, rs1, imm)
                    }
                    break
                }

                else {
                    setErrors(prevErrors => { return [...prevErrors, { errorMessage: `Instruction "${inst.line[0]}" takes 3 arguments, recieved ${inst.line.length - 1}`, errorLine: lineNumber }] })
                    break
                }

            // inst rd imm
            case uType.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 3)) {
                    const instruction = inst.talLine[0]
                    const rd = inst.talLine[1]
                    const imm = getNumber(inst.talLine[2])
                    checkRegister(rd, lineNumber, setErrors)
                    if (checkImmediate(imm, instruction, 0, 1048575, setErrors, lineNumber)) {
                        inst.talLine[2] = imm
                        return uTypeMachineCode(instruction, rd, imm)
                    }
                    break
                } else {
                    argLengthError(2, inst.talLine, setErrors, lineNumber)
                    break
                }

            // inst rd imm
            case jType.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 3)) {
                    const instruction = inst.talLine[0]
                    const rd = inst.talLine[1]
                    checkRegister(rd, lineNumber, setErrors)

                    const match = checkForLabel(inst, 2, symbolTable)
                    if (!match) {
                        setErrors(prevErrors => { return [...prevErrors, { errorMessage: `Label "${inst.talLine[2]}" is not defined`, errorLine: inst.lineNo }] })
                    } else {
                        if (checkImmediate(inst.talLine[2], instruction, -1048576, 1048575, setErrors, lineNumber)) {
                            return jTypeMachineCode(instruction, rd, inst.talLine[2])
                        }
                    }
                    break
                } else {
                    argLengthError(3, inst.talLine, setErrors, lineNumber)
                    break
                }

            // inst rd imm(rs1)
            case sType.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 4)) {
                    const instruction = inst.talLine[0]
                    const rd = inst.talLine[1]
                    const rs1 = inst.talLine[3]
                    const imm = getNumber(inst.talLine[2])
                    checkRegisters([rd, rs1], lineNumber, setErrors)

                    if (checkImmediate(imm, instruction, -2048, 2047, setErrors, lineNumber)) {
                        inst.talLine[2] = imm
                        return sTypeMachineCode(instruction, rd, inst.talLine[2], rs1)
                    }
                } else {
                    argLengthError(3, inst.talLine, setErrors, lineNumber)
                    break
                }

            case /^(?:fence)$/i.test(inst.talLine[0]):
                setWarnings(prevWarnings => {
                    return [...prevWarnings, { warningMessage: `instruction \"fence\" is unnecessary as Orbit is single threaded`, warningLine: lineNumber }]
                })

            //inst rd rs1 rs2
            // case mType.test(inst.talLine[0]):
            //     if (checkArgsLength(inst.talLine, 4)) {
            //         const instruction = inst.talLine[0]
            //         const rd = inst.talLine[1]
            //         const rs1 = inst.talLine[2]
            //         const rs2 = inst.talLine[3]
            //         checkRegisters([rd, rs1, rs2], lineNumber, setErrors)
            //         return mTypeMachineCode(instruction, rd, rs1, rs2)
            //     } else {
            //         argLengthError(3, inst.talLine, setErrors, lineNumber)
            //         break
            //     }
        }
    }

    const checkRegisters = (registers, lineNumber, setErrors) => {
        for (const register of registers) {
            checkRegister(register, lineNumber, setErrors)
        }
    }

    const checkForLabel = (inst, labelIndex, symbolTable) => {
        for (const symbol of symbolTable) {
            if (symbol.label === inst.talLine[labelIndex]) {
                inst.talLine[labelIndex] = symbol.address - inst.memoryLocation
                return true
            }
        }
    }

    return { validate }
}