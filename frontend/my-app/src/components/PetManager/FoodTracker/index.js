import React, { useState, useEffect } from 'react';
import { Edit2, Save, Trash2 } from 'lucide-react';
import { getFoodTracking, createOrUpdateFoodTracking, deleteFoodTracking } from '@/lib/api';
import styles from './FoodTracker.module.css';

const FoodTracker = ({ petId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUnit, setActiveUnit] = useState('g');
  const [foodData, setFoodData] = useState(null);
  
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    loadFoodData();
  }, [petId]);

  const loadFoodData = async () => {
    try {
      setIsLoading(true);
      const response = await getFoodTracking(petId);
      setFoodData(response.data);
      
      // Initialize form data if we have food data
      if (response.data) {
        setFormData({
          type: response.data.type,
          totalWeight: response.data.totalWeight,
          dailyAmount: response.data.dailyAmount
        });
      } else {
        // Set default values if no existing data
        setFormData({
          type: 'dry',
          totalWeight: '',
          dailyAmount: ''
        });
        setIsEditing(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEditing = () => {
    // When starting to edit, convert values based on active unit
    const conversionFactor = activeUnit === 'kg' ? 1000 : 1;
    setFormData({
      type: foodData.type,
      totalWeight: activeUnit === 'kg' 
        ? (foodData.totalWeight / 1000).toString()
        : foodData.totalWeight.toString(),
      dailyAmount: activeUnit === 'kg'
        ? (foodData.dailyAmount / 1000).toString()
        : foodData.dailyAmount.toString()
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const conversionFactor = activeUnit === 'kg' ? 1000 : 1;
      const dataToSubmit = {
        type: formData.type,
        totalWeight: parseFloat(formData.totalWeight) * conversionFactor,
        dailyAmount: parseFloat(formData.dailyAmount) * conversionFactor
      };

      const response = await createOrUpdateFoodTracking(petId, dataToSubmit);
      setFoodData(response.data);
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };

  
  const handleCancel = () => {
    // Reset form data to current food data values
    if (foodData) {
      setFormData({
        type: foodData.type,
        totalWeight: activeUnit === 'kg' 
          ? (foodData.totalWeight / 1000).toString()
          : foodData.totalWeight.toString(),
        dailyAmount: activeUnit === 'kg'
          ? (foodData.dailyAmount / 1000).toString()
          : foodData.dailyAmount.toString()
      });
    } else {
      setFormData({
        type: 'dry',
        totalWeight: '',
        dailyAmount: ''
      });
    }
    setIsEditing(false);
  };


  const handleDelete = async () => {
    try {
      await deleteFoodTracking(petId);
      setFoodData(null);
      setFormData({
        type: 'dry',
        totalWeight: '',
        dailyAmount: ''
      });
      setIsEditing(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const calculateRemainingDays = () => {
    if (!foodData) return null;
    return Math.floor(foodData.totalWeight / foodData.dailyAmount);
  };

  const calculateDepletionDate = () => {
    const days = calculateRemainingDays();
    if (!days) return null;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString();
  };

  const convertValue = (value, toKilograms = false) => {
    if (!value) return '';
    return toKilograms ? (value / 1000).toFixed(2) : value.toString();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Food Tracker</h2>
        {foodData && !isEditing && (
          <div className={styles.actions}>
            <button onClick={handleStartEditing}>
              <Edit2 size={16} />
            </button>
            <button onClick={handleDelete}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.unitToggle}>
          <label>
            <input
              type="radio"
              value="g"
              checked={activeUnit === 'g'}
              onChange={(e) => setActiveUnit(e.target.value)}
            />
            Grams
          </label>
          <label>
            <input
              type="radio"
              value="kg"
              checked={activeUnit === 'kg'}
              onChange={(e) => setActiveUnit(e.target.value)}
            />
            Kilograms
          </label>
        </div>

        {isEditing && formData ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label>Food Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="dry">Dry Food</option>
                <option value="moist">Moist Food</option>
              </select>
            </div>

            <div>
              <label>Total Weight ({activeUnit})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalWeight}
                onChange={(e) => setFormData({...formData, totalWeight: e.target.value})}
                required
              />
            </div>

            <div>
              <label>Daily Amount ({activeUnit})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.dailyAmount}
                onChange={(e) => setFormData({...formData, dailyAmount: e.target.value})}
                required
              />
            </div>
            
            <div className={styles.formButtons}>
              <button type="submit">
                <Save size={16} /> Save Food Data
              </button>
              <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        ) : foodData ? (
          <div>
            <div className={styles.stats}>
              <div>
                <span>Food Type:</span>
                <span>{foodData.type}</span>
              </div>
              <div>
                <span>Total Weight:</span>
                <span>
                  {activeUnit === 'kg' 
                    ? convertValue(foodData.totalWeight, true)
                    : convertValue(foodData.totalWeight)} {activeUnit}
                </span>
              </div>
              <div>
                <span>Daily Amount:</span>
                <span>
                  {activeUnit === 'kg'
                    ? convertValue(foodData.dailyAmount, true)
                    : convertValue(foodData.dailyAmount)} {activeUnit}
                </span>
              </div>
              <div>
                <span>Days Remaining:</span>
                <span>{calculateRemainingDays()} days</span>
              </div>
            </div>
            
            <div className={styles.depletion}>
              <p>Food will last until:</p>
              <p>{calculateDepletionDate()}</p>
            </div>
          </div>
        ) : null}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodTracker;