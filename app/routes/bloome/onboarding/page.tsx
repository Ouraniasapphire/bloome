import { getAuth } from 'firebase/auth';
import {
    doc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '~/clients/firebaseClient';
import useRedirect from '~/hooks/useRedirect';

const FIXED_CLASS_ID = 'R7zvt77ssD3VIhZv2cu1';

const OnBoarding = () => {
    const redirect = useRedirect();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let didRun = false; // prevent multiple runs in Strict Mode

        async function markInitialLoginComplete(userUID: string) {
            try {
                const userRef = doc(db, 'users', userUID);
                await updateDoc(userRef, { initialLogin: false });
                console.log(`User ${userUID} initialLogin set to false.`);
            } catch (err) {
                console.error('Failed to update initialLogin:', err);
                throw err;
            }
        }

        async function enrollUserInFixedClass(userId: string, role: string) {
            try {
                const enrollmentsRef = collection(db, 'enrollments');

                // Check for duplicate enrollment
                const q = query(
                    enrollmentsRef,
                    where('userID', '==', userId),
                    where('classID', '==', FIXED_CLASS_ID)
                );
                const existing = await getDocs(q);

                if (!existing.empty) {
                    console.log(`User ${userId} is already enrolled in the fixed class.`);
                    return;
                }

                await addDoc(enrollmentsRef, {
                    classID: FIXED_CLASS_ID,
                    userID: userId,
                    role: role,
                    createdAt: serverTimestamp(),
                });

                console.log(`User ${userId} enrolled in fixed class.`);
            } catch (err) {
                console.error('Failed to enroll user:', err);
                throw err;
            }
        }

        async function onBoard() {
            if (didRun) return; // prevent multiple runs
            didRun = true;

            const user = getAuth().currentUser;

            if (!user) {
                console.warn('No logged-in user found');
                setError('No logged-in user found');
                setLoading(false);
                return;
            }

            try {
                await enrollUserInFixedClass(user.uid, 'student');
                await markInitialLoginComplete(user.uid);
            } catch (err: any) {
                setError(err.message || 'Onboarding failed');
                console.error(err);
            } finally {
                setLoading(false);
                redirect('dashboard');
            }
        }

        onBoard();
    }, [redirect]);

    return (
        <div className='w-full h-full flex justify-center items-center'>
            {loading && <h1>Just getting a few things ready :)</h1>}
            {!loading && error && <h1 className='text-red-500'>Error: {error}</h1>}
            {!loading && !error && <h1>Done!</h1>}
        </div>
    );
};

export default OnBoarding;
