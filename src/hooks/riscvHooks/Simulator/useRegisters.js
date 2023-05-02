// hooks
import { useState } from "react"

export const useRegisters = () => {
    const [currentRegister, setCurrentRegister] = useState(0)
    const [registerZero, setRegisterZero] = useState(0)
    const [registerOne, setRegisterOne] = useState(0)
    const [registerTwo, setRegisterTwo] = useState(2147483632)
    const [registerThree, setRegisterThree] = useState(268435456)
    const [registerFour, setRegisterFour] = useState(0)
    const [registerFive, setRegisterFive] = useState(0)
    const [registerSix, setRegisterSix] = useState(0)
    const [registerSeven, setRegisterSeven] = useState(0)
    const [registerEight, setRegisterEight] = useState(0)
    const [registerNine, setRegisterNine] = useState(0)
    const [registerTen, setRegisterTen] = useState(0)
    const [registerEleven, setRegisterEleven] = useState(0)
    const [registerTwelve, setRegisterTwelve] = useState(0)
    const [registerThirteen, setRegisterThirteen] = useState(0)
    const [registerFourteen, setRegisterFourteen] = useState(0)
    const [registerFifteen, setRegisterFifteen] = useState(0)
    const [registerSixteen, setRegisterSixteen] = useState(0)
    const [registerSeventeen, setRegisterSeventeen] = useState(0)
    const [registerEighteen, setRegisterEighteen] = useState(0)
    const [registerNineteen, setRegisterNineteen] = useState(0)
    const [registerTwenty, setRegisterTwenty] = useState(0)
    const [registerTwentyOne, setRegisterTwentyOne] = useState(0)
    const [registerTwentyTwo, setRegisterTwentyTwo] = useState(0)
    const [registerTwentyThree, setRegisterTwentyThree] = useState(0)
    const [registerTwentyFour, setRegisterTwentyFour] = useState(0)
    const [registerTwentyFive, setRegisterTwentyFive] = useState(0)
    const [registerTwentySix, setRegisterTwentySix] = useState(0)
    const [registerTwentySeven, setRegisterTwentySeven] = useState(0)
    const [registerTwentyEight, setRegisterTwentyEight] = useState(0)
    const [registerTwentyNine, setRegisterTwentyNine] = useState(0)
    const [registerThirty, setRegisterThirty] = useState(0)
    const [registerThirtyOne, setRegisterThirtyOne] = useState(0)
    let registers = [
        registerZero, registerOne, registerTwo, registerThree, registerFour, registerFive, registerSix, registerSeven,
        registerEight, registerNine, registerTen, registerEleven, registerTwelve, registerThirteen, registerFourteen,
        registerFifteen, registerSixteen, registerSeventeen, registerEighteen, registerNineteen, registerTwenty,
        registerTwentyOne, registerTwentyTwo, registerTwentyThree, registerTwentyFour, registerTwentyFive,
        registerTwentySix, registerTwentySeven, registerTwentyEight, registerTwentyNine, registerThirty, registerThirtyOne
    ]

    let registerFunctions = [
        setRegisterZero, setRegisterOne, setRegisterTwo, setRegisterThree, setRegisterFour, setRegisterFive, setRegisterSix, setRegisterSeven,
        setRegisterEight, setRegisterNine, setRegisterTen, setRegisterEleven, setRegisterTwelve, setRegisterThirteen, setRegisterFourteen,
        setRegisterFifteen, setRegisterSixteen, setRegisterSeventeen, setRegisterEighteen, setRegisterNineteen, setRegisterTwenty,
        setRegisterTwentyOne, setRegisterTwentyTwo, setRegisterTwentyThree, setRegisterTwentyFour, setRegisterTwentyFive,
        setRegisterTwentySix, setRegisterTwentySeven, setRegisterTwentyEight, setRegisterTwentyNine, setRegisterThirty, setRegisterThirtyOne
    ]

    const asignRegisters = (register, value) => {
        let newValue;

        if (value > 4294967295) {
            newValue = value - 4294967295
        } else if (value < -2147483648) {
            newValue = value + 4294967295
        } else {
            newValue = value
        }

        switch (register) {
            case "x0":
            case "zero":
                setRegisterZero(0) // register zero is always zero
                break
            case "x1":
            case "ra":
                setRegisterOne(newValue)
                break
            case "x2":
            case "sp":
                setRegisterTwo(newValue)
                break
            case "x3":
            case "gp":
                setRegisterThree(newValue)
                break
            case "x4":
            case "tp":
                setRegisterFour(newValue)
                break
            case "x5":
            case "t0":
                setRegisterFive(newValue)
                break
            case "x6":
            case "t1":
                setRegisterSix(newValue)
                break
            case "x7":
            case "t2":
                setRegisterSeven(newValue)
                break
            case "x8":
            case "s0":
            case "fp":
                setRegisterEight(newValue)
                break
            case "x9":
            case "s1":
                setRegisterNine(newValue)
                break
            case "x10":
            case "a0":
                setRegisterTen(newValue)
                break
            case "x11":
            case "a1":
                setRegisterEleven(newValue)
                break
            case "x12":
            case "a2":
                setRegisterTwelve(newValue)
                break
            case "x13":
            case "a3":
                setRegisterThirteen(newValue)
                break
            case "x14":
            case "a4":
                setRegisterFourteen(newValue)
                break
            case "x15":
            case "a5":
                setRegisterFifteen(newValue)
                break
            case "x16":
            case "a6":
                setRegisterSixteen(newValue)
                break
            case "x17":
            case "a7":
                setRegisterSeventeen(newValue)
                break
            case "x18":
            case "s2":
                setRegisterEighteen(newValue)
                break
            case "x19":
            case "s3":
                setRegisterNineteen(newValue)
                break
            case "x20":
            case "s4":
                setRegisterTwenty(newValue)
                break
            case "x21":
            case "s5":
                setRegisterTwentyOne(newValue)
                break
            case "x22":
            case "s6":
                setRegisterTwentyTwo(newValue)
                break
            case "x23":
            case "s7":
                setRegisterTwentyThree(newValue)
                break
            case "x24":
            case "s8":
                setRegisterTwentyFour(newValue)
                break
            case "x25":
            case "s9":
                setRegisterTwentyFive(newValue)
                break
            case "x26":
            case "s10":
                setRegisterTwentySix(newValue)
                break
            case "x27":
            case "s11":
                setRegisterTwentySeven(newValue)
                break
            case "x28":
            case "t3":
                setRegisterTwentyEight(newValue)
                break
            case "x29":
            case "t4":
                setRegisterTwentyNine(newValue)
                break
            case "x30":
            case "t5":
                setRegisterThirty(newValue)
                break
            case "x31":
            case "t6":
                setRegisterThirtyOne(newValue)
                break
        }
        setCurrentRegister(register)
    }

    const readRegister = register => {
        switch (register) {
            case "x0":
            case "zero":
                return registerZero
            case "x1":
            case "ra":
                return registerOne
            case "x2":
            case "sp":
                return registerTwo
            case "x3":
            case "gp":
                return registerThree
            case "x4":
            case "tp":
                return registerFour
            case "x5":
            case "t0":
                return registerFive
            case "x6":
            case "t1":
                return registerSix
            case "x7":
            case "t2":
                return registerSeven
            case "x8":
            case "s0":
            case "fp":
                return registerEight
            case "x9":
            case "s1":
                return registerNine
            case "x10":
            case "a0":
                return registerTen
            case "x11":
            case "a1":
                return registerEleven
            case "x12":
            case "a2":
                return registerTwelve
            case "x13":
            case "a3":
                return registerThirteen
            case "x14":
            case "a4":
                return registerFourteen
            case "x15":
            case "a5":
                return registerFifteen
            case "x16":
            case "a6":
                return registerSixteen
            case "x17":
            case "a7":
                return registerSeventeen
            case "x18":
            case "s2":
                return registerEighteen
            case "x19":
            case "s3":
                return registerNineteen
            case "x20":
            case "s4":
                return registerTwenty
            case "x21":
            case "s5":
                return registerTwentyOne
            case "x22":
            case "s6":
                return registerTwentyTwo
            case "x23":
            case "s7":
                return registerTwentyThree
            case "x24":
            case "s8":
                return registerTwentyFour
            case "x25":
            case "s9":
                return registerTwentyFive
            case "x26":
            case "s10":
                return registerTwentySix
            case "x27":
            case "s11":
                return registerTwentySeven
            case "x28":
            case "t3":
                return registerTwentyEight
            case "x29":
            case "t4":
                return registerTwentyNine
            case "x30":
            case "t5":
                return registerThirty
            case "x31":
            case "t6":
                return registerThirtyOne
        }
    }

    const resetReg = () => {
        for (let i = 0; i < registerFunctions.length; i++) {
            registerFunctions[i](0)
        }
    }

    return { registers, asignRegisters, readRegister, currentRegister, resetReg }
}

