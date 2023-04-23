// hooks
import { useRegex } from '../riscv/useRegex'
import { useValidateInstructions } from './useValidateInstructions'
import { useRelocation } from './useRelocation'

export const useAssemblerPassTwo = () => {
    const { instructions, fakeLoadInstructions } = useRegex()
    const { validate } = useValidateInstructions()
    const { convertToAuipc, relocateLoad } = useRelocation()

    const doPassTwo = (symbolTable, talInstructions, setErrors, setWarnings) => {
        // replace label in load instructions
        talInstructions.forEach((inst) => {
            const instruction = inst.talLine[0]
            if (fakeLoadInstructions.test(instruction)) {
                const finalDigit = instruction.charAt(instruction.length - 1)
                if (finalDigit === '1') {
                    const labelToInt = convertToAuipc(inst, symbolTable, setErrors)
                    inst.talLine = labelToInt ? labelToInt : inst.line
                }
                else if (finalDigit === "2") {
                    const labelToInt = relocateLoad(inst, symbolTable)
                    inst.talLine = labelToInt ? labelToInt : inst.line
                }
            }
        })

        for (const inst of talInstructions) {
            if (!instructions.test(inst.talLine[0])) {
                setErrors(prevErrors => {
                    return [...prevErrors, { errorMessage: `Invalid instruction: "${inst.line[0]}"`, errorLine: inst.lineNo }]
                })
            }
            else {
                inst.machineCode = validate(inst, setErrors, setWarnings, symbolTable)
            }
        }
    }

    return { doPassTwo }
}

