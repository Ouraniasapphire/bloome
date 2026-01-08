import { useEffect, useState } from 'react';
import Loading from '~/components/loading/Loading';
import useAuth from '~/hooks/useAuth';
import useRedirect from '~/hooks/useRedirect';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/clients/firebaseClient';

export default function Redirect() {
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth(); // make sure your hook returns auth loading state
    const redirect = useRedirect();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            window.location.href = '/';
            return;
        }

        const doRedirect = async () => {
            try {
                // Fetch the user's Firestore doc
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    console.error('User document not found!');
                    await redirect('dashboard');
                    return;
                }


                await redirect('dashboard');
            } catch (err) {
                console.error('Redirect failed:', err);
            } finally {
                setLoading(false);
            }
        };

        doRedirect();
    }, [user, authLoading, redirect]);

    return loading ? <Loading /> : null;
}
