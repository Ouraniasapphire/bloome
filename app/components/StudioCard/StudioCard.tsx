import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router';
import type { Class } from '~/types/Class';

const StudioCard = (props: Class) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if(!user) {
        return
    }

    const navigate = useNavigate();

    return (
        <div
            className='h-fit relative rounded-2xl overflow-hidden shadow-md cursor-pointer bg-(--surface-0) border-2 border-(--card-accent) max-w-1/3 min-w-1/4 grow'
            onClick={() => {
                navigate(`/${user.uid}/${props.id}/studio`);
            }}
        >
            <div className='relative h-36'>
                <img
                    src={`${props.hero_url}`}
                    alt={`${props.name}`}
                    className='absolute inset-0 w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-black opacity-25' />
                <div className='absolute bottom-4 left-4 z-10 text-white'>
                    <h2 className='text-xl font-bold '>{props.name}</h2>
                    <p className='text-sm opacity-90 '>{props.hour}</p>
                </div>
            </div>

            <div className='p-5 relative z-10'>
                <p className='text-(--surface-text) font-medium mb-4'>{props.description}</p>
                <div className='border-t border-gray-200 my-4'></div>
                <div className='flex justify-between items-center text-(--surface-text) text-sm'>
                    <span>{props.teacher_id}</span>
                    <span className='bg-(--surface-100) text-(--surface-text) px-3 py-1 rounded-full text-xs font-semibold'>
                        {props.room}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StudioCard;
