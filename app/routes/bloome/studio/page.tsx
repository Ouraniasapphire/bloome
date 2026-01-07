import { useParams } from "react-router";
import useAuth from "~/hooks/useAuth";



const Studio = () => {
    const { user } = useAuth();
    const { classID } = useParams();

    return <>
    
        {classID}
    </>
}