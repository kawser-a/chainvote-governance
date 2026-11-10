'use client';
import { useParams } from 'next/navigation';
import ElectionResults from '../../../components/results/ElectionResults';

export default function ElectionResultsPage() {
    const { id } = useParams();
    return <ElectionResults id={id} back={{ href: '/elections', label: 'Elections' }} allowPetitions />;
}
