import { useEffect, useState } from 'react';
import StudioCard from '~/components/StudioCard/StudioCard';
import { fetchClassesByID } from '~/services/classService';
import type { ClassWithRole } from '~/services/classService';

const Dashboard = () => {
    const [cards, setCards] = useState<ClassWithRole[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadClasses() {
            try {
                const classes = await fetchClassesByID();
                setCards(classes);
            } catch (err) {
                console.error('Failed to load classes:', err);
            } finally {
                setLoading(false);
            }
        }

        loadClasses();
    }, []);

    if (loading) {
        return <div className='p-4'>Loading your classes...</div>;
    }

    if (cards.length === 0) {
        return <div className='p-4'>You are not enrolled in any classes yet.</div>;
    }

    return (
        <div className='w-full h-full flex gap-4 flex-row flex-wrap justify-start items-stretch p-4 box-border'>
            {cards.map((card) => (
                <StudioCard
                    key={card.id}
                    id={card.id}
                    name={card.name}
                    description={card.description}
                    teacher_id={card.teacher_id}
                    hero_url={card.hero_url}
                    room={card.room}
                    hour={card.hour}
                />
            ))}
        </div>
    );
};

export default Dashboard;
