"use client"

import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { addPetWeight, getPetWeights,deletePetWeight, updatePetWeight } from '../../lib/api';
import { toast } from "react-toastify";
import styles from './Weight.module.css'

const WeightTracker = ({ petId }) => {
    const [weights, setWeights] = useState([]);
    const [newWeight, setNewWeight] = useState('');
    const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingWeightId, setEditingWeightId] = useState(null);
    const [editWeight, setEditWeight] = useState('');
    const [editDate, setEditDate] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch weights when component mounts
    useEffect(() => {
        fetchWeights();
    }, [petId]);

    const fetchWeights = async () => {
        try {
            setLoading(true);
            const response = await getPetWeights(petId);
            setWeights(response.data);
        } catch (error) {
            console.error('Failed to fetch weights:', error);
            toast.error('Failed to load weight history');
        } finally {
            setLoading(false);
        }
    };

    // Sort weights by date
    const sortedWeights = [...weights].sort((a, b) => new Date(a.date) - new Date(b.date));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const weightData = {
                weight: parseFloat(newWeight),
                date: weightDate
            };

            console.log('Submitting weight data:', weightData);
            console.log('Weight type:', typeof weightData.weight);
            console.log('Weight value:', weightData.weight);

            const response = await addPetWeight(petId, weightData);
            
            // Update local state with new weight
            setWeights(prevWeights => [...prevWeights, response.data]);
            toast.success('Weight entry added successfully');

            // Reset form
            setNewWeight('');
            setWeightDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error('Error adding weight:', error);
            toast.error('Failed to add weight entry');
        }
    };

    const handleEditClick = (entry) => {
        setEditingWeightId(entry._id);
        setEditWeight(entry.weight.toString());
        setEditDate(new Date(entry.date).toISOString().split('T')[0]);
    };

    const handleUpdateWeight = async (e, weightId) => {
        e.preventDefault();
        try {
            const updatedData = {
                weight: parseFloat(editWeight),
                date: editDate
            };
    
            const response = await updatePetWeight(petId, weightId, updatedData);
            
            // Update local state
            setWeights(prevWeights => 
                prevWeights.map(w => 
                    w._id === weightId ? response.data : w
                )
            );
    
            // Reset edit state
            setEditingWeightId(null);
            setEditWeight('');
            setEditDate('');
    
            toast.success('Weight updated successfully');
        } catch (error) {
            console.error('Error updating weight:', error);
            toast.error('Failed to update weight');
        }
    };

    const handleDeleteWeight = async (weightId) => {
        try {
            await deletePetWeight(petId, weightId);
            setWeights(prevWeights => prevWeights.filter(w => w._id !== weightId));
            toast.success('Weight entry deleted successfully');
        } catch (error) {
            console.error('Error deleting weight:', error);
            toast.error('Failed to delete weight entry');
        }
    };

    if (loading) {
        return <div>Loading weight history...</div>;
    }

    return (
        <div className={styles.weightTracker}>
            <h3>Weight Tracker</h3>
            
            {/* Weight Entry Form */}
            <form onSubmit={handleSubmit} className={styles.weightForm}>
                <div className={styles.inputGroup}>
                    <label htmlFor="weight">Weight (kg):</label>
                    <input
                        type="number"
                        id="weight"
                        value={newWeight}
                        onChange={(e) => {
                            console.log('New weight value:', e.target.value);

                            setNewWeight(e.target.value)}}
                        step="0.1"
                        min="0"
                        required
                    />
                </div>
                
                <div className={styles.inputGroup}>
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        value={weightDate}
                        onChange={(e) => setWeightDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>
                
                <button type="submit">Add Weight</button>
            </form>
    
            {/* Weight Graph */}
            <div className={styles.weightGraph}>
                <LineChart width={600} height={300} data={sortedWeights}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis 
                        label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value) => [`${value} kg`, 'Weight']}
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </div>
    
            {/* Weight Log */}
            <div className={styles.weightLog}>
                <h4>Weight History</h4>
                {weights.length === 0 ? (
                    <p>No weight entries yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Weight (kg)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedWeights.map((entry) => (
                                <tr key={entry._id}>
                                    <td>
                                        {editingWeightId === entry._id ? (
                                            <input
                                                type="date"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        ) : (
                                            new Date(entry.date).toLocaleDateString()
                                        )}
                                    </td>
                                    <td>
                                        {editingWeightId === entry._id ? (
                                            <input
                                                type="number"
                                                value={editWeight}
                                                onChange={(e) => setEditWeight(e.target.value)}
                                                step="0.1"
                                                min="0"
                                                required
                                            />
                                        ) : (
                                            `${entry.weight} kg`
                                        )}
                                    </td>
                                    <td>
                                        {editingWeightId === entry._id ? (
                                            <div className={styles.editActions}>
                                                <button 
                                                    onClick={(e) => handleUpdateWeight(e, entry._id)}
                                                    className={styles.saveButton}
                                                >
                                                    Save
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setEditingWeightId(null);
                                                        setEditWeight('');
                                                        setEditDate('');
                                                    }}
                                                    className={styles.cancelButton}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.rowActions}>
                                                <button 
                                                    onClick={() => handleEditClick(entry)}
                                                    className={styles.editButton}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteWeight(entry._id)}
                                                    className={styles.deleteButton}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default WeightTracker;