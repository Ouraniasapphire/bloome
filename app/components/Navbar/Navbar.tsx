import { useEffect, useState } from 'react';
import Icon from './Icon';
import Menu from './Menu';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useNavigate } from 'react-router';
import useRedirect from '~/hooks/useRedirect';
import ProfileBadge from '../ProfileBadge/ProfileBage';
import useAuth from '~/hooks/useAuth';

import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '~/clients/firebaseClient';
import { signOut } from 'firebase/auth';

const Navbar = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    const { user } = useAuth();
    const navigate = useNavigate();
    const redirect = useRedirect();

    useEffect(() => {
        if (!user) return;

        const fetchRole = async () => {
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) throw new Error('User document not found');
                setUserRole(docSnap.data().role);
            } catch (err) {
                console.error(err);
            }
        };

        fetchRole();
    }, [user]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const menuEl = document.getElementById('navbar-menu');
            const btnEl = document.getElementById('navbar-menu-btn');
            if (!menuEl || !btnEl) {
                setShowMenu(false);
                return;
            }
            if (!menuEl.contains(e.target as Node) && !btnEl.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [showMenu]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (err) {
            console.error('Sign out failed:', err);
        }
    };

    const handleShowMenu = () => {
        setShowMenu((prev) => !prev);
    };

    const SignOutButton = () => {
        return (
            <button
                onClick={handleSignOut}
                className='px-4 py-2 bg-linear-to-t from-purple-700 to-indigo-600 text-white rounded-lg! border-none! hover:cursor-pointer w-full mb-4 mr-4 mt-2 ml-4'
            >
                Sign out
            </button>
        );
    };

    const SettingsButton = () => {
        return (
            <button
                onClick={() => {
                    redirect('settings');
                }}
                className='w-12 h-12 bg-(--surface-0) border-0! p-0! hover:cursor-pointer'
            >
                <ProfileBadge id={user?.uid ?? ''} />
            </button>
        );
    };

    const studentButtons = [
        <button key='Dashboard' onClick={() => redirect('dashboard')}>
            Dashboard
        </button>,
    ];

    const teacherButtons = [
        <button key='Dashboard' onClick={() => redirect('dashboard')}>
            Dashboard
        </button>,
        <button key='Studio Manager' onClick={() => redirect('studio-manager')}>
            {' '}
            Studio Manager
        </button>,
        <button key='onboarding' onClick={() => redirect('onBoarding')}>
            {' '}
            Admin OnBoarding
        </button>,
    ];

    return (
        <div className='bg-(--surface-0) w-full h-12 shadow-md flex flex-row items-center border-b-2 border-(--surface-100)'>
            <div onClick={handleShowMenu} id='navbar-menu-btn'>
                <Icon />
            </div>

            {showMenu && (
                <Menu>
                    <ThemeToggle />
                    {user && <SignOutButton />}
                </Menu>
            )}

            <div id='navbar-links' className='w-full'>
                {(userRole === 'student' && studentButtons) || teacherButtons}
            </div>

            {user && <SettingsButton />}
        </div>
    );
};

export default Navbar;
