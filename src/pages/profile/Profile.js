//styles
import "./Profile.css"

// components
import ProjectList from '../../components/ProjectList'
import Unauthorised from "../../components/unauthorised/Unauthorised";

// hooks
import { useCollection } from "../../hooks/firebase/useCollection"
import { useParams, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/firebase/useAuthContext"

export default function Profile() {
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)

  const { user } = useAuthContext();
  const history = useHistory()


  // documents created by user
  const { documents, error } = useCollection(
    "projects",
    ["createdBy", "==", id],
    ["lastModified", "desc"]);

  useEffect(() => {
    if (documents) {
      setIsLoading(false)
    }
  }, [documents])

  if (user && user.uid !== id) {
    history.push("../../")
  }

  return (
    <div className="profile">
      {!error && <ProjectList projects={documents} isLoading={isLoading} />}
      {error && <Unauthorised issue={error} />}
    </div>
  )
}
