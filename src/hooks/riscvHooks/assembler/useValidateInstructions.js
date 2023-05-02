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
                    inst.talLine[1] = validateRegister(inst.talLine[1])
                    inst.talLine[2] = validateRegister(inst.talLine[2])
                    inst.talLine[3] = validateRegister(inst.talLine[3])
                    checkRegisters([inst.talLine[1], inst.talLine[2], inst.talLine[3]], lineNumber, setErrors)
                    return rTypeMachineCode(instruction, inst.talLine[1], inst.talLine[2], inst.talLine[3])
                } else {
                    argLengthError(3, inst.talLine, setErrors, lineNumber)
                    break
                }

            // inst rd rs1 imm
            case iType.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 4)) {
                    const instruction = inst.talLine[0]
                    inst.talLine[1] = validateRegister(inst.talLine[1])
                    inst.talLine[2] = validateRegister(inst.talLine[2])
                    const imm = getNumber(inst.talLine[3])
                    checkRegisters([inst.talLine[1], inst.talLine[2]], lineNumber, setErrors)
                    if (checkImmediate(imm, instruction, -2048, 2047, setErrors, lineNumber)) {
                        inst.talLine[3] = imm
                        return iTypeMachineCode(instruction, inst.talLine[1], inst.talLine[2], imm)
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
                    inst.talLine[1] = validateRegister(inst.talLine[1])
                    inst.talLine[2] = validateRegister(inst.talLine[2])
                    checkRegisters([inst.talLine[1], inst.talLine[2]], lineNumber, setErrors)
                    const match = checkForLabel(inst, 3, symbolTable)
                    if (!match) {
                        setErrors(prevErrors => { return [...prevErrors, { errorMessage: `Label "${inst.talLine[3]}" is not defined`, errorLine: inst.lineNo }] })
                    } else if (checkImmediate(inst.talLine[3], instruction, -2048, 2047, setErrors, lineNumber)) {
                        return bTypeMachineCode(instruction, inst.talLine[1], inst.talLine[2], inst.talLine[3])
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
                    inst.talLine[1] = validateRegister(inst.talLine[1])
                    inst.talLine[2] = validateRegister(inst.talLine[2])
                    const shamt = getNumber(inst.talLine[3])
                    checkRegisters([inst.talLine[1], inst.talLine[2]], lineNumber, setErrors)
                    if (checkImmediate(inst.talLine[3], instruction, 0, 31, setErrors, lineNumber)) {
                        inst.talLine[3] = shamt
                        return iTypShifteMachineCode(instruction, inst.talLine[1], inst.talLine[2], shamt)
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
                    inst.talLine[1] = validateRegister(inst.talLine[1])
                    inst.talLine[3] = validateRegister(inst.talLine[3])
                    const imm = getNumber(inst.talLine[2])
                    checkRegisters([inst.talLine[1], inst.talLine[3]], lineNumber, setErrors)
                    if (checkImmediate(imm, instruction, -2048, 2047, setErrors, lineNumber)) {
                        inst.talLine[2] = imm
                        return iTypeMachineCode(instruction, inst.talLine[1], inst.talLine[3], imm)
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
                    inst.talLine[1] = validateRegister(inst.talLine[1])
                    const imm = getNumber(inst.talLine[2])
                    checkRegister(inst.talLine[1], lineNumber, setErrors)
                    if (checkImmediate(imm, instruction, 0, 1048575, setErrors, lineNumber)) {
                        inst.talLine[2] = imm
                        return uTypeMachineCode(instruction, inst.talLine[1], imm)
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
                    inst.talLine[1] = validateRegister(inst.talLine[1])
                    checkRegister(inst.talLine[1], lineNumber, setErrors)

                    const match = checkForLabel(inst, 2, symbolTable)
                    if (!match) {
                        setErrors(prevErrors => { return [...prevErrors, { errorMessage: `Label "${inst.talLine[2]}" is not defined`, errorLine: inst.lineNo }] })
                    } else {
                        if (checkImmediate(inst.talLine[2], instruction, -1048576, 1048575, setErrors, lineNumber)) {
                            return jTypeMachineCode(instruction, inst.talLine[1], inst.talLine[2])
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
                    inst.talLine[1] = validateRegister(inst.talLine[1])
                    inst.talLine[3] = validateRegister(inst.talLine[3])
                    const imm = getNumber(inst.talLine[2])
                    checkRegisters([inst.talLine[1], inst.talLine[3]], lineNumber, setErrors)

                    if (checkImmediate(imm, instruction, -2048, 2047, setErrors, lineNumber)) {
                        inst.talLine[2] = imm
                        return sTypeMachineCode(instruction, inst.talLine[1], inst.talLine[2], inst.talLine[3])
                    }
                } else {
                    argLengthError(3, inst.talLine, setErrors, lineNumber)
                    break
                }

            case /^(?:fence)$/i.test(inst.talLine[0]):
                setWarnings(prevWarnings => {
                    return [...prevWarnings, { warningMessage: `instruction \"fence\" is unnecessary as Orbit is single threaded`, warningLine: lineNumber }]
                })

            case /^(?:ecall)$/i.test(inst.talLine[0]):
                if (checkArgsLength(inst.talLine, 1)) {
                    return "00000073"
                } else {
                    argLengthError(0, inst.talLine, setErrors, lineNumber)
                    break
                }
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

    const validateRegister = register => {
        switch (register) {
            case "x0": case "zero": return "x0"
            case "x1": case "ra": return "x1"
            case "x2": case "sp": return "x2"
            case "x3": case "gp": return "x3"
            case "x4": case "tp": return "x4"
            case "x5": case "t0": return "x5"
            case "x6": case "t1": return "x6"
            case "x7": case "t2": return "x7"
            case "x8": case "s0": case "fp": return "x8"
            case "x9": case "s1": return "x9"
            case "x10": case "a0": return "x10"
            case "x11": case "a1": return "x11"
            case "x12": case "a2": return "x12"
            case "x13": case "a3": return "x13"
            case "x14": case "a4": return "x14"
            case "x15": case "a5": return "x15"
            case "x16": case "a6": return "x16"
            case "x17": case "a7": return "x17"
            case "x18": case "s2": return "x18"
            case "x19": case "s3": return "x19"
            case "x20": case "s4": return "x20"
            case "x21": case "s5": return "x21"
            case "x22": case "s6": return "x22"
            case "x23": case "s7": return "x23"
            case "x24": case "s8": return "x24"
            case "x25": case "s9": return "x25"
            case "x26": case "s10": return "x26"
            case "x27": case "s11": return "x27"
            case "x28": case "t3": return "x28"
            case "x29": case "t4": return "x29"
            case "x30": case "t5": return "x30"
            case "x31": case "t6": return "x31"
        }
    }

    return { validate }
}