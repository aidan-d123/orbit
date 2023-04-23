// hooks
import { useAssemblerPassOne } from "./useAssemblerPassOne"
import { useAssemblerPassTwo } from "./useAssemblerPassTwo"

export const useAssembler = () => {
  const { doPassOne } = useAssemblerPassOne()
  const { doPassTwo } = useAssemblerPassTwo()

  const assemble = (code, setErrors, setWarnings) => {
    const { symbolTable, talInstructions, dataMemory } = doPassOne(code, setErrors, setWarnings)
    doPassTwo(symbolTable, talInstructions, setErrors, setWarnings)
    return { talInstructions, dataMemory }
  }

  return { assemble }
}

