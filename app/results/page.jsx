// /app/results/page.jsx
"use client"
import { useState, useEffect } from 'react';

function ResultsPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            const response = await fetch('/api/results?electionId=your-election-id');
            const data = await response.json();
            if (data.ok) {
                setResults(data.results);
            } else {
                console.error('Failed to fetch results');
            }
            setLoading(false);
        };
        fetchResults();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Election Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Manifesto Title</th>
                        <th>Candidate</th>
                        <th>Votes</th>
                        <th>Party</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((result, idx) => (
                        <tr key={idx}>
                            <td>{result.manifestoTitle}</td>
                            <td>{result.candidateName}</td>
                            <td>{result.votes}</td>
                            <td>{result.party || 'Independent'}</td>
                            <td>{result.winner ? 'Winner' : 'Not Winner'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ResultsPage;
