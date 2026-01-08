import {
    doc,
    collection,
    getDocs,
    query,
    where,
    addDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '~/clients/firebaseClient';

const FIXED_CLASS_ID = 'R7zvt77ssD3VIhZv2cu1';

type User = {
    uid: string;
    displayName?: string;
    email?: string;
    initialLogin?: boolean;
};

type OnboardState = 'idle' | 'loading' | 'success' | 'error';

const onBoarding = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [onboardStates, setOnboardStates] = useState<Record<string, OnboardState>>({});
    const [error, setError] = useState<string | null>(null);

    // Fetch all users on mount
    useEffect(() => {
        async function fetchUsers() {
            try {
                const usersRef = collection(db, 'users');
                const snapshot = await getDocs(usersRef);
                const usersList: User[] = snapshot.docs.map(
                    (doc) =>
                        ({
                            uid: doc.id,
                            ...doc.data(),
                        }) as User
                );
                setUsers(usersList);
            } catch (err: any) {
                console.error('Failed to fetch users:', err);
                setError('Failed to fetch users');
            }
        }
        fetchUsers();
    }, []);

    async function enrollUserInFixedClass(userId: string) {
        try {
            const enrollmentsRef = collection(db, 'enrollments');

            // Prevent duplicate enrollment
            const q = query(
                enrollmentsRef,
                where('userID', '==', userId),
                where('classID', '==', FIXED_CLASS_ID)
            );
            const existing = await getDocs(q);

            if (!existing.empty) {
                console.log(`User ${userId} is already enrolled.`);
                return;
            }

            await addDoc(enrollmentsRef, {
                classID: FIXED_CLASS_ID,
                userID: userId,
                role: 'student',
                createdAt: serverTimestamp(),
            });

            console.log(`User ${userId} enrolled in fixed class.`);
        } catch (err) {
            console.error(`Failed to enroll user ${userId}:`, err);
            throw err;
        }
    }

    async function markInitialLoginComplete(userId: string) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { initialLogin: false });
            console.log(`User ${userId} initialLogin set to false.`);
        } catch (err) {
            console.error(`Failed to mark initialLogin for ${userId}:`, err);
            throw err;
        }
    }

    async function onboardUser(userId: string) {
        setOnboardStates((prev) => ({ ...prev, [userId]: 'loading' }));
        try {
            await enrollUserInFixedClass(userId);
            await markInitialLoginComplete(userId);
            setOnboardStates((prev) => ({ ...prev, [userId]: 'success' }));
        } catch (err) {
            setOnboardStates((prev) => ({ ...prev, [userId]: 'error' }));
        }
    }

    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-4'>Admin Onboarding</h1>
            {error && <p className='text-red-500 mb-4'>{error}</p>}
            <ul className='space-y-2'>
                {users.map((user) => (
                    <li
                        key={user.uid}
                        className='flex items-center justify-between border p-2 rounded'
                    >
                        <div>
                            <span className='font-medium'>
                                {user.displayName || user.email || user.uid}
                            </span>
                            {user.initialLogin === false && (
                                <span className='ml-2 text-green-600'>(Already onboarded)</span>
                            )}
                        </div>
                        <div>
                            <button
                                onClick={() => onboardUser(user.uid)}
                                disabled={
                                    onboardStates[user.uid] === 'loading' ||
                                    user.initialLogin === false
                                }
                                className={`px-3 py-1 rounded text-white ${
                                    onboardStates[user.uid] === 'success'
                                        ? 'bg-green-500 cursor-not-allowed'
                                        : onboardStates[user.uid] === 'error'
                                          ? 'bg-red-500'
                                          : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                            >
                                {onboardStates[user.uid] === 'loading'
                                    ? 'Onboarding...'
                                    : onboardStates[user.uid] === 'success'
                                      ? 'Done'
                                      : onboardStates[user.uid] === 'error'
                                        ? 'Retry'
                                        : 'Onboard'}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default onBoarding;
