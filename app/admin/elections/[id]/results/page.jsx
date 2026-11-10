'use client';
import { useParams } from 'next/navigation';
import ElectionResults from '../../../../components/results/ElectionResults';

export default function AdminElectionResults() {
    const { id } = useParams();
    return <ElectionResults id={id} back={{ href: '/admin/results', label: 'Results' }} />;
}
