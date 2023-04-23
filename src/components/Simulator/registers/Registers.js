// styles
import { useEffect } from "react"
import "./Registers.css"

export default function Registers(props) {
    const { registers, currentRegister } = props

    const structureValue = value => {
        let structuredValue
        const bits = 32

        if (value >= 0) {
            structuredValue = value.toString(2)
            structuredValue = structuredValue.length === bits ? structuredValue : "0".repeat(bits - structuredValue.length) + structuredValue
        } else {
            structuredValue = (value >>> 0).toString(2).slice(-bits)
            structuredValue = structuredValue.length === bits ? structuredValue : "1".repeat(bits - structuredValue.length) + structuredValue
        }

        let hexString = parseInt(structuredValue, 2).toString(16)
        hexString = hexString.length === 8 ? hexString : "0".repeat(8 - hexString.length) + hexString
        return hexString
    }

    const getReg = i => {
        switch (i) {
            case 0: return "x0/zero"
            case 1: return "x1/ra"
            case 2: return "x2/sp"
            case 3: return "x3/gp"
            case 4: return "x4/tp"
            case 5: return "x5/t0"
            case 6: return "x6/t1"
            case 7: return "x7/t2"
            case 8: return "x8/s0"
            case 9: return "x9/s1"
            case 10: return "x10/a0"
            case 11: return "x11/a1"
            case 12: return "x12/a2"
            case 13: return "x13/a3"
            case 14: return "x14/a4"
            case 15: return "x15/a5"
            case 16: return "x16/a6"
            case 17: return "x17/a7"
            case 18: return "x18/s2"
            case 19: return "x19/s3"
            case 20: return "x20/s4"
            case 21: return "x21/s5"
            case 22: return "x22/s6"
            case 23: return "x23/s7"
            case 24: return "x24/s8"
            case 25: return "x25/s9"
            case 26: return "x26/s10"
            case 27: return "x27/s11"
            case 28: return "x28/t3"
            case 29: return "x29/t4"
            case 30: return "x30/t5"
            case 31: return "x31/t6"
        }
    }

    const checkReg = register => {
        switch (register) {
            case "x0":
            case "zero":
                return 0
            case "x1":
            case "ra":
                return 1
            case "x2":
            case "sp":
                return 2
            case "x3":
            case "gp":
                return 3
            case "x4":
            case "tp":
                return 4
            case "x5":
            case "t0":
                return 5
            case "x6":
            case "t1":
                return 6
            case "x7":
            case "t2":
                return 7
            case "x8":
            case "s0":
            case "fp":
                return 8
            case "x9":
            case "s1":
                return 9
            case "x10":
            case "a0":
                return 10
            case "x11":
            case "a1":
                return 11
            case "x12":
            case "a2":
                return 12
            case "x13":
            case "a3":
                return 13
            case "x14":
            case "a4":
                return 14
            case "x15":
            case "a5":
                return 15
            case "x16":
            case "a6":
                return 16
            case "x17":
            case "a7":
                return 17
            case "x18":
            case "s2":
                return 18
            case "x19":
            case "s3":
                return 19
            case "x20":
            case "s4":
                return 20
            case "x21":
            case "s5":
                return 21
            case "x22":
            case "s6":
                return 22
            case "x23":
            case "s7":
                return 23
            case "x24":
            case "s8":
                return 24
            case "x25":
            case "s9":
                return 25
            case "x26":
            case "s10":
                return 26
            case "x27":
            case "s11":
                return 27
            case "x28":
            case "t3":
                return 28
            case "x29":
            case "t4":
                return 29
            case "x30":
            case "t5":
                return 30
            case "x31":
            case "t6":
                return 31
        }
    }

    return (
        <div className="stor-table-container">
            <table className="reg-table">
                <thead>
                    <tr>
                        <th>Registers</th>
                        <th>Vaue</th>
                    </tr>
                </thead>
                <tbody>
                    {registers && registers.map((register, index) => (
                        <tr key={getReg(index)} className={checkReg(currentRegister) === index ? "current-reg" : ""}>
                            <td className="reg">{getReg(index)}</td><td className="reg-val">0x{structureValue(register)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
