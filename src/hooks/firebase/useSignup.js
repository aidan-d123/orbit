import { useState, useEffect } from 'react'
import { projectAuth, projectFirestore } from "../../firebase/config"
import { useAuthContext } from './useAuthContext'

export const useSignup = () => {
  const [isCancelled, setIsCancelled] = useState(false)
  const [signupError, setSignupError] = useState(null)
  const [isSignupPending, setIsSignupPending] = useState(false)
  const { dispatch } = useAuthContext()

  const signup = async (email, password, displayName) => {
    setSignupError(null)
    setIsSignupPending(true)

    try {
      // signup
      const res = await projectAuth.createUserWithEmailAndPassword(email, password)
      await projectAuth.currentUser.sendEmailVerification()

      if (!res) {
        throw new Error('Could not complete signup')
      }

      // add display name to user
      await res.user.updateProfile({ displayName })

      // create a user document
      await projectFirestore.collection("users").doc(res.user.uid).set({
        displayName,
      });

      // dispatch login action
      dispatch({ type: 'LOGIN', payload: res.user })

      if (!isCancelled) {
        setIsSignupPending(false)
        setSignupError(null)
      }
    }
    catch (err) {
      setSignupError(err.message)
      if (!isCancelled) {
        setIsSignupPending(false)
      }
    }
  }

  useEffect(() => {
    return () => setIsCancelled(true)
  }, [])

  return { signup, signupError, isSignupPending }
}