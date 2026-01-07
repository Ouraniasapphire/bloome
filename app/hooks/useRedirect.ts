import { useNavigate } from 'react-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/clients/firebaseClient';
import useAuth from '~/hooks/useAuth';

export default function useRedirect() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const redirect = async (url: string) => {
        if (!user) return;

        try {
            const docRef = doc(db, 'user_settings', user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.warn('No user_settings found for UID:', user.uid);
                return; // just exit if the doc is missing
            }

            const dynamicKey = docSnap.data()?.dynamicKey;

            if (!dynamicKey) {
                console.warn('dynamicKey missing for UID:', user.uid);
                return; // exit if dynamicKey is missing
            }

            // Navigate to the dynamic URL
            navigate(`/${dynamicKey}/${url}`, { replace: true });
            // console.log('Navigated to:', `/${dynamicKey}/${url}`);
        } catch (err) {
            console.error('Redirect failed:', err);
        }
    };

    return redirect;
}
