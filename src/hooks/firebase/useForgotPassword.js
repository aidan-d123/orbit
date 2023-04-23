import { useState, useEffect } from 'react'
import { projectAuth } from "../../firebase/config"
import { useAuthContext } from './useAuthContext'

export const useForgotPassword = () => {
    const [isCancelled, setIsCancelled] = useState(false)
    const [forgotPasswordError, setForgotPasswordError] = useState(null)
    const [isForgotPasswordPending, setIsForgotPasswordPending] = useState(false)
    const { dispatch } = useAuthContext()

    const forgotPassword = async (email) => {
        setForgotPasswordError(null)
        setIsForgotPasswordPending(true)

        try {
            const res = await projectAuth.sendPasswordResetEmail(email)

            if (!isCancelled) {
                setIsForgotPasswordPending(false)
                setForgotPasswordError(null)
            }
        }
        catch (err) {
            setForgotPasswordError(err.message)
            if (!isCancelled) {
                setIsForgotPasswordPending(false)
            }
        }
    }

    useEffect(() => {
        return () => setIsCancelled(true)
    }, [])

    return { forgotPassword, isForgotPasswordPending, forgotPasswordError }
}