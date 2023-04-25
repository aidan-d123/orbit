// hooks
import { useUtils } from "../riscv/useUtils"

export const usePseudoDispatcher = () => {
    const { checkArgsLength, argLengthError, getNumber } = useUtils()

    const replacePseudoInstructions = (line, setErrors, newCurrentLineNumber) => {
        switch (line[0].toLowerCase()) {
            case "bgt":
                // bgt x5 x7 label = blt x7 x5 label
                if (checkArgsLength(line, 4)) {
                    return [["blt", line[2], line[1], line[3]]]
                } else {
                    argLengthError(3, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "ble":
                // ble x5 x7 label = bge x7 x5 label
                if (checkArgsLength(line, 4)) {
                    return [["bge", line[2], line[1], line[3]]]
                } else {
                    argLengthError(3, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "bgtu":
                // bgtu x5 x7 label = bltu x7 x5 label
                if (checkArgsLength(line, 4)) {
                    return [["bltu", line[2], line[1], line[3]]]
                } else {
                    argLengthError(3, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "bleu":
                // bleu x5 x7 label = bgeu x7 x5 label
                if (checkArgsLength(line, 4)) {
                    return [["beq", line[2], line[1], line[3]]]
                } else {
                    argLengthError(3, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "beqz":
                // beqz x5 label = beq x5 x0 label 
                if (checkArgsLength(line, 3)) {
                    return [["beq", line[1], "x0", line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "bnez":
                // bnez x5 label = bne x5 x0 label
                if (checkArgsLength(line, 3)) {
                    return [["bne", line[1], "x0", line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "bltz":
                // bltz x5 label = blt x5 x0 label
                if (checkArgsLength(line, 3)) {
                    return [["blt", line[1], "x0", line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "bgez":
                // bgez x5 label = bge x5 x0 labels
                if (checkArgsLength(line, 3)) {
                    return [["bge", line[1], "x0", line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "bgtz":
                // bgtz x5 label = blt x0 x5 labels
                if (checkArgsLength(line, 3)) {
                    return [["blt", "x0", line[1], line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "blez":
                // blez x5 label = bge x0 x5 labels
                if (checkArgsLength(line, 3)) {
                    return [["bge", "x0", line[1], line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "j":
                // j label = jal x0 label
                if (checkArgsLength(line, 2)) {
                    return [["jal", "x0", line[1]]]
                } else {
                    argLengthError(1, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "jal":
                // jal label = jal x1 label
                if (checkArgsLength(line, 2)) {
                    return [["jal", "x1", line[1]]]
                } else if (checkArgsLength(line, 3)) {
                    return [line]
                } else {
                    setErrors(prevErrors => {
                        return [...prevErrors, { errorMessage: `Instruction "${line[0]}" takes 4 or 1 arguments, recieved ${line.length - 1}`, errorLine: newCurrentLineNumber }]
                    })
                    break
                }

            case "jr":
                // jr x5 = jalr x0 x5 0
                if (checkArgsLength(line, 2)) {
                    return [["jalr", "x0", "0", line[1],]]
                } else {
                    setErrors(prevErrors => {
                        return [...prevErrors, { errorMessage: `Instruction "${line[0]}" takes 1 argument, recieved ${line.length - 1}`, errorLine: newCurrentLineNumber }]
                    })
                    break
                }

            case "jalr":
                // jalr x5 = jalr x1 x5 0
                if (checkArgsLength(line, 2)) {
                    return [["jalr", "x1", "0", line[1]]]
                } else if (checkArgsLength(line, 4)) {
                    return [line]
                } else {
                    setErrors(prevErrors => {
                        return [...prevErrors, { errorMessage: `Instruction "${line[0]}" takes 1 or 3 arguments, recieved ${line.length - 1}`, errorLine: newCurrentLineNumber }]
                    })
                    break
                }

            case "ret":
                //ret = "jalr", "x0", "x1", "0"
                if (checkArgsLength(line, 1)) {
                    return [["jalr", "x0", "0", "x1"]]
                } else {
                    argLengthError(0, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "mv":
                // mv x5 x7 = addi x5 x7 0
                if (checkArgsLength(line, 3)) {
                    return [["addi", line[1], line[2], "0"]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "not":
                // not x5 x7 = xori x5 x7 -1
                if (checkArgsLength(line, 3)) {
                    return [["xori", line[1], line[2], "-1"]]
                }
                else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "nop":
                // addi x0 x0 0
                if (checkArgsLength(line, 1)) {
                    return [["addi", "x0", "x0", "0"]]
                } else {
                    argLengthError(0, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "neg":
                // neg x5 x7 = sub x5 x0 x7
                if (checkArgsLength(line, 3)) {
                    return [["sub", line[1], "x0", line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "seqz":
                // seqz x5 x7 = sltiu x5 x7 1
                if (checkArgsLength(line, 3)) {
                    return [["sltiu", line[1], line[2], "1"]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "sgtz":
                // sgtz x5 x7 = slt x5 x0 x7 
                if (checkArgsLength(line, 3)) {
                    return [["slt", line[1], "x0", line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }


            case "sltz":
                // sltz x5 x7 = slt x5 x7 x0
                if (checkArgsLength(line, 3)) {
                    return [["slt", line[1], line[2], "x0"]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "snez":
                // snez x5 x7 = sltu x5 x0 x7
                if (checkArgsLength(line, 3)) {
                    return [["sltu", line[1], "x0", line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            case "li":
                // li = (addi) OR (lui AND addi)
                if (checkArgsLength(line, 3)) {
                    let imm = getNumber(line[2])
                    // 0 evalutes to false
                    if ((imm && imm !== undefined) || imm === 0) {
                        console.log(imm)
                        if ((imm >= -2048) && (imm <= 2047)) {
                            return [["addi", line[1], "x0", imm.toString()]]
                        }
                        else if (((imm > 2047) && (imm <= 2147483647)) || ((imm < -2048) && (imm >= -2147483648))) {
                            const imm_hi = (imm + 0x800) >>> 12
                            let imm_lo = imm - (imm_hi << 12)
                            return [["lui", line[1], imm_hi.toString()], ["addi", line[1], line[1], imm_lo.toString()]]
                        }
                        else {
                            setErrors(prevErrors => {
                                return [...prevErrors, { errorMessage: `Immediate value for instruction "${line[0]}" (${imm}) out of range (>= -2048 and <=2147483648)}`, errorLine: newCurrentLineNumber }]
                            })
                            break
                        }
                    } else {
                        setErrors(prevErrors => {
                            return [...prevErrors, { errorMessage: `Immediate value for instruction "${line[0]}"`, errorLine: newCurrentLineNumber }]
                        })
                        break
                    }

                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                } break

            case "la":
                // this instruction can only be turned into an auipc-addi pair once symbol addresses are known
                // li = (addi) OR (lui AND addi)
                if (checkArgsLength(line, 3)) {
                    return [["la1", line[1], line[2]], ["la2", line[1], line[2]]]
                } else {
                    argLengthError(2, line, setErrors, newCurrentLineNumber)
                    break
                }

            /* This is for dealing with load instructions that use labels */
            case "lb":
            case "lw":
            case "lbu":
            case "lh":
            case "lhu":
                if (checkArgsLength(line, 4)) {
                    return [line]
                } else if (checkArgsLength(line, 3)) {
                    return [[line[0] + 1, line[1], line[2]], [line[0] + 2, line[1], line[2]]]
                } else {
                    setErrors(prevErrors => {
                        return [...prevErrors, { errorMessage: `Instruction "${line[0]}" takes 2 or 3 arguments, recieved ${line.length - 1}`, errorLine: newCurrentLineNumber }]
                    })
                    break
                }

            // not a pseudo instruction
            default: return [line]
        }
    }

    return { replacePseudoInstructions }
}

