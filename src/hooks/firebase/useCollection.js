import { useEffect, useState, useRef } from "react"
import { projectFirestore } from "../../firebase/config"
import { useAuthContext } from "../../hooks/firebase/useAuthContext"

export const useCollection = (collection, _orderBy) => {
  const [documents, setDocuments] = useState(null)
  const [error, setError] = useState(null)
  const { user } = useAuthContext();

  // if we don't use a ref --> infinite loop in useEffect
  // _query is an array and is "different" on every function call
  const orderBy = useRef(_orderBy).current

  useEffect(() => {
    let ref = projectFirestore.collection(collection)
    const query = ["createdBy", "==", user ? user.uid : ""]

    if (query) {
      ref = ref.where(...query)
    }
    if (orderBy) {
      ref = ref.orderBy(...orderBy)
    }

    const unsubscribe = ref.onSnapshot(snapshot => {
      let results = []
      snapshot.docs.forEach(doc => {
        results.push({ ...doc.data(), id: doc.id })
      });

      // update state
      setDocuments(results)
      setError(null)
    }, error => {
      setError('could not fetch the data')
    })

    // unsubscribe on unmount
    return () => unsubscribe()

  }, [collection, orderBy, user])

  return { documents, error }
}