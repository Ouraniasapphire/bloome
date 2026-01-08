import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '~/clients/firebaseClient';
import type { Class } from '~/types/Class';

export type ClassWithRole = Class & { role: string };

export async function fetchClassesByID(): Promise<ClassWithRole[]> {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    // Query enrollments by string UID
    const q = query(
        collection(db, 'enrollments'),
        where('userID', '==', user.uid) // <-- string comparison
    );

    const enrollmentSnap = await getDocs(q);

    const classes = await Promise.all(
        enrollmentSnap.docs.map(async (enrollmentDoc) => {
            const enrollmentData = enrollmentDoc.data();
            const classID = enrollmentData.classID as string; // string ID of the class

            // Get the class document by string ID
            const classRef = doc(db, 'classes', classID);
            const classSnap = await getDoc(classRef);
            if (!classSnap.exists()) return null;

            const classData = classSnap.data() as Class;

            return {
                id: classData.id,
                name: classData.name,
                description: classData.description || '',
                hour: classData.hour,
                room: classData.room || '',
                hero_url: classData.hero_url,
                teacher_id: classData.teacher_id,
                role: enrollmentData.role as string,
            } as ClassWithRole;
        })
    );

    // Remove nulls
    return classes.filter(Boolean) as ClassWithRole[];
}

export async function enrollUserInFixedClass(
    userUID: string,
    role: 'student' | 'teacher' = 'student'
) {
    try {
        // Reference to the fixed class
        const classRef = doc(db, 'classes', 'R7zvt77ssD3VIhZv2cu1');

        // Reference to the user document
        const userRef = doc(db, 'users', userUID);

        // Create a new enrollment document with auto-generated ID
        const enrollmentRef = doc(collection(db, 'enrollments'));

        await setDoc(enrollmentRef, {
            classID: classRef, // Firestore reference
            userID: userUID, // store as string
            role: role,
        });

        console.log(`User ${userUID} enrolled in class as ${role}.`);
    } catch (error) {
        console.error('Error enrolling user:', error);
    }
}